"""
frontend/app.py

Streamlit skeleton for CourseMatch AI.
"""

import streamlit as st
import requests

API_URL = "http://localhost:8000"  # Adjust if you host backend elsewhere

def main():
    st.title("CourseMatch AI")
    st.write("A minimal working product for course recommendations.")

    # Example: Get all courses endpoint
    if st.button("Load All Courses"):
        try:
            resp = requests.get(f"{API_URL}/courses")
            if resp.status_code == 200:
                courses = resp.json()
                st.subheader("Courses in the System:")
                for c in courses:
                    st.write(f"{c.get('course_id', '')}: {c.get('title', '')}")
            else:
                st.error("Could not fetch courses.")
        except Exception as e:
            st.error(f"Error: {e}")

if __name__ == "__main__":
    main()
