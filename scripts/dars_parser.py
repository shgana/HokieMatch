import pdfplumber
import re
import json
import argparse

###############################################################################
#                         HEADING & SKIP PATTERNS                              #
###############################################################################

HEADING_KEYWORDS = [
    "complete the following", "theory", "capstone", "elective",
    "requirement", "foundation", "language study", "cs technical",
    "non-technical", "with grade c", "degree", "english requirement", "core"
]

def is_heading_candidate(line: str) -> bool:
    """Returns True if the line is likely a heading."""
    lower = line.lower()
    for kw in HEADING_KEYWORDS:
        if kw in lower:
            return True
    alpha_chars = [ch for ch in line if ch.isalpha()]
    if alpha_chars:
        ratio = sum(ch.isupper() for ch in alpha_chars) / len(alpha_chars)
        if ratio >= 0.6 and len(line.strip()) >= 5:
            return True
    return False

def should_skip_heading_line(line: str) -> bool:
    """Skips lines that are clearly noise (e.g. hours added, awarded, URLs)."""
    lower = line.lower()
    skip_patterns = [
        r"completed",
        r"awarded:",
        r"h.ours added",
        r"sub-group",
        r"\d+\.00\s+h.ours",  # e.g. "6.00 HOURS"
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
    Looks up to `lookback` lines above the NEEDS line and collects those that
    are heading candidates (and not skip-worthy). Joined by ' - '.
    """
    start_line = max(0, needs_idx - lookback)
    heading_lines = []
    for i in range(needs_idx-1, start_line-1, -1):
        line = all_lines[i].strip()
        # Stop if we hit another NEEDS line
        if line.upper().startswith("NEEDS:"):
            break
        if is_heading_candidate(line) and not should_skip_heading_line(line):
            heading_lines.append(line)
    if heading_lines:
        heading_lines.reverse()
        joined = " - ".join(heading_lines)
        joined = re.sub(r"\s*-\s*-\s*", " - ", joined)
        return re.sub(r"\s+", " ", joined).strip()
    return ""  # return empty string if nothing found

###############################################################################
#                          COURSE TOKEN PARSING                                #
###############################################################################

def parse_course_tokens(lines, last_subject=None):
    """
    Parse course tokens from one or more lines. Handles comma‐separated tokens,
    wildcards, and attaches a subject if missing.
    Returns (list_of_tokens, updated_last_subject).
    """
    all_tokens = set()
    current_subject = last_subject
    full_text = ' '.join(line.strip() for line in lines)
    parts = []
    for chunk in full_text.split(','):
        parts.extend(chunk.strip().split())
    
    i = 0
    while i < len(parts):
        part = parts[i]
        if re.search(r'[A-Z]', part, re.IGNORECASE):
            if re.match(r'^[A-Z]{2,4}\d', part, re.IGNORECASE):
                all_tokens.add(part.replace(' ', ''))
                current_subject = ''.join(filter(str.isalpha, part))
            elif re.match(r'^[A-Z]{2,4}$', part, re.IGNORECASE):
                current_subject = part
                if i + 1 < len(parts):
                    next_part = parts[i + 1]
                    if re.match(r'^\d', next_part):
                        all_tokens.add(current_subject + next_part.replace(' ', ''))
                        i += 1
            else:
                all_tokens.add(part.replace(' ', ''))
        elif current_subject:
            if re.match(r'^\d\*+$', part):
                all_tokens.add(current_subject + part.replace(' ', ''))
            elif re.match(r'^\d{4}$', part):
                all_tokens.add(current_subject + part.replace(' ', ''))
        i += 1

    cleaned_tokens = []
    for token in sorted(all_tokens):
        token = token.replace(' ', '')
        if '*' in token:
            base = token.split('*')[0]
            cleaned_tokens.append(base + '***')
        else:
            cleaned_tokens.append(token)
    return cleaned_tokens, current_subject

def is_possible_course_line(line: str) -> bool:
    """Return True if the line appears to contain course tokens."""
    return re.search(r"[A-Z]{2,4}\s*\d{3,4}|\d\*+", line) is not None

def is_block_boundary(line: str) -> bool:
    """
    Determines if the line indicates a boundary between requirement blocks.
    A line is a boundary if it starts with known keywords (NEEDS:, OR), NOT FROM:, etc.)
    unless it also appears to contain course tokens.
    """
    up = line.upper()
    boundary_keywords = [
        "NEEDS:", "OR)", "NOT FROM:", "SELECT FROM:", "AWARDED:", "COURSES TAKEN",
        "UNDERGRADUATE CREDIT SUMMARY", "END OF ANALYSIS"
    ]
    for kw in boundary_keywords:
        if up.startswith(kw):
            # If the line does not look like it contains course tokens, it's a boundary.
            if not is_possible_course_line(line):
                return True
    return False

###############################################################################
#                          MAIN PARSER WITH "OR)" MERGE                        #
###############################################################################

def extract_requirement_type(text_lines, needs_idx):
    """
    Attempts to extract the requirement type (the heading) from up to 10 lines above the NEEDS line.
    Returns the joined heading text.
    """
    heading = gather_heading_for_needs(text_lines, needs_idx, lookback=10)
    return heading  # do not default to any value if empty

def parse_dars(pdf_path):
    data = {
        "student_info": {"student_id": "", "name": "", "program": ""},
        "completed_courses": [],
        "in_progress_courses": [],
        "requirements_needed": []
    }

    # Step 1: extract text lines from the PDF
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
            m = re.search(r"Student ID[:\s]+(\d{9})", line)
            if m:
                data["student_info"]["student_id"] = m.group(1)
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
                    if (status and len(status) == 1 and status.isalpha()) or (status == "AP" and old_status == "TR"):
                        completed_map[cid] = entry
                else:
                    completed_map[cid] = entry

    data["completed_courses"] = list(completed_map.values())
    data["in_progress_courses"] = list(inprogress_map.values())

    # Step 4: parse requirements with merging of OR blocks
    requirements = []
    current_req = None
    last_subject = None
    or_mode = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # If an "OR)" line is encountered, set or_mode so that the next NEEDS block is merged.
        if line.upper().startswith("OR)"):
            or_mode = True
            i += 1
            continue

        if line.upper().startswith("NEEDS:"):
            if not or_mode:
                # Start a new requirement block
                combined = line
                while ("HOURS" not in combined.upper()) and (i + 1 < len(lines)):
                    i += 1
                    combined += " " + lines[i]
                hh = re.search(r"NEEDS:\s+([\d.]+)\s+HOURS", combined, re.IGNORECASE)
                if hh:
                    hours_needed = hh.group(1)
                    req_heading = extract_requirement_type(lines, i)
                    current_req = {
                        "requirement_description": combined,
                        "hours_needed": hours_needed,
                        "requirement_type": req_heading,
                        "select_from": [],
                        "not_from": []
                    }
                    requirements.append(current_req)
                else:
                    current_req = None
            else:
                # OR mode: do not start a new block, just merge additional tokens
                # (We assume the current_req already exists.)
                combined = line
                while ("HOURS" not in combined.upper()) and (i + 1 < len(lines)):
                    i += 1
                    combined += " " + lines[i]
                # Do not update current_req's description/hours; just merge tokens later.
            or_mode = False
            i += 1
            continue

        # Process SELECT FROM:
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
                    is_block_boundary(sub)):
                    break
                if is_possible_course_line(sub):
                    gather_list.append(sub)
                else:
                    break
                j += 1
            tokens, last_subject = parse_course_tokens(gather_list, last_subject)
            if current_req:
                # Remove stray tokens like "OR" if any
                tokens = [t for t in tokens if t.upper() != "OR"]
                current_req["select_from"].extend(tokens)
            i = j
            continue

        # Process NOT FROM:
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
                    is_block_boundary(sub)):
                    break
                if is_possible_course_line(sub):
                    gather_list.append(sub)
                else:
                    break
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
    parser = argparse.ArgumentParser(
        description="Parse DARS PDF -> JSON, merge OR blocks & gather multiline SELECT FROM."
    )
    parser.add_argument("--input", required=True, help="Path to DARS PDF")
    parser.add_argument("--output", required=True, help="Path to output JSON")
    args = parser.parse_args()

    parsed = parse_dars(args.input)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(parsed, f, indent=2)
    print(f"Saved to {args.output}")

if __name__ == "__main__":
    main()
