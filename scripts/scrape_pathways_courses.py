import collections
import collections.abc
if not hasattr(collections, 'Callable'):
    collections.Callable = collections.abc.Callable

from dotenv import load_dotenv
import os
load_dotenv(dotenv_path="../.env")
print(f"DATABASE_URL LOADED: {os.environ.get('DATABASE_URL')}")

import re
import pdfplumber
import psycopg2
from psycopg2.extras import execute_values

def parse_pathways_pdf(pdf_path):
    """
    Parses the Pathways PDF, extracting:
      - The 'pathways_req' from headings like '... (4)' or '(1a)'
      - Each row of the table below that heading:
        SUBJECT | COURSE | COURSE TITLE | CROSSLIST | PREREQUISITES | OTHER INFORMATION | PATHWAYS MINORS
    Returns a list of dicts, each containing:
      {
        'course_code': 'SUBJECT COURSE',
        'pathways_req': '4',
        'course_title': ...,
        'crosslist': ...,
        'prerequisites': ...,
        'other_info': ...,
        'pathways_minors': ...
      }
    """

    courses = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            # 1) Try to find a heading line that ends with (4) or (1f), etc
            #    e.g. "Reasoning in the Natural Sciences (4)"
            #    We'll search for the last occurrence, in case there's more text
            heading_match = re.search(r'\(([0-9a-zA-Z]+)\)$', text.strip(), re.MULTILINE)
            current_req = heading_match.group(1) if heading_match else None

            # 2) Extract the table
            table = page.extract_table()
            if not table:
                # No table on this page? Skip.
                continue

            # The first row might be a header if it has 'SUBJECT' or 'COURSE'
            # We'll check that and skip the row if so
            header_row = table[0]
            start_index = 0
            if header_row and len(header_row) >= 7:
                # If 'SUBJECT' is in the first cell, we skip
                if "SUBJECT" in (header_row[0] or "").upper():
                    start_index = 1

            # For each row, parse columns
            for row in table[start_index:]:
                if len(row) < 7:
                    # Row is incomplete or blank
                    continue

                subject         = (row[0] or "").strip()
                course_num      = (row[1] or "").strip()
                title           = (row[2] or "").strip()
                crosslist       = (row[3] or "").strip()
                prereqs         = (row[4] or "").strip()
                other_info      = (row[5] or "").strip()
                minors_col      = (row[6] or "").strip()

                # Combine subject+course
                # e.g. "ENGL" + "1105" => "ENGL 1105"
                course_code = f"{subject} {course_num}".strip()

                # If there's no heading found on this page, you might skip or store a placeholder
                # We'll skip if current_req is None
                if not current_req:
                    continue

                # Build the dictionary
                courses.append({
                    "course_code": course_code,
                    "pathways_req": current_req,
                    "course_title": title,
                    "crosslist": crosslist,
                    "prerequisites": prereqs,
                    "other_info": other_info,
                    "pathways_minors": minors_col
                })

    return courses

def connect_db():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not set in environment")
    return psycopg2.connect(db_url, sslmode="require")

def insert_pathways_courses(conn, courses):
    if not courses:
        print("No parsed courses to insert.")
        return

    query = """
        INSERT INTO pathways_courses (
          course_code,
          pathways_req,
          course_title,
          crosslist,
          prerequisites,
          other_info,
          pathways_minors
        )
        VALUES %s
        ON CONFLICT (course_code, pathways_req) DO NOTHING;
    """
    values = [
        (
            c["course_code"],
            c["pathways_req"],
            c["course_title"],
            c["crosslist"],
            c["prerequisites"],
            c["other_info"],
            c["pathways_minors"]
        )
        for c in courses
    ]
    with conn.cursor() as cur:
        execute_values(cur, query, values)
    conn.commit()
    print(f"✅ Inserted {len(values)} rows into pathways_courses.")

if __name__ == "__main__":
    pdf_path = "/Users/shyam/HokieMatch/data/pathways_courses.pdf"  # Ensure the file is in the same folder or use an absolute path
    print("Parsing Pathways PDF...")
    courses_data = parse_pathways_pdf(pdf_path)
    print(f"Total parsed courses: {len(courses_data)}")

    # Show the first few for sanity check
    for c in courses_data[:5]:
        print(c)

    try:
        conn = connect_db()
        insert_pathways_courses(conn, courses_data)
        conn.close()
    except Exception as e:
        print(f"❌ Error inserting into database: {e}")

    print("Done.")
