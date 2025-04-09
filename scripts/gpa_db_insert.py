import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv
import os

# Load environment variables (including DATABASE_URL)
load_dotenv(dotenv_path="../.env")
db_url = os.getenv("DATABASE_URL")
print("DB URL Loaded:", bool(db_url))

# Load CSV
df = pd.read_csv("/Users/shyam/HokieMatch/data/Grade Distribution.csv")

# Prepare data
def format_semester(term, year):
    return f"{term} {year}"

df['course_code'] = df['Subject'] + "-" + df['Course No.'].astype(str)
df['semester'] = df.apply(lambda row: format_semester(row['Term'], row['Academic Year']), axis=1)

# Select and rename relevant columns
upload_df = df[['course_code', 'Instructor', 'GPA', 'Graded Enrollment', 'semester']].copy()
upload_df.columns = ['course_code', 'instructor', 'avg_gpa', 'num_students', 'semester']

# Drop rows with missing GPA or Enrollment
upload_df.dropna(subset=['avg_gpa', 'num_students'], inplace=True)

# Convert to correct data types
upload_df['avg_gpa'] = upload_df['avg_gpa'].astype(float)
upload_df['num_students'] = upload_df['num_students'].astype(int)

# Insert into Supabase
conn = psycopg2.connect(db_url, sslmode="require")
with conn.cursor() as cur:
    query = """
    INSERT INTO gpa_stats (course_code, instructor, avg_gpa, num_students, semester)
    VALUES %s
    ON CONFLICT DO NOTHING;
    """
    execute_values(cur, query, upload_df.values.tolist())
    conn.commit()
    print(f"✅ Inserted {len(upload_df)} rows into gpa_stats.")

conn.close()
