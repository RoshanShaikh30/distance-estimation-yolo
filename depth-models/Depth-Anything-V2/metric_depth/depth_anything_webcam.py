import cv2
import torch
import numpy as np

from depth_anything_v2.dpt import DepthAnythingV2

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

model_configs = {
    'vitb': {
        'encoder': 'vitb',
        'features': 128,
        'out_channels': [96, 192, 384, 768]
    }
}

print("Loading Depth Anything V2 Metric...")

model = DepthAnythingV2(
    **model_configs['vitb'],
    max_depth=20
)

model.load_state_dict(
    torch.load(
        "checkpoints/depth_anything_v2_metric_hypersim_vitb.pth",
        map_location=DEVICE
    )
)

model = model.to(DEVICE).eval()

print("Model loaded")

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    depth = model.infer_image(frame)
    
    h, w = depth.shape
    center_x = w // 2
    center_y = h // 2
    center_depth = depth[center_y, center_x]
    print(f"Center Depth: {center_depth:.2f} m")   

    depth_vis = cv2.normalize(
        depth,
        None,
        0,
        255,
        cv2.NORM_MINMAX
    )

    depth_vis = depth_vis.astype(np.uint8)
    
    cv2.putText(
     frame,
     f"{center_depth:.2f} m",
     (20, 40),
     cv2.FONT_HERSHEY_SIMPLEX,
     1,
     (0, 255, 0),
     2
    )

    cv2.imshow("Webcam", frame)
    cv2.imshow("Metric Depth", depth_vis)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()