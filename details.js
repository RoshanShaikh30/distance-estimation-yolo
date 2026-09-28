const API_BASE_URL = "http://127.0.0.1:8000";

const scanSummary = document.getElementById("scanSummary");
// const resultImage = document.getElementById("resultImage");
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
        alert("Loaded " + result.detections.length + " detections");


        // Check whether scan succeeded
        if (result.success !== true) {
            throw new Error(
                "The scan was not successful."
            );
        }


        // Display annotated result image
        // if (resultImage && result.result_image) {

        //     resultImage.src =
        //         API_BASE_URL + result.result_image;

        //     resultImage.style.display = "block";

        //     console.log(
        //         "RESULT IMAGE:",
        //         resultImage.src
        //     );
        // }


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

            const distance =
                detection.distance !== undefined
                ? detection.distance.toFixed(2)
                : "N/A";

            const centerX =
                detection.cx ?? "N/A";

            const centerY =
                detection.cy ?? "N/A";

            const x1 =
                detection.x1 ?? "N/A";

            const y1 =
                detection.y1 ?? "N/A";

            const x2 =
                detection.x2 ?? "N/A";

            const y2 =
                detection.y2 ?? "N/A";

            console.log("CURRENT DETECTION:", detection);

            const card = document.createElement("div");

            card.className = "detection-card";


            card.innerHTML = `
             <h2>
              ${objectName}
             </h2>

            <p>
             <strong>Distance:</strong>
             ${distance} m
            </p>

            <p>
              <strong>Center Position:</strong>
              (${centerX}, ${centerY})
            </p>

            <p>
              <strong>Bounding Box:</strong>
              (${x1}, ${y1}) → (${x2}, ${y2})
            </p>
          `;


            detectionsContainer.appendChild(card);
            console.log("CARD ADDED");

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