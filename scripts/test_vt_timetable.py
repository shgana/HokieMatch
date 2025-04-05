#!/usr/bin/env python3
import sys
import os

# Add lib to the Python path so we can import VT_Timetable
sys.path.append(os.path.join(os.path.dirname(__file__), '../lib/VT_Timetable/pyvt'))

from VT_Timetable import Timetable

def main():
    term = "202509"  # Example: Fall 2024
    subject = "CS"   # Try "MATH", "STAT", etc. for other subjects

    timetable = Timetable()

    try:
        print(f"🔍 Looking up subject: {subject} for term {term}")
        sections = timetable.subject_lookup(subject, term_year=term, open_only=False)

        if not sections:
            print("⚠️ No sections found.")
            return

        print(f"✅ Found {len(sections)} sections. Showing first 5:\n")

        for section in sections[:5]:
            print(f"{section.name} | CRN: {section.crn} | Days: {section.days} | Time: {section.start_time}-{section.end_time} | Instructor: {section.instructor}")

    except Exception as e:
        print(f"X Error: {e}")

if __name__ == "__main__":
    main()
