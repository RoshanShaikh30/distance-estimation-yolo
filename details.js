const API_BASE_URL = "http://127.0.0.1:8000";

const scanSummary = document.getElementById("scanSummary");
const resultImage = document.getElementById("resultImage");
const detectionsContainer = document.getElementById("detectionsContainer");


function loadScanResult() {

    console.log("DETAILS PAGE LOADED");

    try {

        // Get the scan result saved by scanner.js
        const savedResult = localStorage.getItem("visionSphereScan");

        console.log("SAVED SCAN RESULT:", savedResult);

        if (!savedResult) {
            throw new Error(
                "No scan result found. Please analyse an image first."
            );
        }

        const result = JSON.parse(savedResult);

        console.log("SCAN RESULT:", result);


        // Check whether scan succeeded
        if (result.success !== true) {
            throw new Error(
                "The scan was not successful."
            );
        }


        // Display annotated result image
        if (resultImage && result.result_image) {

            resultImage.src =
                API_BASE_URL + result.result_image;

            resultImage.style.display = "block";

            console.log(
                "RESULT IMAGE:",
                resultImage.src
            );
        }


        // Get detections
        const detections = Array.isArray(result.detections)
            ? result.detections
            : [];


        console.log("DETECTIONS:", detections);
        console.log("TOTAL DETECTIONS:", detections.length);


        // Update summary
        if (scanSummary) {

            scanSummary.textContent =
                `${detections.length} object(s) detected`;

        }


        // Make sure detection container exists
        if (!detectionsContainer) {

            console.error(
                "detectionsContainer was not found in details.html"
            );

            return;
        }


        // Clear old content
        detectionsContainer.innerHTML = "";


        // No detections
        if (detections.length === 0) {

            detectionsContainer.innerHTML = `
                <div class="detection-card">
                    <h2>No detection data returned</h2>

                    <p>
                        The image was analysed successfully,
                        but the backend response did not contain
                        object detection details.
                    </p>

                    <p>
                        The annotated result image above is still
                        available.
                    </p>
                </div>
            `;

            return;
        }


        // Display every detected object
        detections.forEach(function (detection, index) {

            const objectName =
                detection.object_name ||
                detection.class_name ||
                detection.name ||
                "Unknown object";


            const confidence =
                detection.confidence_percentage ??
                detection.confidence ??
                "N/A";


            const width =
                detection.image_dimensions?.width_px ??
                detection.width_pixels ??
                "N/A";


            const height =
                detection.image_dimensions?.height_px ??
                detection.height_pixels ??
                "N/A";


            const centerX =
                detection.center_position?.x ??
                "N/A";


            const centerY =
                detection.center_position?.y ??
                "N/A";


            const orientation =
                detection.visual_traits?.orientation ??
                "N/A";


            const scenePresence =
                detection.visual_traits?.scene_presence ??
                "N/A";


            const areaPercentage =
                detection.visual_traits?.area_percentage ??
                "N/A";


            const card = document.createElement("div");

            card.className = "detection-card";


            card.innerHTML = `
                <h2>
                    Object ${index + 1}: ${objectName}
                </h2>

                <p>
                    <strong>Confidence:</strong>
                    ${confidence}%
                </p>

                <p>
                    <strong>Width:</strong>
                    ${width}px
                </p>

                <p>
                    <strong>Height:</strong>
                    ${height}px
                </p>

                <p>
                    <strong>Position:</strong>
                    ${centerX}, ${centerY}
                </p>

                <p>
                    <strong>Orientation:</strong>
                    ${orientation}
                </p>

                <p>
                    <strong>Scene Presence:</strong>
                    ${scenePresence}
                </p>

                <p>
                    <strong>Image Coverage:</strong>
                    ${areaPercentage}%
                </p>
            `;


            detectionsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(
            "DETAILS ERROR:",
            error
        );


        if (scanSummary) {

            scanSummary.textContent =
                "Could not load analysis.";

        }


        if (detectionsContainer) {

            detectionsContainer.innerHTML = `
                <div class="detection-card">
                    <h2>Error loading scan</h2>

                    <p>
                        ${error.message}
                    </p>
                </div>
            `;

        }

    }
}


// Start loading the scan
loadScanResult();