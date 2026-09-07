"use strict";

// ============================================================
// FINANCE DATE RECOVERY TOOL
// DASHBOARD
// dashboard.js
// ============================================================

async function loadDashboard() {

    try {

        // ----------------------------------------------------
        // MAKE SURE USER IS LOGGED IN
        // ----------------------------------------------------

        if (!requireAuthentication()) {
            return;
        }


        // ----------------------------------------------------
        // LOAD DASHBOARD DATA
        // ----------------------------------------------------

        const data = await apiGet("dashboard");


        // ----------------------------------------------------
        // API ERROR
        // ----------------------------------------------------

        if (!data.success) {

            showError(
                data.message || "Unable to load dashboard.",
                "Dashboard Error"
            );

            return;
        }


        // ----------------------------------------------------
        // STATISTICS
        // ----------------------------------------------------

        document.getElementById("totalRecords").textContent =
            data.data.totalRecords ?? 0;

        document.getElementById("uploadedFiles").textContent =
            data.data.uploadedFiles ?? 0;

        document.getElementById("recoveredRecords").textContent =
            data.data.recoveredRecords ?? 0;

        document.getElementById("pendingRecords").textContent =
            data.data.pendingRecords ?? 0;


        // ----------------------------------------------------
        // RECENT UPLOADS
        // ----------------------------------------------------

        const uploads =
            document.getElementById("recentUploads");

        if (uploads) {

            uploads.innerHTML = "";

            if (
                data.data.recentUploads &&
                data.data.recentUploads.length > 0
            ) {

                data.data.recentUploads.forEach(file => {

                    uploads.innerHTML += `
                        <tr>
                            <td>${escapeHtml(
                                file.file_name || ""
                            )}</td>

                            <td>${file.records ?? 0}</td>

                            <td>${escapeHtml(
                                file.date || "—"
                            )}</td>

                            <td>${escapeHtml(
                                file.status || "—"
                            )}</td>
                        </tr>
                    `;

                });

            } else {

                uploads.innerHTML = `
                    <tr>
                        <td colspan="4">
                            No recent uploads found.
                        </td>
                    </tr>
                `;

            }
        }


        // ----------------------------------------------------
        // RECENT SEARCHES
        // ----------------------------------------------------

        const searches =
            document.getElementById("recentSearches");

        if (searches) {

            searches.innerHTML = "";

            if (
                data.data.recentSearches &&
                data.data.recentSearches.length > 0
            ) {

                data.data.recentSearches.forEach(search => {

                    searches.innerHTML += `
                        <tr>

                            <td>${escapeHtml(
                                search.search_term || "—"
                            )}</td>

                            <td>${escapeHtml(
                                search.user || "Unknown"
                            )}</td>

                            <td>${escapeHtml(
                                search.date || "—"
                            )}</td>

                            <td>${escapeHtml(
                                search.result || "—"
                            )}</td>

                        </tr>
                    `;

                });

            } else {

                searches.innerHTML = `
                    <tr>
                        <td colspan="4">
                            No recent searches found.
                        </td>
                    </tr>
                `;

            }
        }


        // ----------------------------------------------------
        // API STATUS
        // ----------------------------------------------------

        const apiStatus =
            document.getElementById("apiStatus");

        if (apiStatus) {
            apiStatus.textContent = "Connected";
        }


        // ----------------------------------------------------
        // DATABASE STATUS
        // ----------------------------------------------------

        const databaseStatus =
            document.getElementById("databaseStatus");

        if (databaseStatus) {
            databaseStatus.textContent = "Connected";
        }


        // ----------------------------------------------------
        // SUCCESS NOTIFICATION
        // ----------------------------------------------------

        console.log(
            "Dashboard loaded successfully.",
            data
        );


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );


        // ----------------------------------------------------
        // API STATUS
        // ----------------------------------------------------

        const apiStatus =
            document.getElementById("apiStatus");

        if (apiStatus) {
            apiStatus.textContent = "Disconnected";
        }


        // ----------------------------------------------------
        // DATABASE STATUS
        // ----------------------------------------------------

        const databaseStatus =
            document.getElementById("databaseStatus");

        if (databaseStatus) {
            databaseStatus.textContent = "Unavailable";
        }


        // ----------------------------------------------------
        // SHOW ERROR
        // ----------------------------------------------------

        showError(
            error.message ||
            "Unable to load dashboard data.",
            "Dashboard Error"
        );


        // ----------------------------------------------------
        // TOKEN PROBLEM
        // ----------------------------------------------------

        if (
            error.status === 401 ||
            error.status === 403
        ) {

            removeAuthToken();
            removeCurrentUser();

            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1500);
        }

    }
}


// ============================================================
// LOAD DASHBOARD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboard();

    }
);