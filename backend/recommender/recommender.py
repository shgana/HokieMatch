import json
import os
import re
import psycopg2
from psycopg2.extras import RealDictCursor

# --- Helper Functions ---

def normalize_course_code(code):
    """
    Normalize course code strings to SUBJECT+NUMBER (e.g., 'CS2506').
    Removes all non-alphanumeric characters and trims off any section suffixes.
    E.g., 'CS-2506-01' → 'CS2506'
    """
    code = code.upper().strip()
    parts = code.split("-")
    if len(parts) >= 2 and parts[1].isdigit():
        subject = parts[0]
        number = parts[1]
        return f"{subject}{number}"
    return re.sub(r'[^A-Z0-9]', '', code)

def format_course_code_for_gpa(code):
    """
    Converts a normalized course code (e.g., "CS2506") to the format used in avg_gpa_stats (e.g., "CS-2506").
    """
    if "-" in code:
        return code
    match = re.match(r"([A-Z]+)(\d+)", code)
    if match:
        return f"{match.group(1)}-{match.group(2)}"
    return code

def evaluate_prereq(prereq, student_courses):
    """
    Recursively evaluate a prerequisite JSON structure against the student's completed courses.
    """
    if isinstance(prereq, str):
        return normalize_course_code(prereq) in student_courses
    elif isinstance(prereq, dict):
        operator = prereq.get("type", "").lower()
        conditions = prereq.get("conditions", [])
        if operator == "and":
            return all(evaluate_prereq(cond, student_courses) for cond in conditions)
        elif operator == "or":
            return any(evaluate_prereq(cond, student_courses) for cond in conditions)
        else:
            return False
    elif isinstance(prereq, list):
        return all(evaluate_prereq(item, student_courses) for item in prereq)
    else:
        return False

def prereqs_satisfied(course_code, student_courses, prereq_data):
    """
    Check if the student has satisfied prerequisites for a given course using prereq_data.
    """
    normalized = normalize_course_code(course_code)
    if normalized in prereq_data:
        prereq_structure = prereq_data[normalized]
        return evaluate_prereq(prereq_structure, student_courses)
    return True

# --- Database Connection and Data Retrieval ---

def connect_db():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not set in environment")
    return psycopg2.connect(db_url, sslmode="require")

def get_open_sections(conn):
    """
    Retrieves open sections from the database.
    Assumes a table 'sections' with columns: crn, section_code, days, time, location, instructor.
    Handles cases where the time field is not in a strict "start-end" format.
    """
    query = "SELECT crn, section_code, days, time, location, instructor FROM sections;"
    open_sections = []
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query)
        rows = cur.fetchall()
        print("🔍 Open sections raw rows:")
        for idx, row in enumerate(rows[:5]):
            print(f"Row {idx}: {row} | keys: {list(row.keys())}")
        for row in rows:
            time_str = row["time"]
            time_parts = time_str.split("-")
            if len(time_parts) == 2:
                start_time = time_parts[0].strip()
                end_time = time_parts[1].strip()
            else:
                start_time = ""
                end_time = ""
            open_sections.append({
                "crn": row["crn"],
                "code": row["section_code"],
                "name": "",  # Optionally add course title if available.
                "instructor": row["instructor"],
                "days": row["days"],
                "start_time": start_time,
                "end_time": end_time,
                "location": row["location"]
            })
    print("✅ Got open sections")
    return open_sections

def get_prereq_data(conn):
    """
    Retrieves prerequisite/corequisite JSON data from the database.
    Assumes a table 'course_requirements' with columns: course_code and prereqs_json.
    """
    query = "SELECT course_code, prereqs_json FROM course_requirements WHERE prereqs_json IS NOT NULL;"
    prereq_data = {}
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query)
        rows = cur.fetchall()
        print("🔍 Prereq Data preview:")
        for idx, row in enumerate(rows[:5]):
            print(f"Row {idx}: {row}")
        for row in rows:
            code = row["course_code"]
            # Assuming prereqs_json is stored as JSON (either text or native JSON type)
            prereq_data[normalize_course_code(code)] = row["prereqs_json"]
    return prereq_data

def get_weighted_gpa(conn, course_code, instructor):
    """
    Retrieves the precomputed weighted average GPA for a given course and instructor
    from the avg_gpa_stats table.
    
    The avg_gpa_stats table has columns: course_code, instructor, avg_gpa.
    """
    query = "SELECT avg_gpa FROM avg_gpa_stats WHERE course_code = %s AND instructor = %s;"
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(query, (course_code, instructor))
        row = cur.fetchone()
        if row:
            return float(row["avg_gpa"])
        else:
            return 0

# --- Recommendation Logic ---

def recommend_courses(dars_data, open_sections, prereq_data, conn):
    """
    Generates course recommendations based on the student's DARS audit,
    open course sections, precomputed professor GPA data from avg_gpa_stats,
    and prerequisite/corequisite requirements.
    
    Returns:
      dict: Recommendations grouped by requirement_type.
    """
    recommendations = []
    student_courses = set(
        normalize_course_code(course["course_id"])
        for course in dars_data.get("completed_courses", []) + dars_data.get("in_progress_courses", [])
    )
    
    for req in dars_data.get("requirements_needed", []):
        req_type = req.get("requirement_type", "No Type")
        select_from = req.get("select_from", [])
        candidate_sections = []
        
        if select_from:
            for candidate in select_from:
                candidate_norm = normalize_course_code(candidate)
                for section in open_sections:
                    section_code_norm = normalize_course_code(section["code"])
                    if section_code_norm == candidate_norm:
                        if prereqs_satisfied(section["code"], student_courses, prereq_data):
                            if candidate_norm not in student_courses:
                                formatted_code = format_course_code_for_gpa(candidate_norm)
                                professor = section["instructor"].strip()
                                avg_gpa = get_weighted_gpa(conn, formatted_code, professor)
                                print(f"Adding section: {section['code']} with GPA: {avg_gpa}")
                                candidate_sections.append({
                                    "section": section,
                                    "avg_gpa": avg_gpa,
                                    "professor": professor
                                })
            candidate_sections.sort(key=lambda x: x["avg_gpa"], reverse=True)
        
        recommendations.append({
            "requirement": req_type,
            "recommended_courses": candidate_sections
        })
    
    return {"recommendations": recommendations}

# --- Main Execution ---

if __name__ == "__main__":
    # Load DARS data from file.
    dars_file_path = "/Users/shyam/HokieMatch/data/dars_output.json"
    try:
        with open(dars_file_path, "r") as f:
            dars_data = json.load(f)
    except Exception as e:
        print(f"❌ Failed to load DARS data from {dars_file_path}: {e}")
        exit(1)
    
    # Connect to the database.
    try:
        conn = connect_db()
    except Exception as e:
        print(f"❌ Failed to connect to the database: {e}")
        exit(1)
    
    # Retrieve real-time data.
    try:
        open_sections = get_open_sections(conn)
        prereq_data = get_prereq_data(conn)
    except Exception as e:
        print(f"❌ Failed to retrieve data from the database: {e}")
        conn.close()
        exit(1)
    
    print("🎯 Sample DARS select_from course codes:")
    for req in dars_data["requirements_needed"]:
        for course in req.get("select_from", []):
            print(f"  → {repr(course)}")

    print("\n🎯 Sample Open Sections course codes:")
    for section in open_sections[:10]:
        print(f"  → {repr(section['code'])}")

    # Generate recommendations.
    recommendations = recommend_courses(dars_data, open_sections, prereq_data, conn)
    
    output_path = "/Users/shyam/HokieMatch/data/recommendations_output.json"
    try:
        with open(output_path, "w") as f:
            json.dump(recommendations, f, indent=2)
        print(f"✅ Recommendations written to {output_path}")
    except Exception as e:
        print(f"❌ Failed to write recommendations to file: {e}")

        
    conn.close()
