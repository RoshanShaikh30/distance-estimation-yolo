from fastapi import FastAPI, UploadFile, File
from detector import detect_objects
import cv2
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    image_bytes = await file.read()

    np_array = np.frombuffer(
        image_bytes,
        np.uint8
    )

    frame = cv2.imdecode(
        np_array,
        cv2.IMREAD_COLOR
    )

    detections = detect_objects(frame)
    return {
    "success": True,
    "scan_id": "test123",
    "total_objects": len(detections),
    "detections": detections
     }