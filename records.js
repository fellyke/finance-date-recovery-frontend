// ============================================================
// FINANCE DATE RECOVERY TOOL
// RECORDS.JS
// ============================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------------------------------
    // ELEMENTS
    // --------------------------------------------------------

    const recordSearch =
        document.getElementById("recordSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const recordsBody =
        document.getElementById("recordsBody");

    const recordsTable =
        document.getElementById("recordsTable");

    const recordCount =
        document.getElementById("recordCount");

    const emptyState =
        document.querySelector(".empty-state");

    const searchButton =
        document.querySelector(".search-box .btn");


    // --------------------------------------------------------
    // STORE RECORDS
    // --------------------------------------------------------

    let allRecords = [];


    // --------------------------------------------------------
    // CHECK AUTHENTICATION
    // --------------------------------------------------------

    if (!requireAuthentication()) {
        return;
    }


    // --------------------------------------------------------
    // LOAD RECORDS WHEN PAGE OPENS
    // --------------------------------------------------------

    loadRecords();


    // --------------------------------------------------------
    // SEARCH BUTTON
    // --------------------------------------------------------

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function () {
                filterRecords();
            }
        );

    }


    // --------------------------------------------------------
    // SEARCH WHILE TYPING
    // --------------------------------------------------------

    if (recordSearch) {

        recordSearch.addEventListener(
            "input",
            function () {
                filterRecords();
            }
        );

    }


    // --------------------------------------------------------
    // STATUS FILTER
    // --------------------------------------------------------

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {
                filterRecords();
            }
        );

    }


    // ========================================================
    // LOAD RECORDS FROM API
    // ========================================================

    async function loadRecords() {

        try {

            showLoading();


            // ------------------------------------------------
            // IMPORTANT
            // apiGet() automatically sends the JWT token.
            // ------------------------------------------------

            const result =
                await apiGet("records");


            // ------------------------------------------------
            // CHECK API RESPONSE
            // ------------------------------------------------

            if (!result || !result.success) {

                throw new Error(
                    result?.message ||
                    "Failed to load financial records."
                );

            }


            // ------------------------------------------------
            // GET RECORD DATA
            // ------------------------------------------------

            allRecords =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            // ------------------------------------------------
            // DISPLAY RECORDS
            // ------------------------------------------------

            displayRecords(allRecords);


            console.log(
                "Financial records loaded successfully:",
                allRecords
            );


        } catch (error) {

            console.error(
                "Error loading financial records:",
                error
            );


            // ------------------------------------------------
            // HANDLE AUTHENTICATION ERROR
            // ------------------------------------------------

            if (
                error.status === 401 ||
                error.status === 403
            ) {

                removeAuthToken();
                removeCurrentUser();

                showError(
                    "Your login session has expired. Please log in again."
                );

                setTimeout(function () {
                    window.location.href = "index.html";
                }, 1500);

                return;
            }


            // ------------------------------------------------
            // SHOW ACTUAL ERROR
            // ------------------------------------------------

            showError(
                error.message ||
                "Unable to load financial records."
            );

        }

    }


    // ========================================================
    // DISPLAY RECORDS
    // ========================================================

    function displayRecords(records) {

        if (!recordsBody) {
            return;
        }


        recordsBody.innerHTML = "";


        // ----------------------------------------------------
        // NO RECORDS
        // ----------------------------------------------------

        if (!records || records.length === 0) {

            if (recordsTable) {
                recordsTable.style.display = "none";
            }

            if (emptyState) {
                emptyState.style.display = "block";
            }

            if (recordCount) {
                recordCount.textContent =
                    "No records available.";
            }

            return;
        }


        // ----------------------------------------------------
        // SHOW TABLE
        // ----------------------------------------------------

        if (recordsTable) {
            recordsTable.style.display = "table";
        }

        if (emptyState) {
            emptyState.style.display = "none";
        }


        // ----------------------------------------------------
        // RECORD COUNT
        // ----------------------------------------------------

        if (recordCount) {

            recordCount.textContent =
                `${records.length} record${
                    records.length === 1
                        ? ""
                        : "s"
                } found`;

        }


        // ----------------------------------------------------
        // CREATE TABLE ROWS
        // ----------------------------------------------------

        records.forEach(function (record) {

            const row =
                document.createElement("tr");


            // ------------------------------------------------
            // GET VALUES
            // ------------------------------------------------

            const id =
                getValue(record, [
                    "id",
                    "recordId",
                    "record_id"
                ]);


            const memberNumber =
                getValue(record, [
                    "memberNumber",
                    "member_number",
                    "Member Number"
                ]);


            const memberName =
                getValue(record, [
                    "memberName",
                    "member_name",
                    "Member Name"
                ]);


            const loanNumber =
                getValue(record, [
                    "loanNumber",
                    "loan_number",
                    "Loan Number"
                ]);


            const loanType =
                getValue(record, [
                    "loanType",
                    "loan_type",
                    "Loan Type"
                ]);


            const loanAmount =
                getValue(record, [
                    "loanAmount",
                    "loan_amount",
                    "Loan Amount"
                ]);


            const loanDate =
                getValue(record, [
                    "loanDate",
                    "loan_date",
                    "Loan Date"
                ]);


            const repaymentDate =
                getValue(record, [
                    "repaymentDate",
                    "repayment_date",
                    "Repayment Date"
                ]);


            const maturityDate =
                getValue(record, [
                    "maturityDate",
                    "maturity_date",
                    "Maturity Date"
                ]);


            const status =
                getValue(record, [
                    "status",
                    "Status"
                ]);


            // ------------------------------------------------
            // CREATE TABLE CELLS
            // ------------------------------------------------

            row.innerHTML = `

                <td>
                    ${escapeHtml(memberNumber)}
                </td>

                <td>
                    ${escapeHtml(memberName)}
                </td>

                <td>
                    ${escapeHtml(loanNumber)}
                </td>

                <td>
                    ${escapeHtml(loanType)}
                </td>

                <td>
                    ${formatCurrency(loanAmount)}
                </td>

                <td>
                    ${formatDate(loanDate)}
                </td>

                <td>
                    ${formatDate(repaymentDate)}
                </td>

                <td>
                    ${formatDate(maturityDate)}
                </td>

                <td>
                    ${createStatusBadge(status)}
                </td>

                <td>

                    <a
                        href="records-details.html?id=${encodeURIComponent(id)}"
                        class="btn btn-primary btn-sm"
                    >
                        View Details
                    </a>

                </td>

            `;


            recordsBody.appendChild(row);

        });

    }


    // ========================================================
    // FILTER RECORDS
    // ========================================================

    function filterRecords() {

        const searchTerm =
            recordSearch
                ? recordSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                    .trim()
                    .toLowerCase()
                : "";


        const filteredRecords =
            allRecords.filter(
                function (record) {

                    // ----------------------------------------
                    // SEARCH VALUES
                    // ----------------------------------------

                    const memberNumber =
                        String(
                            getValue(record, [
                                "memberNumber",
                                "member_number",
                                "Member Number"
                            ])
                        ).toLowerCase();


                    const memberName =
                        String(
                            getValue(record, [
                                "memberName",
                                "member_name",
                                "Member Name"
                            ])
                        ).toLowerCase();


                    const loanNumber =
                        String(
                            getValue(record, [
                                "loanNumber",
                                "loan_number",
                                "Loan Number"
                            ])
                        ).toLowerCase();


                    const transactionNumber =
                        String(
                            getValue(record, [
                                "transactionNumber",
                                "transaction_number",
                                "transactionReference",
                                "transaction_reference",
                                "Transaction Number"
                            ])
                        ).toLowerCase();


                    // ----------------------------------------
                    // SEARCH MATCH
                    // ----------------------------------------

                    const matchesSearch =
                        searchTerm === "" ||
                        memberNumber.includes(searchTerm) ||
                        memberName.includes(searchTerm) ||
                        loanNumber.includes(searchTerm) ||
                        transactionNumber.includes(searchTerm);


                    // ----------------------------------------
                    // STATUS MATCH
                    // ----------------------------------------

                    const recordStatus =
                        String(
                            getValue(record, [
                                "status",
                                "Status"
                            ])
                        ).toLowerCase();


                    const matchesStatus =
                        selectedStatus === "" ||
                        recordStatus === selectedStatus;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );


        // ----------------------------------------------------
        // DISPLAY FILTERED RECORDS
        // ----------------------------------------------------

        displayRecords(filteredRecords);


        // ----------------------------------------------------
        // NO SEARCH RESULTS
        // ----------------------------------------------------

        if (
            filteredRecords.length === 0 &&
            allRecords.length > 0
        ) {

            if (recordsTable) {
                recordsTable.style.display = "none";
            }


            if (emptyState) {

                emptyState.style.display = "block";


                const title =
                    emptyState.querySelector("h3");

                const message =
                    emptyState.querySelector("p");

                const button =
                    emptyState.querySelector("a");


                if (title) {
                    title.textContent =
                        "No Matching Records";
                }


                if (message) {

                    message.textContent =
                        "No financial records match your search or filter.";

                }


                if (button) {
                    button.style.display = "none";
                }

            }


            if (recordCount) {

                recordCount.textContent =
                    "No matching records found.";

            }

        }

    }


    // ========================================================
    // CREATE STATUS BADGE
    // ========================================================

    function createStatusBadge(status) {

        if (
            status === null ||
            status === undefined ||
            status === "" ||
            status === "—"
        ) {
            return "—";
        }


        const cleanStatus =
            String(status).trim();


        const className =
            cleanStatus
                .toLowerCase()
                .replace(/\s+/g, "-");


        return `
            <span
                class="status-badge status-${escapeHtml(className)}"
            >
                ${escapeHtml(cleanStatus)}
            </span>
        `;

    }


    // ========================================================
    // FORMAT CURRENCY
    // ========================================================

    function formatCurrency(value) {

        if (
            value === null ||
            value === undefined ||
            value === "" ||
            value === "—"
        ) {
            return "—";
        }


        const number =
            Number(value);


        if (Number.isNaN(number)) {

            return escapeHtml(
                String(value)
            );

        }


        return new Intl.NumberFormat(
            "en-KE",
            {
                style: "currency",
                currency: "KES",
                minimumFractionDigits: 2
            }
        ).format(number);

    }


    // ========================================================
    // FORMAT DATE
    // ========================================================

    function formatDate(value) {

        if (
            value === null ||
            value === undefined ||
            value === "" ||
            value === "—"
        ) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return escapeHtml(
                String(value)
            );

        }


        return date.toLocaleDateString(
            "en-KE",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // ========================================================
    // GET VALUE
    // ========================================================

    function getValue(object, keys) {

        for (const key of keys) {

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


    // ========================================================
    // SHOW LOADING
    // ========================================================

    function showLoading() {

        if (recordsTable) {
            recordsTable.style.display = "table";
        }


        if (emptyState) {
            emptyState.style.display = "none";
        }


        if (recordsBody) {

            recordsBody.innerHTML = `
                <tr>
                    <td
                        colspan="10"
                        style="text-align:center;"
                    >
                        Loading financial records...
                    </td>
                </tr>
            `;

        }


        if (recordCount) {

            recordCount.textContent =
                "Loading records...";

        }

    }


    // ========================================================
    // SHOW ERROR
    // ========================================================

    function showError(message) {

        if (recordsTable) {
            recordsTable.style.display = "table";
        }


        if (emptyState) {
            emptyState.style.display = "none";
        }


        if (recordsBody) {

            recordsBody.innerHTML = `
                <tr>
                    <td
                        colspan="10"
                        style="text-align:center;"
                    >
                        ${escapeHtml(message)}
                    </td>
                </tr>
            `;

        }


        if (recordCount) {

            recordCount.textContent =
                "Unable to load records.";

        }

    }


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHtml(value) {

        const div =
            document.createElement("div");

        div.textContent =
            String(value);

        return div.innerHTML;

    }

});