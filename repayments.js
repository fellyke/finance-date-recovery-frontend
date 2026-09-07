


"use strict";


// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE_URL =
    "https://finance-date-recovery-backend.onrender.com/api";

const REPAYMENTS_API =
    `${API_BASE_URL}/repayments`;


// ============================================================
// PAGINATION
// ============================================================

let currentPage = 1;

const pageSize = 50;

let totalPages = 1;

let isLoading = false;


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeRepaymentsPage();

    }
);


// ============================================================
// INITIALIZE
// ============================================================

function initializeRepaymentsPage() {

    setupSearchAndFilters();

    setupPaginationButtons();

    loadRepayments();

}


// ============================================================
// TOKEN
// ============================================================

function getToken() {

    return (
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken") ||
        null
    );

}


// ============================================================
// AUTHENTICATED REQUEST
// ============================================================

async function apiRequest(
    url,
    options = {}
) {

    const token = getToken();

    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );


    let data;

    try {

        data =
            await response.json();

    } catch (error) {

        data = {

            success: false,

            message:
                "Invalid server response."

        };

    }


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        handleAuthenticationError();

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed."
        );

    }


    return data;

}


// ============================================================
// AUTHENTICATION ERROR
// ============================================================

function handleAuthenticationError() {

    console.warn(
        "Authentication token is missing or expired."
    );

    // Do not immediately redirect if the project
    // has another authentication handler.

    const message =
        document.getElementById(
            "message"
        ) ||
        document.getElementById(
            "errorMessage"
        );


    if (message) {

        message.textContent =
            "Your session has expired. Please log in again.";

    }

}


// ============================================================
// LOAD REPAYMENTS
// ============================================================

async function loadRepayments() {

    if (isLoading) {

        return;

    }


    isLoading = true;


    showLoading();


    try {

        const params =
            buildQueryParameters();


        const data =
            await apiRequest(
                `${REPAYMENTS_API}?${params}`
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load repayments."
            );

        }


        const records =
            Array.isArray(data.data)
                ? data.data
                : [];


        renderRepayments(records);


        updatePagination(
            data.pagination
        );


        updateRecordCount(
            data.pagination,
            records
        );


    } catch (error) {

        console.error(
            "LOAD REPAYMENTS ERROR:",
            error
        );


        showError(
            error.message ||
            "Unable to load repayment records."
        );

    } finally {

        isLoading = false;

        hideLoading();

    }

}


// ============================================================
// BUILD QUERY PARAMETERS
// ============================================================

function buildQueryParameters() {

    const params =
        new URLSearchParams();


    params.set(
        "page",
        currentPage
    );


    params.set(
        "pageSize",
        pageSize
    );


    // --------------------------------------------------------
    // CUSTOMER
    // --------------------------------------------------------

    const customer =
        getInputValue([
            "customerSearch",
            "customer",
            "searchCustomer"
        ]);


    if (customer) {

        params.set(
            "customer",
            customer
        );

    }


    // --------------------------------------------------------
    // LOAN NUMBER
    // --------------------------------------------------------

    const loanNumber =
        getInputValue([
            "loanNumberSearch",
            "loanNumber",
            "searchLoanNumber"
        ]);


    if (loanNumber) {

        params.set(
            "loanNumber",
            loanNumber
        );

    }


    // --------------------------------------------------------
    // REFERENCE NUMBER
    // --------------------------------------------------------

    const referenceNumber =
        getInputValue([
            "referenceNumberSearch",
            "referenceNumber",
            "searchReferenceNumber"
        ]);


    if (referenceNumber) {

        params.set(
            "referenceNumber",
            referenceNumber
        );

    }


    // --------------------------------------------------------
    // RECEIPT NUMBER
    // --------------------------------------------------------

    const receiptNumber =
        getInputValue([
            "receiptNumberSearch",
            "receiptNumber",
            "searchReceiptNumber"
        ]);


    if (receiptNumber) {

        params.set(
            "receiptNumber",
            receiptNumber
        );

    }


    // --------------------------------------------------------
    // AMOUNT
    // --------------------------------------------------------

    const amount =
        getInputValue([
            "amountSearch",
            "amount"
        ]);


    if (amount) {

        params.set(
            "amount",
            amount
        );

    }


    // --------------------------------------------------------
    // PAYMENT METHOD
    // --------------------------------------------------------

    const paymentMethod =
        getInputValue([
            "paymentMethod",
            "paymentMethodFilter",
            "method"
        ]);


    if (paymentMethod) {

        params.set(
            "paymentMethod",
            paymentMethod
        );

    }


    // --------------------------------------------------------
    // DATE FROM
    // --------------------------------------------------------

    const dateFrom =
        getInputValue([
            "dateFrom",
            "startDate",
            "repaymentDateFrom"
        ]);


    if (dateFrom) {

        params.set(
            "dateFrom",
            dateFrom
        );

    }


    // --------------------------------------------------------
    // DATE TO
    // --------------------------------------------------------

    const dateTo =
        getInputValue([
            "dateTo",
            "endDate",
            "repaymentDateTo"
        ]);


    if (dateTo) {

        params.set(
            "dateTo",
            dateTo
        );

    }


    return params;

}


// ============================================================
// GET INPUT VALUE
// ============================================================

function getInputValue(ids) {

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            const value =
                String(
                    element.value || ""
                ).trim();


            if (value) {

                return value;

            }

        }

    }


    return "";

}


// ============================================================
// RENDER REPAYMENTS
// ============================================================

function renderRepayments(records) {

    const tbody =
        findRepaymentTableBody();


    if (!tbody) {

        console.error(
            "Repayment table body was not found."
        );

        return;

    }


    tbody.innerHTML = "";


    if (records.length === 0) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td
                colspan="11"
                style="text-align:center;"
            >
                No repayment records found.
            </td>

        `;


        tbody.appendChild(row);

        return;

    }


    records.forEach(
        function (record) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        record.customer
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        record.loan_number
                    )}
                </td>

                <td>
                    ${formatDate(
                        record.repayment_date
                    )}
                </td>

                <td>
                    ${formatAmount(
                        record.amount
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        record.payment_method
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        record.reference_number
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        record.receipt_number
                    )}
                </td>

                <td>
                    ${formatAmount(
                        record.balance
                    )}
                </td>

                <td>
                    ${renderStatus(
                        record.status
                    )}
                </td>

                <td>
                    ${record.id}
                </td>

                <td>

                    <div
                        class="repayment-actions"
                    >

                        <button
                            type="button"
                            class="view-btn"
                            onclick="viewRepayment(${record.id})"
                        >
                            View
                        </button>

                        <button
                            type="button"
                            class="edit-btn"
                            onclick="editRepayment(${record.id})"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteRepayment(${record.id})"
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}


// ============================================================
// FIND TABLE BODY
// ============================================================

function findRepaymentTableBody() {

    const ids = [

        "repaymentsTableBody",

        "repaymentTableBody",

        "repaymentsBody",

        "repaymentBody",

        "tableBody"

    ];


    for (
        const id of ids
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            return element;

        }

    }


    // Fallback: find tbody inside a table

    const table =
        document.querySelector(
            "#repaymentsTable, #repaymentTable, table"
        );


    if (table) {

        return table.querySelector("tbody");

    }


    return null;

}


// ============================================================
// STATUS
// ============================================================

function renderStatus(status) {

    const normalized =
        String(status || "")
            .trim()
            .toLowerCase();


    if (
        normalized === "verified"
    ) {

        return `
            <span class="status verified">
                Verified
            </span>
        `;

    }


    return `
        <span class="status unverified">
            Unverified
        </span>
    `;

}


// ============================================================
// FORMAT AMOUNT
// ============================================================

function formatAmount(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0.00";

    }


    return number.toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

    if (!value) {

        return "-";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return escapeHtml(
            value
        );

    }


    return date.toLocaleDateString(
        "en-GB"
    );

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "-";

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


// ============================================================
// VIEW REPAYMENT
// ============================================================

async function viewRepayment(id) {

    try {

        const data =
            await apiRequest(
                `${REPAYMENTS_API}/${id}`
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load repayment."
            );

        }


        showRepaymentDetails(
            data.data
        );


    } catch (error) {

        console.error(
            "VIEW REPAYMENT ERROR:",
            error
        );


        showError(
            error.message
        );

    }

}


// ============================================================
// SHOW REPAYMENT DETAILS
// ============================================================

function showRepaymentDetails(record) {

    let modal =
        document.getElementById(
            "repaymentViewModal"
        );


    // --------------------------------------------------------
    // CREATE MODAL IF IT DOES NOT EXIST
    // --------------------------------------------------------

    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "repaymentViewModal";


        modal.innerHTML = `

            <div
                class="repayment-modal-overlay"
                onclick="closeRepaymentModal(event)"
            >

                <div
                    class="repayment-modal"
                    onclick="event.stopPropagation()"
                >

                    <div
                        class="repayment-modal-header"
                    >

                        <h2>
                            Repayment Details
                        </h2>

                        <button
                            type="button"
                            onclick="closeRepaymentModal()"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        id="repaymentDetailsContent"
                        class="repayment-details"
                    >
                    </div>


                    <div
                        class="repayment-modal-footer"
                    >

                        <button
                            type="button"
                            onclick="closeRepaymentModal()"
                        >
                            Close
                        </button>

                    </div>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );

    }


    const content =
        document.getElementById(
            "repaymentDetailsContent"
        );


    if (!content) {

        return;

    }


    content.innerHTML = `

        <div class="detail-row">
            <strong>Customer</strong>
            <span>
                ${escapeHtml(record.customer)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Loan Number</strong>
            <span>
                ${escapeHtml(record.loan_number)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Repayment Date</strong>
            <span>
                ${formatDate(record.repayment_date)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Amount</strong>
            <span>
                KES ${formatAmount(record.amount)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Payment Method</strong>
            <span>
                ${escapeHtml(record.payment_method)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Reference Number</strong>
            <span>
                ${escapeHtml(record.reference_number)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Receipt Number</strong>
            <span>
                ${escapeHtml(record.receipt_number)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Balance</strong>
            <span>
                KES ${formatAmount(record.balance)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Status</strong>
            <span>
                ${escapeHtml(record.status)}
            </span>
        </div>

        <div class="detail-row">
            <strong>Financial Record ID</strong>
            <span>
                ${escapeHtml(record.financial_record_id)}
            </span>
        </div>

    `;


    modal.style.display =
        "block";

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeRepaymentModal(event) {

    if (
        event &&
        event.target &&
        event.target.id !==
            "repaymentViewModal"
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "repaymentViewModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ============================================================
// EDIT REPAYMENT
// ============================================================

async function editRepayment(id) {

    try {

        const data =
            await apiRequest(
                `${REPAYMENTS_API}/${id}`
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to load repayment."
            );

        }


        showEditForm(
            data.data
        );


    } catch (error) {

        console.error(
            "EDIT REPAYMENT ERROR:",
            error
        );


        showError(
            error.message
        );

    }

}


// ============================================================
// SHOW EDIT FORM
// ============================================================

function showEditForm(record) {

    let modal =
        document.getElementById(
            "repaymentEditModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );


        modal.id =
            "repaymentEditModal";


        modal.innerHTML = `

            <div
                class="repayment-modal-overlay"
                onclick="closeEditModal(event)"
            >

                <div
                    class="repayment-modal"
                    onclick="event.stopPropagation()"
                >

                    <div
                        class="repayment-modal-header"
                    >

                        <h2>
                            Edit Repayment
                        </h2>

                        <button
                            type="button"
                            onclick="closeEditModal()"
                        >
                            ×
                        </button>

                    </div>


                    <form
                        id="editRepaymentForm"
                    >

                        <input
                            type="hidden"
                            id="editRepaymentId"
                        >


                        <label>
                            Customer
                        </label>

                        <input
                            type="text"
                            id="editCustomer"
                            required
                        >


                        <label>
                            Loan Number
                        </label>

                        <input
                            type="text"
                            id="editLoanNumber"
                            required
                        >


                        <label>
                            Repayment Date
                        </label>

                        <input
                            type="date"
                            id="editRepaymentDate"
                            required
                        >


                        <label>
                            Amount
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            id="editAmount"
                            required
                        >


                        <label>
                            Payment Method
                        </label>

                        <input
                            type="text"
                            id="editPaymentMethod"
                        >


                        <label>
                            Reference Number
                        </label>

                        <input
                            type="text"
                            id="editReferenceNumber"
                        >


                        <label>
                            Receipt Number
                        </label>

                        <input
                            type="text"
                            id="editReceiptNumber"
                        >


                        <label>
                            Balance
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            id="editBalance"
                        >


                        <label>
                            Status
                        </label>

                        <select
                            id="editStatus"
                        >

                            <option value="Verified">
                                Verified
                            </option>

                            <option value="Unverified">
                                Unverified
                            </option>

                        </select>


                        <div
                            class="repayment-modal-footer"
                        >

                            <button
                                type="submit"
                            >
                                Save Changes
                            </button>

                            <button
                                type="button"
                                onclick="closeEditModal()"
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "editRepaymentForm"
            )
            .addEventListener(
                "submit",
                submitEditRepayment
            );

    }


    document.getElementById(
        "editRepaymentId"
    ).value = record.id;


    document.getElementById(
        "editCustomer"
    ).value =
        record.customer || "";


    document.getElementById(
        "editLoanNumber"
    ).value =
        record.loan_number || "";


    document.getElementById(
        "editRepaymentDate"
    ).value =
        formatDateForInput(
            record.repayment_date
        );


    document.getElementById(
        "editAmount"
    ).value =
        record.amount || 0;


    document.getElementById(
        "editPaymentMethod"
    ).value =
        record.payment_method || "";


    document.getElementById(
        "editReferenceNumber"
    ).value =
        record.reference_number || "";


    document.getElementById(
        "editReceiptNumber"
    ).value =
        record.receipt_number || "";


    document.getElementById(
        "editBalance"
    ).value =
        record.balance || 0;


    document.getElementById(
        "editStatus"
    ).value =
        record.status || "Unverified";


    modal.style.display =
        "block";

}


// ============================================================
// FORMAT DATE FOR INPUT
// ============================================================

function formatDateForInput(value) {

    if (!value) {

        return "";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value)
            .substring(0, 10);

    }


    return date
        .toISOString()
        .substring(0, 10);

}


// ============================================================
// SUBMIT EDIT
// ============================================================

async function submitEditRepayment(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "editRepaymentId"
        ).value;


    const body = {

        customer:
            document.getElementById(
                "editCustomer"
            ).value.trim(),

        loan_number:
            document.getElementById(
                "editLoanNumber"
            ).value.trim(),

        repayment_date:
            document.getElementById(
                "editRepaymentDate"
            ).value,

        amount:
            document.getElementById(
                "editAmount"
            ).value,

        payment_method:
            document.getElementById(
                "editPaymentMethod"
            ).value.trim(),

        reference_number:
            document.getElementById(
                "editReferenceNumber"
            ).value.trim(),

        receipt_number:
            document.getElementById(
                "editReceiptNumber"
            ).value.trim(),

        balance:
            document.getElementById(
                "editBalance"
            ).value,

        status:
            document.getElementById(
                "editStatus"
            ).value

    };


    try {

        const data =
            await apiRequest(
                `${REPAYMENTS_API}/${id}`,
                {
                    method: "PUT",

                    body:
                        JSON.stringify(body)
                }
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to update repayment."
            );

        }


        closeEditModal();


        showSuccess(
            "Repayment updated successfully."
        );


        await loadRepayments();


    } catch (error) {

        console.error(
            "UPDATE REPAYMENT ERROR:",
            error
        );


        showError(
            error.message
        );

    }

}


// ============================================================
// CLOSE EDIT MODAL
// ============================================================

function closeEditModal(event) {

    if (
        event &&
        event.target &&
        event.target.id !==
            "repaymentEditModal"
    ) {

        return;

    }


    const modal =
        document.getElementById(
            "repaymentEditModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// ============================================================
// DELETE REPAYMENT
// ============================================================

async function deleteRepayment(id) {

    const confirmed =
        window.confirm(
            "Are you sure you want to delete this repayment record?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const data =
            await apiRequest(
                `${REPAYMENTS_API}/${id}`,
                {
                    method: "DELETE"
                }
            );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to delete repayment."
            );

        }


        showSuccess(
            "Repayment deleted successfully."
        );


        // If deleting the last record
        // on a page, move back one page.

        if (
            currentPage > 1
        ) {

            const tbody =
                findRepaymentTableBody();


            if (
                tbody &&
                tbody.children.length === 1
            ) {

                currentPage--;

            }

        }


        await loadRepayments();


    } catch (error) {

        console.error(
            "DELETE REPAYMENT ERROR:",
            error
        );


        showError(
            error.message
        );

    }

}


// ============================================================
// SEARCH AND FILTERS
// ============================================================

function setupSearchAndFilters() {

    const elements =
        document.querySelectorAll(
            `
            input,
            select
            `
        );


    elements.forEach(
        function (element) {

            const id =
                element.id || "";


            const repaymentField =
                /customer|loan|reference|receipt|amount|payment|method|date/i
                    .test(id);


            if (!repaymentField) {

                return;

            }


            element.addEventListener(
                "change",
                function () {

                    currentPage = 1;

                    loadRepayments();

                }
            );


            if (
                element.tagName
                    .toLowerCase() ===
                "input"
            ) {

                let timer;


                element.addEventListener(
                    "input",
                    function () {

                        clearTimeout(timer);


                        timer =
                            setTimeout(
                                function () {

                                    currentPage = 1;

                                    loadRepayments();

                                },
                                400
                            );

                    }
                );

            }

        }
    );

}


// ============================================================
// RESET FILTERS
// ============================================================

function resetRepaymentFilters() {

    const possibleIds = [

        "customerSearch",
        "customer",
        "searchCustomer",

        "loanNumberSearch",
        "loanNumber",
        "searchLoanNumber",

        "referenceNumberSearch",
        "referenceNumber",
        "searchReferenceNumber",

        "receiptNumberSearch",
        "receiptNumber",
        "searchReceiptNumber",

        "amountSearch",
        "amount",

        "paymentMethod",
        "paymentMethodFilter",
        "method",

        "dateFrom",
        "startDate",
        "repaymentDateFrom",

        "dateTo",
        "endDate",
        "repaymentDateTo"

    ];


    possibleIds.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.value = "";

            }

        }
    );


    currentPage = 1;

    loadRepayments();

}


// ============================================================
// PAGINATION BUTTONS
// ============================================================

function setupPaginationButtons() {

    const previousButtons =
        document.querySelectorAll(
            "#previousPage, #prevPage, #previousBtn, #prevBtn"
        );


    const nextButtons =
        document.querySelectorAll(
            "#nextPage, #nextBtn, #nextButton"
        );


    previousButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    if (
                        currentPage <= 1
                    ) {

                        return;

                    }


                    currentPage--;

                    loadRepayments();

                }
            );

        }
    );


    nextButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    if (
                        currentPage >=
                        totalPages
                    ) {

                        return;

                    }


                    currentPage++;

                    loadRepayments();

                }
            );

        }
    );

}


// ============================================================
// UPDATE PAGINATION
// ============================================================

function updatePagination(
    pagination
) {

    if (!pagination) {

        totalPages = 1;

        return;

    }


    currentPage =
        Number(
            pagination.page
        ) || 1;


    totalPages =
        Number(
            pagination.totalPages
        ) || 1;


    const previousButtons =
        document.querySelectorAll(
            "#previousPage, #prevPage, #previousBtn, #prevBtn"
        );


    const nextButtons =
        document.querySelectorAll(
            "#nextPage, #nextBtn, #nextButton"
        );


    previousButtons.forEach(
        function (button) {

            button.disabled =
                !pagination.hasPreviousPage;

        }
    );


    nextButtons.forEach(
        function (button) {

            button.disabled =
                !pagination.hasNextPage;

        }
    );


    const pageElements =
        document.querySelectorAll(
            "#currentPage, #pageNumber, #pageInfo"
        );


    pageElements.forEach(
        function (element) {

            element.textContent =
                `Page ${currentPage} of ${totalPages}`;

        }
    );


    const totalElements =
        document.querySelectorAll(
            "#totalPages"
        );


    totalElements.forEach(
        function (element) {

            element.textContent =
                totalPages;

        }
    );

}


// ============================================================
// UPDATE RECORD COUNT
// ============================================================

function updateRecordCount(
    pagination,
    records
) {

    const elements =
        document.querySelectorAll(
            "#recordCount, #totalRecords, #repaymentCount"
        );


    elements.forEach(
        function (element) {

            if (
                pagination &&
                pagination.total !== undefined
            ) {

                element.textContent =
                    Number(
                        pagination.total
                    ).toLocaleString();

            } else {

                element.textContent =
                    records.length;

            }

        }
    );

}


// ============================================================
// LOADING STATE
// ============================================================

function showLoading() {

    const tbody =
        findRepaymentTableBody();


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="11"
                style="text-align:center;"
            >

                Loading repayment records...

            </td>

        </tr>

    `;

}


// ============================================================
// HIDE LOADING
// ============================================================

function hideLoading() {

    // Table is replaced by renderRepayments().
    // This function is intentionally kept
    // for future loading indicators.

}


// ============================================================
// SUCCESS MESSAGE
// ============================================================

function showSuccess(message) {

    showMessage(
        message,
        "success"
    );

}


// ============================================================
// ERROR MESSAGE
// ============================================================

function showError(message) {

    showMessage(
        message,
        "error"
    );

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    let element =
        document.getElementById(
            "repaymentMessage"
        );


    if (!element) {

        element =
            document.createElement(
                "div"
            );


        element.id =
            "repaymentMessage";


        element.style.position =
            "fixed";

        element.style.top =
            "20px";

        element.style.right =
            "20px";

        element.style.zIndex =
            "99999";

        element.style.padding =
            "12px 18px";

        element.style.borderRadius =
            "6px";

        element.style.background =
            type === "error"
                ? "#dc3545"
                : "#198754";

        element.style.color =
            "#ffffff";

        element.style.fontWeight =
            "600";


        document.body.appendChild(
            element
        );

    }


    element.textContent =
        message;


    element.style.display =
        "block";


    setTimeout(
        function () {

            element.style.display =
                "none";

        },
        4000
    );

}


// ============================================================
// EXPORT FUNCTIONS
//
// Makes functions available to HTML onclick handlers.
// ============================================================

window.loadRepayments =
    loadRepayments;

window.viewRepayment =
    viewRepayment;

window.editRepayment =
    editRepayment;

window.deleteRepayment =
    deleteRepayment;

window.closeRepaymentModal =
    closeRepaymentModal;

window.closeEditModal =
    closeEditModal;

window.resetRepaymentFilters =
    resetRepaymentFilters;
```
