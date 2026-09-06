from ultralytics import YOLO
import cv2
import torch
import time

prev_time = time.time()

print("Loading model...")
model = YOLO("../yolov8s.pt")
print("Model loaded")

print("CUDA:", torch.cuda.is_available())
print("Device:", torch.cuda.get_device_name(0))

print("Opening camera...")
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
print("Camera opened")

while True:

    ret, frame = cap.read()

    if not ret:
        print("Failed to read frame")
        break

    results = model(frame, device=0, verbose=False)

    annotated = results[0].plot()

    cv2.imshow("YOLO GPU Test", annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()