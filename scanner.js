const API_BASE_URL = "http://127.0.0.1:8000";

const imageInput = document.getElementById("imageInput");
const previewImage = document.getElementById("previewImage");
const cameraFeed = document.getElementById("cameraFeed");
const scanPlaceholder = document.getElementById("scanPlaceholder");
const cameraButton = document.getElementById("cameraButton");
const analyseButton = document.getElementById("analyseButton");
const scanOverlay = document.getElementById("scanOverlay");
const scanStatus = document.getElementById("scanStatus");

let selectedFile = null;
let cameraStream = null;


function updateStatus(message) {
    if (!scanStatus) return;

    scanStatus.innerHTML = `
        <span class="status-pulse"></span>
        <span>${message}</span>
    `;
}


function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    if (cameraFeed) {
        cameraFeed.srcObject = null;
        cameraFeed.hidden = true;
    }
}


if (imageInput) {

    imageInput.addEventListener("change", function () {

        const file = imageInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            imageInput.value = "";
            return;
        }

        stopCamera();

        selectedFile = file;

        const imageURL = URL.createObjectURL(file);

        previewImage.src = imageURL;
        previewImage.hidden = false;

        if (scanPlaceholder) {
            scanPlaceholder.hidden = true;
        }

        if (analyseButton) {
            analyseButton.disabled = false;
        }

        updateStatus("Image ready for analysis");
    });
}


if (cameraButton) {

    cameraButton.addEventListener("click", async function () {

        try {

            stopCamera();

            cameraStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: {
                            ideal: "environment"
                        }
                    },
                    audio: false
                });

            cameraFeed.srcObject = cameraStream;
            cameraFeed.hidden = false;

            previewImage.hidden = true;

            if (scanPlaceholder) {
                scanPlaceholder.hidden = true;
            }

            if (analyseButton) {
                analyseButton.disabled = false;
            }

            updateStatus("Camera ready for analysis");

        } catch (error) {

            console.error("CAMERA ERROR:", error);

            updateStatus("Camera access was not available");

            alert(
                "Could not access the camera.\n\n" +
                "Please allow camera permission and try again."
            );
        }
    });
}


function captureCameraFrame() {

    if (!cameraFeed || !cameraStream) {
        return null;
    }

    if (
        cameraFeed.videoWidth === 0 ||
        cameraFeed.videoHeight === 0
    ) {
        return null;
    }

    const canvas = document.createElement("canvas");

    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
        cameraFeed,
        0,
        0,
        canvas.width,
        canvas.height
    );

    return new Promise(function (resolve) {

        canvas.toBlob(
            function (blob) {

                if (!blob) {
                    resolve(null);
                    return;
                }

                const file = new File(
                    [blob],
                    "camera_capture.jpg",
                    {
                        type: "image/jpeg"
                    }
                );

                resolve(file);
            },
            "image/jpeg",
            0.95
        );
    });
}


if (analyseButton) {

    analyseButton.addEventListener(
        "click",
        async function () {

            let fileToAnalyse = selectedFile;

            try {

                analyseButton.disabled = true;

                analyseButton.innerHTML = `
                    <span>Analysing...</span>
                    <span>◌</span>
                `;

                if (scanOverlay) {
                    scanOverlay.hidden = false;
                }

                updateStatus("Preparing visual data...");


                if (cameraStream) {

                    updateStatus(
                        "Capturing camera frame..."
                    );

                    fileToAnalyse =
                        await captureCameraFrame();

                    if (!fileToAnalyse) {

                        throw new Error(
                            "Could not capture a frame from the camera."
                        );
                    }
                }


                if (!fileToAnalyse) {

                    throw new Error(
                        "Please upload an image or activate the camera first."
                    );
                }


                updateStatus(
                    "YOLO is analysing visual data..."
                );


                const formData = new FormData();

                formData.append(
                    "file",
                    fileToAnalyse,
                    fileToAnalyse.name
                );


                console.log("Sending image to backend...");


                const response = await fetch(
                    `${API_BASE_URL}/api/scan/image`,
                    {
                        method: "POST",
                        body: formData
                    }
                );


                const responseText =
                    await response.text();

                console.log(
                    "RAW BACKEND RESPONSE:",
                    responseText
                );


                let result;

                try {

                    result =
                        JSON.parse(responseText);

                } catch (error) {

                    throw new Error(
                        "Backend returned invalid JSON."
                    );
                }


                console.log(
                    "BACKEND RESULT:",
                    result
                );


                if (!response.ok) {

                    throw new Error(
                        result.detail ||
                        "Image analysis failed."
                    );
                }


                if (result.success !== true) {

                    throw new Error(
                        result.detail ||
                        "Backend did not complete the scan."
                    );
                }


                if (!result.scan_id) {

                    throw new Error(
                        "Backend completed the scan but did not return a scan ID."
                    );
                }


                if (!Array.isArray(result.detections)) {

                    throw new Error(
                        "Backend response does not contain detections."
                    );
                }


                console.log(
                    "TOTAL OBJECTS:",
                    result.total_objects
                );

                console.log(
                    "DETECTIONS:",
                    result.detections
                );

                console.log(
                    "RESULT IMAGE:",
                    result.result_image
                );


                localStorage.setItem(
                    "visionSphereScan",
                    JSON.stringify(result)
                );


                stopCamera();


                updateStatus(
                    "Analysis complete. Opening results..."
                );


                window.location.href =
                    `details.html?scan_id=${encodeURIComponent(
                        result.scan_id
                    )}`;

            } catch (error) {

                console.error(
                    "ANALYSIS ERROR:",
                    error
                );


                if (scanOverlay) {
                    scanOverlay.hidden = true;
                }


                analyseButton.disabled = false;

                analyseButton.innerHTML = `
                    <span>Analyse Scene</span>
                    <span>→</span>
                `;


                updateStatus(
                    "Analysis failed: " +
                    error.message
                );


                alert(
                    "Analysis failed:\n\n" +
                    error.message
                );
            }
        }
    );
}