import requests
from bs4 import BeautifulSoup
import os
import json
import re
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import execute_values

# Import pyparsing for a more robust parser
from pyparsing import (
    infixNotation, opAssoc, Word, alphas, nums, Combine, ParserElement, oneOf
)

# Enable packrat parsing for better performance
ParserElement.enablePackrat()

# Load environment variables (DATABASE_URL must be defined in your .env file)
load_dotenv(dotenv_path="../.env")
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL not set in environment")

# --- Define a Grammar for Course Codes and Boolean Expressions ---
# A course code typically consists of a subject (letters) followed by a space and a number (or alphanumeric)
subject_part = Word(alphas)
number_part = Word(nums + alphas)
course_token = Combine(subject_part + " " + number_part)

# Define a boolean expression grammar with operators "and" and "or"
bool_expr = infixNotation(course_token,
    [
        (oneOf("and"), 2, opAssoc.LEFT),
        (oneOf("or"), 2, opAssoc.LEFT),
    ]
)

def parse_with_pyparsing(text):
    """
    Parse the prerequisite/corequisite string using pyparsing.
    Returns a nested Python structure.
    """
    try:
        parsed = bool_expr.parseString(text, parseAll=True).asList()

        def convert(parsed_item):
            if isinstance(parsed_item, list):
                if len(parsed_item) == 1:
                    return convert(parsed_item[0])
                elif len(parsed_item) == 3:
                    left = convert(parsed_item[0])
                    op = parsed_item[1]
                    right = convert(parsed_item[2])
                    return {"type": op, "conditions": [left, right]}
                else:
                    # Process left-associatively for longer lists
                    result = convert(parsed_item[0])
                    for i in range(1, len(parsed_item), 2):
                        op = parsed_item[i]
                        right = convert(parsed_item[i+1])
                        result = {"type": op, "conditions": [result, right]}
                    return result
            else:
                # Return the token as is
                return parsed_item
        return convert(parsed)
    except Exception as e:
        print("Error parsing prerequisites:", text, e)
        return text  # Fallback to raw string if parsing fails

def parse_req_string(req_text):
    """
    Preprocess the raw prerequisite/corequisite text to normalize whitespace and
    then parse it into a structured JSON object.
    """
    # Replace non-breaking spaces with regular spaces
    req_text = req_text.replace("\xa0", " ").strip()
    if not req_text:
        return None
    # Normalize whitespace around "and" and "or"
    req_text = re.sub(r'\s*or\s*', ' or ', req_text, flags=re.IGNORECASE)
    req_text = re.sub(r'\s*and\s*', ' and ', req_text, flags=re.IGNORECASE)
    result = parse_with_pyparsing(req_text)
    # If the result is a simple string, wrap it in a structured object
    if isinstance(result, str):
        return {"type": "single", "conditions": [result]}
    return result

# --- Scraper Functionality ---
def scrape_course_requirements(subject_code):
    """
    Scrapes the course page for the given subject code.
    For example, for ALCE the URL would be:
       https://catalog.vt.edu/undergraduate/course-descriptions/alce/
    Returns a list of dicts, one per course that has prerequisites or corequisites:
       {
         'course_code': ...,
         'title': ...,
         'prerequisites': <raw text>,
         'corequisites': <raw text>,
         'prereqs_json': <structured JSON>,
         'coreqs_json': <structured JSON>
       }
    """
    url = f"https://catalog.vt.edu/undergraduate/course-descriptions/{subject_code}/"
    response = requests.get(url)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    course_blocks = soup.find_all("div", class_="courseblock")
    courses = []
    for block in course_blocks:
        # Extract course code
        code_elem = block.find("span", class_="detail-code")
        course_code = code_elem.get_text(strip=True) if code_elem else None

        # Extract title
        title_elem = block.find("span", class_="detail-title")
        title = title_elem.get_text(strip=True) if title_elem else None

        # Extract prerequisites raw text (if any)
        prereq_elem = block.find("span", class_="detail-prereq")
        raw_prereq = (prereq_elem.get_text(strip=True)
                      .replace("Prerequisite(s):", "").strip()) if prereq_elem else ""

        # Extract corequisites raw text (if any)
        coreq_elem = block.find("span", class_="detail-coreq")
        raw_coreq = (coreq_elem.get_text(strip=True)
                     .replace("Corequisite(s):", "").strip()) if coreq_elem else ""

        # Only include courses with prerequisite or corequisite info
        if not raw_prereq and not raw_coreq:
            continue

        # Parse into structured JSON
        prereqs_json = parse_req_string(raw_prereq) if raw_prereq else None
        coreqs_json = parse_req_string(raw_coreq) if raw_coreq else None

        courses.append({
            "course_code": course_code,
            "title": title,
            "prerequisites": raw_prereq,
            "corequisites": raw_coreq,
            "prereqs_json": prereqs_json,
            "coreqs_json": coreqs_json
        })
    return courses

# --- Database Insertion ---
def insert_course_requirements(conn, courses):
    """
    Inserts or updates course requirement data into the course_requirements table.
    Expects each course as a dict containing raw prerequisite/corequisite strings
    and the structured JSON versions.
    """
    if not courses:
        print("No course requirement data to insert.")
        return

    query = """
    INSERT INTO course_requirements (
       course_code, 
       title, 
       prerequisites, 
       corequisites, 
       prereqs_json, 
       coreqs_json
    )
    VALUES %s
    ON CONFLICT (course_code) DO UPDATE 
       SET title = EXCLUDED.title,
           prerequisites = EXCLUDED.prerequisites,
           corequisites = EXCLUDED.corequisites,
           prereqs_json = EXCLUDED.prereqs_json,
           coreqs_json = EXCLUDED.coreqs_json;
    """
    data_tuples = []
    for c in courses:
        data_tuples.append((
            c["course_code"],
            c["title"],
            c["prerequisites"],
            c["corequisites"],
            json.dumps(c["prereqs_json"]) if c["prereqs_json"] else None,
            json.dumps(c["coreqs_json"]) if c["coreqs_json"] else None
        ))
    with conn.cursor() as cur:
        execute_values(cur, query, data_tuples)
    conn.commit()
    print(f"Inserted/Updated {len(courses)} rows into course_requirements.")

def main():
    subjects = [
        "AAD", "AAEC", "ACIS", "ADS", "ADV", "AFST", "AHRM", "AINS", "AIS", "ALCE", "ALS",
        "AOE", "APS", "APSC", "ARBC", "ARCH", "ART", "AS", "ASPT", "AT", "BC", "BCHM", "BDS",
        "BIOL", "BIT", "BMES", "BMSP", "BMVS", "BSE", "CEE", "CEM", "CHE", "CHEM", "CHN",
        "CINE", "CLA", "CMDA", "CMST", "CNST", "COMM", "CONS", "COS", "CRIM", "CS", "CSES",
        "DANC", "DASC", "ECE", "ECON", "EDCI", "EDCO", "EDCT", "EDEL", "EDEP", "EDHE",
        "EDIT", "EDP", "EDRE", "EDTE", "ENGE", "ENGL", "ENGR", "ENSC", "ENT", "ESM", "FA",
        "FIN", "FIW", "FL", "FMD", "FR", "FREC", "FST", "GBCB", "GEOG", "GEOS", "GER", "GIA",
        "GR", "GRAD", "HD", "HEB", "HIST", "HNFE", "HORT", "HTM", "HUM", "IDS", "IS",
        "ISC", "ISE", "ITAL", "ITDS", "JMC", "JPN", "JUD", "LAHS", "LAR", "LAT", "LDRS",
        "MACR", "MATH", "ME", "MGT", "MINE", "MKTG", "MN", "MS", "MSE", "MTRG", "MUS",
        "NANO", "NEUR", "NR", "NSEG", "PAPA", "PHIL", "PHS", "PHYS", "PM", "PORT", "PPE",
        "PPWS", "PR", "PSCI", "PSVP", "PSYC", "REAL", "RED", "RLCL", "RTM", "RUS", "SBIO",
        "SOC", "SPAN", "SPES", "SPIA", "STAT", "STL", "STS", "SYSB", "TA", "TBMH", "UAP",
        "UH", "UNIV", "VM", "WATR", "WGS"
    ]

    conn = psycopg2.connect(DATABASE_URL, sslmode="require")

    try:
        for subject in subjects:
            print(f"\nScraping course requirements for subject: {subject} ...")
            try:
                course_data = scrape_course_requirements(subject.lower())
                print(f"Found {len(course_data)} courses with prereq/coreq data.")
                insert_course_requirements(conn, course_data)
            except Exception as e:
                print(f"Error scraping subject {subject}: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
