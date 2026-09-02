REAL_HEIGHT = 11.43      

known_distance = 62.23   # img3 actual distance
pixel_height = 236.60    # img3 YOLO height

focal_length = (pixel_height * known_distance) / REAL_HEIGHT

print("Focal Length =", focal_length)

pixel_heights = {
    "img1": 123.87,
    "img2": 153.20,
    "img3": 236.60,
    "img4": 330.76,
    "img5": 469.14
}

print("\nEstimated Distances:\n")

for img, height in pixel_heights.items():

    distance = (REAL_HEIGHT * focal_length) / height

    print(f"{img} -> {distance:.2f} cm")