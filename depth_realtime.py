from transformers import pipeline
import cv2
import numpy as np
from PIL import Image

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

    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_frame)
    depth = depth_estimator(pil_image)

    depth_map = np.array(depth["depth"])

    depth_map = cv2.normalize(
        depth_map,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    depth_map = depth_map.astype(np.uint8)

    cv2.imshow("Webcam", frame)
    cv2.imshow("Depth Map", depth_map)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()