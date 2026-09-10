import cv2
import torch
import numpy as np

from ultralytics import YOLO
from depth_anything_v2.dpt import DepthAnythingV2

# DEVICE
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# YOLO

print("Loading YOLO...")
yolo = YOLO("../../../yolov8s.pt")

# DEPTH ANYTHING V2 METRIC

print("Loading Metric Depth Model...")

model_configs = {
    'vitb': {
        'encoder': 'vitb',
        'features': 128,
        'out_channels': [96, 192, 384, 768]
    }
}

depth_model = DepthAnythingV2(
    **model_configs['vitb'],
    max_depth=20
)

depth_model.load_state_dict(
    torch.load(
        "checkpoints/depth_anything_v2_metric_hypersim_vitb.pth",
        map_location=DEVICE
    )
)

depth_model = depth_model.to(DEVICE).eval()

print("Models loaded")


# WEBCAM
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    # DEPTH MAP

    depth = depth_model.infer_image(frame)

#YOLO

    results = yolo(frame, verbose=False)

    for box in results[0].boxes:

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        cls_id = int(box.cls[0])
        class_name = yolo.names[cls_id]

        # object center

        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2

        # depth at object center

        object_depth = depth[cy, cx]

        print(
            f"{class_name} | Distance: {object_depth:.2f} m"
        )

        # bounding box

        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (255, 0, 0),
            2
        )

        # center point

        cv2.circle(
            frame,
            (cx, cy),
            4,
            (0, 0, 255),
            -1
        )

        # label

        cv2.putText(
            frame,
            f"{class_name}: {object_depth:.2f}m",
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

    cv2.imshow("YOLO + Metric Depth", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()