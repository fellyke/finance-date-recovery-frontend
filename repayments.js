
// ============================================================
// FINANCE DATE RECOVERY TOOL
// REPAYMENTS.JS
// ============================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    // ========================================================
    // API CONFIGURATION
    // ========================================================

    const API_URL =
        "https://finance-date-recovery-backend.onrender.com/api/repayments";


    // ========================================================
    // PAGINATION
    // ========================================================

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
    // STATISTICS ELEMENTS
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
            "token",
            "authToken",
            "accessToken",
            "jwt"
        ];

        for (const key of tokenKeys) {

            const token =
                localStorage.getItem(key) ||
                sessionStorage.getItem(key);

            if (token) {
                return token;
            }
        }

        return null;
    }


    // ========================================================
    // AUTHENTICATED FETCH
    // ========================================================

    async function apiRequest(url, options = {}) {

        const token = getToken();

        if (!token) {

            window.location.href = "login.html";

            throw new Error("No authentication token found.");
        }

        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            "Authorization": `Bearer ${token}`
        };

        const response = await fetch(url, {
            ...options,
            headers
        });


        // ----------------------------------------------------
        // SESSION EXPIRED
        // ----------------------------------------------------

        if (response.status === 401 || response.status === 403) {

            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("jwt");

            sessionStorage.removeItem("token");
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("jwt");

            window.location.href = "login.html";

            throw new Error("Your session has expired.");
        }


        const contentType =
            response.headers.get("content-type") || "";


        if (contentType.includes("application/json")) {

            const data = await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Request failed."
                );
            }

            return data;
        }


        if (!response.ok) {

            const text = await response.text();

            throw new Error(
                text || "Request failed."
            );
        }

        return response;
    }


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ========================================================
    // FORMAT CURRENCY
    // ========================================================

    function formatCurrency(value) {

        const amount = Number(value);

        if (Number.isNaN(amount)) {
            return "KES 0.00";
        }

        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }


    // ========================================================
    // FORMAT DATE
    // ========================================================

    function formatDate(value) {

        if (!value) {
            return "—";
        }

        // ----------------------------------------------------
        // Handle YYYY-MM-DD without timezone shifting
        // ----------------------------------------------------

        const dateString = String(value);

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {

            const parts = dateString.split("-");

            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }


        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }


    // ========================================================
    // NORMALIZE STATUS
    // ========================================================

    function normalizeStatus(status) {

        if (!status) {
            return "Unverified";
        }

        const value =
            String(status).trim().toLowerCase();

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
    // GET SEARCH VALUES
    // ========================================================

    function getSearchFilters() {

        return {

            customer:
                document.getElementById("customer")?.value.trim() || "",

            loanNumber:
                document.getElementById("loanNumber")?.value.trim() || "",

            referenceNumber:
                document.getElementById("referenceNumber")?.value.trim() || "",

            receiptNumber:
                document.getElementById("receiptNumber")?.value.trim() || "",

            amount:
                document.getElementById("amount")?.value.trim() || "",

            paymentMethod:
                document.getElementById("paymentMethod")?.value.trim() || "",

            dateFrom:
                document.getElementById("dateFrom")?.value || "",

            dateTo:
                document.getElementById("dateTo")?.value || ""
        };
    }


    // ========================================================
    // BUILD QUERY STRING
    // ========================================================

    function buildQueryString() {

        const filters = getSearchFilters();

        const params = new URLSearchParams();

        params.set("page", currentPage);
        params.set("pageSize", PAGE_SIZE);


        Object.entries(filters).forEach(
            ([key, value]) => {

                if (value !== "") {
                    params.set(key, value);
                }
            }
        );


        return params.toString();
    }


    // ========================================================
    // LOADING ROW
    // ========================================================

    function showLoading() {

        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading repayments...
                </td>
            </tr>
        `;
    }


    // ========================================================
    // ERROR ROW
    // ========================================================

    function showError(message) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-state">
                    <i class="fas fa-circle-exclamation"></i>
                    <div>${escapeHTML(message)}</div>
                    <button
                        type="button"
                        class="btn btn-secondary"
                        id="retryRepaymentsBtn"
                        style="margin-top: 12px;"
                    >
                        <i class="fas fa-rotate-right"></i>
                        Retry
                    </button>
                </td>
            </tr>
        `;


        const retryBtn =
            document.getElementById("retryRepaymentsBtn");

        if (retryBtn) {

            retryBtn.addEventListener(
                "click",
                () => loadRepayments()
            );
        }
    }


    // ========================================================
    // EMPTY ROW
    // ========================================================

    function showEmpty() {

        tableBody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <div>No repayment records found.</div>
                </td>
            </tr>
        `;
    }


    // ========================================================
    // RENDER TABLE
    // ========================================================

    function renderRepayments(records) {

        tableBody.innerHTML = "";


        if (!records || records.length === 0) {

            showEmpty();

            return;
        }


        records.forEach((repayment, index) => {

            const absoluteNumber =
                ((currentPage - 1) * PAGE_SIZE) +
                index +
                1;


            const status =
                normalizeStatus(repayment.status);

            const statusClass =
                status.toLowerCase() === "verified"
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
                    ${escapeHTML(repayment.customer || "—")}
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
                    <span class="status ${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-btn view-btn"
                            data-action="view"
                            data-id="${repayment.id}"
                            title="View repayment"
                        >
                            <i class="fas fa-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn edit-btn"
                            data-action="edit"
                            data-id="${repayment.id}"
                            title="Edit repayment"
                        >
                            <i class="fas fa-pen"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn delete-btn"
                            data-action="delete"
                            data-id="${repayment.id}"
                            title="Delete repayment"
                        >
                            <i class="fas fa-trash"></i>
                        </button>

                    </div>

                </td>
            `;


            tableBody.appendChild(row);
        });
    }


    // ========================================================
    // UPDATE PAGINATION
    // ========================================================

    function updatePagination(pagination) {

        if (!pagination) {

            totalRecords = 0;
            totalPages = 1;

        } else {

            totalRecords =
                Number(pagination.total) || 0;

            totalPages =
                Number(pagination.totalPages) || 1;
        }


        const start =
            totalRecords === 0
                ? 0
                : ((currentPage - 1) * PAGE_SIZE) + 1;


        const end =
            totalRecords === 0
                ? 0
                : Math.min(
                    currentPage * PAGE_SIZE,
                    totalRecords
                );


        if (paginationStart) {
            paginationStart.textContent = start;
        }

        if (paginationEnd) {
            paginationEnd.textContent = end;
        }

        if (paginationTotal) {
            paginationTotal.textContent = totalRecords;
        }

        if (currentPageElement) {
            currentPageElement.textContent = currentPage;
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
    // UPDATE RESULT SUMMARY
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


        resultSummary.textContent =
            `Showing ${Math.min(
                ((currentPage - 1) * PAGE_SIZE) + 1,
                totalRecords
            )}–${Math.min(
                currentPage * PAGE_SIZE,
                totalRecords
            )} of ${totalRecords} repayment records`;
    }


    // ========================================================
    // UPDATE STATISTICS
    // ========================================================

    function updateStatistics(records, serverSummary) {

        let totalAmount = 0;
        let verified = 0;
        let unverified = 0;


        records.forEach(record => {

            totalAmount +=
                Number(record.amount) || 0;


            const status =
                normalizeStatus(record.status);


            if (status === "Verified") {
                verified++;
            } else {
                unverified++;
            }
        });


        // ----------------------------------------------------
        // Use backend summary when available.
        // This keeps statistics correct even when pagination
        // is being used.
        // ----------------------------------------------------

        if (serverSummary) {

            if (
                serverSummary.totalAmount !== undefined
            ) {
                totalAmount =
                    Number(serverSummary.totalAmount) || 0;
            }

            if (
                serverSummary.verified !== undefined
            ) {
                verified =
                    Number(serverSummary.verified) || 0;
            }

            if (
                serverSummary.unverified !== undefined
            ) {
                unverified =
                    Number(serverSummary.unverified) || 0;
            }
        }


        if (totalRepaymentsElement) {

            totalRepaymentsElement.textContent =
                totalRecords;
        }


        if (totalRepaymentAmountElement) {

            totalRepaymentAmountElement.textContent =
                formatCurrency(totalAmount);
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

        updatePagination({
            total: totalRecords,
            totalPages: totalPages
        });


        try {

            const queryString =
                buildQueryString();


            const data =
                await apiRequest(
                    `${API_URL}?${queryString}`
                );


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Failed to load repayments."
                );
            }


            const records =
                Array.isArray(data.data)
                    ? data.data
                    : [];


            // ------------------------------------------------
            // PAGINATION
            // ------------------------------------------------

            if (data.pagination) {

                totalRecords =
                    Number(data.pagination.total) || 0;

                totalPages =
                    Number(
                        data.pagination.totalPages
                    ) || 1;

            } else {

                // Backward compatibility with the
                // old non-paginated backend.

                totalRecords =
                    Number(data.count) ||
                    records.length;

                totalPages = 1;
            }


            renderRepayments(records);


            updatePagination({
                total: totalRecords,
                totalPages: totalPages
            });


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


            updatePagination({
                total: totalRecords,
                totalPages: totalPages
            });
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


            const repayment =
                data.data;


            showViewModal(repayment);


        } catch (error) {

            console.error(error);

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
                        <i class="fas fa-receipt"></i>
                        Repayment Details
                    </h3>

                    <button
                        type="button"
                        class="modal-close-btn"
                        id="closeRepaymentModal"
                    >
                        <i class="fas fa-times"></i>
                    </button>

                </div>


                <div class="repayment-modal-body">

                    <div class="detail-grid">

                        <div class="detail-item">
                            <span>Customer</span>
                            <strong>
                                ${escapeHTML(
                                    repayment.customer || "—"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Loan Number</span>
                            <strong>
                                ${escapeHTML(
                                    repayment.loan_number || "—"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Repayment Date</span>
                            <strong>
                                ${formatDate(
                                    repayment.repayment_date
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Amount</span>
                            <strong>
                                ${formatCurrency(
                                    repayment.amount
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Payment Method</span>
                            <strong>
                                ${escapeHTML(
                                    repayment.payment_method || "—"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Reference Number</span>
                            <strong>
                                ${escapeHTML(
                                    repayment.reference_number || "—"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Receipt Number</span>
                            <strong>
                                ${escapeHTML(
                                    repayment.receipt_number || "—"
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Balance</span>
                            <strong>
                                ${formatCurrency(
                                    repayment.balance
                                )}
                            </strong>
                        </div>

                        <div class="detail-item">
                            <span>Status</span>
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


        document.body.appendChild(modal);


        document
            .getElementById("closeRepaymentModal")
            ?.addEventListener(
                "click",
                closeModal
            );


        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {
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


            showEditModal(data.data);


        } catch (error) {

            console.error(error);

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


        modal.innerHTML = `

            <div class="repayment-modal">

                <div class="repayment-modal-header">

                    <h3>
                        <i class="fas fa-pen"></i>
                        Edit Repayment
                    </h3>

                    <button
                        type="button"
                        class="modal-close-btn"
                        id="closeRepaymentModal"
                    >
                        <i class="fas fa-times"></i>
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

                            <select id="editStatus">

                                <option value="Verified"
                                    ${normalizeStatus(
                                        repayment.status
                                    ) === "Verified"
                                        ? "selected"
                                        : ""
                                    }>
                                    Verified
                                </option>

                                <option value="Unverified"
                                    ${normalizeStatus(
                                        repayment.status
                                    ) === "Unverified"
                                        ? "selected"
                                        : ""
                                    }>
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
                            Cancel
                        </button>

                        <button
                            type="submit"
                            class="btn btn-primary"
                            id="saveRepaymentBtn"
                        >
                            <i class="fas fa-save"></i>
                            Save Changes
                        </button>

                    </div>

                </form>

            </div>
        `;


        document.body.appendChild(modal);


        document
            .getElementById("closeRepaymentModal")
            ?.addEventListener(
                "click",
                closeModal
            );


        document
            .getElementById("cancelEditBtn")
            ?.addEventListener(
                "click",
                closeModal
            );


        document
            .getElementById("editRepaymentForm")
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

                if (event.target === modal) {
                    closeModal();
                }
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


        if (Number.isNaN(date.getTime())) {
            return "";
        }


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;
    }


    // ========================================================
    // SAVE REPAYMENT
    // ========================================================

    async function saveRepayment(id) {

        const saveButton =
            document.getElementById(
                "saveRepaymentBtn"
            );


        const payload = {

            customer:
                document.getElementById(
                    "editCustomer"
                ).value.trim(),

            loanNumber:
                document.getElementById(
                    "editLoanNumber"
                ).value.trim(),

            repaymentDate:
                document.getElementById(
                    "editRepaymentDate"
                ).value,

            amount:
                document.getElementById(
                    "editAmount"
                ).value,

            paymentMethod:
                document.getElementById(
                    "editPaymentMethod"
                ).value.trim(),

            referenceNumber:
                document.getElementById(
                    "editReferenceNumber"
                ).value.trim(),

            receiptNumber:
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


        if (!payload.customer) {

            alert("Customer is required.");

            return;
        }


        if (!payload.loanNumber) {

            alert("Loan Number is required.");

            return;
        }


        if (!payload.repaymentDate) {

            alert("Repayment Date is required.");

            return;
        }


        if (
            payload.amount === "" ||
            Number(payload.amount) < 0
        ) {

            alert("Please enter a valid amount.");

            return;
        }


        try {

            if (saveButton) {

                saveButton.disabled = true;

                saveButton.innerHTML = `
                    <i class="fas fa-spinner fa-spin"></i>
                    Saving...
                `;
            }


            const data =
                await apiRequest(
                    `${API_URL}/${id}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload)
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

            console.error(error);

            alert(
                error.message ||
                "Unable to update repayment."
            );


            if (saveButton) {

                saveButton.disabled = false;

                saveButton.innerHTML = `
                    <i class="fas fa-save"></i>
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


            // ------------------------------------------------
            // If deleting the last item on a page, move back
            // one page when necessary.
            // ------------------------------------------------

            if (
                currentPage > 1 &&
                totalRecords - 1 <=
                (currentPage - 1) * PAGE_SIZE
            ) {

                currentPage--;
            }


            await loadRepayments();


            showMessage(
                "Repayment deleted successfully.",
                "success"
            );


        } catch (error) {

            console.error(error);

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
    // SIMPLE MESSAGE / TOAST
    // ========================================================

    function showMessage(message, type = "success") {

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


        toast.innerHTML = `

            <i class="fas ${
                type === "success"
                    ? "fa-circle-check"
                    : "fa-circle-exclamation"
            }"></i>

            <span>
                ${escapeHTML(message)}
            </span>
        `;


        document.body.appendChild(toast);


        setTimeout(() => {

            toast.classList.add("hide");

            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 3000);
    }


    // ========================================================
    // EXPORT CURRENT RESULTS
    // ========================================================

    function exportRepayments() {

        const rows =
            tableBody.querySelectorAll("tr");


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


        rows.forEach((row, index) => {

            const cells =
                row.querySelectorAll("td");


            if (cells.length < 10) {
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
        });


        const csv =
            data
                .map(row =>
                    row
                        .map(value =>
                            `"${String(value)
                                .replace(/"/g, '""')}"`
                        )
                        .join(",")
                )
                .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;


        link.download =
            `repayments-page-${currentPage}-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);
    }


    // ========================================================
    // SEARCH
    // ========================================================

    if (searchForm) {

        searchForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const dateFrom =
                    document.getElementById(
                        "dateFrom"
                    )?.value;


                const dateTo =
                    document.getElementById(
                        "dateTo"
                    )?.value;


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
    // CLEAR SEARCH
    // ========================================================

    if (clearSearchBtn) {

        clearSearchBtn.addEventListener(
            "click",
            function () {

                if (searchForm) {
                    searchForm.reset();
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

                loadRepayments();
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
    // RECOVER DATE BUTTON
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
    // EXPORT
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


                if (action === "view") {

                    viewRepayment(id);
                }


                if (action === "edit") {

                    editRepayment(id);
                }


                if (action === "delete") {

                    deleteRepayment(id);
                }
            }
        );
    }


    // ========================================================
    // KEYBOARD ESCAPE - CLOSE MODAL
    // ========================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeModal();
            }
        }
    );


    // ========================================================
    // ADD MODAL / TOAST STYLES
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
            document.createElement("style");


        style.id =
            "repaymentDynamicStyles";


        style.textContent = `

            /* ================================================
               ACTION BUTTONS
               ================================================ */

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


            /* ================================================
               MODAL
               ================================================ */

            .repayment-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.55);
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
                background: #ffffff;
                border-radius: 12px;
                box-shadow:
                    0 20px 50px rgba(0, 0, 0, 0.2);
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


            /* ================================================
               DETAIL GRID
               ================================================ */

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


            /* ================================================
               EDIT FORM
               ================================================ */

            .edit-form-grid {
                display: grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
                gap: 16px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .form-group label {
                font-weight: 600;
                font-size: 13px;
            }

            .form-group input,
            .form-group select {
                width: 100%;
                box-sizing: border-box;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 7px;
                outline: none;
            }

            .form-group input:focus,
            .form-group select:focus {
                border-color: #2563eb;
            }

            .modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 22px;
                padding-top: 18px;
                border-top: 1px solid #e5e7eb;
            }


            /* ================================================
               TOAST
               ================================================ */

            .repayment-toast {
                position: fixed;
                right: 25px;
                bottom: 25px;
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 13px 18px;
                background: #ffffff;
                border-radius: 8px;
                box-shadow:
                    0 10px 30px rgba(0, 0, 0, 0.15);
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


            /* ================================================
               EMPTY / LOADING
               ================================================ */

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


            /* ================================================
               MOBILE
               ================================================ */

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


        document.head.appendChild(style);
    }


    // ========================================================
    // INITIALIZE
    // ========================================================

    addDynamicStyles();

    loadRepayments();

});

