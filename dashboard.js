// dashboard.js

async function loadDashboard() {
    try {
        const data = await apiGet("dashboard");

        if (!data.success) {
            console.log(data.message);
            return;
        }

        // Statistics
        document.getElementById("totalRecords").textContent =
            data.data.totalRecords;

        document.getElementById("uploadedFiles").textContent =
            data.data.uploadedFiles;

        document.getElementById("recoveredRecords").textContent =
            data.data.recoveredRecords;

        document.getElementById("pendingRecords").textContent =
            data.data.pendingRecords;


        // Recent uploads
        const uploads = document.getElementById("recentUploads");

        if (data.data.recentUploads.length > 0) {

            uploads.innerHTML = "";

            data.data.recentUploads.forEach(file => {

                uploads.innerHTML += `
                    <tr>
                        <td>${file.file_name}</td>
                        <td>${file.records}</td>
                        <td>${file.date}</td>
                        <td>${file.status}</td>
                    </tr>
                `;

            });

        }


        // Recent searches
        const searches = document.getElementById("recentSearches");

        if (data.data.recentSearches.length > 0) {

            searches.innerHTML = "";

            data.data.recentSearches.forEach(search => {

                searches.innerHTML += `
                    <tr>
                        <td>${search.search}</td>
                        <td>${search.user}</td>
                        <td>${search.date}</td>
                        <td>${search.result}</td>
                    </tr>
                `;

            });

        }


        // API status
        document.getElementById("apiStatus").textContent =
            "Connected";

        document.getElementById("databaseStatus").textContent =
            "Connected";

    } catch (error) {

        console.error(error);

        document.getElementById("apiStatus").textContent =
            "Disconnected";

        document.getElementById("databaseStatus").textContent =
            "Unavailable";
    }
}


loadDashboard();