// repayments.js

const form = document.getElementById("repaymentSearchForm");
const tableBody = document.getElementById("repaymentsTableBody");

const refreshButton = document.getElementById("refreshRepaymentsBtn");
const clearButton = document.getElementById("clearSearchBtn");
const recoverButton = document.getElementById("recoverDateBtn");
const exportButton = document.getElementById("exportRepaymentsBtn");

const previousButton = document.getElementById("previousPageBtn");
const nextButton = document.getElementById("nextPageBtn");

let repayments = [];
let currentPage = 1;
const recordsPerPage = 10;


// Load repayments
async function loadRepayments() {

    try {

        const response = await apiGet("repayments");

        if (!response.success) {
            alert(response.message);
            return;
        }

        repayments = response.data || [];

        currentPage = 1;

        updateStatistics();
        displayRepayments();

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="11">
                    Unable to load repayment records.
                </td>
            </tr>
        `;
    }
}


// Display repayments
function displayRepayments() {

    tableBody.innerHTML = "";

    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;

    const records = repayments.slice(start, end);

    if (records.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="11">
                    No repayment records found.
                </td>
            </tr>
        `;

    } else {

        records.forEach((repayment, index) => {

            tableBody.innerHTML += `
                <tr>

                    <td>${start + index + 1}</td>

                    <td>${repayment.customer || "-"}</td>

                    <td>${repayment.loan_number || "-"}</td>

                    <td>${repayment.repayment_date || "-"}</td>

                    <td>
                        KES ${Number(repayment.amount || 0).toFixed(2)}
                    </td>

                    <td>${repayment.payment_method || "-"}</td>

                    <td>${repayment.reference_number || "-"}</td>

                    <td>${repayment.receipt_number || "-"}</td>

                    <td>
                        KES ${Number(repayment.balance || 0).toFixed(2)}
                    </td>

                    <td>${repayment.status || "Unverified"}</td>

                    <td>
                        <button
                            class="btn btn-primary"
                            onclick="viewRepayment(${repayment.id})">
                            View
                        </button>
                    </td>

                </tr>
            `;

        });
    }

    updatePagination();
}


// Statistics
function updateStatistics() {

    const total = repayments.length;

    const amount = repayments.reduce(
        (sum, repayment) =>
            sum + Number(repayment.amount || 0),
        0
    );

    const verified = repayments.filter(
        repayment => repayment.status === "Verified"
    ).length;

    const unverified = total - verified;

    document.getElementById("totalRepayments").textContent = total;

    document.getElementById("totalRepaymentAmount").textContent =
        `KES ${amount.toFixed(2)}`;

    document.getElementById("verifiedRepayments").textContent =
        verified;

    document.getElementById("unverifiedRepayments").textContent =
        unverified;
}


// Search
form.addEventListener("submit", async function (e) {

    e.preventDefault();

    const params = new URLSearchParams();

    const fields = {
        customer: "customer",
        loanNumber: "loanNumber",
        referenceNumber: "referenceNumber",
        receiptNumber: "receiptNumber",
        amount: "amount",
        paymentMethod: "paymentMethod",
        dateFrom: "dateFrom",
        dateTo: "dateTo"
    };

    Object.keys(fields).forEach(key => {

        const value =
            document.getElementById(fields[key]).value.trim();

        if (value) {
            params.append(key, value);
        }
    });

    try {

        const response =
            await apiGet(`repayments?${params.toString()}`);

        if (!response.success) {
            alert(response.message);
            return;
        }

        repayments = response.data || [];
        currentPage = 1;

        updateStatistics();
        displayRepayments();

    } catch (error) {

        console.error(error);
        alert("Unable to search repayment records.");
    }
});


// Clear search
clearButton.addEventListener("click", function () {

    form.reset();

    loadRepayments();
});


// Refresh
refreshButton.addEventListener("click", function () {
    loadRepayments();
});


// Date recovery
recoverButton.addEventListener("click", function () {
    window.location.href = "date-recovery.html";
});


// Pagination
previousButton.addEventListener("click", function () {

    if (currentPage > 1) {
        currentPage--;
        displayRepayments();
    }

});


nextButton.addEventListener("click", function () {

    const totalPages =
        Math.ceil(repayments.length / recordsPerPage);

    if (currentPage < totalPages) {
        currentPage++;
        displayRepayments();
    }

});


function updatePagination() {

    const total = repayments.length;

    const start =
        total === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;

    const end =
        Math.min(currentPage * recordsPerPage, total);

    const totalPages =
        Math.ceil(total / recordsPerPage);

    document.getElementById("paginationStart").textContent = start;
    document.getElementById("paginationEnd").textContent = end;
    document.getElementById("paginationTotal").textContent = total;
    document.getElementById("currentPage").textContent = currentPage;

    previousButton.disabled = currentPage === 1;
    nextButton.disabled =
        currentPage >= totalPages || total === 0;

    document.getElementById("resultSummary").textContent =
        `${total} repayment record(s) found`;
}


// View repayment
function viewRepayment(id) {

    window.location.href =
        `date-recovery.html?id=${id}`;
}


// Export
exportButton.addEventListener("click", function () {

    if (repayments.length === 0) {
        alert("There are no repayment records to export.");
        return;
    }

    let csv = "Customer,Loan Number,Repayment Date,Amount,Payment Method,Reference,Receipt,Balance,Status\n";

    repayments.forEach(repayment => {

        csv += [
            repayment.customer,
            repayment.loan_number,
            repayment.repayment_date,
            repayment.amount,
            repayment.payment_method,
            repayment.reference_number,
            repayment.receipt_number,
            repayment.balance,
            repayment.status
        ].join(",") + "\n";

    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "repayments.csv";

    link.click();

    URL.revokeObjectURL(url);
});


// Start
loadRepayments();