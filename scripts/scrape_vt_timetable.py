
import collections
import collections.abc

if not hasattr(collections, 'Callable'):
    collections.Callable = collections.abc.Callable

import requests
from bs4 import BeautifulSoup
import time

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
        print(f"❌ Failed to fetch {subject}: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find("table", class_="dataentrytable")
    if not table:
        print(f"⚠️ No results for subject {subject} in term {term}")
        return []

    rows = table.find_all("tr", attrs={"class": None})
    sections = []
    for row in rows:
        cols = [td.get_text(strip=True).replace("\xa0", " ") for td in row.find_all("td")]
        if len(cols) >= 11:
            section = {
                "crn": cols[0],
                "code": cols[1],
                "name": cols[2],
                "lecture_type": cols[3],
                "credits": cols[4],
                "capacity": cols[5],
                "instructor": cols[6],
                "days": cols[7],
                "start_time": cols[8],
                "end_time": cols[9],
                "location": cols[10],
                "exam_type": cols[11] if len(cols) > 11 else ""
            }
            sections.append(section)

    return sections


if __name__ == "__main__":
    term = "202509"  # Fall 2024 (or update to whatever's active)
    subject = "CS"   # Try "MATH", "STAT", "ECE", etc.

    print(f"🔍 Scraping {subject} for term {term}...")
    sections = scrape_subject(term, subject, open_only=False)

    print(f"✅ Found {len(sections)} sections.\n")
    for section in sections[:5]:  # Just show first 5
        print(f"{section['name']} | {section['days']} {section['start_time']}-{section['end_time']} | {section['instructor']}")
