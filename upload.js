// ============================================================
// FINANCE DATE RECOVERY TOOL
// UPLOAD.JS
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    // ========================================================
    // API CONFIGURATION
    // ========================================================

    const API_URL = "http://localhost:5000/api/upload";


    // ========================================================
    // GET HTML ELEMENTS
    // ========================================================

    const uploadForm = document.getElementById("uploadForm");

    const excelFile = document.getElementById("excelFile");

    const selectedFile = document.getElementById("selectedFile");

    const uploadType = document.getElementById("uploadType");

    const logbookName = document.getElementById("logbookName");

    const financialYear = document.getElementById("financialYear");

    const branch = document.getElementById("branch");

    const description = document.getElementById("description");

    const requiredColumns = document.getElementById("requiredColumns");

    const requiredColumnsDescription =
        document.getElementById("requiredColumnsDescription");

    const uploadPreview =
        document.getElementById("uploadPreview");

    const uploadButton = uploadForm
        ? uploadForm.querySelector('button[type="submit"]')
        : null;


    // ========================================================
    // CHECK REQUIRED ELEMENTS
    // ========================================================

    if (!uploadForm) {
        console.error("ERROR: uploadForm was not found.");
        return;
    }

    if (!excelFile) {
        console.error("ERROR: excelFile input was not found.");
        return;
    }

    if (!uploadType) {
        console.error("ERROR: uploadType was not found.");
        return;
    }


    // ========================================================
    // REQUIRED COLUMNS
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
    // UPLOAD TYPE CHANGE
    // ========================================================

    uploadType.addEventListener("change", function () {

        const type = uploadType.value;


        // ----------------------------------------------------
        // NO TYPE SELECTED
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // FINANCIAL RECORDS
        // ----------------------------------------------------

        if (type === "financial_records") {

            requiredColumnsDescription.textContent =
                "Your financial records Excel file should contain the following columns.";

            displayRequiredColumns(
                financialRecordColumns
            );

            return;
        }


        // ----------------------------------------------------
        // REPAYMENTS
        // ----------------------------------------------------

        if (type === "repayments") {

            requiredColumnsDescription.textContent =
                "Your repayment Excel file should contain the following columns.";

            displayRequiredColumns(
                repaymentColumns
            );

            return;
        }

    });


    // ========================================================
    // DISPLAY REQUIRED COLUMNS
    // ========================================================

    function displayRequiredColumns(columns) {

        requiredColumns.innerHTML = "";

        columns.forEach(column => {

            const span = document.createElement("span");

            span.textContent = column;

            requiredColumns.appendChild(span);

        });

    }


    // ========================================================
    // FILE SELECTION
    // ========================================================

    excelFile.addEventListener("change", () => {

        const file = excelFile.files[0];


        if (!file) {

            selectedFile.textContent =
                "No file selected";

            return;
        }


        if (!isValidFile(file)) {

            excelFile.value = "";

            selectedFile.textContent =
                "No file selected";

            return;
        }


        selectedFile.textContent =
            `${file.name} (${formatFileSize(file.size)})`;


        // Show preview information
        showFilePreview(file);

    });


    // ========================================================
    // FORM SUBMIT
    // ========================================================

    uploadForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        // ----------------------------------------------------
        // VALIDATE UPLOAD TYPE
        // ----------------------------------------------------

        if (!uploadType.value) {

            showMessage(
                "Please select what type of records you are uploading.",
                "error"
            );

            uploadType.focus();

            return;
        }


        // ----------------------------------------------------
        // GET FILE
        // ----------------------------------------------------

        const file = excelFile.files[0];


        if (!file) {

            showMessage(
                "Please select an Excel or CSV file.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // VALIDATE FILE
        // ----------------------------------------------------

        if (!isValidFile(file)) {
            return;
        }


        // ----------------------------------------------------
        // VALIDATE LOGBOOK NAME
        // ----------------------------------------------------

        if (!logbookName.value.trim()) {

            showMessage(
                "Please enter the logbook name.",
                "error"
            );

            logbookName.focus();

            return;
        }


        // ----------------------------------------------------
        // VALIDATE FINANCIAL YEAR
        // ----------------------------------------------------

        if (!financialYear.value.trim()) {

            showMessage(
                "Please enter the financial year.",
                "error"
            );

            financialYear.focus();

            return;
        }


        // ====================================================
        // CREATE FORM DATA
        // ====================================================

        const formData = new FormData();


        // IMPORTANT:
        // This must match multer upload.single("excelFile")
        formData.append(
            "excelFile",
            file
        );


        // ----------------------------------------------------
        // UPLOAD TYPE
        // ----------------------------------------------------

        formData.append(
            "uploadType",
            uploadType.value
        );


        // ----------------------------------------------------
        // LOGBOOK INFORMATION
        // ----------------------------------------------------

        formData.append(
            "logbookName",
            logbookName.value.trim()
        );


        formData.append(
            "financialYear",
            financialYear.value.trim()
        );


        formData.append(
            "branch",
            branch.value.trim()
        );


        formData.append(
            "description",
            description.value.trim()
        );


        // ====================================================
        // START UPLOAD
        // ====================================================

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


            console.log("-----------------------------------------");
            console.log("STARTING UPLOAD");
            console.log("-----------------------------------------");

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


            // =================================================
            // SEND REQUEST TO NODE.JS
            // =================================================

            const response = await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


            // =================================================
            // READ RESPONSE
            // =================================================

            let result;


            try {

                result = await response.json();

            } catch (jsonError) {

                throw new Error(
                    "The server returned an invalid response."
                );

            }


            console.log(
                "Server response:",
                result
            );


            // =================================================
            // CHECK API RESPONSE
            // =================================================

            if (!response.ok || !result.success) {

                throw new Error(
                    result.message ||
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
            // LOG SUCCESS
            // =================================================

            console.log("-----------------------------------------");
            console.log("UPLOAD SUCCESSFUL");
            console.log("-----------------------------------------");

            console.log(result);


        } catch (error) {

            console.error(
                "UPLOAD ERROR:",
                error
            );


            // =================================================
            // CONNECTION ERROR
            // =================================================

            if (
                error instanceof TypeError &&
                error.message.includes("fetch")
            ) {

                showMessage(
                    "Cannot connect to the Node.js server. Make sure your backend is running.",
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

    });


    // ========================================================
    // FORM RESET
    // ========================================================

    uploadForm.addEventListener("reset", () => {

        setTimeout(() => {

            selectedFile.textContent =
                "No file selected";


            // Reset upload type
            uploadType.value = "";


            // Reset required columns
            requiredColumns.innerHTML = `
                <span>
                    Select upload type
                </span>
            `;


            requiredColumnsDescription.textContent =
                "Select an upload type to see the required Excel columns.";


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

        }, 0);

    });


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

        if (!allowedExtensions.includes(extension)) {

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


        if (file.size > maxSize) {

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
                ${escapeHTML(formatFileSize(file.size))}
            </p>

            <p>
                The file is ready to be uploaded.
            </p>

        `;

    }


    // ========================================================
    // SHOW MESSAGE
    // ========================================================

    function showMessage(message, type) {

        let messageBox =
            document.getElementById(
                "uploadMessage"
            );


        // ----------------------------------------------------
        // CREATE MESSAGE BOX
        // ----------------------------------------------------

        if (!messageBox) {

            messageBox =
                document.createElement("div");

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

    function showUploadResult(data) {

        let result =
            document.getElementById(
                "uploadResult"
            );


        // ----------------------------------------------------
        // CREATE RESULT BOX
        // ----------------------------------------------------

        if (!result) {

            result =
                document.createElement("div");

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
            data.fileName || "-";


        const records =
            data.records !== undefined
                ? data.records
                : 0;


        const fileId =
            data.fileId || "-";


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

});