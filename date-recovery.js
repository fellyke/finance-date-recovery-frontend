
// ============================================================
// FINANCE DATE RECOVERY TOOL
// DATE-RECOVERY.JS
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // --------------------------------------------------------
    // API
    // --------------------------------------------------------

    const API_URL = "https://finance-date-recovery-backend.onrender.com/api/recovery";


    // --------------------------------------------------------
    // ELEMENTS
    // --------------------------------------------------------

    const form = document.getElementById("dateRecoveryForm");

    const memberNumber =
        document.getElementById("memberNumber");

    const memberName =
        document.getElementById("memberName");

    const loanNumber =
        document.getElementById("loanNumber");

    const loanType =
        document.getElementById("loanType");

    const transactionReference =
        document.getElementById("transactionReference");

    const loanDate =
        document.getElementById("loanDate");

    const repaymentDate =
        document.getElementById("repaymentDate");

    const maturityDate =
        document.getElementById("maturityDate");

    const searchButton =
        document.getElementById("searchButton");

    const clearButton =
        document.getElementById("clearButton");

    const resultsBody =
        document.getElementById("resultsBody");

    const resultsContainer =
        document.getElementById("resultsContainer");

    const emptyState =
        document.getElementById("emptyState");

    const resultMessage =
        document.getElementById("resultMessage");

    const recoveredRecord =
        document.getElementById("recoveredRecord");

    const viewSourceButton =
        document.getElementById("viewSourceButton");

    const viewDetailsButton =
        document.getElementById("viewDetailsButton");


    // --------------------------------------------------------
    // CURRENT SELECTED RECORD
    // --------------------------------------------------------

    let selectedRecord = null;


    // --------------------------------------------------------
    // GET AUTHENTICATION TOKEN
    // --------------------------------------------------------

    function getToken() {

        const possibleKeys = [
            "token",
            "authToken",
            "jwtToken",
            "accessToken"
        ];

        // Check localStorage
        for (const key of possibleKeys) {

            const token =
                localStorage.getItem(key);

            if (token) {
                return token;
            }
        }


        // Check sessionStorage
        for (const key of possibleKeys) {

            const token =
                sessionStorage.getItem(key);

            if (token) {
                return token;
            }
        }


        return null;
    }


    // --------------------------------------------------------
    // AUTHENTICATED FETCH
    // --------------------------------------------------------

    async function apiFetch(url, options = {}) {

        const token = getToken();


        if (!token) {

            throw new Error(
                "Authentication token not found. Please login again."
            );

        }


        const headers = {
            ...(options.headers || {}),
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };


        return fetch(url, {
            ...options,
            headers: headers
        });

    }


    // --------------------------------------------------------
    // SEARCH FORM
    // --------------------------------------------------------

    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                await searchRecords();

            }
        );

    }


    // --------------------------------------------------------
    // CLEAR BUTTON
    // --------------------------------------------------------

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                clearSearch();

            }
        );

    }


    // --------------------------------------------------------
    // SEARCH RECORDS
    // --------------------------------------------------------

    async function searchRecords() {

        const memberNumberValue =
            memberNumber ? memberNumber.value.trim() : "";

        const memberNameValue =
            memberName ? memberName.value.trim() : "";

        const loanNumberValue =
            loanNumber ? loanNumber.value.trim() : "";

        const loanTypeValue =
            loanType ? loanType.value.trim() : "";

        const transactionReferenceValue =
            transactionReference
                ? transactionReference.value.trim()
                : "";

        const loanDateValue =
            loanDate ? loanDate.value : "";

        const repaymentDateValue =
            repaymentDate ? repaymentDate.value : "";

        const maturityDateValue =
            maturityDate ? maturityDate.value : "";


        // ----------------------------------------------------
        // CHECK SEARCH INPUT
        // ----------------------------------------------------

        if (
            !memberNumberValue &&
            !memberNameValue &&
            !loanNumberValue &&
            !loanTypeValue &&
            !transactionReferenceValue &&
            !loanDateValue &&
            !repaymentDateValue &&
            !maturityDateValue
        ) {

            showMessage(
                "Please enter at least one search detail."
            );

            return;

        }


        // ----------------------------------------------------
        // SHOW LOADING
        // ----------------------------------------------------

        setLoading(true);


        try {

            // ------------------------------------------------
            // BUILD QUERY
            // ------------------------------------------------

            const params =
                new URLSearchParams();


            if (memberNumberValue) {

                params.append(
                    "memberNumber",
                    memberNumberValue
                );

            }


            if (memberNameValue) {

                params.append(
                    "memberName",
                    memberNameValue
                );

            }


            if (loanNumberValue) {

                params.append(
                    "loanNumber",
                    loanNumberValue
                );

            }


            // The backend currently does not search
            // loanType, loanDate, repaymentDate or maturityDate.
            //
            // Transaction field MUST be called transactionNumber
            // because that is what the backend accepts.

            if (transactionReferenceValue) {

                params.append(
                    "transactionNumber",
                    transactionReferenceValue
                );

            }


            // ------------------------------------------------
            // CALL AUTHENTICATED API
            // ------------------------------------------------

            const response =
                await apiFetch(
                    `${API_URL}/search?${params.toString()}`
                );


            const result =
                await response.json();


            // ------------------------------------------------
            // AUTHENTICATION ERROR
            // ------------------------------------------------

            if (response.status === 401) {

                showMessage(
                    "Your login session has expired. Please login again."
                );

                return;

            }


            // ------------------------------------------------
            // API ERROR
            // ------------------------------------------------

            if (
                !response.ok ||
                !result.success
            ) {

                displayResults([]);

                showMessage(
                    result.message ||
                    "No matching records found."
                );

                return;

            }


            // ------------------------------------------------
            // GET RECORDS
            // ------------------------------------------------

            const records =
                Array.isArray(result.data)
                    ? result.data
                    : [];


            // ------------------------------------------------
            // DISPLAY RECORDS
            // ------------------------------------------------

            displayResults(records);


        } catch (error) {

            console.error(
                "Recovery search error:",
                error
            );


            displayResults([]);


            showMessage(
                error.message ||
                "Unable to connect to the recovery API."
            );


        } finally {

            setLoading(false);

        }

    }


    // --------------------------------------------------------
    // DISPLAY RESULTS
    // --------------------------------------------------------

    function displayResults(records) {

        if (!resultsBody) {
            return;
        }


        resultsBody.innerHTML = "";


        if (recoveredRecord) {
            recoveredRecord.style.display = "none";
        }


        selectedRecord = null;


        // ----------------------------------------------------
        // NO RESULTS
        // ----------------------------------------------------

        if (
            !records ||
            records.length === 0
        ) {

            if (resultsContainer) {
                resultsContainer.style.display = "none";
            }

            if (emptyState) {
                emptyState.style.display = "block";
            }

            if (resultMessage) {
                resultMessage.textContent =
                    "No matching financial records were found.";
            }

            return;

        }


        // ----------------------------------------------------
        // SHOW RESULTS
        // ----------------------------------------------------

        if (emptyState) {
            emptyState.style.display = "none";
        }


        if (resultsContainer) {
            resultsContainer.style.display = "block";
        }


        if (resultMessage) {

            resultMessage.textContent =
                `${records.length} matching record${records.length === 1 ? "" : "s"} found.`;

        }


        // ----------------------------------------------------
        // CREATE TABLE ROWS
        // ----------------------------------------------------

        records.forEach(function (record) {

            const row =
                document.createElement("tr");


            const memberNameValue =
                getValue(record, [
                    "memberName",
                    "member_name",
                    "Member Name"
                ]);


            const memberNumberValue =
                getValue(record, [
                    "memberNumber",
                    "member_number",
                    "Member Number"
                ]);


            const loanNumberValue =
                getValue(record, [
                    "loanNumber",
                    "loan_number",
                    "Loan Number"
                ]);


            const loanTypeValue =
                getValue(record, [
                    "loanType",
                    "loan_type",
                    "Loan Type"
                ]);


            const loanAmountValue =
                getValue(record, [
                    "loanAmount",
                    "loan_amount",
                    "Loan Amount"
                ]);


            const loanDateValue =
                getValue(record, [
                    "loanDate",
                    "loan_date",
                    "Loan Date"
                ]);


            const repaymentDateValue =
                getValue(record, [
                    "repaymentDate",
                    "repayment_date",
                    "Repayment Date"
                ]);


            const maturityDateValue =
                getValue(record, [
                    "maturityDate",
                    "maturity_date",
                    "Maturity Date"
                ]);


            const statusValue =
                getValue(record, [
                    "status",
                    "Status"
                ]);


            row.innerHTML = `

                <td>
                    ${escapeHtml(memberNameValue)}
                </td>

                <td>
                    ${escapeHtml(memberNumberValue)}
                </td>

                <td>
                    ${escapeHtml(loanNumberValue)}
                </td>

                <td>
                    ${escapeHtml(loanTypeValue)}
                </td>

                <td>
                    ${formatCurrency(loanAmountValue)}
                </td>

                <td>
                    ${formatDate(loanDateValue)}
                </td>

                <td>
                    ${formatDate(repaymentDateValue)}
                </td>

                <td>
                    ${formatDate(maturityDateValue)}
                </td>

                <td>
                    ${createStatusBadge(statusValue)}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-primary btn-sm recover-record"
                    >
                        Recover
                    </button>

                </td>

            `;


            // ------------------------------------------------
            // RECOVER BUTTON
            // ------------------------------------------------

            const recoverButton =
                row.querySelector(
                    ".recover-record"
                );


            recoverButton.addEventListener(
                "click",
                async function () {

                    await recoverRecord(record);

                }
            );


            resultsBody.appendChild(row);

        });

    }


    // --------------------------------------------------------
    // RECOVER RECORD
    // --------------------------------------------------------

    async function recoverRecord(record) {

        const id =
            getValue(record, [
                "id",
                "recordId",
                "record_id"
            ]);


        if (
            id === "—" ||
            id === "" ||
            id === null
        ) {

            alert(
                "This record does not have a valid ID."
            );

            return;

        }


        try {

            // ------------------------------------------------
            // SHOW LOADING
            // ------------------------------------------------

            if (resultMessage) {

                resultMessage.textContent =
                    "Recovering financial dates...";

            }


            // ------------------------------------------------
            // CALL RECOVERY API
            // ------------------------------------------------

            const response =
                await apiFetch(
                    `${API_URL}/${encodeURIComponent(id)}/dates`
                );


            const result =
                await response.json();


            // ------------------------------------------------
            // AUTHENTICATION ERROR
            // ------------------------------------------------

            if (response.status === 401) {

                alert(
                    "Your login session has expired. Please login again."
                );

                return;

            }


            // ------------------------------------------------
            // API ERROR
            // ------------------------------------------------

            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.message ||
                    "Unable to recover this record."
                );

                return;

            }


            // ------------------------------------------------
            // USE RECOVERED DATA
            // ------------------------------------------------

            const recoveredData =
                result.data || record;


            selectedRecord =
                recoveredData;


            // ------------------------------------------------
            // SHOW RECOVERED RECORD
            // ------------------------------------------------

            showRecoveredRecord(
                recoveredData
            );


            if (resultMessage) {

                resultMessage.textContent =
                    "Financial dates recovered successfully.";

            }


        } catch (error) {

            console.error(
                "Recovery error:",
                error
            );


            alert(
                error.message ||
                "Unable to recover the financial record."
            );

        }

    }


    // --------------------------------------------------------
    // SHOW RECOVERED RECORD
    // --------------------------------------------------------

    function showRecoveredRecord(record) {

        selectedRecord =
            record;


        // ----------------------------------------------------
        // MEMBER INFORMATION
        // ----------------------------------------------------

        setText(
            "recoveredMemberName",
            getValue(record, [
                "memberName",
                "member_name",
                "Member Name"
            ])
        );


        setText(
            "recoveredMemberNumber",
            getValue(record, [
                "memberNumber",
                "member_number",
                "Member Number"
            ])
        );


        // ----------------------------------------------------
        // LOAN INFORMATION
        // ----------------------------------------------------

        setText(
            "recoveredLoanNumber",
            getValue(record, [
                "loanNumber",
                "loan_number",
                "Loan Number"
            ])
        );


        setText(
            "recoveredLoanType",
            getValue(record, [
                "loanType",
                "loan_type",
                "Loan Type"
            ])
        );


        setText(
            "recoveredLoanAmount",
            formatCurrency(
                getValue(record, [
                    "loanAmount",
                    "loan_amount",
                    "Loan Amount"
                ])
            )
        );


        // ----------------------------------------------------
        // DATES
        // ----------------------------------------------------

        setText(
            "recoveredLoanDate",
            formatDate(
                getValue(record, [
                    "loanDate",
                    "loan_date",
                    "Loan Date"
                ])
            )
        );


        setText(
            "recoveredRepaymentDate",
            formatDate(
                getValue(record, [
                    "repaymentDate",
                    "repayment_date",
                    "Repayment Date"
                ])
            )
        );


        setText(
            "recoveredMaturityDate",
            formatDate(
                getValue(record, [
                    "maturityDate",
                    "maturity_date",
                    "Maturity Date"
                ])
            )
        );


        // ----------------------------------------------------
        // STATUS
        // ----------------------------------------------------

        setText(
            "recoveredStatus",
            getValue(record, [
                "status",
                "Status"
            ])
        );


        // ----------------------------------------------------
        // SOURCE FILE
        // ----------------------------------------------------

        setText(
            "recoveredSourceFile",
            getValue(record, [
                "sourceFile",
                "source_file",
                "fileName",
                "file_name",
                "Source Excel File"
            ])
        );


        // ----------------------------------------------------
        // SHOW PANEL
        // ----------------------------------------------------

        if (recoveredRecord) {

            recoveredRecord.style.display =
                "block";


            recoveredRecord.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }


    // --------------------------------------------------------
    // VIEW FULL DETAILS
    // --------------------------------------------------------

    if (viewDetailsButton) {

        viewDetailsButton.addEventListener(
            "click",
            function () {

                if (!selectedRecord) {

                    alert(
                        "Please select a record first."
                    );

                    return;

                }


                const id =
                    getValue(selectedRecord, [
                        "id",
                        "recordId",
                        "record_id"
                    ]);


                if (id === "—") {

                    alert(
                        "This record does not have a valid ID."
                    );

                    return;

                }


                window.location.href =
                    `records-details.html?id=${encodeURIComponent(id)}`;

            }
        );

    }


    // --------------------------------------------------------
    // VIEW SOURCE RECORD
    // --------------------------------------------------------

    if (viewSourceButton) {

        viewSourceButton.addEventListener(
            "click",
            function () {

                if (!selectedRecord) {

                    alert(
                        "Please select a record first."
                    );

                    return;

                }


                const sourceUrl =
                    getValue(
                        selectedRecord,
                        [
                            "sourceUrl",
                            "source_url",
                            "sourceRecordUrl",
                            "source_record_url"
                        ]
                    );


                if (
                    sourceUrl !== "—"
                ) {

                    window.open(
                        sourceUrl,
                        "_blank"
                    );

                    return;

                }


                alert(
                    "The original source record is not available."
                );

            }
        );

    }


    // --------------------------------------------------------
    // CLEAR SEARCH
    // --------------------------------------------------------

    function clearSearch() {

        if (form) {
            form.reset();
        }


        if (resultsBody) {
            resultsBody.innerHTML = "";
        }


        if (resultsContainer) {
            resultsContainer.style.display =
                "none";
        }


        if (emptyState) {
            emptyState.style.display =
                "block";
        }


        if (recoveredRecord) {
            recoveredRecord.style.display =
                "none";
        }


        selectedRecord = null;


        if (resultMessage) {

            resultMessage.textContent =
                "No search has been performed yet.";

        }

    }


    // --------------------------------------------------------
    // LOADING STATE
    // --------------------------------------------------------

    function setLoading(isLoading) {

        if (!searchButton) {
            return;
        }


        if (isLoading) {

            searchButton.disabled =
                true;

            searchButton.textContent =
                "Searching...";

        } else {

            searchButton.disabled =
                false;

            searchButton.textContent =
                "Search Records";

        }

    }


    // --------------------------------------------------------
    // MESSAGE
    // --------------------------------------------------------

    function showMessage(message) {

        if (resultMessage) {

            resultMessage.textContent =
                message;

        }


        if (resultsContainer) {

            resultsContainer.style.display =
                "none";

        }


        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        if (recoveredRecord) {

            recoveredRecord.style.display =
                "none";

        }

    }


    // --------------------------------------------------------
    // SET TEXT
    // --------------------------------------------------------

    function setText(
        elementId,
        value
    ) {

        const element =
            document.getElementById(
                elementId
            );


        if (!element) {
            return;
        }


        element.textContent =
            value || "—";

    }


    // --------------------------------------------------------
    // GET VALUE
    // --------------------------------------------------------

    function getValue(
        object,
        keys
    ) {

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


    // --------------------------------------------------------
    // FORMAT CURRENCY
    // --------------------------------------------------------

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


        if (
            Number.isNaN(number)
        ) {

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


    // --------------------------------------------------------
    // FORMAT DATE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // STATUS BADGE
    // --------------------------------------------------------

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
            <span class="status-badge status-${escapeHtml(className)}">
                ${escapeHtml(cleanStatus)}
            </span>
        `;

    }


    // --------------------------------------------------------
    // ESCAPE HTML
    // --------------------------------------------------------

    function escapeHtml(value) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            String(value);


        return div.innerHTML;

    }

});

