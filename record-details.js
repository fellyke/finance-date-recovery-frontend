// ============================================================
// FINANCE DATE RECOVERY TOOL
// RECORD DETAIL.JS
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------------------------------
    // API CONFIGURATION
    // --------------------------------------------------------

    const API_URL = "http://localhost:5000/api/records";


    // --------------------------------------------------------
    // GET RECORD ID FROM URL
    // Example:
    // records-details.html?id=1
    // --------------------------------------------------------

    const urlParams = new URLSearchParams(window.location.search);
    const recordId = urlParams.get("id");


    // --------------------------------------------------------
    // CHECK IF RECORD ID EXISTS
    // --------------------------------------------------------

    if (!recordId) {
        showError("No record ID was provided.");
        return;
    }


    // --------------------------------------------------------
    // LOAD RECORD
    // --------------------------------------------------------

    loadRecord(recordId);


    // --------------------------------------------------------
    // LOAD RECORD FUNCTION
    // --------------------------------------------------------

    async function loadRecord(id) {

        try {

            const response = await fetch(`${API_URL}/${id}`);

            const result = await response.json();


            // ------------------------------------------------
            // CHECK API RESPONSE
            // ------------------------------------------------

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Unable to load record."
                );
            }


            // ------------------------------------------------
            // GET RECORD DATA
            // ------------------------------------------------

            const record = result.data;


            // ------------------------------------------------
            // DISPLAY RECORD
            // ------------------------------------------------

            displayRecord(record);


        } catch (error) {

            console.error("Error loading record:", error);

            showError(
                error.message || "Unable to load the financial record."
            );

        }

    }


    // --------------------------------------------------------
    // DISPLAY RECORD
    // --------------------------------------------------------

    function displayRecord(record) {

        // Member information
        setText(
            "detailMemberName",
            getValue(record, [
                "memberName",
                "member_name",
                "Member Name"
            ])
        );

        setText(
            "detailMemberNumber",
            getValue(record, [
                "memberNumber",
                "member_number",
                "Member Number"
            ])
        );


        // Loan information
        setText(
            "detailLoanNumber",
            getValue(record, [
                "loanNumber",
                "loan_number",
                "Loan Number"
            ])
        );

        setText(
            "detailLoanType",
            getValue(record, [
                "loanType",
                "loan_type",
                "Loan Type"
            ])
        );

        setText(
            "detailLoanAmount",
            formatCurrency(
                getValue(record, [
                    "loanAmount",
                    "loan_amount",
                    "Loan Amount"
                ])
            )
        );

        setText(
            "detailStatus",
            getValue(record, [
                "status",
                "Status"
            ])
        );


        // Important dates
        setText(
            "detailLoanDate",
            formatDate(
                getValue(record, [
                    "loanDate",
                    "loan_date",
                    "Loan Date"
                ])
            )
        );

        setText(
            "detailTransactionDate",
            formatDate(
                getValue(record, [
                    "transactionDate",
                    "transaction_date",
                    "Transaction Date"
                ])
            )
        );

        setText(
            "detailRepaymentDate",
            formatDate(
                getValue(record, [
                    "repaymentDate",
                    "repayment_date",
                    "Repayment Date"
                ])
            )
        );

        setText(
            "detailMaturityDate",
            formatDate(
                getValue(record, [
                    "maturityDate",
                    "maturity_date",
                    "Maturity Date"
                ])
            )
        );


        // Source information
        setText(
            "detailSourceFile",
            getValue(record, [
                "sourceFile",
                "source_file",
                "fileName",
                "file_name",
                "Source Excel File"
            ])
        );

        setText(
            "detailImportedDate",
            formatDate(
                getValue(record, [
                    "importedDate",
                    "imported_date",
                    "createdAt",
                    "created_at",
                    "Date Imported"
                ])
            )
        );

        setText(
            "detailVerificationStatus",
            getValue(record, [
                "verificationStatus",
                "verification_status",
                "Verification Status"
            ])
        );


        // ----------------------------------------------------
        // SOURCE RECORD BUTTON
        // ----------------------------------------------------

        setupSourceButton(record);

    }


    // --------------------------------------------------------
    // GET VALUE FROM OBJECT
    // --------------------------------------------------------
    // This allows the JS to work with either:
    //
    // memberName
    // member_name
    // Member Name
    //
    // --------------------------------------------------------

    function getValue(object, possibleKeys) {

        for (const key of possibleKeys) {

            if (
                object &&
                object[key] !== undefined &&
                object[key] !== null &&
                object[key] !== ""
            ) {
                return object[key];
            }

        }

        return "—";
    }


    // --------------------------------------------------------
    // SET TEXT
    // --------------------------------------------------------

    function setText(elementId, value) {

        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.textContent = value || "—";

    }


    // --------------------------------------------------------
    // FORMAT CURRENCY
    // --------------------------------------------------------

    function formatCurrency(value) {

        if (
            value === "—" ||
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return value;
        }

        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 2
        }).format(number);

    }


    // --------------------------------------------------------
    // FORMAT DATE
    // --------------------------------------------------------

    function formatDate(value) {

        if (
            value === "—" ||
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("en-KE", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

    }


    // --------------------------------------------------------
    // SOURCE RECORD BUTTON
    // --------------------------------------------------------

    function setupSourceButton(record) {

        const button = document.getElementById(
            "sourceRecordButton"
        );

        if (!button) {
            return;
        }


        button.addEventListener("click", function () {

            // If the API provides a source URL,
            // open it in a new tab.

            const sourceUrl = getValue(record, [
                "sourceUrl",
                "source_url",
                "sourceRecordUrl",
                "source_record_url"
            ]);


            if (sourceUrl !== "—") {

                window.open(
                    sourceUrl,
                    "_blank"
                );

                return;
            }


            // If no source URL exists
            alert(
                "The original source record is not available."
            );

        });

    }


    // --------------------------------------------------------
    // DISPLAY ERROR
    // --------------------------------------------------------

    function showError(message) {

        const fields = [
            "detailMemberName",
            "detailMemberNumber",
            "detailLoanNumber",
            "detailLoanType",
            "detailLoanAmount",
            "detailStatus",
            "detailLoanDate",
            "detailTransactionDate",
            "detailRepaymentDate",
            "detailMaturityDate",
            "detailSourceFile",
            "detailImportedDate",
            "detailVerificationStatus"
        ];


        fields.forEach(function (field) {
            setText(field, "—");
        });


        console.error(message);


        // Show the error on the page
        const pageContent = document.querySelector(
            ".page-content"
        );


        if (pageContent) {

            const errorBox = document.createElement("div");

            errorBox.className = "panel";

            errorBox.innerHTML = `
                <div style="
                    padding: 20px;
                    color: #b42318;
                    background: #fef3f2;
                    border-radius: 8px;
                ">
                    <strong>Unable to load record</strong>
                    <p>${escapeHtml(message)}</p>
                    <a href="records.html" class="btn btn-primary">
                        Back to Records
                    </a>
                </div>
            `;

            pageContent.prepend(errorBox);

        }

    }


    // --------------------------------------------------------
    // ESCAPE HTML
    // --------------------------------------------------------

    function escapeHtml(value) {

        const div = document.createElement("div");

        div.textContent = value;

        return div.innerHTML;

    }

});