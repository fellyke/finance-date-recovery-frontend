
// ============================================================
// FINANCE DATE RECOVERY TOOL
// UPLOAD.JS
// ============================================================

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // API CONFIGURATION
    // ========================================================

    const API_URL =
        "https://finance-date-recovery-backend.onrender.com/api/upload";


    // ========================================================
    // STORAGE KEYS
    // ========================================================

    const TOKEN_KEYS = [
        "financeRecovery_token",
        "token",
        "authToken",
        "accessToken",
        "jwt"
    ];

    const USER_KEYS = [
        "financeRecovery_user",
        "user"
    ];


    // ========================================================
    // GET HTML ELEMENTS
    // ========================================================

    const uploadForm =
        document.getElementById("uploadForm");

    const excelFile =
        document.getElementById("excelFile");

    const selectedFile =
        document.getElementById("selectedFile");

    const uploadType =
        document.getElementById("uploadType");

    const logbookName =
        document.getElementById("logbookName");

    const financialYear =
        document.getElementById("financialYear");

    const branch =
        document.getElementById("branch");

    const description =
        document.getElementById("description");

    const requiredColumns =
        document.getElementById("requiredColumns");

    const requiredColumnsDescription =
        document.getElementById(
            "requiredColumnsDescription"
        );

    const uploadPreview =
        document.getElementById("uploadPreview");

    const uploadButton =
        uploadForm
            ? uploadForm.querySelector(
                'button[type="submit"]'
            )
            : null;


    // ========================================================
    // CHECK REQUIRED HTML
    // ========================================================

    if (!uploadForm) {
        console.error(
            "UPLOAD ERROR: #uploadForm was not found."
        );
        return;
    }

    if (!excelFile) {
        console.error(
            "UPLOAD ERROR: #excelFile was not found."
        );
        return;
    }

    if (!uploadType) {
        console.error(
            "UPLOAD ERROR: #uploadType was not found."
        );
        return;
    }


    // ========================================================
    // REQUIRED EXCEL COLUMNS
    // ========================================================

    const financialRecordColumns = [
        "Member Number",
        "Member Name",
        "Loan Number",
        "Loan Type",
        "Loan Amount",
        "Loan Date",
        "Repayment Date",
        "Maturity Date",
        "Transaction Date",
        "Transaction Reference",
        "Status"
    ];


    const repaymentColumns = [
        "Customer",
        "Loan Number",
        "Repayment Date",
        "Amount",
        "Payment Method",
        "Reference Number",
        "Receipt Number",
        "Balance",
        "Status"
    ];


    // ========================================================
    // GET AUTH TOKEN
    // ========================================================

    function getAuthToken() {

        for (const key of TOKEN_KEYS) {

            const value =
                localStorage.getItem(key);

            if (
                value &&
                value.trim()
            ) {

                return value.trim();

            }

        }

        return null;

    }


    // ========================================================
    // GET USER
    // ========================================================

    function getStoredUser() {

        for (const key of USER_KEYS) {

            const value =
                localStorage.getItem(key);

            if (
                value &&
                value.trim()
            ) {

                return value;

            }

        }

        return null;

    }


    // ========================================================
    // CHECK LOGIN
    // ========================================================

    function isLoggedIn() {

        /*
         * IMPORTANT:
         *
         * The JWT token is what authenticates the API request.
         *
         * We therefore do NOT require the user object
         * just to perform the upload.
         */

        return !!getAuthToken();

    }


    // ========================================================
    // AUTHORIZATION HEADERS
    // ========================================================

    function getAuthHeaders() {

        const headers = {};

        const token =
            getAuthToken();

        if (token) {

            headers.Authorization =
                `Bearer ${token}`;

        }

        return headers;

    }


    // ========================================================
    // SHOW MESSAGE
    // ========================================================

    function showMessage(
        message,
        type = "info"
    ) {

        let messageBox =
            document.getElementById(
                "uploadMessage"
            );


        if (!messageBox) {

            messageBox =
                document.createElement(
                    "div"
                );

            messageBox.id =
                "uploadMessage";

            messageBox.className =
                "upload-message";

            uploadForm.prepend(
                messageBox
            );

        }


        messageBox.className =
            `upload-message ${type}`;

        messageBox.textContent =
            message;

        messageBox.style.display =
            "block";

    }


    // ========================================================
    // REDIRECT TO LOGIN
    // ========================================================

    function redirectToLogin() {

        showMessage(
            "No login token was found. Please login again.",
            "error"
        );

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1500);

    }


    // ========================================================
    // DISPLAY REQUIRED COLUMNS
    // ========================================================

    function displayRequiredColumns(
        columns
    ) {

        if (!requiredColumns) {
            return;
        }

        requiredColumns.innerHTML = "";

        columns.forEach(
            column => {

                const span =
                    document.createElement(
                        "span"
                    );

                span.textContent =
                    column;

                requiredColumns.appendChild(
                    span
                );

            }
        );

    }


    // ========================================================
    // UPLOAD TYPE CHANGE
    // ========================================================

    uploadType.addEventListener(
        "change",
        function () {

            const type =
                uploadType.value;


            if (!type) {

                if (requiredColumns) {

                    requiredColumns.innerHTML = `
                        <span>Select upload type</span>
                    `;

                }

                if (requiredColumnsDescription) {

                    requiredColumnsDescription.textContent =
                        "Select an upload type to see the required Excel columns.";

                }

                return;

            }


            if (
                type === "financial_records"
            ) {

                if (requiredColumnsDescription) {

                    requiredColumnsDescription.textContent =
                        "Your financial records Excel file should contain the following columns.";

                }

                displayRequiredColumns(
                    financialRecordColumns
                );

                return;

            }


            if (
                type === "repayments"
            ) {

                if (requiredColumnsDescription) {

                    requiredColumnsDescription.textContent =
                        "Your repayment Excel file should contain the following columns.";

                }

                displayRequiredColumns(
                    repaymentColumns
                );

            }

        }
    );


    // ========================================================
    // FILE SELECTION
    // ========================================================

    excelFile.addEventListener(
        "change",
        () => {

            const file =
                excelFile.files &&
                excelFile.files[0];


            if (!file) {

                if (selectedFile) {

                    selectedFile.textContent =
                        "No file selected";

                }

                return;

            }


            if (!isValidFile(file)) {

                excelFile.value = "";

                if (selectedFile) {

                    selectedFile.textContent =
                        "No file selected";

                }

                return;

            }


            if (selectedFile) {

                selectedFile.textContent =
                    `${file.name} (${formatFileSize(file.size)})`;

            }


            showFilePreview(file);

        }
    );


    // ========================================================
    // FORM SUBMIT
    // ========================================================

    uploadForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            console.log(
                "========================================="
            );

            console.log(
                "UPLOAD STARTED"
            );

            console.log(
                "========================================="
            );


            // =================================================
            // CHECK TOKEN
            // =================================================

            const token =
                getAuthToken();


            console.log(
                "Token found:",
                token ? "YES" : "NO"
            );


            if (!token) {

                showMessage(
                    "No authentication token found. Please login again.",
                    "error"
                );

                redirectToLogin();

                return;

            }


            // =================================================
            // VALIDATE UPLOAD TYPE
            // =================================================

            const type =
                uploadType.value;


            if (!type) {

                showMessage(
                    "Please select what type of records you are uploading.",
                    "error"
                );

                uploadType.focus();

                return;

            }


            // =================================================
            // GET FILE
            // =================================================

            const file =
                excelFile.files &&
                excelFile.files[0];


            if (!file) {

                showMessage(
                    "Please select an Excel or CSV file.",
                    "error"
                );

                return;

            }


            // =================================================
            // VALIDATE FILE
            // =================================================

            if (!isValidFile(file)) {

                return;

            }


            // =================================================
            // LOGBOOK NAME
            // =================================================

            if (
                !logbookName ||
                !logbookName.value.trim()
            ) {

                showMessage(
                    "Please enter the logbook name.",
                    "error"
                );

                if (logbookName) {
                    logbookName.focus();
                }

                return;

            }


            // =================================================
            // FINANCIAL YEAR
            // =================================================

            if (
                !financialYear ||
                !financialYear.value.trim()
            ) {

                showMessage(
                    "Please enter the financial year.",
                    "error"
                );

                if (financialYear) {
                    financialYear.focus();
                }

                return;

            }


            // =================================================
            // CREATE FORMDATA
            // =================================================

            const formData =
                new FormData();


            /*
             * THIS MUST MATCH THE BACKEND:
             *
             * upload.single("excelFile")
             */

            formData.append(
                "excelFile",
                file,
                file.name
            );


            formData.append(
                "uploadType",
                type
            );


            formData.append(
                "logbookName",
                logbookName.value.trim()
            );


            formData.append(
                "financialYear",
                financialYear.value.trim()
            );


            if (branch) {

                formData.append(
                    "branch",
                    branch.value.trim()
                );

            }


            if (description) {

                formData.append(
                    "description",
                    description.value.trim()
                );

            }


            // =================================================
            // DEBUG FORMDATA
            // =================================================

            console.log(
                "API URL:",
                API_URL
            );

            console.log(
                "File:",
                file.name
            );

            console.log(
                "File size:",
                file.size
            );

            console.log(
                "Upload type:",
                type
            );

            console.log(
                "Logbook:",
                logbookName.value.trim()
            );

            console.log(
                "Financial year:",
                financialYear.value.trim()
            );

            console.log(
                "Authorization:",
                `Bearer ${token.substring(0, 15)}...`
            );


            // =================================================
            // START LOADING
            // =================================================

            setLoading(true);

            showMessage(
                `Uploading ${
                    type === "repayments"
                        ? "repayment"
                        : "financial"
                } records...`,
                "loading"
            );


            // =================================================
            // SEND REQUEST
            // =================================================

            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                formData
                        }
                    );


                console.log(
                    "HTTP STATUS:",
                    response.status
                );


                // =================================================
                // READ SERVER RESPONSE
                // =================================================

                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";


                let result;


                if (
                    contentType.includes(
                        "application/json"
                    )
                ) {

                    result =
                        await response.json();

                } else {

                    const text =
                        await response.text();

                    result = {

                        success: false,

                        message:
                            text ||
                            `Server returned HTTP ${response.status}`

                    };

                }


                console.log(
                    "SERVER RESPONSE:",
                    result
                );


                // =================================================
                // AUTH ERROR
                // =================================================

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    console.error(
                        "AUTHENTICATION FAILED"
                    );

                    console.error(
                        result
                    );


                    showMessage(
                        result.message ||
                        "Authentication failed. Please login again.",
                        "error"
                    );


                    /*
                     * Do not immediately delete everything.
                     * This allows us to see the actual error.
                     */

                    setTimeout(() => {

                        window.location.href =
                            "index.html";

                    }, 2000);


                    return;

                }


                // =================================================
                // SERVER ERROR
                // =================================================

                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        result.error ||
                        `Upload failed. Server returned HTTP ${response.status}.`
                    );

                }


                // =================================================
                // APPLICATION ERROR
                // =================================================

                if (
                    result.success === false
                ) {

                    throw new Error(
                        result.message ||
                        result.error ||
                        "The server rejected the upload."
                    );

                }


                // =================================================
                // SUCCESS
                // =================================================

                console.log(
                    "UPLOAD SUCCESSFUL"
                );


                showMessage(
                    result.message ||
                    "Excel file uploaded successfully.",
                    "success"
                );


                showUploadResult(
                    result.data || result
                );


                // =================================================
                // SAVE FILE ID
                // =================================================

                const fileId =
                    result.data &&
                    (
                        result.data.fileId ||
                        result.data.id
                    );


                if (fileId) {

                    localStorage.setItem(
                        "financeRecovery_lastFileId",
                        String(fileId)
                    );

                }


            } catch (error) {

                console.error(
                    "UPLOAD ERROR:",
                    error
                );


                if (
                    error.name === "TypeError"
                ) {

                    showMessage(
                        "Could not connect to the backend server. Check that the backend is running and that the API URL is correct.",
                        "error"
                    );

                } else {

                    showMessage(
                        error.message ||
                        "Unable to upload the file.",
                        "error"
                    );

                }

            } finally {

                setLoading(false);

            }

        }
    );


    // ========================================================
    // FILE VALIDATION
    // ========================================================

    function isValidFile(file) {

        const allowedExtensions = [
            ".xlsx",
            ".xls",
            ".csv"
        ];


        const fileName =
            file.name.toLowerCase();


        const extension =
            "." +
            fileName.split(".").pop();


        if (
            !allowedExtensions.includes(
                extension
            )
        ) {

            showMessage(
                "Only .xlsx, .xls and .csv files are allowed.",
                "error"
            );

            return false;

        }


        const maxSize =
            10 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            showMessage(
                "The file cannot be larger than 10 MB.",
                "error"
            );

            return false;

        }


        return true;

    }


    // ========================================================
    // FILE PREVIEW
    // ========================================================

    function showFilePreview(file) {

        if (!uploadPreview) {
            return;
        }


        const typeName =
            uploadType.value === "repayments"
                ? "Repayments"
                : uploadType.value === "financial_records"
                    ? "Financial Records"
                    : "Not selected";


        uploadPreview.innerHTML = `

            <div class="empty-state-icon">
                ✓
            </div>

            <h3>
                File Selected
            </h3>

            <p>
                <strong>File:</strong>
                ${escapeHTML(file.name)}
            </p>

            <p>
                <strong>Type:</strong>
                ${escapeHTML(typeName)}
            </p>

            <p>
                <strong>Size:</strong>
                ${escapeHTML(
                    formatFileSize(file.size)
                )}
            </p>

            <p>
                The file is ready to be uploaded.
            </p>

        `;

    }


    // ========================================================
    // SHOW UPLOAD RESULT
    // ========================================================

    function showUploadResult(data) {

        let result =
            document.getElementById(
                "uploadResult"
            );


        if (!result) {

            result =
                document.createElement(
                    "div"
                );

            result.id =
                "uploadResult";

            result.className =
                "upload-result";

            uploadForm.appendChild(
                result
            );

        }


        const fileName =
            data.fileName ||
            data.filename ||
            "-";


        const records =
            data.records !== undefined
                ? data.records
                : data.importedRecords !== undefined
                    ? data.importedRecords
                    : 0;


        const fileId =
            data.fileId ||
            data.id ||
            "-";


        const type =
            data.uploadType ||
            uploadType.value ||
            "-";


        const typeName =
            type === "repayments"
                ? "Repayments"
                : type === "financial_records"
                    ? "Financial Records"
                    : type;


        result.innerHTML = `

            <div class="upload-result-header">
                Upload Complete
            </div>

            <div class="upload-result-item">
                <strong>File:</strong>
                ${escapeHTML(fileName)}
            </div>

            <div class="upload-result-item">
                <strong>Upload Type:</strong>
                ${escapeHTML(typeName)}
            </div>

            <div class="upload-result-item">
                <strong>Records Imported:</strong>
                ${escapeHTML(records)}
            </div>

            <div class="upload-result-item">
                <strong>File ID:</strong>
                ${escapeHTML(fileId)}
            </div>

        `;


        result.style.display =
            "block";

    }


    // ========================================================
    // LOADING STATE
    // ========================================================

    function setLoading(loading) {

        if (!uploadButton) {
            return;
        }


        if (loading) {

            uploadButton.disabled =
                true;


            if (
                !uploadButton.dataset.originalText
            ) {

                uploadButton.dataset.originalText =
                    uploadButton.textContent;

            }


            uploadButton.textContent =
                "Uploading...";

        } else {

            uploadButton.disabled =
                false;

            uploadButton.textContent =
                uploadButton.dataset.originalText ||
                "Upload File";

        }

    }


    // ========================================================
    // RESET
    // ========================================================

    uploadForm.addEventListener(
        "reset",
        () => {

            setTimeout(() => {

                if (selectedFile) {

                    selectedFile.textContent =
                        "No file selected";

                }


                if (requiredColumns) {

                    requiredColumns.innerHTML = `
                        <span>Select upload type</span>
                    `;

                }


                if (requiredColumnsDescription) {

                    requiredColumnsDescription.textContent =
                        "Select an upload type to see the required Excel columns.";

                }


                if (uploadPreview) {

                    uploadPreview.innerHTML = `

                        <div class="empty-state-icon">
                            □
                        </div>

                        <h3>
                            No File Uploaded
                        </h3>

                        <p>
                            Select an Excel file to preview its records.
                        </p>

                    `;

                }


                const message =
                    document.getElementById(
                        "uploadMessage"
                    );


                if (message) {

                    message.style.display =
                        "none";

                }


                const result =
                    document.getElementById(
                        "uploadResult"
                    );


                if (result) {

                    result.style.display =
                        "none";

                }

            }, 0);

        }
    );


    // ========================================================
    // FORMAT FILE SIZE
    // ========================================================

    function formatFileSize(bytes) {

        if (bytes === 0) {
            return "0 Bytes";
        }


        const units = [
            "Bytes",
            "KB",
            "MB",
            "GB"
        ];


        const index =
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            );


        return (
            parseFloat(
                (
                    bytes /
                    Math.pow(
                        1024,
                        index
                    )
                ).toFixed(2)
            ) +
            " " +
            units[index]
        );

    }


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ========================================================
    // STARTUP DEBUG
    // ========================================================

    console.log(
        "========================================="
    );

    console.log(
        "Finance Date Recovery Tool"
    );

    console.log(
        "upload.js loaded successfully"
    );

    console.log(
        "========================================="
    );

    console.log(
        "Upload API:",
        API_URL
    );

    console.log(
        "Authentication token:",
        getAuthToken()
            ? "FOUND"
            : "NOT FOUND"
    );

    console.log(
        "Stored user:",
        getStoredUser()
            ? "FOUND"
            : "NOT FOUND"
    );

});

