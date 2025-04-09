from dotenv import load_dotenv
import os
load_dotenv(dotenv_path="../.env")
print(f"DATABASE_URL LOADED: {os.environ.get('DATABASE_URL')}")

import time
import json
import requests
from bs4 import BeautifulSoup
import psycopg2
from psycopg2.extras import execute_values
import argparse


# --- Scraper Functionality ---
def scrape_subject(term, subject, open_only=False):
    url = "https://selfservice.banner.vt.edu/ssb/HZSKVTSC.P_ProcRequest"
    form_data = {
        "TERMYEAR": term,
        "subj_code": subject,
        "SCHDTYPE": "%",
        "CAMPUS": "0",
        "CORE_CODE": "AR%",
        "open_only": "on" if open_only else "",
        "BTN_PRESSED": "FIND class sections"
    }
    
    try:
        response = requests.post(url, data=form_data, timeout=10)
        response.raise_for_status()
    except Exception as e:
        print(f"❌ Failed to fetch data for subject {subject}: {e}")
        return []
    
    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table", class_="dataentrytable")
    if not table:
        print(f"⚠️ No results found for subject {subject} in term {term}")
        return []
    
    rows = table.find_all("tr", attrs={"class": None})
    sections = []
    for row in rows:
        cols = [td.get_text(strip=True).replace("\xa0", " ") for td in row.find_all("td")]
        if len(cols) >= 12 and cols[0].isdigit():
            section = {
                "crn": cols[0],
                "code": cols[1],
                "name": cols[2],
                "lecture_type": cols[3],
                "modality": cols[4],
                "credits": cols[5],
                "capacity": cols[6],
                "instructor": cols[7],
                "days": cols[8],
                "start_time": cols[9],
                "end_time": cols[10],
                "location": cols[11],
                "exam_type": cols[12] if len(cols) > 12 else ""
            }

            sections.append(section)
    return sections

# --- Extract Unique Courses from Sections ---
def extract_courses(sections):
    seen = set()
    courses = []
    for s in sections:
        key = (s["code"], s["name"])
        if key not in seen:
            seen.add(key)

            credit_raw = s.get("credits")
            credit_str = str(credit_raw).strip() if credit_raw is not None else ""

            try:
                if "-" in credit_str:
                    credit_val = int(float(credit_str.split("-")[-1]))  # Pick the max in a range
                else:
                    credit_val = int(float(credit_str))
            except:
                print(f"⚠️ Unable to parse credit value for {s['code']}: '{credit_str}'")
                credit_val = None

            course = {
                "code": s["code"],
                "title": s["name"],
                "credits": credit_val
            }
            courses.append(course)
    return courses


# --- Supabase DB Insertion using DATABASE_URL ---
def connect_db():
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not set in environment")
    return psycopg2.connect(db_url, sslmode="require")

def insert_sections(conn, sections):
    if not sections:
        return
    
    query = """
    INSERT INTO sections (crn, section_code, days, time, location, instructor)
    VALUES %s
    ON CONFLICT (crn) DO UPDATE
    SET
    section_code = EXCLUDED.section_code,
    days = EXCLUDED.days,
    time = EXCLUDED.time,
    location = EXCLUDED.location,
    instructor = EXCLUDED.instructor;
    """

    values = []
    for s in sections:
        time_combined = f"{s['start_time']}-{s['end_time']}"
        values.append((
            s["crn"],
            s["code"],
            s["days"],
            time_combined,
            s["location"],
            s["instructor"]
        ))
    
    with conn.cursor() as cur:
        execute_values(cur, query, values)
    conn.commit()
    print(f"Inserted {len(values)} sections into the database.")

def insert_courses(conn, courses):
    if not courses:
        return
    
    query = """
    INSERT INTO courses (code, title, credits)
    VALUES %s
    ON CONFLICT (code) DO UPDATE
    SET
    title = EXCLUDED.title,
    credits = EXCLUDED.credits;
    """

    values = [(c["code"], c["title"], c["credits"]) for c in courses]
    with conn.cursor() as cur:
        execute_values(cur, query, values)
    conn.commit()
    print(f"Inserted {len(values)} unique courses into the database.")

# --- Main Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--subject", help="Optional: single subject to scrape (e.g., CS)")
    parser.add_argument("--term", default="202509", help="Academic term (default: 202509)")
    args = parser.parse_args()

    subjects = [args.subject.upper()] if args.subject else [  # if --subject is passed, use it
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

    all_sections = []
    for subject in subjects:
        print(f"🔍 Scraping subject {subject} for term {args.term}...")
        sections = scrape_subject(args.term, subject, open_only=True)
        print(f"✅ Found {len(sections)} sections for {subject}.")
        all_sections.extend(sections)
        time.sleep(1)

    courses = extract_courses(all_sections)

    try:
        conn = connect_db()
        insert_courses(conn, courses)
        insert_sections(conn, all_sections)
        conn.close()
    except Exception as e:
        print(f"❌ Failed to insert into database: {e}")

