from ultralytics import YOLO
from transformers import pipeline
from PIL import Image

import cv2
import numpy as np
import torch

print("Loading YOLO...")
yolo = YOLO("yolov8s.pt")

print("Loading Depth Model...")
depth_estimator = pipeline(
    task="depth-estimation",
    model="Intel/dpt-hybrid-midas"
)

print("CUDA:", torch.cuda.is_available())

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    # YOLO Detection

    results = yolo(frame, device=0, verbose=False)

    annotated = results[0].plot()

    # Depth Estimation
  
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    pil_image = Image.fromarray(rgb_frame)

    depth = depth_estimator(pil_image)["depth"]

    depth_array = np.array(depth)

    # resize depth map to webcam size
    depth_array = cv2.resize(
        depth_array,
        (frame.shape[1], frame.shape[0])
    )

    # Object Depth

    for box in results[0].boxes:

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        cx = int((x1 + x2) / 2)
        cy = int((y1 + y2) / 2)

        depth_value = depth_array[cy, cx]

        cls_id = int(box.cls[0])
        class_name = yolo.names[cls_id]

        print(
            f"{class_name} | Depth: {depth_value:.2f}"
        )

        cv2.putText(
            annotated,
            f"{depth_value:.2f}",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0,255,0),
            2
        )

    cv2.imshow("Depth + YOLO", annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()