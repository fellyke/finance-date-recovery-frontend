
"use strict";

// ============================================================
// FINANCE DATE RECOVERY TOOL
// REPAYMENTS.JS
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    // ========================================================
    // API CONFIGURATION
    // ========================================================

    const API_URL =
        "https://finance-date-recovery-backend.onrender.com/api/repayments";

    const PAGE_SIZE = 50;

    let currentPage = 1;
    let totalPages = 1;
    let totalRecords = 0;
    let isLoading = false;


    // ========================================================
    // DOM ELEMENTS
    // ========================================================

    const searchForm =
        document.getElementById("repaymentSearchForm");

    const clearSearchBtn =
        document.getElementById("clearSearchBtn");

    const refreshBtn =
        document.getElementById("refreshRepaymentsBtn");

    const recoverDateBtn =
        document.getElementById("recoverDateBtn");

    const exportBtn =
        document.getElementById("exportRepaymentsBtn");

    const tableBody =
        document.getElementById("repaymentsTableBody");

    const previousPageBtn =
        document.getElementById("previousPageBtn");

    const nextPageBtn =
        document.getElementById("nextPageBtn");

    const currentPageElement =
        document.getElementById("currentPage");

    const paginationStart =
        document.getElementById("paginationStart");

    const paginationEnd =
        document.getElementById("paginationEnd");

    const paginationTotal =
        document.getElementById("paginationTotal");

    const resultSummary =
        document.getElementById("resultSummary");


    // ========================================================
    // SEARCH ELEMENTS
    // ========================================================

    const customerInput =
        document.getElementById("customer");

    const customerSearchInput =
        document.getElementById("customerSearch");

    const loanNumberInput =
        document.getElementById("loanNumber");

    const referenceNumberInput =
        document.getElementById("referenceNumber");

    const receiptNumberInput =
        document.getElementById("receiptNumber");

    const amountInput =
        document.getElementById("amount");

    const paymentMethodInput =
        document.getElementById("paymentMethod");

    const paymentMethodSearchInput =
        document.getElementById("paymentMethodSearch");

    const dateFromInput =
        document.getElementById("dateFrom");

    const dateToInput =
        document.getElementById("dateTo");


    // ========================================================
    // STATISTICS
    // ========================================================

    const totalRepaymentsElement =
        document.getElementById("totalRepayments");

    const totalRepaymentAmountElement =
        document.getElementById("totalRepaymentAmount");

    const unverifiedRepaymentsElement =
        document.getElementById("unverifiedRepayments");

    const verifiedRepaymentsElement =
        document.getElementById("verifiedRepayments");


    // ========================================================
    // AUTHENTICATION
    // ========================================================

    function getToken() {

        const tokenKeys = [
            "financeRecovery_token",
            "token",
            "authToken",
            "accessToken",
            "jwt"
        ];

        for (const key of tokenKeys) {

            const localToken =
                localStorage.getItem(key);

            if (localToken) {
                return localToken;
            }

            const sessionToken =
                sessionStorage.getItem(key);

            if (sessionToken) {
                return sessionToken;
            }
        }

        return null;
    }


    // ========================================================
    // CLEAR TOKENS
    // ========================================================

    function clearTokens() {

        const tokenKeys = [
            "financeRecovery_token",
            "token",
            "authToken",
            "accessToken",
            "jwt"
        ];

        tokenKeys.forEach(function (key) {

            localStorage.removeItem(key);
            sessionStorage.removeItem(key);

        });
    }


    // ========================================================
    // API REQUEST
    // ========================================================

    async function apiRequest(url, options = {}) {

        const token = getToken();

        console.log("Authentication token found:", !!token);

        if (!token) {

            showError(
                "You are not logged in. Please log in again."
            );

            setTimeout(function () {

                window.location.href = "index.html";

            }, 1200);

            throw new Error(
                "No authentication token found."
            );
        }


        const headers = {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        };


        // Preserve any additional headers.
        if (options.headers) {

            Object.assign(
                headers,
                options.headers
            );
        }


        // Add JSON content type only when a body exists
        // and the body is not FormData.

        if (
            options.body &&
            !(options.body instanceof FormData)
        ) {

            headers["Content-Type"] =
                "application/json";
        }


        const response =
            await fetch(
                url,
                {
                    ...options,
                    headers
                }
            );


        console.log(
            "API response status:",
            response.status
        );


        // ====================================================
        // AUTHORIZATION ERROR
        // ====================================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            clearTokens();

            showError(
                "Your session has expired. Please log in again."
            );

            setTimeout(function () {

                window.location.href = "index.html";

            }, 1200);

            throw new Error(
                "Your session has expired."
            );
        }


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        // ====================================================
        // JSON RESPONSE
        // ====================================================

        if (
            contentType.includes(
                "application/json"
            )
        ) {

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Request failed."
                );
            }


            return data;
        }


        // ====================================================
        // NON JSON RESPONSE
        // ====================================================

        const text =
            await response.text();


        if (!response.ok) {

            throw new Error(
                text ||
                `Request failed with status ${response.status}`
            );
        }


        return text;
    }


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

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
    // CURRENCY
    // ========================================================

    function formatCurrency(value) {

        const amount =
            Number(value);

        if (Number.isNaN(amount)) {

            return "KES 0.00";
        }


        return new Intl.NumberFormat(
            "en-KE",
            {
                style: "currency",
                currency: "KES",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(amount);
    }


    // ========================================================
    // DATE
    // ========================================================

    function formatDate(value) {

        if (!value) {
            return "—";
        }


        const stringValue =
            String(value);


        // PostgreSQL DATE
        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                stringValue
            )
        ) {

            const parts =
                stringValue.split("-");

            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return escapeHTML(value);
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
    // DATE INPUT VALUE
    // ========================================================

    function getDateInputValue(value) {

        if (!value) {
            return "";
        }


        const stringValue =
            String(value);


        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                stringValue
            )
        ) {

            return stringValue;
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";
        }


        return [
            date.getFullYear(),
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            ),
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            )
        ].join("-");
    }


    // ========================================================
    // STATUS
    // ========================================================

    function normalizeStatus(status) {

        if (!status) {
            return "Unverified";
        }


        const value =
            String(status)
                .trim()
                .toLowerCase();


        if (
            value === "verified" ||
            value === "approved" ||
            value === "confirmed"
        ) {

            return "Verified";
        }


        return "Unverified";
    }


    // ========================================================
    // CUSTOMER SEARCH
    // ========================================================

    function getCustomerValue() {

        if (
            customerSearchInput &&
            customerSearchInput.value.trim()
        ) {

            return customerSearchInput
                .value
                .trim();
        }


        if (
            customerInput &&
            customerInput.value.trim()
        ) {

            return customerInput
                .value
                .trim();
        }


        return "";
    }


    // ========================================================
    // PAYMENT METHOD SEARCH
    // ========================================================

    function getPaymentMethodValue() {

        if (
            paymentMethodSearchInput &&
            paymentMethodSearchInput.value.trim()
        ) {

            return paymentMethodSearchInput
                .value
                .trim();
        }


        if (
            paymentMethodInput &&
            paymentMethodInput.value.trim()
        ) {

            return paymentMethodInput
                .value
                .trim();
        }


        return "";
    }


    // ========================================================
    // SEARCH FILTERS
    // ========================================================

    function getSearchFilters() {

        return {

            customer:
                getCustomerValue(),

            loanNumber:
                loanNumberInput
                    ?.value
                    .trim() || "",

            referenceNumber:
                referenceNumberInput
                    ?.value
                    .trim() || "",

            receiptNumber:
                receiptNumberInput
                    ?.value
                    .trim() || "",

            amount:
                amountInput
                    ?.value
                    .trim() || "",

            paymentMethod:
                getPaymentMethodValue(),

            dateFrom:
                dateFromInput
                    ?.value || "",

            dateTo:
                dateToInput
                    ?.value || ""
        };
    }


    // ========================================================
    // BUILD QUERY STRING
    // ========================================================

    function buildQueryString() {

        const filters =
            getSearchFilters();


        const params =
            new URLSearchParams();


        params.set(
            "page",
            currentPage
        );


        params.set(
            "pageSize",
            PAGE_SIZE
        );


        Object.entries(filters)
            .forEach(
                function ([key, value]) {

                    if (
                        value !== "" &&
                        value !== null &&
                        value !== undefined
                    ) {

                        params.set(
                            key,
                            value
                        );
                    }
                }
            );


        return params.toString();
    }


    // ========================================================
    // LOADING STATE
    // ========================================================

    function showLoading() {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    class="loading-state"
                >

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <div>
                        Loading repayment records...
                    </div>

                </td>

            </tr>

        `;
    }


    // ========================================================
    // ERROR STATE
    // ========================================================

    function showError(message) {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    class="loading-state"
                >

                    <i class="fa-solid fa-circle-exclamation"></i>

                    <div>
                        ${escapeHTML(message)}
                    </div>

                    <button
                        type="button"
                        class="btn btn-secondary"
                        id="retryRepaymentsBtn"
                        style="margin-top:15px;"
                    >

                        <i class="fa-solid fa-rotate-right"></i>

                        Retry

                    </button>

                </td>

            </tr>

        `;


        const retryBtn =
            document.getElementById(
                "retryRepaymentsBtn"
            );


        if (retryBtn) {

            retryBtn.addEventListener(
                "click",
                function () {

                    loadRepayments();

                }
            );
        }
    }


    // ========================================================
    // EMPTY STATE
    // ========================================================

    function showEmpty() {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="11"
                    class="empty-state"
                >

                    <i class="fa-solid fa-receipt"></i>

                    <div>
                        No repayment records found.
                    </div>

                </td>

            </tr>

        `;
    }


    // ========================================================
    // RENDER REPAYMENTS
    // ========================================================

    function renderRepayments(records) {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        if (
            !Array.isArray(records) ||
            records.length === 0
        ) {

            showEmpty();

            return;
        }


        records.forEach(
            function (repayment, index) {

                const absoluteNumber =
                    (
                        (currentPage - 1) *
                        PAGE_SIZE
                    ) +
                    index +
                    1;


                const status =
                    normalizeStatus(
                        repayment.status
                    );


                const statusClass =
                    status === "Verified"
                        ? "verified"
                        : "unverified";


                const row =
                    document.createElement("tr");


                row.dataset.id =
                    repayment.id;


                row.innerHTML = `

                    <td>
                        ${absoluteNumber}
                    </td>

                    <td>
                        ${escapeHTML(
                            repayment.customer || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            repayment.loan_number || "—"
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            repayment.repayment_date
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatCurrency(
                                repayment.amount
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            repayment.payment_method || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            repayment.reference_number || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            repayment.receipt_number || "—"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            repayment.balance
                        )}
                    </td>

                    <td>

                        <span
                            class="status ${statusClass}"
                        >

                            ${status}

                        </span>

                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-btn view-btn"
                                data-action="view"
                                data-id="${escapeHTML(
                                    repayment.id
                                )}"
                                title="View repayment"
                            >

                                <i class="fa-solid fa-eye"></i>

                            </button>


                            <button
                                type="button"
                                class="action-btn edit-btn"
                                data-action="edit"
                                data-id="${escapeHTML(
                                    repayment.id
                                )}"
                                title="Edit repayment"
                            >

                                <i class="fa-solid fa-pen"></i>

                            </button>


                            <button
                                type="button"
                                class="action-btn delete-btn"
                                data-action="delete"
                                data-id="${escapeHTML(
                                    repayment.id
                                )}"
                                title="Delete repayment"
                            >

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                `;


                tableBody.appendChild(row);

            }
        );
    }


    // ========================================================
    // PAGINATION
    // ========================================================

    function updatePagination() {

        const start =
            totalRecords === 0
                ? 0
                : (
                    (currentPage - 1) *
                    PAGE_SIZE
                ) + 1;


        const end =
            totalRecords === 0
                ? 0
                : Math.min(
                    currentPage *
                    PAGE_SIZE,
                    totalRecords
                );


        if (paginationStart) {

            paginationStart.textContent =
                start;
        }


        if (paginationEnd) {

            paginationEnd.textContent =
                end;
        }


        if (paginationTotal) {

            paginationTotal.textContent =
                totalRecords;
        }


        if (currentPageElement) {

            currentPageElement.textContent =
                currentPage;
        }


        if (previousPageBtn) {

            previousPageBtn.disabled =
                currentPage <= 1 ||
                isLoading;
        }


        if (nextPageBtn) {

            nextPageBtn.disabled =
                currentPage >= totalPages ||
                isLoading;
        }
    }


    // ========================================================
    // RESULT SUMMARY
    // ========================================================

    function updateResultSummary() {

        if (!resultSummary) {
            return;
        }


        if (totalRecords === 0) {

            resultSummary.textContent =
                "No repayment records found.";

            return;
        }


        const start =
            (
                (currentPage - 1) *
                PAGE_SIZE
            ) + 1;


        const end =
            Math.min(
                currentPage *
                PAGE_SIZE,
                totalRecords
            );


        resultSummary.textContent =
            `Showing ${start}–${end} of ${totalRecords} repayment records`;
    }


    // ========================================================
    // STATISTICS
    // ========================================================

    function updateStatistics(
        records,
        serverSummary
    ) {

        let totalAmount = 0;
        let verified = 0;
        let unverified = 0;


        if (Array.isArray(records)) {

            records.forEach(
                function (record) {

                    totalAmount +=
                        Number(
                            record.amount
                        ) || 0;


                    if (
                        normalizeStatus(
                            record.status
                        ) === "Verified"
                    ) {

                        verified++;

                    } else {

                        unverified++;

                    }

                }
            );
        }


        // Backend summary takes priority.

        if (serverSummary) {

            if (
                serverSummary.totalAmount !==
                undefined
            ) {

                totalAmount =
                    Number(
                        serverSummary.totalAmount
                    ) || 0;
            }


            if (
                serverSummary.verified !==
                undefined
            ) {

                verified =
                    Number(
                        serverSummary.verified
                    ) || 0;
            }


            if (
                serverSummary.unverified !==
                undefined
            ) {

                unverified =
                    Number(
                        serverSummary.unverified
                    ) || 0;
            }
        }


        if (totalRepaymentsElement) {

            totalRepaymentsElement.textContent =
                totalRecords;
        }


        if (totalRepaymentAmountElement) {

            totalRepaymentAmountElement.textContent =
                formatCurrency(
                    totalAmount
                );
        }


        if (verifiedRepaymentsElement) {

            verifiedRepaymentsElement.textContent =
                verified;
        }


        if (unverifiedRepaymentsElement) {

            unverifiedRepaymentsElement.textContent =
                unverified;
        }
    }


    // ========================================================
    // LOAD REPAYMENTS
    // ========================================================

    async function loadRepayments() {

        if (isLoading) {
            return;
        }


        isLoading = true;


        showLoading();

        updatePagination();


        try {

            const queryString =
                buildQueryString();


            const requestURL =
                `${API_URL}?${queryString}`;


            console.log(
                "Loading repayments:",
                requestURL
            );


            const data =
                await apiRequest(
                    requestURL
                );


            console.log(
                "Repayment API response:",
                data
            );


            if (
                !data ||
                !data.success
            ) {

                throw new Error(
                    data?.message ||
                    "Failed to load repayment records."
                );
            }


            const records =
                Array.isArray(data.data)
                    ? data.data
                    : [];


            // =================================================
            // PAGINATION
            // =================================================

            if (data.pagination) {

                totalRecords =
                    Number(
                        data.pagination.total
                    ) || 0;


                totalPages =
                    Number(
                        data.pagination.totalPages
                    ) || 1;

            } else {

                totalRecords =
                    Number(
                        data.count
                    ) ||
                    records.length;


                totalPages = 1;
            }


            // =================================================
            // RENDER
            // =================================================

            renderRepayments(
                records
            );


            updatePagination();


            updateResultSummary();


            updateStatistics(
                records,
                data.summary || null
            );

        } catch (error) {

            console.error(
                "Failed to load repayments:",
                error
            );


            totalRecords = 0;
            totalPages = 1;


            updatePagination();


            updateStatistics(
                [],
                null
            );


            showError(
                error.message ||
                "Unable to load repayment records."
            );


            if (resultSummary) {

                resultSummary.textContent =
                    "Failed to load repayment records.";
            }

        } finally {

            isLoading = false;

            updatePagination();
        }
    }


    // ========================================================
    // VIEW REPAYMENT
    // ========================================================

    async function viewRepayment(id) {

        try {

            const data =
                await apiRequest(
                    `${API_URL}/${id}`
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load repayment."
                );
            }


            showViewModal(
                data.data
            );

        } catch (error) {

            console.error(
                "View repayment error:",
                error
            );


            alert(
                error.message ||
                "Unable to view repayment."
            );
        }
    }


    // ========================================================
    // VIEW MODAL
    // ========================================================

    function showViewModal(repayment) {

        closeModal();


        const modal =
            document.createElement("div");


        modal.id =
            "repaymentModal";


        modal.className =
            "repayment-modal-overlay";


        modal.innerHTML = `

            <div class="repayment-modal">

                <div class="repayment-modal-header">

                    <h3>

                        <i class="fa-solid fa-receipt"></i>

                        Repayment Details

                    </h3>


                    <button
                        type="button"
                        class="modal-close-btn"
                        id="closeRepaymentModal"
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>


                <div class="repayment-modal-body">

                    <div class="detail-grid">

                        <div class="detail-item">

                            <span>
                                Customer
                            </span>

                            <strong>
                                ${escapeHTML(
                                    repayment.customer || "—"
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Loan Number
                            </span>

                            <strong>
                                ${escapeHTML(
                                    repayment.loan_number || "—"
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Repayment Date
                            </span>

                            <strong>
                                ${formatDate(
                                    repayment.repayment_date
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Amount
                            </span>

                            <strong>
                                ${formatCurrency(
                                    repayment.amount
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Payment Method
                            </span>

                            <strong>
                                ${escapeHTML(
                                    repayment.payment_method || "—"
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Reference Number
                            </span>

                            <strong>
                                ${escapeHTML(
                                    repayment.reference_number || "—"
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Receipt Number
                            </span>

                            <strong>
                                ${escapeHTML(
                                    repayment.receipt_number || "—"
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Balance
                            </span>

                            <strong>
                                ${formatCurrency(
                                    repayment.balance
                                )}
                            </strong>

                        </div>


                        <div class="detail-item">

                            <span>
                                Status
                            </span>

                            <strong>
                                ${escapeHTML(
                                    normalizeStatus(
                                        repayment.status
                                    )
                                )}
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "closeRepaymentModal"
            )
            ?.addEventListener(
                "click",
                closeModal
            );


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeModal();
                }
            }
        );
    }


    // ========================================================
    // EDIT REPAYMENT
    // ========================================================

    async function editRepayment(id) {

        try {

            const data =
                await apiRequest(
                    `${API_URL}/${id}`
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to load repayment."
                );
            }


            showEditModal(
                data.data
            );

        } catch (error) {

            console.error(
                "Edit repayment error:",
                error
            );


            alert(
                error.message ||
                "Unable to edit repayment."
            );
        }
    }


    // ========================================================
    // EDIT MODAL
    // ========================================================

    function showEditModal(repayment) {

        closeModal();


        const modal =
            document.createElement("div");


        modal.id =
            "repaymentModal";


        modal.className =
            "repayment-modal-overlay";


        const normalizedStatus =
            normalizeStatus(
                repayment.status
            );


        modal.innerHTML = `

            <div class="repayment-modal">

                <div class="repayment-modal-header">

                    <h3>

                        <i class="fa-solid fa-pen"></i>

                        Edit Repayment

                    </h3>


                    <button
                        type="button"
                        class="modal-close-btn"
                        id="closeRepaymentModal"
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>


                <form
                    id="editRepaymentForm"
                    class="repayment-modal-body"
                >

                    <div class="edit-form-grid">


                        <div class="form-group">

                            <label>
                                Customer
                            </label>

                            <input
                                type="text"
                                id="editCustomer"
                                value="${escapeHTML(
                                    repayment.customer || ""
                                )}"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Loan Number
                            </label>

                            <input
                                type="text"
                                id="editLoanNumber"
                                value="${escapeHTML(
                                    repayment.loan_number || ""
                                )}"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Repayment Date
                            </label>

                            <input
                                type="date"
                                id="editRepaymentDate"
                                value="${getDateInputValue(
                                    repayment.repayment_date
                                )}"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Amount
                            </label>

                            <input
                                type="number"
                                id="editAmount"
                                step="0.01"
                                min="0"
                                value="${escapeHTML(
                                    repayment.amount ?? ""
                                )}"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Payment Method
                            </label>

                            <input
                                type="text"
                                id="editPaymentMethod"
                                value="${escapeHTML(
                                    repayment.payment_method || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Reference Number
                            </label>

                            <input
                                type="text"
                                id="editReferenceNumber"
                                value="${escapeHTML(
                                    repayment.reference_number || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Receipt Number
                            </label>

                            <input
                                type="text"
                                id="editReceiptNumber"
                                value="${escapeHTML(
                                    repayment.receipt_number || ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Balance
                            </label>

                            <input
                                type="number"
                                id="editBalance"
                                step="0.01"
                                min="0"
                                value="${escapeHTML(
                                    repayment.balance ?? ""
                                )}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                id="editStatus"
                            >

                                <option
                                    value="Verified"
                                    ${normalizedStatus === "Verified"
                                        ? "selected"
                                        : ""}
                                >
                                    Verified
                                </option>


                                <option
                                    value="Unverified"
                                    ${normalizedStatus === "Unverified"
                                        ? "selected"
                                        : ""}
                                >
                                    Unverified
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="modal-actions">

                        <button
                            type="button"
                            class="btn btn-secondary"
                            id="cancelEditBtn"
                        >

                            <i class="fa-solid fa-xmark"></i>

                            Cancel

                        </button>


                        <button
                            type="submit"
                            class="btn btn-primary"
                            id="saveRepaymentBtn"
                        >

                            <i class="fa-solid fa-floppy-disk"></i>

                            Save Changes

                        </button>

                    </div>

                </form>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "closeRepaymentModal"
            )
            ?.addEventListener(
                "click",
                closeModal
            );


        document
            .getElementById(
                "cancelEditBtn"
            )
            ?.addEventListener(
                "click",
                closeModal
            );


        document
            .getElementById(
                "editRepaymentForm"
            )
            ?.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    saveRepayment(
                        repayment.id
                    );
                }
            );


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeModal();
                }
            }
        );
    }


    // ========================================================
    // SAVE REPAYMENT
    // ========================================================

    async function saveRepayment(id) {

        const saveButton =
            document.getElementById(
                "saveRepaymentBtn"
            );


        const customerElement =
            document.getElementById(
                "editCustomer"
            );

        const loanNumberElement =
            document.getElementById(
                "editLoanNumber"
            );

        const repaymentDateElement =
            document.getElementById(
                "editRepaymentDate"
            );

        const amountElement =
            document.getElementById(
                "editAmount"
            );

        const paymentMethodElement =
            document.getElementById(
                "editPaymentMethod"
            );

        const referenceNumberElement =
            document.getElementById(
                "editReferenceNumber"
            );

        const receiptNumberElement =
            document.getElementById(
                "editReceiptNumber"
            );

        const balanceElement =
            document.getElementById(
                "editBalance"
            );

        const statusElement =
            document.getElementById(
                "editStatus"
            );


        const payload = {

            customer:
                customerElement?.value.trim() || "",

            loanNumber:
                loanNumberElement?.value.trim() || "",

            repaymentDate:
                repaymentDateElement?.value || "",

            amount:
                amountElement?.value || "",

            paymentMethod:
                paymentMethodElement?.value.trim() || "",

            referenceNumber:
                referenceNumberElement?.value.trim() || "",

            receiptNumber:
                receiptNumberElement?.value.trim() || "",

            balance:
                balanceElement?.value || "",

            status:
                statusElement?.value || "Unverified"
        };


        // ====================================================
        // VALIDATION
        // ====================================================

        if (!payload.customer) {

            alert(
                "Customer is required."
            );

            return;
        }


        if (!payload.loanNumber) {

            alert(
                "Loan Number is required."
            );

            return;
        }


        if (!payload.repaymentDate) {

            alert(
                "Repayment Date is required."
            );

            return;
        }


        if (
            payload.amount === "" ||
            Number(payload.amount) < 0 ||
            Number.isNaN(
                Number(payload.amount)
            )
        ) {

            alert(
                "Please enter a valid amount."
            );

            return;
        }


        try {

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.innerHTML = `

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Saving...

                `;
            }


            const data =
                await apiRequest(
                    `${API_URL}/${id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(
                            payload
                        )
                    }
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Failed to update repayment."
                );
            }


            closeModal();


            await loadRepayments();


            showMessage(
                "Repayment updated successfully.",
                "success"
            );

        } catch (error) {

            console.error(
                "Save repayment error:",
                error
            );


            alert(
                error.message ||
                "Unable to update repayment."
            );


            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.innerHTML = `

                    <i class="fa-solid fa-floppy-disk"></i>

                    Save Changes

                `;
            }
        }
    }


    // ========================================================
    // DELETE REPAYMENT
    // ========================================================

    async function deleteRepayment(id) {

        const confirmed =
            confirm(
                "Are you sure you want to delete this repayment record?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const data =
                await apiRequest(
                    `${API_URL}/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Failed to delete repayment."
                );
            }


            if (
                currentPage > 1 &&
                totalRecords - 1 <=
                (
                    (currentPage - 1) *
                    PAGE_SIZE
                )
            ) {

                currentPage--;
            }


            await loadRepayments();


            showMessage(
                "Repayment deleted successfully.",
                "success"
            );

        } catch (error) {

            console.error(
                "Delete repayment error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete repayment."
            );
        }
    }


    // ========================================================
    // CLOSE MODAL
    // ========================================================

    function closeModal() {

        const modal =
            document.getElementById(
                "repaymentModal"
            );


        if (modal) {
            modal.remove();
        }
    }


    // ========================================================
    // TOAST MESSAGE
    // ========================================================

    function showMessage(
        message,
        type = "success"
    ) {

        const existing =
            document.getElementById(
                "repaymentToast"
            );


        if (existing) {
            existing.remove();
        }


        const toast =
            document.createElement("div");


        toast.id =
            "repaymentToast";


        toast.className =
            `repayment-toast ${type}`;


        const icon =
            type === "success"
                ? "fa-circle-check"
                : "fa-circle-exclamation";


        toast.innerHTML = `

            <i class="fa-solid ${icon}"></i>

            <span>
                ${escapeHTML(message)}
            </span>

        `;


        document.body.appendChild(
            toast
        );


        setTimeout(
            function () {

                toast.classList.add(
                    "hide"
                );


                setTimeout(
                    function () {

                        toast.remove();

                    },
                    300
                );

            },
            3000
        );
    }


    // ========================================================
    // EXPORT CURRENT PAGE
    // ========================================================

    function exportRepayments() {

        if (!tableBody) {

            alert(
                "Repayment table was not found."
            );

            return;
        }


        const rows =
            tableBody.querySelectorAll(
                "tr"
            );


        if (!rows.length) {

            alert(
                "There are no repayment records to export."
            );

            return;
        }


        const data = [];


        data.push([
            "No.",
            "Customer",
            "Loan Number",
            "Repayment Date",
            "Amount",
            "Payment Method",
            "Reference Number",
            "Receipt Number",
            "Balance",
            "Status"
        ]);


        rows.forEach(
            function (row) {

                const cells =
                    row.querySelectorAll(
                        "td"
                    );


                // Only export actual data rows.

                if (
                    cells.length !== 11
                ) {
                    return;
                }


                data.push([

                    cells[0].innerText.trim(),

                    cells[1].innerText.trim(),

                    cells[2].innerText.trim(),

                    cells[3].innerText.trim(),

                    cells[4].innerText.trim(),

                    cells[5].innerText.trim(),

                    cells[6].innerText.trim(),

                    cells[7].innerText.trim(),

                    cells[8].innerText.trim(),

                    cells[9].innerText.trim()

                ]);
            }
        );


        if (data.length === 1) {

            alert(
                "There are no repayment records to export."
            );

            return;
        }


        const csv =
            data
                .map(
                    function (row) {

                        return row
                            .map(
                                function (value) {

                                    return `"${String(value)
                                        .replace(
                                            /"/g,
                                            '""'
                                        )}"`;
                                }
                            )
                            .join(",");
                    }
                )
                .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            `repayments-page-${currentPage}-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );
    }


    // ========================================================
    // SEARCH FORM
    // ========================================================

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const dateFrom =
                    dateFromInput?.value || "";


                const dateTo =
                    dateToInput?.value || "";


                if (
                    dateFrom &&
                    dateTo &&
                    dateFrom > dateTo
                ) {

                    alert(
                        "The From Date cannot be later than the To Date."
                    );

                    return;
                }


                currentPage = 1;


                loadRepayments();
            }
        );
    }


    // ========================================================
    // TOP SEARCH BUTTON
    // ========================================================

    const searchRepaymentsBtn =
        document.getElementById(
            "searchRepaymentsBtn"
        );


    if (searchRepaymentsBtn) {

        searchRepaymentsBtn.addEventListener(
            "click",
            function () {

                currentPage = 1;

                loadRepayments();

            }
        );
    }


    // ========================================================
    // CLEAR SEARCH
    // ========================================================

    if (clearSearchBtn) {

        clearSearchBtn.addEventListener(
            "click",
            function () {

                if (searchForm) {

                    searchForm.reset();
                }


                if (customerInput) {

                    customerInput.value =
                        "";
                }


                if (customerSearchInput) {

                    customerSearchInput.value =
                        "";
                }


                if (paymentMethodInput) {

                    paymentMethodInput.value =
                        "";
                }


                if (paymentMethodSearchInput) {

                    paymentMethodSearchInput.value =
                        "";
                }


                currentPage = 1;


                loadRepayments();
            }
        );
    }


    // ========================================================
    // REFRESH
    // ========================================================

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            function () {

                if (!isLoading) {

                    loadRepayments();
                }
            }
        );
    }


    // ========================================================
    // PREVIOUS PAGE
    // ========================================================

    if (previousPageBtn) {

        previousPageBtn.addEventListener(
            "click",
            function () {

                if (
                    currentPage <= 1 ||
                    isLoading
                ) {

                    return;
                }


                currentPage--;


                loadRepayments();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }


    // ========================================================
    // NEXT PAGE
    // ========================================================

    if (nextPageBtn) {

        nextPageBtn.addEventListener(
            "click",
            function () {

                if (
                    currentPage >= totalPages ||
                    isLoading
                ) {

                    return;
                }


                currentPage++;


                loadRepayments();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }


    // ========================================================
    // RECOVER DATE
    // ========================================================

    if (recoverDateBtn) {

        recoverDateBtn.addEventListener(
            "click",
            function () {

                window.location.href =
                    "date-recovery.html";
            }
        );
    }


    // ========================================================
    // EXPORT BUTTON
    // ========================================================

    if (exportBtn) {

        exportBtn.addEventListener(
            "click",
            exportRepayments
        );
    }


    // ========================================================
    // TABLE ACTIONS
    // ========================================================

    if (tableBody) {

        tableBody.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const id =
                    button.dataset.id;


                if (!id) {
                    return;
                }


                switch (action) {

                    case "view":

                        viewRepayment(id);

                        break;


                    case "edit":

                        editRepayment(id);

                        break;


                    case "delete":

                        deleteRepayment(id);

                        break;
                }
            }
        );
    }


    // ========================================================
    // ESCAPE KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeModal();
            }
        }
    );


    // ========================================================
    // DYNAMIC STYLES
    // ========================================================

    function addDynamicStyles() {

        if (
            document.getElementById(
                "repaymentDynamicStyles"
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "repaymentDynamicStyles";


        style.textContent = `

            .action-buttons {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .action-btn {
                width: 34px;
                height: 34px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .action-btn:hover {
                transform: translateY(-1px);
            }

            .view-btn {
                background: #eef4ff;
                color: #2563eb;
            }

            .edit-btn {
                background: #fff7ed;
                color: #ea580c;
            }

            .delete-btn {
                background: #fef2f2;
                color: #dc2626;
            }

            .repayment-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.55);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                z-index: 9999;
            }

            .repayment-modal {
                width: 100%;
                max-width: 850px;
                max-height: 90vh;
                overflow-y: auto;
                background: #fff;
                border-radius: 12px;
                box-shadow:
                    0 20px 50px rgba(0,0,0,0.2);
            }

            .repayment-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 18px 22px;
                border-bottom: 1px solid #e5e7eb;
            }

            .repayment-modal-header h3 {
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .modal-close-btn {
                border: none;
                background: transparent;
                width: 36px;
                height: 36px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 18px;
            }

            .modal-close-btn:hover {
                background: #f3f4f6;
            }

            .repayment-modal-body {
                padding: 22px;
            }

            .detail-grid {
                display: grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
                gap: 16px;
            }

            .detail-item {
                padding: 14px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
            }

            .detail-item span {
                display: block;
                font-size: 12px;
                color: #6b7280;
                margin-bottom: 5px;
            }

            .detail-item strong {
                display: block;
                color: #111827;
            }

            .edit-form-grid {
                display: grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
                gap: 16px;
            }

            .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 22px;
                padding-top: 18px;
                border-top: 1px solid #e5e7eb;
            }

            .repayment-toast {
                position: fixed;
                right: 25px;
                bottom: 25px;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 13px 18px;
                background: #fff;
                border-radius: 8px;
                box-shadow:
                    0 10px 30px rgba(0,0,0,0.15);
                border-left: 4px solid #16a34a;
                transition:
                    opacity 0.3s ease,
                    transform 0.3s ease;
            }

            .repayment-toast.hide {
                opacity: 0;
                transform: translateY(10px);
            }

            .repayment-toast.success {
                border-left-color: #16a34a;
            }

            .repayment-toast i {
                color: #16a34a;
            }

            .loading-state,
            .empty-state {
                text-align: center;
                padding: 45px 20px !important;
                color: #6b7280;
            }

            .loading-state i,
            .empty-state > i {
                display: block;
                font-size: 30px;
                margin-bottom: 10px;
            }

            @media (max-width: 700px) {

                .detail-grid,
                .edit-form-grid {
                    grid-template-columns: 1fr;
                }

                .repayment-modal-overlay {
                    padding: 10px;
                }

                .repayment-modal {
                    max-height: 95vh;
                }

                .repayment-modal-body {
                    padding: 16px;
                }

                .action-buttons {
                    flex-wrap: wrap;
                }
            }

        `;


        document.head.appendChild(
            style
        );
    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    addDynamicStyles();


    console.log(
        "=================================================="
    );

    console.log(
        "Finance Date Recovery Tool - Repayments"
    );

    console.log(
        "Repayments.js initialized successfully."
    );

    console.log(
        "API:",
        API_URL
    );

    console.log(
        "=================================================="
    );


    // Load records immediately.

    loadRepayments();

});


