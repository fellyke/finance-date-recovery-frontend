
"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // ============================================================
    // CONFIGURATION
    // ============================================================

    const API_URL =
        "https://finance-date-recovery-backend.onrender.com/api/uploaded-files";


    // ============================================================
    // HTML ELEMENTS
    // ============================================================

    const uploadedFilesTable =
        document.getElementById("uploadedFilesTable");

    const uploadedFilesBody =
        document.getElementById("uploadedFilesBody");

    const emptyState =
        document.querySelector(".empty-state");


    // ============================================================
    // INITIALIZE
    // ============================================================

    initializeUploadedFiles();


    async function initializeUploadedFiles() {

        console.log(
            "Uploaded Files page initialized."
        );

        await loadUploadedFiles();
    }


    // ============================================================
    // GET JWT TOKEN
    // ============================================================

    function getToken() {

        const tokenKeys = [
            "token",
            "authToken",
            "jwtToken",
            "accessToken"
        ];


        // Check localStorage
        for (const key of tokenKeys) {

            const token =
                localStorage.getItem(key);

            if (token) {
                return token;
            }
        }


        // Check sessionStorage
        for (const key of tokenKeys) {

            const token =
                sessionStorage.getItem(key);

            if (token) {
                return token;
            }
        }


        return null;
    }


    // ============================================================
    // LOAD UPLOADED FILES
    // ============================================================

    async function loadUploadedFiles() {

        try {

            showLoading();


            const token = getToken();


            // ----------------------------------------------------
            // CHECK AUTHENTICATION
            // ----------------------------------------------------

            if (!token) {

                throw new Error(
                    "Authentication token not found. Please login again."
                );
            }


            console.log(
                "Loading uploaded files..."
            );


            // ----------------------------------------------------
            // CALL NODE.JS API
            // ----------------------------------------------------

            const response = await fetch(
                API_URL,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


            // ----------------------------------------------------
            // READ RESPONSE
            // ----------------------------------------------------

            const result =
                await response.json();


            console.log(
                "Uploaded Files API Response:",
                result
            );


            // ----------------------------------------------------
            // TOKEN EXPIRED
            // ----------------------------------------------------

            if (response.status === 401) {

                throw new Error(
                    "Your login session has expired. Please login again."
                );
            }


            // ----------------------------------------------------
            // API ERROR
            // ----------------------------------------------------

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to load uploaded files."
                );
            }


            // ----------------------------------------------------
            // GET DATA
            // ----------------------------------------------------

            const files =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            console.log(
                "Uploaded files:",
                files
            );


            // ----------------------------------------------------
            // DISPLAY DATA
            // ----------------------------------------------------

            displayUploadedFiles(files);


        } catch (error) {

            console.error(
                "Uploaded Files Error:",
                error
            );


            showEmptyState(
                error.message ||
                "Unable to connect to the Uploaded Files API."
            );
        }
    }


    // ============================================================
    // DISPLAY UPLOADED FILES
    // ============================================================

    function displayUploadedFiles(files) {

        if (!uploadedFilesBody) {

            console.error(
                "uploadedFilesBody was not found."
            );

            return;
        }


        // --------------------------------------------------------
        // NO FILES
        // --------------------------------------------------------

        if (
            !files ||
            files.length === 0
        ) {

            showEmptyState(
                "No uploaded Excel files have been found."
            );

            return;
        }


        // --------------------------------------------------------
        // CLEAR OLD TABLE DATA
        // --------------------------------------------------------

        uploadedFilesBody.innerHTML = "";


        // --------------------------------------------------------
        // SHOW TABLE
        // --------------------------------------------------------

        if (uploadedFilesTable) {

            uploadedFilesTable.style.display =
                "block";
        }


        // --------------------------------------------------------
        // HIDE EMPTY STATE
        // --------------------------------------------------------

        if (emptyState) {

            emptyState.style.display =
                "none";
        }


        // --------------------------------------------------------
        // CREATE TABLE ROWS
        // --------------------------------------------------------

        files.forEach(function (file) {

            const row =
                document.createElement("tr");


            // ----------------------------------------------------
            // FILE NAME
            // ----------------------------------------------------

            addCell(
                row,
                file.file_name ||
                file.fileName ||
                "—"
            );


            // ----------------------------------------------------
            // LOGBOOK NAME
            //
            // Your current database does not have this field.
            // ----------------------------------------------------

            addCell(
                row,
                file.logbook_name ||
                file.logbookName ||
                "—"
            );


            // ----------------------------------------------------
            // FINANCIAL YEAR
            //
            // Your current database does not have this field.
            // ----------------------------------------------------

            addCell(
                row,
                file.financial_year ||
                file.financialYear ||
                "—"
            );


            // ----------------------------------------------------
            // BRANCH
            //
            // Your current database does not have this field.
            // ----------------------------------------------------

            addCell(
                row,
                file.branch ||
                "—"
            );


            // ----------------------------------------------------
            // NUMBER OF RECORDS
            // ----------------------------------------------------

            addCell(
                row,
                file.records !== null &&
                file.records !== undefined
                    ? file.records
                    : "0"
            );


            // ----------------------------------------------------
            // UPLOADED BY
            // ----------------------------------------------------

            addCell(
                row,
                file.username ||
                file.user_name ||
                file.uploaded_by_name ||
                "Unknown"
            );


            // ----------------------------------------------------
            // DATE UPLOADED
            // ----------------------------------------------------

            addCell(
                row,
                formatDateTime(
                    file.upload_date ||
                    file.uploaded_at ||
                    file.date
                )
            );


            // ----------------------------------------------------
            // ACTION
            // ----------------------------------------------------

            const actionCell =
                document.createElement("td");


            const viewButton =
                document.createElement("button");


            viewButton.type =
                "button";


            viewButton.className =
                "btn btn-primary";


            viewButton.textContent =
                "View";


            viewButton.addEventListener(
                "click",
                function () {

                    viewFile(file);
                }
            );


            actionCell.appendChild(
                viewButton
            );


            row.appendChild(
                actionCell
            );


            // ----------------------------------------------------
            // ADD ROW TO TABLE
            // ----------------------------------------------------

            uploadedFilesBody.appendChild(
                row
            );

        });
    }


    // ============================================================
    // ADD TABLE CELL
    // ============================================================

    function addCell(row, value) {

        const cell =
            document.createElement("td");


        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            cell.textContent =
                "—";

        } else {

            cell.textContent =
                String(value);
        }


        row.appendChild(cell);
    }


    // ============================================================
    // FORMAT DATE AND TIME
    // ============================================================

    function formatDateTime(value) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return String(value);
        }


        return date.toLocaleString(
            "en-KE",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // ============================================================
    // VIEW FILE
    // ============================================================

    function viewFile(file) {

        console.log(
            "Selected uploaded file:",
            file
        );


        const fileId =
            file.id;


        if (!fileId) {

            alert(
                "Unable to open this file because its ID is missing."
            );

            return;
        }


        /*
         * At this stage we display the file information.
         *
         * A dedicated backend endpoint can later be added
         * for viewing the records belonging to this file.
         */

        const fileName =
            file.file_name ||
            file.fileName ||
            "Uploaded file";


        const records =
            file.records !== null &&
            file.records !== undefined
                ? file.records
                : 0;


        alert(
            "File: " +
            fileName +
            "\nRecords: " +
            records +
            "\nFile ID: " +
            fileId
        );
    }


    // ============================================================
    // SHOW EMPTY / ERROR STATE
    // ============================================================

    function showEmptyState(message) {

        if (uploadedFilesTable) {

            uploadedFilesTable.style.display =
                "none";
        }


        if (uploadedFilesBody) {

            uploadedFilesBody.innerHTML =
                "";
        }


        if (emptyState) {

            emptyState.style.display =
                "block";


            const heading =
                emptyState.querySelector("h3");


            const paragraph =
                emptyState.querySelector("p");


            if (heading) {

                heading.textContent =
                    "Uploaded Files";
            }


            if (paragraph) {

                paragraph.textContent =
                    message;
            }
        }
    }


    // ============================================================
    // SHOW LOADING
    // ============================================================

    function showLoading() {

        if (uploadedFilesTable) {

            uploadedFilesTable.style.display =
                "none";
        }


        if (emptyState) {

            emptyState.style.display =
                "block";


            const heading =
                emptyState.querySelector("h3");


            const paragraph =
                emptyState.querySelector("p");


            if (heading) {

                heading.textContent =
                    "Loading Uploaded Files...";
            }


            if (paragraph) {

                paragraph.textContent =
                    "Connecting to the Uploaded Files API...";
            }
        }
    }


    // ============================================================
    // PUBLIC FUNCTIONS
    // ============================================================

    window.uploadedFilesManager = {

        load: loadUploadedFiles,

        refresh: loadUploadedFiles

    };

});

