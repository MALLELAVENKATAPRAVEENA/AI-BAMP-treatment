# Installation Guide

## Prerequisites
- **Node.js**: v18.x or higher
- **Python**: v3.9 or higher
- **npm** or **yarn**
- **Docker & Docker Compose** (Optional for containerized run)

---

## Steps

### 1. Clone & Navigate
Ensure you are inside the `web/` directory.

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. AI Service Setup
```bash
cd backend/ai-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
