from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from openai import OpenAI  # AI Library
import json
import os
from typing import List, Optional

# --- INITIALIZATION ---
app = FastAPI(title="Appian Predictive Operations AI")

# CORS Setup (Frontend connection ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 🤖 AI CONFIGURATION (GROQ) ---
client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key="ENTER API KEY" 
)

# --- 💾 FILE DATABASE SYSTEM (PERMANENT STORAGE) ---
DB_FILE = "staff_db.json"

# Default Data 
INITIAL_STAFF = [
    {"id": 1, "name": "Alice Johnson", "role": "Sr. Reviewer", "status": "Active", "efficiency": 94, "skills": ["Audit", "Compliance"], "shift": "Morning"},
    {"id": 2, "name": "Bob Smith", "role": "Intake Specialist", "status": "Break", "efficiency": 88, "skills": ["Data Entry"], "shift": "Evening"},
    {"id": 3, "name": "Charlie Davis", "role": "Approver", "status": "Active", "efficiency": 91, "skills": ["Legal", "Risk"], "shift": "Morning"},
    {"id": 4, "name": "Dana Lee", "role": "Auditor", "status": "Offline", "efficiency": 0, "skills": ["Audit"], "shift": "Night"},
    {"id": 5, "name": "Ethan Hunt", "role": "Intake Specialist", "status": "Active", "efficiency": 98, "skills": ["Speed", "QC"], "shift": "Morning"},
]

def load_db():
    """Load staff data from JSON file (Persistent Storage)"""
    if not os.path.exists(DB_FILE):
        # Create file if not exists
        with open(DB_FILE, 'w') as f:
            json.dump(INITIAL_STAFF, f, indent=4)
        return INITIAL_STAFF
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except:
        return INITIAL_STAFF

def save_db(data):
    """Save staff data to JSON file"""
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# --- GLOBAL DATA STORE (For CSV Analysis) ---
data_store = {
    "df": None,
    "model_ready": False
}

@app.on_event("startup")
def load_data():
    """Server start hote hi CSV aur DB load karega"""
    try:
        print("🔄 Loading Historical Data...")
        # Ensure 'appian_historical_data.csv' exists
        if os.path.exists("appian_historical_data.csv"):
            df = pd.read_csv("appian_historical_data.csv")
            df['Arrival_Time'] = pd.to_datetime(df['Arrival_Time'])
            df['Completion_Time'] = pd.to_datetime(df['Completion_Time'])
            data_store["df"] = df
            data_store["model_ready"] = True
            print(f"✅ CSV Data Loaded: {len(df)} records.")
        else:
            print("⚠️ CSV file not found. Simulation running in mock mode.")
            data_store["model_ready"] = True # Allow running without CSV for demo

        # Ensure DB is ready
        load_db()
        print("✅ Staff Database Connected.")
        
    except Exception as e:
        print(f"❌ Error loading data: {e}")

# --- DATA MODELS ---
class StaffMember(BaseModel):
    id: Optional[int] = None
    name: str
    role: str
    status: str
    efficiency: int
    skills: List[str] = []
    shift: str

class SimulationRequest(BaseModel):
    staff_count_intake: int
    staff_count_review: int
    incoming_spike_percent: int

class ChatRequest(BaseModel):
    message: str

# --- 🟢 ENDPOINTS ---

@app.get("/")
def home():
    return {"status": "Online", "system": "Appian Predictive Core v2.0 AI"}

# --- 1. STAFF MANAGEMENT API (The New Part) ---

@app.get("/api/staff")
def get_all_staff():
    """Get list of all employees from DB"""
    return load_db()

@app.post("/api/staff")
def add_staff(staff: StaffMember):
    """Add new employee to DB"""
    db = load_db()
    # Generate ID automatically
    new_id = max([s['id'] for s in db]) + 1 if db else 1
    
    new_entry = staff.dict()
    new_entry['id'] = new_id
    
    db.append(new_entry)
    save_db(db) # Save to file
    return new_entry

@app.put("/api/staff/{staff_id}")
def update_staff(staff_id: int, updated_staff: StaffMember):
    """Update existing employee"""
    db = load_db()
    for i, person in enumerate(db):
        if person['id'] == staff_id:
            db[i] = updated_staff.dict()
            db[i]['id'] = staff_id # Keep original ID
            save_db(db)
            return db[i]
    raise HTTPException(status_code=404, detail="Staff not found")

@app.delete("/api/staff/{staff_id}")
def delete_staff(staff_id: int):
    """Delete employee from DB"""
    db = load_db()
    original_len = len(db)
    db = [s for s in db if s['id'] != staff_id]
    
    if len(db) == original_len:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    save_db(db)
    return {"status": "deleted", "id": staff_id}

# --- 2. DASHBOARD ANALYTICS API ---

@app.get("/api/current-stats")
def get_current_stats():
    """Dashboard Stats"""
    # If CSV loaded, use real math, else mock
    if data_store["model_ready"] and data_store["df"] is not None:
        df = data_store["df"]
        total_cases = len(df)
        avg_duration = df['Duration_Minutes'].mean()
        sla_breach_rate = (df['SLA_Breached'].sum() / total_cases) * 100
    else:
        avg_duration = 45.5
        sla_breach_rate = 12.5

    # Simulation Logic
    current_backlog = random.randint(140, 160) + random.randint(-5, 15)
    
    return {
        "active_cases": current_backlog,
        "avg_completion_time": round(avg_duration, 1),
        "sla_risk_score": round(sla_breach_rate, 1), 
        "efficiency_trend": "+4.5%"
    }

@app.get("/api/forecast-graph")
def get_forecast_graph():
    """Forecast Graph Data"""
    hours = []
    incoming_volume = []
    capacity_limit = []
    
    current_hour = datetime.now().hour
    
    for i in range(8):
        next_hour = (current_hour + i) % 24
        time_label = f"{next_hour}:00"
        
        # Simulate Peak Hours
        if 9 <= next_hour <= 17:
            base_vol = random.randint(45, 65)
        else:
            base_vol = random.randint(15, 35)
            
        hours.append(time_label)
        incoming_volume.append(base_vol)
        capacity_limit.append(50)
        
    return {
        "labels": hours,
        "incoming": incoming_volume,
        "capacity": capacity_limit
    }

@app.post("/api/run-simulation")
def run_what_if_analysis(params: SimulationRequest):
    """What-If Simulation Engine"""
    base_processing_capacity = 5 
    
    total_staff = params.staff_count_intake + params.staff_count_review
    total_capacity_per_hour = total_staff * base_processing_capacity
    
    base_load = 50 
    spike_multiplier = 1 + (params.incoming_spike_percent / 100)
    projected_load = base_load * spike_multiplier
    
    utilization = projected_load / total_capacity_per_hour if total_capacity_per_hour > 0 else 10
    
    risk_probability = min(99, (utilization ** 2) * 60) 
    
    if utilization > 1.0:
        prediction_text = "CRITICAL: Backlog will grow rapidly. Immediate staffing needed."
        status = "danger"
    elif utilization > 0.85:
        prediction_text = "WARNING: Approaching capacity limits. Monitor closely."
        status = "warning"
    else:
        prediction_text = "OPTIMAL: Resources are sufficient to handle volume."
        status = "success"

    return {
        "projected_risk": round(risk_probability, 1),
        "utilization_rate": round(utilization * 100, 1),
        "prediction_message": prediction_text,
        "status_code": status
    }

# --- 3. HONEY AI CHATBOT API ---

@app.post("/api/chat")
def chat_with_ai(request: ChatRequest):
    """Honey AI Chatbot"""
    try:
        system_prompt = """
        You are 'Honey AI', an intelligent assistant for the Appian Operations Center.
        Your goal is to help managers analyze predictive SLAs and resource allocation.
        
        Guidelines:
        - Keep answers short, professional, and data-driven.
        - If asked about 'current status', assume the system is stable but under high load.
        - You can advise on moving staff between 'Intake' and 'Review' teams.
        - Do not mention you are an AI model; act like an Operations Expert.
        """
        
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", # Updated model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        ai_reply = completion.choices[0].message.content
        return {"reply": ai_reply}
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {"reply": f"AI Error: {str(e)}"}
