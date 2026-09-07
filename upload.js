
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

    // Storage key used by script.js
    const TOKEN_KEY = "financeRecovery_token";
    const USER_KEY = "financeRecovery_user";


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
    // CHECK REQUIRED ELEMENTS
    // ========================================================

    if (!uploadForm) {
        console.error(
            "ERROR: uploadForm was not found."
        );
        return;
    }

    if (!excelFile) {
        console.error(
            "ERROR: excelFile input was not found."
        );
        return;
    }

    if (!uploadType) {
        console.error(
            "ERROR: uploadType was not found."
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
    // AUTHENTICATION
    // ========================================================

    function getAuthToken() {

        const token =
            localStorage.getItem(TOKEN_KEY);

        if (!token) {
            console.warn(
                "No authentication token found."
            );
        }

        return token;
    }


    // ========================================================
    // CHECK LOGIN
    // ========================================================

    function isLoggedIn() {

        const token =
            getAuthToken();

        const user =
            localStorage.getItem(USER_KEY);

        return !!token && !!user;
    }


    // ========================================================
    // REDIRECT TO LOGIN
    // ========================================================

    function redirectToLogin() {

        showMessage(
            "Your login session has expired. Please login again.",
            "error"
        );

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1500);
    }


    // ========================================================
    // GET AUTHORIZATION HEADERS
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
    // UPLOAD TYPE CHANGE
    // ========================================================

    uploadType.addEventListener(
        "change",
        function () {

            const type =
                uploadType.value;


            // ------------------------------------------------
            // NO TYPE SELECTED
            // ------------------------------------------------

            if (!type) {

                requiredColumns.innerHTML = `
                    <span>
                        Select upload type
                    </span>
                `;

                requiredColumnsDescription.textContent =
                    "Select an upload type to see the required Excel columns.";

                return;
            }


            // ------------------------------------------------
            // FINANCIAL RECORDS
            // ------------------------------------------------

            if (
                type === "financial_records"
            ) {

                requiredColumnsDescription.textContent =
                    "Your financial records Excel file should contain the following columns.";

                displayRequiredColumns(
                    financialRecordColumns
                );

                return;
            }


            // ------------------------------------------------
            // REPAYMENTS
            // ------------------------------------------------

            if (
                type === "repayments"
            ) {

                requiredColumnsDescription.textContent =
                    "Your repayment Excel file should contain the following columns.";

                displayRequiredColumns(
                    repaymentColumns
                );

                return;
            }

        }
    );


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
    // FILE SELECTION
    // ========================================================

    excelFile.addEventListener(
        "change",
        () => {

            const file =
                excelFile.files[0];


            if (!file) {

                selectedFile.textContent =
                    "No file selected";

                return;
            }


            if (
                !isValidFile(file)
            ) {

                excelFile.value = "";

                selectedFile.textContent =
                    "No file selected";

                return;
            }


            selectedFile.textContent =
                `${file.name} (${formatFileSize(file.size)})`;


            // Show preview
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


            // ------------------------------------------------
            // CHECK LOGIN
            // ------------------------------------------------

            if (!isLoggedIn()) {

                showMessage(
                    "You are not logged in. Please login first.",
                    "error"
                );

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 1200);

                return;
            }


            // ------------------------------------------------
            // VALIDATE UPLOAD TYPE
            // ------------------------------------------------

            if (!uploadType.value) {

                showMessage(
                    "Please select what type of records you are uploading.",
                    "error"
                );

                uploadType.focus();

                return;
            }


            // ------------------------------------------------
            // GET FILE
            // ------------------------------------------------

            const file =
                excelFile.files[0];


            if (!file) {

                showMessage(
                    "Please select an Excel or CSV file.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // VALIDATE FILE
            // ------------------------------------------------

            if (
                !isValidFile(file)
            ) {

                return;
            }


            // ------------------------------------------------
            // VALIDATE LOGBOOK NAME
            // ------------------------------------------------

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


            // ------------------------------------------------
            // VALIDATE FINANCIAL YEAR
            // ------------------------------------------------

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
            // GET TOKEN
            // =================================================

            const token =
                getAuthToken();


            if (!token) {

                redirectToLogin();

                return;
            }


            // =================================================
            // CREATE FORM DATA
            // =================================================

            const formData =
                new FormData();


            // IMPORTANT:
            // This MUST match:
            //
            // upload.single("excelFile")
            //
            // in your Node.js backend.

            formData.append(
                "excelFile",
                file
            );


            // -------------------------------------------------
            // UPLOAD TYPE
            // -------------------------------------------------

            formData.append(
                "uploadType",
                uploadType.value
            );


            // -------------------------------------------------
            // LOGBOOK NAME
            // -------------------------------------------------

            formData.append(
                "logbookName",
                logbookName.value.trim()
            );


            // -------------------------------------------------
            // FINANCIAL YEAR
            // -------------------------------------------------

            formData.append(
                "financialYear",
                financialYear.value.trim()
            );


            // -------------------------------------------------
            // BRANCH
            // -------------------------------------------------

            if (branch) {

                formData.append(
                    "branch",
                    branch.value.trim()
                );

            }


            // -------------------------------------------------
            // DESCRIPTION
            // -------------------------------------------------

            if (description) {

                formData.append(
                    "description",
                    description.value.trim()
                );

            }


            // =================================================
            // START UPLOAD
            // =================================================

            try {

                setLoading(true);


                showMessage(
                    `Uploading ${
                        uploadType.value === "repayments"
                            ? "repayment"
                            : "financial"
                    } records...`,
                    "loading"
                );


                console.log(
                    "-----------------------------------------"
                );

                console.log(
                    "STARTING UPLOAD"
                );

                console.log(
                    "-----------------------------------------"
                );


                console.log(
                    "File:",
                    file.name
                );

                console.log(
                    "Upload type:",
                    uploadType.value
                );

                console.log(
                    "API:",
                    API_URL
                );

                console.log(
                    "Authentication token:",
                    token
                        ? "Token found"
                        : "NO TOKEN"
                );


                // =================================================
                // SEND REQUEST
                // =================================================
                //
                // IMPORTANT:
                //
                // We DO NOT set Content-Type manually.
                //
                // The browser automatically creates:
                //
                // multipart/form-data; boundary=...
                //
                // =================================================

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


                // =================================================
                // READ RESPONSE
                // =================================================

                let result;


                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";


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
                            "The server returned an invalid response."
                    };

                }


                console.log(
                    "Server response:",
                    result
                );


                // =================================================
                // TOKEN / AUTHORIZATION ERROR
                // =================================================

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    console.error(
                        "Authentication failed:",
                        result
                    );


                    // Remove expired credentials
                    localStorage.removeItem(
                        TOKEN_KEY
                    );

                    localStorage.removeItem(
                        USER_KEY
                    );


                    showMessage(
                        result.message ||
                        "Your login session has expired. Please login again.",
                        "error"
                    );


                    setTimeout(() => {

                        window.location.href =
                            "index.html";

                    }, 1500);


                    return;
                }


                // =================================================
                // API ERROR
                // =================================================

                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        result.error ||
                        "The file could not be uploaded."
                    );

                }


                // =================================================
                // SUCCESS
                // =================================================

                showMessage(
                    result.message ||
                    "Excel file uploaded successfully.",
                    "success"
                );


                // =================================================
                // SHOW UPLOAD RESULT
                // =================================================

                showUploadResult(
                    result.data || {}
                );


                // =================================================
                // STORE FILE ID
                // =================================================

                if (
                    result.data &&
                    result.data.fileId
                ) {

                    try {

                        localStorage.setItem(
                            "financeRecovery_lastFileId",
                            String(
                                result.data.fileId
                            )
                        );

                    } catch (storageError) {

                        console.warn(
                            "Could not save last file ID.",
                            storageError
                        );

                    }

                }


                console.log(
                    "-----------------------------------------"
                );

                console.log(
                    "UPLOAD SUCCESSFUL"
                );

                console.log(
                    "-----------------------------------------"
                );


                console.log(
                    result
                );

            } catch (error) {

                console.error(
                    "UPLOAD ERROR:",
                    error
                );


                // =================================================
                // NETWORK ERROR
                // =================================================

                if (
                    error instanceof TypeError
                ) {

                    showMessage(
                        "Unable to connect to the Node.js server. Please check your internet connection and backend server.",
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
    // FORM RESET
    // ========================================================

    uploadForm.addEventListener(
        "reset",
        () => {

            setTimeout(
                () => {

                    if (selectedFile) {

                        selectedFile.textContent =
                            "No file selected";

                    }


                    // Reset upload type
                    uploadType.value =
                        "";


                    // Reset required columns
                    if (
                        requiredColumns
                    ) {

                        requiredColumns.innerHTML = `
                            <span>
                                Select upload type
                            </span>
                        `;

                    }


                    if (
                        requiredColumnsDescription
                    ) {

                        requiredColumnsDescription.textContent =
                            "Select an upload type to see the required Excel columns.";

                    }


                    // Reset preview
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


                    // Hide message
                    const message =
                        document.getElementById(
                            "uploadMessage"
                        );


                    if (message) {

                        message.style.display =
                            "none";

                    }


                    // Hide result
                    const result =
                        document.getElementById(
                            "uploadResult"
                        );


                    if (result) {

                        result.style.display =
                            "none";

                    }

                },
                0
            );

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
            fileName
                .split(".")
                .pop();


        // ----------------------------------------------------
        // CHECK EXTENSION
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // CHECK FILE SIZE
        // ----------------------------------------------------

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
    // SHOW FILE PREVIEW
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


        // ----------------------------------------------------
        // CREATE MESSAGE BOX
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // SET MESSAGE
        // ----------------------------------------------------

        messageBox.className =
            `upload-message ${type}`;


        messageBox.textContent =
            message;


        messageBox.style.display =
            "block";

    }


    // ========================================================
    // SHOW UPLOAD RESULT
    // ========================================================

    function showUploadResult(
        data
    ) {

        let result =
            document.getElementById(
                "uploadResult"
            );


        // ----------------------------------------------------
        // CREATE RESULT BOX
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // GET DATA
        // ----------------------------------------------------

        const fileName =
            data.fileName ||
            "-";


        const records =
            data.records !== undefined
                ? data.records
                : 0;


        const fileId =
            data.fileId ||
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


        // ----------------------------------------------------
        // DISPLAY RESULT
        // ----------------------------------------------------

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
    // BUTTON LOADING STATE
    // ========================================================

    function setLoading(
        loading
    ) {

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
    // FORMAT FILE SIZE
    // ========================================================

    function formatFileSize(
        bytes
    ) {

        if (
            bytes === 0
        ) {

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

    function escapeHTML(
        value
    ) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    console.log(
        "Finance Date Recovery Tool - upload.js loaded."
    );

    console.log(
        "Authentication token:",
        getAuthToken()
            ? "FOUND"
            : "NOT FOUND"
    );

});

