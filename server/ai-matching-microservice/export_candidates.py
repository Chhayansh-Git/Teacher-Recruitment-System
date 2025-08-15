# server/ai-matching-microservice/export_candidates.py

import os
import json
from pymongo import MongoClient
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

MONGO_URI = os.environ.get("MONGODB_URI")
DB_NAME = "test" 
CANDIDATES_COLLECTION = "candidates"
OUTPUT_DIR = "data"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "candidates.json")

def format_candidate_text(candidate):
    """
    Creates a rich, descriptive string from a candidate document
    for better semantic matching by the AI.
    """
    texts = []
    
    if candidate.get("fullName"):
        texts.append(f"{candidate.get('fullName')} is a professional applying for the position of {candidate.get('position', 'Not specified')}.")
    if candidate.get("type"):
        texts.append(f"Their specialization is in a {candidate.get('type')} role.")
    
    if candidate.get('preferredLocations'):
        texts.append(f"Preferred work locations are: {', '.join(candidate.get('preferredLocations'))}.")
    if candidate.get('expectedSalary'):
        texts.append(f"Expected annual salary is around {candidate.get('expectedSalary')}.")

    education_list = candidate.get("education", [])
    if education_list:
        edu_texts = []
        # --- FIX: Check if edu is a dictionary before trying to access its keys ---
        for edu in education_list:
            if isinstance(edu, dict):
                edu_texts.append(f"{edu.get('degree', 'a degree')} in {edu.get('specialization', 'a field')} from {edu.get('boardOrUniversity', 'a university')} (passed in {edu.get('passingYear', 'N/A')})")
        if edu_texts:
            texts.append(f"Education history includes: {', '.join(edu_texts)}.")
            
    experience_list = candidate.get("experience", [])
    if experience_list:
        exp_texts = []
        # --- FIX: Also add the same check for experience data ---
        for exp in experience_list:
            if isinstance(exp, dict):
                exp_texts.append(f"{exp.get('role', 'a role')} at {exp.get('organization', 'an organization')} ({exp.get('employmentType', 'Full-time')})")
        if exp_texts:
            texts.append(f"Work experience includes: {'. '.join(exp_texts)}.")

    if candidate.get("languages"):
        texts.append(f"Fluent in: {', '.join(candidate.get('languages'))}.")
    if candidate.get("communicationSkills"):
        texts.append(f"Noted for skills in {candidate.get('communicationSkills')}.")
    if candidate.get("achievements"):
         texts.append(f"Key achievements include: {candidate.get('achievements')}.")
    if candidate.get("extraResponsibilities"):
        texts.append(f"Has handled responsibilities such as: {', '.join(candidate.get('extraResponsibilities'))}.")

    return " ".join(filter(None, texts))

def main():
    if not MONGO_URI:
        print("❌ ERROR: MONGODB_URI not found. Make sure it's in the server/.env file.")
        return

    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    print(f"Fetching candidates from '{CANDIDATES_COLLECTION}'...")
    candidates_cursor = db[CANDIDATES_COLLECTION].find({"status": "active"})
    
    output_data = []
    count = 0
    for candidate in candidates_cursor:
        count += 1
        formatted_text = format_candidate_text(candidate)
        output_data.append({
            "id": str(candidate["_id"]),
            "profile_text": formatted_text
        })
        
    print(f"✅ Fetched and processed {count} candidates.")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)
        
    print(f"✅ Successfully wrote rich candidate data to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()