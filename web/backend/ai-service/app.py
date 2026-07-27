"""
FastAPI Microservice for AI BAMP Outcome Predictor
Provides endpoints for cephalometric landmark detection, geometry calculation,
XGBoost & Random Forest outcome prediction, SHAP explainability, 3D craniofacial mesh generation,
strict AI X-Ray validation (>=90% confidence threshold), and AI Chatbot Assistant.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import datetime

from xray_validator import validate_cephalometric_xray
from landmark_detection.detector import detect_cephalometric_landmarks
from prediction_engine.predictor import predict_bamp_outcome
from prediction_engine.shap_analyzer import generate_shap_explanation
from visualization.mesh_generator import generate_craniofacial_mesh

app = FastAPI(
    title="AI BAMP Outcome Predictor API",
    description="Microservice for Class III Malocclusion Treatment Outcome Assessment & Strict X-Ray Validation",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ValidationRequest(BaseModel):
    xrayId: Optional[str] = None
    imageUrl: Optional[str] = None
    imageBase64: Optional[str] = None

class LandmarkRequest(BaseModel):
    xrayId: Optional[str] = "XRAY-001"
    imageUrl: Optional[str] = None
    imageBase64: Optional[str] = None

class PredictionRequest(BaseModel):
    patientId: Optional[str] = "PAT-001"
    age: Optional[float] = 11.0
    gender: Optional[str] = "Female"
    cvmStage: Optional[str] = "CVM 3"
    growthPotential: Optional[str] = "High"
    measurements: Optional[Dict[str, Any]] = None
    isXrayValidated: Optional[bool] = True

class ChatRequest(BaseModel):
    prompt: str
    history: Optional[List[Dict[str, Any]]] = []

@app.get("/")
def read_root():
    return {
        "service": "AI BAMP Outcome Predictor Microservice",
        "status": "Online",
        "version": "1.1.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/validate-xray")
def api_validate_xray(req: ValidationRequest):
    img_src = req.imageBase64 or req.imageUrl or req.xrayId
    if not img_src:
        raise HTTPException(status_code=400, detail="Missing image data or URL for validation.")
    return validate_cephalometric_xray(img_src)

@app.post("/validate-xray-file")
async def api_validate_xray_file(file: UploadFile = File(...)):
    contents = await file.read()
    return validate_cephalometric_xray(contents)

@app.post("/detect-landmarks")
def api_detect_landmarks(req: LandmarkRequest):
    img_src = req.imageBase64 or req.imageUrl
    if img_src:
        validation_res = validate_cephalometric_xray(img_src)
        if not validation_res.get("isValid"):
            raise HTTPException(
                status_code=400,
                detail=f"Landmark detection blocked: {validation_res.get('rejectionReason')}"
            )
    return detect_cephalometric_landmarks(image_url=req.imageUrl, xray_id=req.xrayId)

@app.post("/predict")
def api_predict(req: PredictionRequest):
    if req.isXrayValidated is False:
        raise HTTPException(
            status_code=400,
            detail="BAMP AI Outcome Prediction blocked. Requires a validated Lateral Cephalometric X-Ray."
        )
    patient_dict = {
        "patientId": req.patientId,
        "age": req.age,
        "gender": req.gender,
        "cvmStage": req.cvmStage,
        "growthPotential": req.growthPotential,
        "measurements": req.measurements
    }
    return predict_bamp_outcome(patient_dict)

@app.post("/shap-explanation")
def api_shap(req: PredictionRequest):
    if req.isXrayValidated is False:
        raise HTTPException(
            status_code=400,
            detail="SHAP explanation blocked. Requires a validated Lateral Cephalometric X-Ray."
        )
    return generate_shap_explanation(req.dict())

@app.post("/mesh")
def api_mesh(req: LandmarkRequest):
    return generate_craniofacial_mesh(req.xrayId)

@app.post("/chat")
def api_chat(req: ChatRequest):
    prompt = req.prompt.lower()
    
    if "bamp" in prompt or "protraction" in prompt:
        reply = (
            "**Bone-Anchored Maxillary Protraction (BAMP)** employs 4 surgical mini-plates "
            "(2 infrazygomatic maxilla + 2 parasymphyseal mandible) loaded with 150g-250g intermaxillary elastics. "
            "It delivers 2.5mm to 4.5mm skeletal maxillary protraction with minimal incisor tipping during CVM 2-3."
        )
    elif "cvm" in prompt or "stage" in prompt:
        reply = (
            "**Cervical Vertebral Maturation (CVM) Guidelines:**\n"
            "- **CVM 1-2**: Pre-peak pubertal growth.\n"
            "- **CVM 3**: Peak pubertal growth (Optimal BAMP Window).\n"
            "- **CVM 4**: Decelerating growth.\n"
            "- **CVM 5-6**: Maturation completed (Orthognathic surgery consideration)."
        )
    elif "anb" in prompt or "wits" in prompt:
        reply = (
            "**Cephalometric Norms:**\n"
            "- **ANB Angle**: Norm +2°. Values < 0° indicate Class III Skeletal Malocclusion.\n"
            "- **Wits Appraisal**: Norm -1mm (Female) / 0mm (Male). Values < -3mm indicate severe Class III."
        )
    else:
        reply = (
            f"Thank you for asking: **'{req.prompt}'**. I am your Clinical AI Orthodontic Assistant. "
            "There are no message limits—feel free to ask any questions about Class III malocclusions, "
            "BAMP protocols, cephalometric angles, patient growth stages, or medical guidelines."
        )
        
    return {
        "prompt": req.prompt,
        "reply": reply,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }
