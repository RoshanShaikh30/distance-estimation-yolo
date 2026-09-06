from transformers import pipeline
import cv2
from PIL import Image
import numpy as np

print("Loading depth model...")
depth_estimator = pipeline(
    task="depth-estimation",
    model="Intel/dpt-hybrid-midas"
)

print("Depth model loaded")

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    pil_image = Image.fromarray(
        cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    )

    depth = depth_estimator(pil_image)["depth"]

    depth_array = np.array(depth)

    h, w = depth_array.shape

    center_depth = depth_array[h // 2, w // 2]

    print(f"Center Depth: {center_depth:.2f}")

    cv2.circle(
        frame,
        (w // 2, h // 2),
        5,
        (0, 0, 255),
        -1
    )

    cv2.imshow("Calibration", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()