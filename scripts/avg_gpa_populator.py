import psycopg2
from psycopg2.extras import RealDictCursor
import os
import re

# --- Utilities ---

def normalize_course_code(code):
    return code.replace(" ", "").replace("-", "").upper()

def normalize_semester(semester_str):
    """
    Converts 'Fall 2023-24' → numerical weighting.
    Newer semesters get higher weights.
    """
    weights = {
        "Spring": 1,
        "Summer": 2,
        "Fall": 3
    }

    match = re.match(r"(Spring|Summer|Fall)\s+(\d{4})", semester_str)
    if match:
        season, year = match.groups()
        year = int(year)
        base = year * 10
        return base + weights.get(season, 0)
    return 0  # fallback weight if format is unknown

# --- Main Logic ---

def populate_avg_gpa_stats():
    try:
        conn = psycopg2.connect(os.environ["DATABASE_URL"], sslmode="require")
        query = "SELECT course_code, instructor, avg_gpa, semester FROM gpa_stats WHERE avg_gpa IS NOT NULL;"
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            rows = cur.fetchall()

            # Debug: Print number of rows fetched
            print(f"Fetched {len(rows)} rows from gpa_stats.")

            # Build weighted GPA map
            gpa_map = {}
            for row in rows:
                course = normalize_course_code(row["course_code"])
                instructor = row["instructor"].strip()
                gpa = float(row["avg_gpa"])
                semester = row["semester"]
                weight = normalize_semester(semester)

                key = (course, instructor)
                if key not in gpa_map:
                    gpa_map[key] = {"weighted_sum": 0.0, "total_weight": 0.0}

                gpa_map[key]["weighted_sum"] += gpa * weight
                gpa_map[key]["total_weight"] += weight

            # Prepare insert values
            values = [
                (course, instructor, round(data["weighted_sum"] / data["total_weight"], 3))
                for (course, instructor), data in gpa_map.items()
                if data["total_weight"] > 0
            ]

            # Debug: Print number of values prepared for insertion
            print(f"Prepared {len(values)} values for insertion.")

            # Clear and insert into avg_gpa_stats
            # Clear the table first
            cur.execute("DELETE FROM avg_gpa_stats;")
            conn.commit()
            print("✅ Cleared existing rows.")

            # Insert in batches
            BATCH_SIZE = 1000
            for i in range(0, len(values), BATCH_SIZE):
                batch = values[i:i + BATCH_SIZE]
                cur.executemany(
                    "INSERT INTO avg_gpa_stats (course_code, instructor, avg_gpa) VALUES (%s, %s, %s);",
                    batch
                )
                conn.commit()
                print(f"✅ Inserted batch {i // BATCH_SIZE + 1}")


        conn.close()
    except Exception as e:
        print(f"❌ An error occurred: {e}")

# --- Entry Point ---
if __name__ == "__main__":
    populate_avg_gpa_stats()
