
// ============================================================
// FINANCE DATE RECOVERY TOOL
// REPAYMENTS API
// routes/repayments.js
//


"use strict";

const express = require("express");

const db = require("../config/database");
const authenticateToken = require("../middleware/auth");

const router = express.Router();


// ============================================================
// HELPER: NORMALIZE NUMBER
// ============================================================

function normalizeNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    if (typeof value === "number") {

        return Number.isFinite(value)
            ? value
            : 0;
    }

    const cleaned =
        String(value)
            .replace(/,/g, "")
            .replace(/KES/gi, "")
            .replace(/KSH/gi, "")
            .trim();

    const number =
        Number(cleaned);

    return Number.isFinite(number)
        ? number
        : 0;
}


// ============================================================
// HELPER: NORMALIZE LOAN NUMBER
// ============================================================

function normalizeLoanNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    let loanNumber =
        String(value).trim();

    // Excel sometimes sends:
    // 12345.0
    //
    // Convert it to:
    // 12345

    if (
        /^\d+\.0$/.test(
            loanNumber
        )
    ) {

        loanNumber =
            loanNumber.replace(
                ".0",
                ""
            );
    }

    return loanNumber || null;
}


// ============================================================
// HELPER: NORMALIZE STATUS
// ============================================================

function normalizeStatus(value) {

    const status =
        String(value || "")
            .trim()
            .toLowerCase();

    if (status === "verified") {

        return "Verified";
    }

    return "Unverified";
}


// ============================================================
// HELPER: GET BODY VALUE
//
// Supports both:
//
// loan_number
//
// and:
//
// loanNumber
// ============================================================

function getBodyValue(
    body,
    snakeCase,
    camelCase
) {

    if (
        body[snakeCase] !== undefined
    ) {

        return body[snakeCase];
    }

    if (
        body[camelCase] !== undefined
    ) {

        return body[camelCase];
    }

    return null;
}


// ============================================================
// GET ALL REPAYMENTS
// GET /api/repayments
// ============================================================

router.get(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                customer,
                loanNumber,
                referenceNumber,
                receiptNumber,
                amount,
                paymentMethod,
                dateFrom,
                dateTo
            } = req.query;


            // ==================================================
            // BASE QUERY
            // ==================================================

            let sql = `

                SELECT

                    id,

                    customer,

                    loan_number,

                    repayment_date,

                    amount,

                    payment_method,

                    reference_number,

                    receipt_number,

                    balance,

                    status,

                    financial_record_id,

                    created_at,

                    updated_at

                FROM public.repayments

                WHERE 1 = 1

            `;


            const values = [];


            // ==================================================
            // CUSTOMER
            // ==================================================

            if (
                customer &&
                String(customer).trim() !== ""
            ) {

                values.push(
                    `%${String(customer).trim()}%`
                );

                sql += `
                    AND customer ILIKE $${values.length}
                `;
            }


            // ==================================================
            // LOAN NUMBER
            // ==================================================

            if (
                loanNumber &&
                String(loanNumber).trim() !== ""
            ) {

                values.push(
                    `%${String(loanNumber).trim()}%`
                );

                sql += `
                    AND CAST(loan_number AS TEXT)
                        ILIKE $${values.length}
                `;
            }


            // ==================================================
            // REFERENCE NUMBER
            // ==================================================

            if (
                referenceNumber &&
                String(referenceNumber).trim() !== ""
            ) {

                values.push(
                    `%${String(referenceNumber).trim()}%`
                );

                sql += `
                    AND reference_number ILIKE $${values.length}
                `;
            }


            // ==================================================
            // RECEIPT NUMBER
            // ==================================================

            if (
                receiptNumber &&
                String(receiptNumber).trim() !== ""
            ) {

                values.push(
                    `%${String(receiptNumber).trim()}%`
                );

                sql += `
                    AND receipt_number ILIKE $${values.length}
                `;
            }


            // ==================================================
            // AMOUNT
            // ==================================================

            if (
                amount !== undefined &&
                amount !== ""
            ) {

                const numericAmount =
                    normalizeNumber(amount);

                values.push(
                    numericAmount
                );

                sql += `
                    AND amount = $${values.length}
                `;
            }


            // ==================================================
            // PAYMENT METHOD
            // ==================================================

            if (
                paymentMethod &&
                String(paymentMethod).trim() !== ""
            ) {

                values.push(
                    String(paymentMethod).trim()
                );

                sql += `
                    AND payment_method = $${values.length}
                `;
            }


            // ==================================================
            // DATE FROM
            // ==================================================

            if (dateFrom) {

                values.push(
                    dateFrom
                );

                sql += `
                    AND repayment_date >= $${values.length}
                `;
            }


            // ==================================================
            // DATE TO
            // ==================================================

            if (dateTo) {

                values.push(
                    dateTo
                );

                sql += `
                    AND repayment_date <= $${values.length}
                `;
            }


            // ==================================================
            // ORDER
            // ==================================================

            sql += `

                ORDER BY

                    repayment_date DESC NULLS LAST,

                    id DESC

            `;


            // ==================================================
            // EXECUTE
            // ==================================================

            const result =
                await db.query(
                    sql,
                    values
                );


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                success: true,

                data: result.rows,

                count: result.rows.length

            });

        } catch (error) {

            console.error(
                "GET REPAYMENTS ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load repayment records.",

                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined

            });
        }
    }
);


// ============================================================
// GET SINGLE REPAYMENT
// GET /api/repayments/:id
// ============================================================

router.get(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            const result =
                await db.query(

                    `

                    SELECT

                        id,

                        customer,

                        loan_number,

                        repayment_date,

                        amount,

                        payment_method,

                        reference_number,

                        receipt_number,

                        balance,

                        status,

                        financial_record_id,

                        created_at,

                        updated_at

                    FROM public.repayments

                    WHERE id = $1

                    `,

                    [id]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Repayment record not found."

                });
            }


            return res.status(200).json({

                success: true,

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "GET SINGLE REPAYMENT ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to load repayment record.",

                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined

            });
        }
    }
);


// ============================================================
// CREATE REPAYMENT
// POST /api/repayments
// ============================================================

router.post(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            // ==================================================
            // READ BODY
            // ==================================================

            const customer =
                getBodyValue(
                    req.body,
                    "customer",
                    "customer"
                );


            const loanNumber =
                normalizeLoanNumber(
                    getBodyValue(
                        req.body,
                        "loan_number",
                        "loanNumber"
                    )
                );


            const repaymentDate =
                getBodyValue(
                    req.body,
                    "repayment_date",
                    "repaymentDate"
                );


            const amount =
                normalizeNumber(
                    getBodyValue(
                        req.body,
                        "amount",
                        "amount"
                    )
                );


            const paymentMethod =
                getBodyValue(
                    req.body,
                    "payment_method",
                    "paymentMethod"
                );


            const referenceNumber =
                getBodyValue(
                    req.body,
                    "reference_number",
                    "referenceNumber"
                );


            const receiptNumber =
                getBodyValue(
                    req.body,
                    "receipt_number",
                    "receiptNumber"
                );


            const balance =
                normalizeNumber(
                    getBodyValue(
                        req.body,
                        "balance",
                        "balance"
                    )
                );


            const status =
                normalizeStatus(
                    getBodyValue(
                        req.body,
                        "status",
                        "status"
                    )
                );


            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                !customer ||
                String(customer).trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer is required."

                });
            }


            if (!loanNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Loan number is required."

                });
            }


            if (
                !repaymentDate
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Repayment date is required."

                });
            }


            if (amount <= 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Repayment amount must be greater than zero."

                });
            }


            // ==================================================
            // FIND FINANCIAL RECORD
            // ==================================================

            let financialRecordId =
                null;


            const financialResult =
                await db.query(

                    `

                    SELECT id

                    FROM public.financial_records

                    WHERE TRIM(
                        CAST(loan_number AS TEXT)
                    ) = $1

                    ORDER BY id DESC

                    LIMIT 1

                    `,

                    [
                        loanNumber
                    ]
                );


            if (
                financialResult.rows.length > 0
            ) {

                financialRecordId =
                    financialResult
                        .rows[0]
                        .id;
            }


            // ==================================================
            // INSERT REPAYMENT
            // ==================================================

            const result =
                await db.query(

                    `

                    INSERT INTO public.repayments

                    (

                        customer,

                        loan_number,

                        repayment_date,

                        amount,

                        payment_method,

                        reference_number,

                        receipt_number,

                        balance,

                        status,

                        financial_record_id

                    )

                    VALUES

                    (

                        $1,

                        $2,

                        $3,

                        $4,

                        $5,

                        $6,

                        $7,

                        $8,

                        $9,

                        $10

                    )

                    RETURNING

                        id,

                        customer,

                        loan_number,

                        repayment_date,

                        amount,

                        payment_method,

                        reference_number,

                        receipt_number,

                        balance,

                        status,

                        financial_record_id,

                        created_at,

                        updated_at

                    `,

                    [

                        String(customer).trim(),

                        loanNumber,

                        repaymentDate,

                        amount,

                        paymentMethod
                            ? String(paymentMethod).trim()
                            : null,

                        referenceNumber
                            ? String(referenceNumber).trim()
                            : null,

                        receiptNumber
                            ? String(receiptNumber).trim()
                            : null,

                        balance,

                        status,

                        financialRecordId

                    ]
                );


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(201).json({

                success: true,

                message:
                    "Repayment created successfully.",

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "CREATE REPAYMENT ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to create repayment record.",

                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined

            });
        }
    }
);


// ============================================================
// UPDATE REPAYMENT
// PUT /api/repayments/:id
// ============================================================

router.put(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            // ==================================================
            // CHECK RECORD
            // ==================================================

            const existing =
                await db.query(

                    `

                    SELECT id

                    FROM public.repayments

                    WHERE id = $1

                    `,

                    [id]
                );


            if (
                existing.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Repayment record not found."

                });
            }


            // ==================================================
            // READ BODY
            // ==================================================

            const customer =
                getBodyValue(
                    req.body,
                    "customer",
                    "customer"
                );


            const loanNumber =
                normalizeLoanNumber(
                    getBodyValue(
                        req.body,
                        "loan_number",
                        "loanNumber"
                    )
                );


            const repaymentDate =
                getBodyValue(
                    req.body,
                    "repayment_date",
                    "repaymentDate"
                );


            const amount =
                normalizeNumber(
                    getBodyValue(
                        req.body,
                        "amount",
                        "amount"
                    )
                );


            const paymentMethod =
                getBodyValue(
                    req.body,
                    "payment_method",
                    "paymentMethod"
                );


            const referenceNumber =
                getBodyValue(
                    req.body,
                    "reference_number",
                    "referenceNumber"
                );


            const receiptNumber =
                getBodyValue(
                    req.body,
                    "receipt_number",
                    "receiptNumber"
                );


            const balance =
                normalizeNumber(
                    getBodyValue(
                        req.body,
                        "balance",
                        "balance"
                    )
                );


            const status =
                normalizeStatus(
                    getBodyValue(
                        req.body,
                        "status",
                        "status"
                    )
                );


            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                !customer ||
                String(customer).trim() === ""
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer is required."

                });
            }


            if (!loanNumber) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Loan number is required."

                });
            }


            if (!repaymentDate) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Repayment date is required."

                });
            }


            if (amount <= 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Repayment amount must be greater than zero."

                });
            }


            // ==================================================
            // FIND FINANCIAL RECORD
            // ==================================================

            let financialRecordId =
                null;


            const financialResult =
                await db.query(

                    `

                    SELECT id

                    FROM public.financial_records

                    WHERE TRIM(
                        CAST(loan_number AS TEXT)
                    ) = $1

                    ORDER BY id DESC

                    LIMIT 1

                    `,

                    [
                        loanNumber
                    ]
                );


            if (
                financialResult.rows.length > 0
            ) {

                financialRecordId =
                    financialResult
                        .rows[0]
                        .id;
            }


            // ==================================================
            // UPDATE
            // ==================================================

            const result =
                await db.query(

                    `

                    UPDATE public.repayments

                    SET

                        customer = $1,

                        loan_number = $2,

                        repayment_date = $3,

                        amount = $4,

                        payment_method = $5,

                        reference_number = $6,

                        receipt_number = $7,

                        balance = $8,

                        status = $9,

                        financial_record_id = $10,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE id = $11

                    RETURNING

                        id,

                        customer,

                        loan_number,

                        repayment_date,

                        amount,

                        payment_method,

                        reference_number,

                        receipt_number,

                        balance,

                        status,

                        financial_record_id,

                        created_at,

                        updated_at

                    `,

                    [

                        String(customer).trim(),

                        loanNumber,

                        repaymentDate,

                        amount,

                        paymentMethod
                            ? String(paymentMethod).trim()
                            : null,

                        referenceNumber
                            ? String(referenceNumber).trim()
                            : null,

                        receiptNumber
                            ? String(receiptNumber).trim()
                            : null,

                        balance,

                        status,

                        financialRecordId,

                        id

                    ]
                );


            return res.status(200).json({

                success: true,

                message:
                    "Repayment updated successfully.",

                data:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "UPDATE REPAYMENT ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to update repayment record.",

                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined

            });
        }
    }
);


// ============================================================
// DELETE REPAYMENT
// DELETE /api/repayments/:id
// ============================================================

router.delete(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            // ==================================================
            // CHECK RECORD
            // ==================================================

            const existing =
                await db.query(

                    `

                    SELECT id

                    FROM public.repayments

                    WHERE id = $1

                    `,

                    [id]
                );


            if (
                existing.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Repayment record not found."

                });
            }


            // ==================================================
            // DELETE
            // ==================================================

            await db.query(

                `

                DELETE FROM public.repayments

                WHERE id = $1

                `,

                [id]
            );


            // ==================================================
            // RESPONSE
            // ==================================================

            return res.status(200).json({

                success: true,

                message:
                    "Repayment deleted successfully."

            });

        } catch (error) {

            console.error(
                "DELETE REPAYMENT ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Unable to delete repayment record.",

                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined

            });
        }
    }
);


