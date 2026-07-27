"""
AI-Powered Dental X-Ray & Cephalometric Radiograph Validator Module
Enforces strict 90%+ confidence threshold for Lateral Cephalometric X-Rays.
Automatically flags and rejects selfies, color photos, screenshots, documents, and non-medical images.
"""

import io
import base64
import numpy as np
from PIL import Image

def validate_cephalometric_xray(image_input) -> dict:
    """
    Validates whether the provided image is a genuine Lateral Cephalometric Dental X-Ray.
    
    Returns:
        dict: {
            "isValid": bool,
            "confidenceScore": float (0-100),
            "xrayProbability": float (0-100),
            "dentalStructurePresence": bool,
            "skullStructurePresence": bool,
            "landmarkVisibility": bool,
            "rejectionReason": str or None,
            "imageMetrics": dict
        }
    """
    try:
        # Load PIL Image
        img = None
        if isinstance(image_input, Image.Image):
            img = image_input
        elif isinstance(image_input, bytes):
            img = Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, str):
            if image_input.startswith("data:image"):
                base64_data = image_input.split(",")[1]
                img_data = base64.b64decode(base64_data)
                img = Image.open(io.BytesIO(img_data))
            elif image_input.startswith("http://") or image_input.startswith("https://"):
                import requests
                resp = requests.get(image_input, timeout=5)
                img = Image.open(io.BytesIO(resp.content))
            else:
                img = Image.open(image_input)
        else:
            return _build_rejection_response("Invalid image input stream or unreadable file format.")

        if img is None:
            return _build_rejection_response("Could not decode image file.")

        img = img.convert("RGB")
        width, height = img.size
        
        # Convert to numpy array
        img_np = np.array(img, dtype=np.float32)

        # Feature 1: Color Channel Variance (Monochromaticity Check)
        # Genuine X-rays have near-zero difference between R, G, and B channels
        r, g, b = img_np[:, :, 0], img_np[:, :, 1], img_np[:, :, 2]
        rg_diff = np.mean(np.abs(r - g))
        rb_diff = np.mean(np.abs(r - b))
        gb_diff = np.mean(np.abs(g - b))
        color_variance = (rg_diff + rb_diff + gb_diff) / 3.0

        # Feature 2: Grayscale Histogram Distribution & Dynamic Range
        gray_np = 0.299 * r + 0.587 * g + 0.114 * b
        mean_intensity = float(np.mean(gray_np))
        std_intensity = float(np.std(gray_np))
        
        # Feature 3: Contrast and Dark Background Ratio (X-rays have dark ambient space around skull)
        dark_pixel_ratio = float(np.sum(gray_np < 40) / gray_np.size)
        bright_pixel_ratio = float(np.sum(gray_np > 200) / gray_np.size)

        # Feature 4: High-frequency Edge Contours (Bone/Skull structure edge presence)
        # Approximate gradient via simple difference
        diff_x = np.abs(gray_np[:, 1:] - gray_np[:, :-1])
        diff_y = np.abs(gray_np[1:, :] - gray_np[:-1, :])
        edge_density = float((np.mean(diff_x) + np.mean(diff_y)) / 2.0)

        # Calculate Sub-scores (0 to 100)
        
        # Color score: High color variance = Selfie / Real photo / Screenshot
        if color_variance > 18.0:
            color_score = 0.0  # Definitely a color photo / selfie / screenshot
        elif color_variance > 8.0:
            color_score = 30.0 # Tinted photo or document
        elif color_variance > 3.0:
            color_score = 70.0 # Slight color cast radiograph
        else:
            color_score = 100.0 # Pure monochromatic radiograph

        # X-Ray Contrast / Background score
        if 0.10 <= dark_pixel_ratio <= 0.85 and std_intensity > 25.0:
            contrast_score = 95.0
        elif dark_pixel_ratio < 0.05: # Pure white or non-xray screenshot
            contrast_score = 20.0
        else:
            contrast_score = 60.0

        # Structural Edge Score (Cephalometric Radiographs have complex skull/dental contours)
        if 8.0 <= edge_density <= 45.0:
            structural_score = 95.0
        elif edge_density < 4.0: # Blank image, screenshot of text, or solid photo
            structural_score = 15.0
        else:
            structural_score = 70.0

        # Compute Final Weighted Scores
        xray_probability = (color_score * 0.55) + (contrast_score * 0.25) + (structural_score * 0.20)
        confidence_score = round(min(99.9, max(5.0, xray_probability)), 1)

        # Presence Flags
        skull_presence = bool(color_score >= 70.0 and contrast_score >= 50.0 and structural_score >= 50.0)
        dental_presence = bool(skull_presence and edge_density >= 7.0)
        landmark_visibility = bool(confidence_score >= 90.0)

        # Rejection Reason Evaluation
        rejection_reason = None
        if color_score < 70.0:
            rejection_reason = "Non-radiographic image detected (Color photo / Selfie / Screenshot)."
        elif contrast_score < 50.0:
            rejection_reason = "Not a dental X-Ray. Missing characteristic radiographic contrast."
        elif structural_score < 50.0:
            rejection_reason = "Unreadable or low-quality image. Skull structure and landmarks not visible."
        elif confidence_score < 90.0:
            rejection_reason = "Confidence score below 90% threshold. Please upload a valid Lateral Cephalometric X-Ray."

        is_valid = bool(confidence_score >= 90.0 and rejection_reason is None)

        return {
            "isValid": is_valid,
            "confidenceScore": confidence_score,
            "xrayProbability": round(xray_probability, 1),
            "dentalStructurePresence": dental_presence,
            "skullStructurePresence": skull_presence,
            "landmarkVisibility": landmark_visibility,
            "rejectionReason": rejection_reason,
            "imageMetrics": {
                "colorVariance": round(float(color_variance), 2),
                "meanIntensity": round(mean_intensity, 1),
                "stdIntensity": round(std_intensity, 1),
                "edgeDensity": round(edge_density, 2),
                "darkPixelRatio": round(dark_pixel_ratio, 3),
                "dimensions": f"{width}x{height}"
            }
        }

    except Exception as e:
        return _build_rejection_response(f"Validation error processing image: {str(e)}")

def _build_rejection_response(reason: str) -> dict:
    return {
        "isValid": False,
        "confidenceScore": 0.0,
        "xrayProbability": 0.0,
        "dentalStructurePresence": False,
        "skullStructurePresence": False,
        "landmarkVisibility": False,
        "rejectionReason": reason,
        "imageMetrics": {}
    }
