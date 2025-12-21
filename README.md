# 🚀 Appian Predictive Operations 

Welcome to the **Appian Predictive Operations** repository!  
This project is a **Full-Stack Intelligent Operations Dashboard** built to optimize workforce allocation using **Generative AI (Groq / Llama-3)** and **Predictive Analytics**.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20Python-blue)

---

## 📌 Overview

Operations teams often face:
- SLA breaches
- Inefficient staff allocation
- Poor workload visibility
- Manual and delayed decision-making

**Appian Predictive Operations AI** addresses these challenges by combining:
- AI-driven workload forecasting  
- Intelligent staff optimization  
- Conversational AI for real-time insights  

All within a single, interactive dashboard.

---

## 🌟 Key Features

### 🧠 HONEY(Holistic Operations Navigation & Efficiency Yielder) AI Chatbot
A context-aware AI assistant acting as an **Operations Expert**.
- Answers queries related to SLAs, staffing, and workload
- Powered by **Groq Llama-3**
- Embedded directly into the dashboard UI

---

### 📊 Predictive Forecasting
- **AI Confidence Intervals** (Upper & Lower bounds)
- **Time Range Toggle** (24-Hour / 7-Day forecasts)
- **Staffing Heatmap** to highlight high-stress periods

---

### 👥 Intelligent Resource Planning
- **Persistent Database**
  - Uses `staff_db.json`
  - Retains employee data across server restarts
- **Real-Time AI Audit**
  - Detects staffing imbalances automatically
- **One-Click Optimization**
  - Instantly apply AI-recommended staff reallocations

---

### ⚙️ Admin Control Center
- **Simulation Engine**
  - What-if analysis for volume spikes and staff reductions
- **Configurable SLA Thresholds**
- **Audit Log Export**
  - Download system logs as CSV

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Recharts

### Backend
- Python
- FastAPI
- Pandas
- Pydantic

### AI & Analytics
- Groq API
- Llama-3
- Predictive modeling with confidence intervals

---

## 🛠️ Prerequisites

Ensure the following are installed on your system:

1. **Node.js (v16 or higher)**  
   https://nodejs.org/

2. **Python (v3.9 or higher)**  
   https://www.python.org/

3. **Git**  
   https://git-scm.com/

---

## 🚀 Setup Guide (Step-by-Step)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/HemangDubey/appian-predictive-project.git
cd appian-predictive-project

```

### 2️⃣ Backend Setup (Python/FastAPI)

Open a terminal in the root folder:

1. **Navigate to backend:**
```bash
cd backend

```


2. **Install Dependencies:**
```bash
pip install fastapi uvicorn pandas openai pydantic

```


3. **Configure API Key:**
* Open `backend/main.py`.
* Locate the `client` setup (approx Line 26).
* Replace `gsk_...` with your valid **Groq API Key**.
* *(Free keys available at [console.groq.com](https://console.groq.com/keys))*.


4. **Start Server:**
```bash
uvicorn main:app --reload

```


*Terminal should show: `Uvicorn running on http://127.0.0.1:8000*`

### 3️⃣ Frontend Setup (React/Vite)

Open a **NEW** terminal (keep the backend running) and run:

1. **Navigate to frontend:**
```bash
cd frontend

```


2. **Install Dependencies:**
```bash
npm install

```


3. **Start Application:**
```bash
npm run dev

```


4. **Launch:**
* Click the Local Link displayed (usually `http://localhost:5173`).



---

## 📂 Project Structure

```text
appian-predictive-project/
│
├── backend/                # Python FastAPI Server
│   ├── main.py             # Core Logic, API Endpoints & AI Integration
│   ├── staff_db.json       # Persistent Database (Auto-generated on run)
│   └── appian_historical_data.csv # Dataset for analysis
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── App.jsx         # Main Dashboard & Logic
│   │   ├── ChatAssistant.jsx # Honey AI Chatbot Component
│   │   └── index.css       # Tailwind CSS Styling
│   └── package.json
│
└── README.md               # Project Documentation

```

---

## ⚠️ Troubleshooting

* **Error: `pip is not recognized**`
* Ensure Python is added to your system PATH variables.


* **Error: `Connection Refused` on Frontend**
* Verify that the **Backend Terminal** is running and shows "Uvicorn running".


* **Error: `401 Unauthorized` in Chatbot**
* Check `backend/main.py` and ensure your API Key is correct and inside quotes `" "`.
---

## 🤝 Contributions

This project was designed, developed, and maintained by:

- **Hemang Dubey**  
  🔗 LinkedIn: https://www.linkedin.com/in/hemang-dubey-7b801628b/

- **Akshat Agrawal**  
  🔗 LinkedIn: https://www.linkedin.com/in/akshat-agrawal-3b0b13255/

- **Jayesh Pani**  
  🔗 LinkedIn: https://www.linkedin.com/in/jayesh-pani-a9ab7628a/

Contributions, suggestions, and improvements are always welcome.  
Feel free to fork the repository, raise issues, or submit pull requests.

