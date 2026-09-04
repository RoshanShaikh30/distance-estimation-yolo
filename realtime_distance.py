#this was again simple testing - with pepper spray as object only!
from ultralytics import YOLO
import cv2
import time

model = YOLO("yolov8s.pt")
cap = cv2.VideoCapture(0)
prev_time = time.time()
distance_history = []

while True:

    ret, frame = cap.read()

    if not ret:
        break

    results = model(frame)

    annotated = results[0].plot()
    
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            class_name = model.names[cls_id]
            if class_name == "bottle":
              x1, y1, x2, y2 = box.xyxy[0]
              height_pixels = float(y2 - y1)
              REAL_HEIGHT = 11.43
              FOCAL_LENGTH = 1288.16
              distance = (REAL_HEIGHT * FOCAL_LENGTH) / height_pixels
              distance_history.append(distance)
              if len(distance_history) > 5:
                distance_history.pop(0)
              smoothed_distance = sum(distance_history) / len(distance_history)
              print(f"Height: {height_pixels:.2f} px | Distance: {distance:.2f} cm")
              cv2.putText(
               annotated,
               f"{smoothed_distance:.1f} cm",
               (int(x1), int(y1) - 10),
               cv2.FONT_HERSHEY_SIMPLEX, 0.8,(0, 255, 0),2
             )

    current_time = time.time()
    fps = 1 / (current_time - prev_time)
    prev_time = current_time

    cv2.putText(
        annotated,
        f"FPS: {int(fps)}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.imshow("YOLOv8 Detection", annotated)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()