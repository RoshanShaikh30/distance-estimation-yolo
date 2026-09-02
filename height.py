from ultralytics import YOLO
import os

model = YOLO("yolov8s.pt")

for image_name in sorted(os.listdir("imgs")):

    if image_name.endswith((".jpg", ".jpeg")):

        image_path = os.path.join("imgs", image_name)

        results = model(image_path,show=True)

        print(f"\n{image_name}")
        
        # results = model(image_path)

        for r in results:

            for box in r.boxes:

                x1, y1, x2, y2 = box.xyxy[0]

                height_pixels = float(y2 - y1)

                confidence = float(box.conf[0])

                print(
                    f"Height = {height_pixels:.2f} px | Confidence = {confidence:.2f}"
                )
# for r in results:
#     for box in r.boxes:

#         x1, y1, x2, y2 = box.xyxy[0]

#         height_pixels = y2 - y1

#         print(
#             f"{image_name} -> Height: {height_pixels:.2f} px"
#         )


#testing all 6:
# from ultralytics import YOLO
# import os

# model = YOLO("yolov8n.pt")

# image_folder = "imgs"

# for image_name in sorted(os.listdir(image_folder)):
#     if image_name.endswith((".jpg", ".jpeg", ".png")):

#         image_path = os.path.join(image_folder, image_name)

#         print(f"\nProcessing: {image_name}")

#         results = model(image_path)

#         for r in results:
#             print(r.boxes)
 
#testing ONE           
# import cv2 
# from ultralytics import YOLO

# model = YOLO("yolov8n.pt")

# results = model("imgs/img6.jpeg", show=True)

# for r in results:
#     print(r.boxes)

# cv2.waitKey(0)
# cv2.destroyAllWindows()