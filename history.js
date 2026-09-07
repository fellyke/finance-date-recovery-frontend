
// ============================================================
// FINANCE DATE RECOVERY TOOL
// HISTORY.JS
// RECOVERY HISTORY MANAGEMENT
// ============================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // ========================================================
    // API
    // ========================================================

    const API_URL =
        "https://finance-date-recovery-backend.onrender.com/api/history";


    // ========================================================
    // HTML ELEMENTS
    // ========================================================

    const historySearch =
        document.getElementById("historySearch");

    const historyTable =
        document.getElementById("historyTable");

    const historyBody =
        document.getElementById("historyBody");

    const searchBox =
        document.querySelector(".search-box");

    const searchButton =
        searchBox
            ? searchBox.querySelector("button")
            : null;


    // ========================================================
    // DATA
    // ========================================================

    let historyRecords = [];


    // ========================================================
    // START
    // ========================================================

    initializeHistory();


    // ========================================================
    // INITIALIZE
    // ========================================================

    async function initializeHistory() {

        console.log(
            "Recovery History page initialized."
        );

        await loadHistory();

        setupSearch();

    }


    // ========================================================
    // GET AUTHENTICATION TOKEN
    // ========================================================
    // Uses the same authentication system as script.js
    // Token key:
    //
    // financeRecovery_token
    //
    // ========================================================

    function getToken() {

        // ----------------------------------------------------
        // PRIMARY AUTHENTICATION SYSTEM
        // ----------------------------------------------------

        if (
            window.FinanceRecovery &&
            typeof window.FinanceRecovery.getAuthToken ===
                "function"
        ) {

            const token =
                window.FinanceRecovery.getAuthToken();

            if (token) {

                return token;

            }

        }


        // ----------------------------------------------------
        // DIRECT LOCAL STORAGE FALLBACK
        // ----------------------------------------------------

        const localToken =
            localStorage.getItem(
                "financeRecovery_token"
            );


        if (localToken) {

            return localToken;

        }


        // ----------------------------------------------------
        // SESSION STORAGE FALLBACK
        // ----------------------------------------------------

        const sessionToken =
            sessionStorage.getItem(
                "financeRecovery_token"
            );


        if (sessionToken) {

            return sessionToken;

        }


        // ----------------------------------------------------
        // OLD TOKEN KEYS
        // ----------------------------------------------------
        // Kept as a compatibility fallback.
        // ----------------------------------------------------

        const oldKeys = [
            "token",
            "authToken",
            "jwtToken",
            "accessToken"
        ];


        for (const key of oldKeys) {

            const token =
                localStorage.getItem(key);

            if (token) {

                return token;

            }

        }


        for (const key of oldKeys) {

            const token =
                sessionStorage.getItem(key);

            if (token) {

                return token;

            }

        }


        return null;

    }


    // ========================================================
    // LOAD HISTORY
    // ========================================================

    async function loadHistory() {

        try {

            showLoading();


            // ------------------------------------------------
            // GET TOKEN
            // ------------------------------------------------

            const token =
                getToken();


            if (!token) {

                throw new Error(
                    "Authentication token not found. Please login again."
                );

            }


            console.log(
                "Loading recovery history..."
            );


            // ------------------------------------------------
            // API REQUEST
            // ------------------------------------------------

            const response =
                await fetch(
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


            // ------------------------------------------------
            // READ RESPONSE
            // ------------------------------------------------

            let result;

            try {

                result =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "The Recovery History API returned an invalid response."
                );

            }


            console.log(
                "Recovery History API:",
                result
            );


            // ------------------------------------------------
            // AUTHENTICATION ERROR
            // ------------------------------------------------

            if (
                response.status === 401
            ) {

                // Remove invalid token from the shared system

                if (
                    window.FinanceRecovery &&
                    typeof window.FinanceRecovery
                        .removeAuthToken ===
                        "function"
                ) {

                    window.FinanceRecovery
                        .removeAuthToken();

                } else {

                    localStorage.removeItem(
                        "financeRecovery_token"
                    );

                    sessionStorage.removeItem(
                        "financeRecovery_token"
                    );

                }


                throw new Error(
                    "Your login session has expired. Please login again."
                );

            }


            // ------------------------------------------------
            // API ERROR
            // ------------------------------------------------

            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to load recovery history."
                );

            }


            // ------------------------------------------------
            // STORE RECORDS
            // ------------------------------------------------

            if (
                Array.isArray(result.data)
            ) {

                historyRecords =
                    result.data;

            } else {

                historyRecords = [];

            }


            console.log(
                "History records:",
                historyRecords
            );


            // ------------------------------------------------
            // DISPLAY
            // ------------------------------------------------

            displayHistory(
                historyRecords
            );


        } catch (error) {

            console.error(
                "Recovery History Error:",
                error
            );


            historyRecords = [];


            showEmptyState(
                error.message ||
                "Unable to connect to the Recovery History API."
            );

        }

    }


    // ========================================================
    // DISPLAY HISTORY
    // ========================================================

    function displayHistory(records) {

        if (!historyBody) {

            console.error(
                "historyBody was not found."
            );

            return;

        }


        // ----------------------------------------------------
        // NO RECORDS
        // ----------------------------------------------------

        if (
            !records ||
            records.length === 0
        ) {

            showEmptyState(
                "No recovery history."
            );

            return;

        }


        // ----------------------------------------------------
        // CLEAR TABLE
        // ----------------------------------------------------

        historyBody.innerHTML = "";


        // ----------------------------------------------------
        // SHOW TABLE
        // ----------------------------------------------------

        if (historyTable) {

            historyTable.style.display =
                "block";

        }


        // ----------------------------------------------------
        // HIDE EMPTY STATE
        // ----------------------------------------------------

        const emptyState =
            document.querySelector(
                ".empty-state"
            );


        if (emptyState) {

            emptyState.style.display =
                "none";

        }


        // ----------------------------------------------------
        // CREATE ROWS
        // ----------------------------------------------------

        records.forEach(function (record) {

            const row =
                document.createElement("tr");


            // =================================================
            // USER
            // =================================================

            addCell(
                row,
                record.username ||
                record.user_name ||
                "—"
            );


            // =================================================
            // SEARCH QUERY
            // =================================================

            addCell(
                row,
                record.search_term ||
                "—"
            );


            // =================================================
            // MEMBER / RECORD
            // =================================================

            let memberRecord =
                "—";


            if (
                record.member_number
            ) {

                memberRecord =
                    record.member_number;

            } else if (
                record.member_name
            ) {

                memberRecord =
                    record.member_name;

            } else if (
                record.loan_number
            ) {

                memberRecord =
                    record.loan_number;

            }


            addCell(
                row,
                memberRecord
            );


            // =================================================
            // DATE RECOVERED
            // =================================================

            addCell(
                row,
                formatDate(
                    record.recovery_date
                )
            );


            // =================================================
            // TIME
            // =================================================

            addCell(
                row,
                formatTime(
                    record.recovery_time
                )
            );


            // =================================================
            // RESULT
            // =================================================

            const resultCell =
                document.createElement("td");


            const resultBadge =
                document.createElement("span");


            const result =
                record.result ||
                "—";


            resultBadge.textContent =
                result;


            resultBadge.className =
                getResultClass(
                    result
                );


            resultCell.appendChild(
                resultBadge
            );


            row.appendChild(
                resultCell
            );


            // =================================================
            // TRANSACTION REFERENCE
            // =================================================

            addCell(
                row,
                record.transaction_reference ||
                record.transactionReference ||
                "—"
            );


            // =================================================
            // ADD ROW
            // =================================================

            historyBody.appendChild(
                row
            );

        });

    }


    // ========================================================
    // ADD CELL
    // ========================================================

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


        row.appendChild(
            cell
        );

    }


    // ========================================================
    // FORMAT DATE
    // ========================================================

    function formatDate(value) {

        if (!value) {

            return "—";

        }


        // ----------------------------------------------------
        // API RETURNS YYYY-MM-DD
        // ----------------------------------------------------

        if (
            typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {

            const parts =
                value.split("-");


            return (
                parts[2] +
                "/" +
                parts[1] +
                "/" +
                parts[0]
            );

        }


        // ----------------------------------------------------
        // TRY DATE OBJECT
        // ----------------------------------------------------

        const date =
            new Date(value);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    // ========================================================
    // FORMAT TIME
    // ========================================================

    function formatTime(value) {

        if (!value) {

            return "—";

        }


        // ----------------------------------------------------
        // API RETURNS HH:MM:SS
        // ----------------------------------------------------

        if (
            typeof value === "string" &&
            /^\d{1,2}:\d{2}:\d{2}$/.test(value)
        ) {

            return value;

        }


        // ----------------------------------------------------
        // TRY DATE OBJECT
        // ----------------------------------------------------

        const date =
            new Date(value);


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleTimeString(
            "en-KE",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    }


    // ========================================================
    // RESULT BADGE
    // ========================================================

    function getResultClass(result) {

        const value =
            String(result)
                .trim()
                .toLowerCase();


        if (
            value === "recovered" ||
            value === "found" ||
            value === "success"
        ) {

            return "status-badge status-success";

        }


        if (
            value === "not found" ||
            value === "failed" ||
            value === "error"
        ) {

            return "status-badge status-danger";

        }


        if (
            value === "pending"
        ) {

            return "status-badge status-warning";

        }


        return "status-badge";

    }


    // ========================================================
    // SEARCH SETUP
    // ========================================================

    function setupSearch() {

        if (!historySearch) {

            return;

        }


        // ----------------------------------------------------
        // LIVE SEARCH
        // ----------------------------------------------------

        historySearch.addEventListener(
            "input",
            function () {

                performSearch(
                    historySearch.value
                );

            }
        );


        // ----------------------------------------------------
        // SEARCH BUTTON
        // ----------------------------------------------------

        if (searchButton) {

            searchButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    performSearch(
                        historySearch.value
                    );

                }
            );

        }


        // ----------------------------------------------------
        // ENTER KEY
        // ----------------------------------------------------

        historySearch.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    performSearch(
                        historySearch.value
                    );

                }

            }
        );

    }


    // ========================================================
    // PERFORM SEARCH
    // ========================================================

    function performSearch(value) {

        const search =
            String(value || "")
                .trim()
                .toLowerCase();


        // ----------------------------------------------------
        // EMPTY SEARCH
        // ----------------------------------------------------

        if (!search) {

            displayHistory(
                historyRecords
            );

            return;

        }


        // ----------------------------------------------------
        // FILTER RECORDS
        // ----------------------------------------------------

        const filtered =
            historyRecords.filter(
                function (record) {

                    const searchableText = [

                        record.username,

                        record.user_name,

                        record.search_term,

                        record.member_number,

                        record.member_name,

                        record.loan_number,

                        record.transaction_reference,

                        record.transactionReference,

                        record.result,

                        record.recovery_date,

                        record.recovery_time

                    ]
                        .filter(
                            value =>
                                value !== null &&
                                value !== undefined
                        )
                        .join(" ")
                        .toLowerCase();


                    return searchableText.includes(
                        search
                    );

                }
            );


        // ----------------------------------------------------
        // NO SEARCH RESULTS
        // ----------------------------------------------------

        if (
            filtered.length === 0
        ) {

            showEmptyState(
                "No recovery history matches your search."
            );

            return;

        }


        // ----------------------------------------------------
        // DISPLAY RESULTS
        // ----------------------------------------------------

        displayHistory(
            filtered
        );

    }


    // ========================================================
    // EMPTY STATE
    // ========================================================

    function showEmptyState(
        message = "No recovery history."
    ) {

        if (historyTable) {

            historyTable.style.display =
                "none";

        }


        if (historyBody) {

            historyBody.innerHTML =
                "";

        }


        const emptyState =
            document.querySelector(
                ".empty-state"
            );


        if (emptyState) {

            emptyState.style.display =
                "block";


            const heading =
                emptyState.querySelector(
                    "h3"
                );


            const paragraph =
                emptyState.querySelector(
                    "p"
                );


            if (heading) {

                heading.textContent =
                    "Recovery History";

            }


            if (paragraph) {

                paragraph.textContent =
                    message;

            }

        }

    }


    // ========================================================
    // LOADING
    // ========================================================

    function showLoading() {

        if (historyTable) {

            historyTable.style.display =
                "none";

        }


        const emptyState =
            document.querySelector(
                ".empty-state"
            );


        if (emptyState) {

            emptyState.style.display =
                "block";


            const heading =
                emptyState.querySelector(
                    "h3"
                );


            const paragraph =
                emptyState.querySelector(
                    "p"
                );


            if (heading) {

                heading.textContent =
                    "Loading Recovery History...";

            }


            if (paragraph) {

                paragraph.textContent =
                    "Connecting to the Recovery History API...";

            }

        }

    }


    // ========================================================
    // PUBLIC HISTORY MANAGER
    // ========================================================

    window.historyManager = {

        load: loadHistory,

        refresh: loadHistory,

        search: performSearch,

        getRecords: function () {

            return historyRecords;

        }

    };

});
