import pdfplumber
import re
import json
import argparse

###############################################################################
#                         HEADING & SKIP PATTERNS                              #
###############################################################################

HEADING_KEYWORDS = [
    # Lines containing these words/phrases are considered headings
    "complete the following", "theory", "capstone", "elective",
    "requirement", "foundation", "language study", "cs technical",
    "non-technical", "with grade c", "degree", "english requirement",
    "core"
]

def is_heading_candidate(line: str) -> bool:
    """True if line is heading-like: has heading keywords or uppercase ratio >= 0.6."""
    lower = line.lower()
    # If any heading keywords appear, it is heading
    for kw in HEADING_KEYWORDS:
        if kw in lower:
            return True

    # Otherwise check uppercase ratio
    alpha_chars = [ch for ch in line if ch.isalpha()]
    if alpha_chars:
        ratio = sum(ch.isupper() for ch in alpha_chars) / len(alpha_chars)
        if ratio >= 0.6 and len(line.strip()) >= 5:
            return True
    return False

def should_skip_heading_line(line: str) -> bool:
    """Skip lines referencing partial data like '3.00 HOURS ADDED', 'COMPLETED', etc."""
    lower = line.lower()
    skip_patterns = [
        r"completed",
        r"awarded:",
        r"h.ours added",
        r"sub-group",
        r"\d+\.00\s+h.ours",  # e.g. "6.00 HOURS"
        r"^\(?\d+\)",         # e.g. "3) ..."
        r"https?://",
        r"courses taken",
        r"^\s*$"
    ]
    for pat in skip_patterns:
        if re.search(pat, lower):
            return True
    return False

def gather_heading_for_needs(all_lines, needs_idx, lookback=10):
    """
    Looks up to 10 lines above the NEEDS for heading-like lines,
    skipping partial or noise lines, and returns them joined by ' - '.
    """
    start_line = max(0, needs_idx - lookback)
    heading_lines = []
    for i in range(needs_idx-1, start_line-1, -1):
        line = all_lines[i].strip()
        if line.upper().startswith("NEEDS:"):
            break
        # If it's heading-like but not skip-worthy, store
        if is_heading_candidate(line) and not should_skip_heading_line(line):
            heading_lines.append(line)
    if not heading_lines:
        return ""
    heading_lines.reverse()
    joined = " - ".join(heading_lines)
    # Minor cleanup
    joined = re.sub(r"\s*-\s*-\s*", " - ", joined)
    return re.sub(r"\s+", " ", joined).strip()

###############################################################################
#                          COURSE TOKEN PARSING                                #
###############################################################################

def parse_course_tokens(lines, last_subject=None):
    """
    Parse course tokens from a list of lines, handling wildcards and comma-separated lists.
    """
    all_tokens = set()  # Use a set to prevent duplicates
    current_subject = last_subject

    # Join all lines into one string and normalize spaces
    full_text = ' '.join(line.strip() for line in lines)
    
    # Split by both commas and spaces to handle all formats
    parts = []
    for chunk in full_text.split(','):
        parts.extend(chunk.strip().split())
    
    i = 0
    while i < len(parts):
        part = parts[i]
        
        # If this part looks like a subject code
        if re.search(r'[A-Z]', part, re.IGNORECASE):
            # If it's a complete course code (e.g., "CS3114")
            if re.match(r'^[A-Z]{2,4}\d', part, re.IGNORECASE):
                all_tokens.add(part.replace(' ', ''))
                current_subject = ''.join(filter(str.isalpha, part))
            # If it's just a subject (e.g., "CS", "CMDA", "ENGE")
            elif re.match(r'^[A-Z]{2,4}$', part, re.IGNORECASE):
                current_subject = part
                # Look ahead for course numbers
                if i + 1 < len(parts):
                    next_part = parts[i + 1]
                    if re.match(r'^\d', next_part):
                        all_tokens.add(current_subject + next_part.replace(' ', ''))
                        i += 1  # Skip the next part since we used it
        # Handle wildcards and numbers when we have a subject
        elif current_subject:
            if re.match(r'^\d\*+$', part):
                all_tokens.add(current_subject + part.replace(' ', ''))
            elif re.match(r'^\d{4}$', part):
                all_tokens.add(current_subject + part.replace(' ', ''))
        
        i += 1

    # Clean up tokens and convert back to list
    cleaned_tokens = []
    for token in sorted(all_tokens):  # Sort for consistent ordering
        # Remove spaces and standardize wildcards
        token = token.replace(' ', '')
        if '*' in token:
            # Ensure consistent wildcard format
            base = token.split('*')[0]
            cleaned_tokens.append(base + '***')
        else:
            cleaned_tokens.append(token)

    return cleaned_tokens, current_subject

###############################################################################
#                          MAIN PARSER WITH "OR)" MERGE                        #
###############################################################################

def extract_requirement_type(text_lines, needs_line_index):
    """
    Attempts to find the requirement type by looking at lines before the NEEDS statement.
    Returns the requirement type as written in the PDF.
    """
    # Look up to 3 lines before the NEEDS statement for the requirement type
    for i in range(max(0, needs_line_index - 3), needs_line_index):
        line = text_lines[i].strip()
        # Skip empty lines or lines containing common non-type text
        if not line or "SELECT FROM:" in line or "NOT FROM:" in line or "NEEDS:" in line or "HOURS ADDED" in line:
            continue
        # Return the first non-empty line that's a requirement type
        if line and not line.startswith("OR)"):
            return line
    
    return "General Elective"  # fallback if no type found

def parse_dars(pdf_path):
    data = {
        "student_info": {"student_id": "", "name": "", "program": ""},
        "completed_courses": [],
        "in_progress_courses": [],
        "requirements_needed": []
    }

    # Step 1: extract text lines
    import pdfplumber
    lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            txt = page.extract_text() or ""
            for rline in txt.split("\n"):
                line = rline.strip()
                if line:
                    lines.append(line)

    # Step 2: parse student info
    student_name_idx = None
    for i, line in enumerate(lines):
        if "Student ID" in line:
            mm = re.search(r"Student ID[:\s]+(\d{9})", line)
            if mm:
                data["student_info"]["student_id"] = mm.group(1)
        elif not data["student_info"]["name"] and re.search(r"\b[A-Za-z]+,\s*[A-Za-z]+\b", line):
            data["student_info"]["name"] = line.strip()
            student_name_idx = i
        elif student_name_idx is not None and i == student_name_idx + 1 and not data["student_info"]["program"]:
            if not re.search(r"\d", line):
                data["student_info"]["program"] = line.strip()

    # Step 3: parse completed/in-progress courses
    course_pattern = re.compile(r"([A-Z]{2,4}\s?\d{4})\s+([\d.]+)\s+(IP|TR|AP|[A-F])?.*")
    completed_map = {}
    inprogress_map = {}
    for line in lines:
        cc = course_pattern.search(line)
        if cc:
            cid = cc.group(1).replace(" ", "")
            credits = cc.group(2)
            status = cc.group(3)
            entry = {"course_id": cid, "credits": credits,
                     "status": "In-Progress" if status == "IP" else (status if status else "Completed")}
            if status == "IP":
                inprogress_map[cid] = entry
            else:
                old = completed_map.get(cid)
                if old:
                    old_status = old["status"]
                    # prefer letter or AP over TR
                    if (status and len(status) == 1 and status.isalpha()) or (status == "AP" and old_status == "TR"):
                        completed_map[cid] = entry
                else:
                    completed_map[cid] = entry

    data["completed_courses"] = list(completed_map.values())
    data["in_progress_courses"] = list(inprogress_map.values())

    # Step 4: parse requirements with merging of OR) blocks
    requirements = []
    current_req = None
    last_subject = None
    or_mode = False  # indicates if next NEEDS: belongs to same block

    i = 0
    while i < len(lines):
        line = lines[i]

        # If line is "OR)", we set or_mode = True
        if line.upper().startswith("OR)"):
            or_mode = True
            i += 1
            continue

        # Check if line starts with NEEDS:
        if line.upper().startswith("NEEDS:"):
            if not or_mode:
                # Normal new requirement block
                combined = line
                # gather until "HOURS"
                while ("HOURS" not in combined.upper()) and (i+1 < len(lines)):
                    i += 1
                    combined += " " + lines[i]
                # parse hours
                hh = re.search(r"NEEDS:\s+([\d.]+)\s+HOURS", combined, re.IGNORECASE)
                if hh:
                    hours_needed = hh.group(1)
                    heading_str = gather_heading_for_needs(lines, i, 10)
                    current_req = {
                        "requirement_description": combined,
                        "hours_needed": hours_needed,
                        "requirement_type": heading_str,
                        "select_from": [],
                        "not_from": []
                    }
                    requirements.append(current_req)
                else:
                    current_req = None
            else:
                # or_mode = True => unify with current_req
                # gather line until "HOURS"
                combined = line
                while ("HOURS" not in combined.upper()) and (i+1 < len(lines)):
                    i += 1
                    combined += " " + lines[i]
                # We won't override the current_req's "requirement_description" or "hours_needed"
                # we just unify the "select_from" and "not_from" from the new block
                # But do we want to parse the heading again? Typically no, because we keep the original heading
                # from the first block
                # so just read it, ignore it
                pass
            or_mode = False
            i += 1
            continue

        # SELECT FROM:
        if "SELECT FROM:" in line.upper():
            gather_list = []
            splitted = re.split(r"SELECT FROM:", line, maxsplit=1)
            if len(splitted) > 1:
                gather_list.append(splitted[1].strip())
            j = i + 1
            while j < len(lines):
                sub = lines[j]
                if (sub.upper().startswith("NEEDS:") or sub.upper().startswith("OR)") or
                    sub.upper().startswith("NOT FROM:") or "SELECT FROM:" in sub.upper() or
                    is_heading_candidate(sub)):
                    break
                gather_list.append(sub)
                j += 1
            tokens, last_subject = parse_course_tokens(gather_list, last_subject)
            if current_req:
                # remove stray 'OR' tokens
                tokens = [t for t in tokens if t.upper() != "OR"]
                current_req["select_from"].extend(tokens)
            i = j
            continue

        # NOT FROM:
        if "NOT FROM:" in line.upper() or "-> NOT FROM:" in line.upper():
            gather_list = []
            splitted = re.split(r"(?:->\s*)?NOT FROM:", line, maxsplit=1)
            if len(splitted) > 1:
                gather_list.append(splitted[1].strip())
            j = i + 1
            while j < len(lines):
                sub = lines[j]
                if (sub.upper().startswith("NEEDS:") or sub.upper().startswith("OR)") or
                    sub.upper().startswith("NOT FROM:") or "SELECT FROM:" in sub.upper() or
                    is_heading_candidate(sub)):
                    break
                gather_list.append(sub)
                j += 1
            tokens, last_subject = parse_course_tokens(gather_list, last_subject)
            if current_req:
                tokens = [t for t in tokens if t.upper() != "OR"]
                current_req["not_from"].extend(tokens)
            i = j
            continue

        i += 1

    data["requirements_needed"] = requirements
    return data

def main():
    parser = argparse.ArgumentParser(description="Parse DARS PDF -> JSON, unify OR blocks & gather multiline SELECT FROM.")
    parser.add_argument("--input", required=True, help="Path to DARS PDF")
    parser.add_argument("--output", required=True, help="Path to output JSON")
    args = parser.parse_args()

    parsed = parse_dars(args.input)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2)
    print(f"Saved to {args.output}")

if __name__ == "__main__":
    main()
