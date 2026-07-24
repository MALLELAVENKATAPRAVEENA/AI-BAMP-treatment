# AI-Based Predictor for Successful Treatment Outcome of BAMP in Class III Skeletal Malocclusion with Maxillary Hypoplasia

A production-grade, full-stack healthcare web application combining machine learning, automated cephalometric landmark detection, SHAP explainability, 3D craniofacial visualization, and PDF report generation to assist orthodontists in assessing treatment outcomes for Bone-Anchored Maxillary Protraction (BAMP).

---

## 🌟 Key Features

1. **Role-Based Authentication System**:
   - Roles: Administrator, Orthodontist, Researcher.
   - Strict password requirements (7-9 chars, uppercase, lowercase, digit, special character).
   - Firebase Authentication with Email OTP verification, token handling, and password reset flows.

2. **Patient & Growth Assessment Module**:
   - Detailed patient records, clinical history, CVM stage tracking (CVM 1–6), skeletal vs chronological age evaluation, and treatment milestones.

3. **Cephalometric Landmark Detection & Calculations**:
   - 11 Key Landmarks: Sella (S), Nasion (N), Point A, Point B, Pogonion (Pog), Gnathion (Gn), Gonion (Go), ANS, PNS, Orbitale (Or), Porion (Po).
   - Direct calculation of Skeletal (SNA, SNB, ANB, Wits, FMA, Y-Axis, Convexity), Dental (IMPA, U1-SN, Interincisal Angle), and Soft Tissue (E-Line) metrics.

4. **AI Outcome Prediction & SHAP Analysis**:
   - Ensemble prediction (Random Forest & XGBoost) for BAMP success probability.
   - Risk Categorization:
     - **Success**: > 85%
     - **Moderate Risk**: 70% – 85%
     - **High Risk**: < 70%
   - SHAP summary plot visualizations explaining feature contributions.

5. **3D Craniofacial Interactive Visualization**:
   - Three.js viewer with rotation, zoom, landmark rendering, and before/after BAMP maxillary protraction simulation.

6. **Professional PDF Reports**:
   - Multi-page clinical reports using PDFKit containing growth metrics, overlay graphics, cephalometric tables, prediction summary, and SHAP analyses.

---

## 📁 Repository Structure

```
web/
├── frontend/             # React.js + Vite + MUI + Redux Toolkit + Three.js
├── backend/              # Node.js + Express + Firebase Admin + PDFKit
│   └── ai-service/       # Python FastAPI + OpenCV + XGBoost + Scikit-Learn + SHAP
├── firebase/             # Firestore rules, indexes & firebase config
├── docker-compose.yml    # Container orchestration
└── README.md             # Core Documentation
```

---

## 🚀 Quick Start

1. Install backend dependencies: `cd web/backend && npm install`
2. Install frontend dependencies: `cd web/frontend && npm install`
3. Install Python AI dependencies: `cd web/backend/ai-service && pip install -r requirements.txt`
4. Start backend: `npm run dev` in `web/backend`
5. Start AI service: `uvicorn app:app --port 8000` in `web/backend/ai-service`
6. Start frontend: `npm run dev` in `web/frontend`
