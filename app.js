document.addEventListener("DOMContentLoaded", () => {

    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const cameraFeed = document.getElementById("cameraFeed");

    const cameraButton = document.getElementById("cameraButton");
    const analyseButton = document.getElementById("analyseButton");

    const scanPlaceholder = document.getElementById("scanPlaceholder");
    const scanOverlay = document.getElementById("scanOverlay");

    const scanStatus = document.getElementById("scanStatus");


    // Stop existing camera stream
    const stopCamera = () => {

        const stream = cameraFeed.srcObject;

        if (stream) {

            stream
                .getTracks()
                .forEach(track => track.stop());

            cameraFeed.srcObject = null;

        }

    };


    // Update scanner status
    const updateStatus = (message) => {

        scanStatus.lastElementChild.textContent = message;

    };


    // Image upload
    if (imageInput) {

        imageInput.addEventListener("change", event => {

            const file = event.target.files[0];

            if (!file) return;


            stopCamera();


            const imageURL = URL.createObjectURL(file);


            previewImage.src = imageURL;

            previewImage.hidden = false;

            cameraFeed.hidden = true;

            scanPlaceholder.hidden = true;


            analyseButton.disabled = false;


            updateStatus(
                "Image ready for analysis"
            );

        });

    }


    // Camera
    if (cameraButton) {

        cameraButton.addEventListener("click", async () => {

            try {

                stopCamera();


                const stream =
                    await navigator.mediaDevices.getUserMedia({

                        video: {

                            facingMode: "environment"

                        },

                        audio: false

                    });


                cameraFeed.srcObject = stream;

                cameraFeed.hidden = false;

                previewImage.hidden = true;

                scanPlaceholder.hidden = true;


                analyseButton.disabled = false;


                updateStatus(
                    "Camera ready for analysis"
                );


            } catch (error) {

                console.error(error);

                updateStatus(
                    "Camera access was not available"
                );

            }

        });

    }


    // Analyse button
    if (analyseButton) {

        analyseButton.addEventListener("click", () => {

            scanOverlay.hidden = false;

            updateStatus(
                "Preparing image for AI analysis..."
            );


            /*
             NEXT STEP:

             This button will send the actual image
             to FastAPI.

             FastAPI
                ↓
             YOLO
                ↓
             Object Detection
                ↓
             Distance + Traits
                ↓
             MongoDB
                ↓
             Details Page
            */


            setTimeout(() => {

                scanOverlay.hidden = true;

                updateStatus(
                    "AI connection will be added next"
                );

            }, 1800);

        });

    }

});