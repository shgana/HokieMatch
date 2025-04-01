from fastapi import FastAPI
import json
import os
from fastapi.middleware.cors import CORSMiddleware

from coursematch_utils import (
    # Add references to your helper functions here, e.g.:
    # simple_keyword_search,
    # filter_by_pathways_area
)

app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load sample data (assuming sample_dataset.json is in ../data/)
DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "sample_dataset.json")
with open(DATA_PATH, "r", encoding="utf-8") as f:
    COURSES = json.load(f)

@app.get("/")
def root():
    """
    Basic root endpoint to confirm the server is running.
    """
    return {"message": "CourseMatch AI backend is running"}

@app.get("/courses")
def get_all_courses():
    """
    Returns all courses from the dataset.
    """
    return COURSES

# Add more endpoints below as needed
