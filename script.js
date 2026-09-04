
"use strict";

/* ============================================================
   FINANCE DATE RECOVERY TOOL
   SHARED FRONTEND SCRIPT
   ============================================================ */


/* ============================================================
   API CONFIGURATION
   ============================================================ */

const API_BASE_URL = "https://finance-date-recovery-backend.onrender.com/api";

const APP_CONFIG = {
    appName: "Finance Date Recovery Tool",
    apiBaseUrl: API_BASE_URL,
    requestTimeout: 30000,
    storagePrefix: "financeRecovery_"
};


/* ============================================================
   API URL
   ============================================================ */

function apiUrl(endpoint = "") {

    endpoint = String(endpoint).replace(/^\/+/, "");

    return endpoint
        ? `${API_BASE_URL}/${endpoint}`
        : API_BASE_URL;
}


/* ============================================================
   AUTHENTICATION STORAGE
   ============================================================ */

function getAuthToken() {

    return localStorage.getItem(
        APP_CONFIG.storagePrefix + "token"
    );
}


function setAuthToken(token) {

    if (token) {

        localStorage.setItem(
            APP_CONFIG.storagePrefix + "token",
            token
        );
    }
}


function removeAuthToken() {

    localStorage.removeItem(
        APP_CONFIG.storagePrefix + "token"
    );
}


/* ============================================================
   CURRENT USER
   ============================================================ */

function getCurrentUser() {

    const user = localStorage.getItem(
        APP_CONFIG.storagePrefix + "user"
    );

    if (!user) {
        return null;
    }

    try {

        return JSON.parse(user);

    } catch (error) {

        console.error(
            "Unable to read user:",
            error
        );

        return null;
    }
}


function setCurrentUser(user) {

    if (!user) {
        return;
    }

    localStorage.setItem(
        APP_CONFIG.storagePrefix + "user",
        JSON.stringify(user)
    );
}


function removeCurrentUser() {

    localStorage.removeItem(
        APP_CONFIG.storagePrefix + "user"
    );
}


/* ============================================================
   LOGIN STATUS
   ============================================================ */

function isLoggedIn() {

    return getCurrentUser() !== null;
}


/* ============================================================
   AUTHORIZATION HEADERS
   ============================================================ */

function getAuthHeaders() {

    const headers = {};

    const token = getAuthToken();

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
}


/* ============================================================
   MAIN API REQUEST
   ============================================================ */

async function apiRequest(
    endpoint,
    options = {}
) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(() => {

            controller.abort();

        }, APP_CONFIG.requestTimeout);


    try {

        const method =
            options.method || "GET";


        const headers = {

            ...getAuthHeaders(),

            ...(options.headers || {})
        };


        let body =
            options.body;


        /* ----------------------------------------------------
           JSON BODY
           ---------------------------------------------------- */

        if (
            body &&
            typeof body === "object" &&
            !(body instanceof FormData) &&
            !(body instanceof Blob)
        ) {

            body =
                JSON.stringify(body);

            headers["Content-Type"] =
                "application/json";
        }


        /* ----------------------------------------------------
           FETCH
           ---------------------------------------------------- */

        const response =
            await fetch(
                apiUrl(endpoint),
                {
                    method,
                    headers,
                    body,
                    signal:
                        controller.signal
                }
            );


        /* ----------------------------------------------------
           READ RESPONSE
           ---------------------------------------------------- */

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data;


        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            data =
                await response.text();
        }


        /* ----------------------------------------------------
           HTTP ERROR
           ---------------------------------------------------- */

        if (!response.ok) {

            const message =
                data?.message ||
                data?.error ||
                `API request failed (${response.status})`;


            const error =
                new Error(message);


            error.status =
                response.status;

            error.data =
                data;


            throw error;
        }


        return data;


    } catch (error) {


        /* ----------------------------------------------------
           TIMEOUT
           ---------------------------------------------------- */

        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "The request took too long. Please check the Node.js server."
            );
        }


        /* ----------------------------------------------------
           CONNECTION ERROR
           ---------------------------------------------------- */

        if (
            error instanceof TypeError
        ) {

            throw new Error(
                "Unable to connect to the Node.js API. Make sure the backend server is running."
            );
        }


        throw error;


    } finally {

        clearTimeout(timeout);
    }
}


/* ============================================================
   GET
   ============================================================ */

async function apiGet(
    endpoint,
    options = {}
) {

    return await apiRequest(
        endpoint,
        {
            ...options,
            method: "GET"
        }
    );
}


/* ============================================================
   POST
   ============================================================ */

async function apiPost(
    endpoint,
    data = {}
) {

    return await apiRequest(
        endpoint,
        {
            method: "POST",
            body: data
        }
    );
}


/* ============================================================
   PUT
   ============================================================ */

async function apiPut(
    endpoint,
    data = {}
) {

    return await apiRequest(
        endpoint,
        {
            method: "PUT",
            body: data
        }
    );
}


/* ============================================================
   PATCH
   ============================================================ */

async function apiPatch(
    endpoint,
    data = {}
) {

    return await apiRequest(
        endpoint,
        {
            method: "PATCH",
            body: data
        }
    );
}


/* ============================================================
   DELETE
   ============================================================ */

async function apiDelete(
    endpoint
) {

    return await apiRequest(
        endpoint,
        {
            method: "DELETE"
        }
    );
}


/* ============================================================
   FILE UPLOAD
   ============================================================ */

async function apiUpload(
    endpoint,
    formData
) {

    if (
        !(formData instanceof FormData)
    ) {

        throw new Error(
            "apiUpload requires FormData."
        );
    }


    return await apiRequest(
        endpoint,
        {
            method: "POST",
            body: formData
        }
    );
}


/* ============================================================
   LOGIN
   ============================================================ */

async function loginUser(
    username,
    password
) {

    const response =
        await apiPost(
            "login",
            {
                username,
                password
            }
        );


    /* Save token */

    if (
        response &&
        response.token
    ) {

        setAuthToken(
            response.token
        );
    }


    /* Save logged-in user */

    if (
        response &&
        response.user
    ) {

        setCurrentUser(
            response.user
        );
    }


    return response;
}


/* ============================================================
   LOGOUT
   ============================================================ */

async function logoutUser() {

    removeAuthToken();

    removeCurrentUser();

    window.location.href =
        "index.html";
}


/* ============================================================
   REQUIRE LOGIN
   ============================================================ */

function requireAuthentication() {

    if (!isLoggedIn()) {

        window.location.href =
            "index.html";

        return false;
    }

    return true;
}


/* ============================================================
   LOGOUT BUTTONS
   ============================================================ */

function initializeLogoutButtons() {

    const buttons =
        document.querySelectorAll(
            "#logoutButton, .logout-button, [data-action='logout']"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                logoutUser();
            }
        );

    });
}


/* ============================================================
   GLOBAL NOTIFICATION SYSTEM
   ============================================================ */

/*
   Usage:

   showNotification(
       "Upload Successful",
       "The file was uploaded successfully.",
       "success"
   );

   Types:

   success
   error
   warning
   info
   loading
*/


let notificationContainer = null;


/* ============================================================
   CREATE NOTIFICATION CONTAINER
   ============================================================ */

function getNotificationContainer() {

    if (notificationContainer) {

        return notificationContainer;
    }


    notificationContainer =
        document.createElement("div");


    notificationContainer.id =
        "globalNotificationContainer";


    notificationContainer.className =
        "global-notification-container";


    document.body.appendChild(
        notificationContainer
    );


    return notificationContainer;
}


/* ============================================================
   NOTIFICATION ICON
   ============================================================ */

function getNotificationIcon(
    type
) {

    switch (type) {

        case "success":
            return "✓";

        case "error":
            return "×";

        case "warning":
            return "!";

        case "loading":
            return "⟳";

        case "info":
        default:
            return "i";
    }
}


/* ============================================================
   NOTIFICATION TITLE
   ============================================================ */

function getNotificationTitle(
    type
) {

    switch (type) {

        case "success":
            return "Success";

        case "error":
            return "Error";

        case "warning":
            return "Warning";

        case "loading":
            return "Please wait";

        case "info":
        default:
            return "Information";
    }
}


/* ============================================================
   SHOW NOTIFICATION
   ============================================================ */

function showNotification(
    title,
    message,
    type = "info",
    duration = 4000
) {

    /*
       Backwards compatibility:

       If called like:

       showNotification(
           "Something went wrong",
           "error"
       );

       it will still work.
    */

    if (
        (
            type === "info" ||
            type === "success" ||
            type === "error" ||
            type === "warning" ||
            type === "loading"
        ) &&
        arguments.length === 2
    ) {

        type = message;
        message = title;
        title = getNotificationTitle(type);
    }


    const container =
        getNotificationContainer();


    /* --------------------------------------------------------
       CREATE NOTIFICATION
       -------------------------------------------------------- */

    const notification =
        document.createElement("div");


    notification.className =
        `global-notification ${type}`;


    notification.setAttribute(
        "role",
        "alert"
    );


    /* --------------------------------------------------------
       ICON
       -------------------------------------------------------- */

    const icon =
        document.createElement("div");


    icon.className =
        "notification-icon";


    icon.textContent =
        getNotificationIcon(type);


    /* --------------------------------------------------------
       CONTENT
       -------------------------------------------------------- */

    const content =
        document.createElement("div");


    content.className =
        "notification-content";


    const titleElement =
        document.createElement("div");


    titleElement.className =
        "notification-title";


    titleElement.textContent =
        title;


    const messageElement =
        document.createElement("div");


    messageElement.className =
        "notification-message";


    messageElement.textContent =
        message;


    content.appendChild(
        titleElement
    );


    content.appendChild(
        messageElement
    );


    /* --------------------------------------------------------
       CLOSE BUTTON
       -------------------------------------------------------- */

    const closeButton =
        document.createElement("button");


    closeButton.type =
        "button";


    closeButton.className =
        "notification-close";


    closeButton.setAttribute(
        "aria-label",
        "Close notification"
    );


    closeButton.innerHTML =
        "&times;";


    /* --------------------------------------------------------
       BUILD NOTIFICATION
       -------------------------------------------------------- */

    notification.appendChild(
        icon
    );


    notification.appendChild(
        content
    );


    notification.appendChild(
        closeButton
    );


    container.appendChild(
        notification
    );


    /* --------------------------------------------------------
       SHOW ANIMATION
       -------------------------------------------------------- */

    requestAnimationFrame(() => {

        notification.classList.add(
            "notification-visible"
        );

    });


    /* --------------------------------------------------------
       CLOSE FUNCTION
       -------------------------------------------------------- */

    let closed = false;


    function closeNotification() {

        if (closed) {
            return;
        }


        closed = true;


        notification.classList.remove(
            "notification-visible"
        );


        notification.classList.add(
            "notification-hide"
        );


        setTimeout(() => {

            if (
                notification.parentNode
            ) {

                notification.remove();
            }

        }, 300);
    }


    /* --------------------------------------------------------
       CLOSE BUTTON
       -------------------------------------------------------- */

    closeButton.addEventListener(
        "click",
        closeNotification
    );


    /* --------------------------------------------------------
       AUTOMATIC CLOSE
       -------------------------------------------------------- */

    if (
        duration > 0 &&
        type !== "loading"
    ) {

        setTimeout(
            closeNotification,
            duration
        );
    }


    /* Return notification */

    return {
        element: notification,
        close: closeNotification
    };
}


/* ============================================================
   SHORTCUT NOTIFICATIONS
   ============================================================ */

function showSuccess(
    message,
    title = "Success"
) {

    return showNotification(
        title,
        message,
        "success"
    );
}


function showError(
    message,
    title = "Error"
) {

    return showNotification(
        title,
        message,
        "error"
    );
}


function showWarning(
    message,
    title = "Warning"
) {

    return showNotification(
        title,
        message,
        "warning"
    );
}


function showInfo(
    message,
    title = "Information"
) {

    return showNotification(
        title,
        message,
        "info"
    );
}


function showLoading(
    message,
    title = "Please wait"
) {

    return showNotification(
        title,
        message,
        "loading",
        0
    );
}


/* ============================================================
   LOADING
   ============================================================ */

function setLoading(
    element,
    loading,
    loadingText = "Loading..."
) {

    if (!element) {
        return;
    }


    if (loading) {

        if (
            !element.dataset.originalText
        ) {

            element.dataset.originalText =
                element.textContent;
        }


        element.disabled =
            true;


        element.textContent =
            loadingText;


    } else {

        element.disabled =
            false;


        if (
            element.dataset.originalText
        ) {

            element.textContent =
                element.dataset.originalText;
        }
    }
}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

function escapeHtml(
    value
) {

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


/* ============================================================
   FORMAT CURRENCY
   ============================================================ */

function formatCurrency(
    amount
) {

    if (
        amount === null ||
        amount === undefined ||
        amount === ""
    ) {

        amount = 0;
    }


    const number =
        Number(
            String(amount)
                .replace(/,/g, "")
                .replace(/KES/gi, "")
                .trim()
        );


    if (isNaN(number)) {

        return "KES 0.00";
    }


    return new Intl.NumberFormat(
        "en-KE",
        {
            style: "currency",
            currency: "KES"
        }
    ).format(number);
}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(
    value
) {

    if (!value) {

        return "—";
    }


    const date =
        new Date(value);


    if (
        isNaN(date.getTime())
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


/* ============================================================
   LOCAL STORAGE
   ============================================================ */

function saveLocalData(
    key,
    value
) {

    try {

        localStorage.setItem(
            APP_CONFIG.storagePrefix + key,
            JSON.stringify(value)
        );


        return true;


    } catch (error) {

        console.error(
            "Unable to save local data:",
            error
        );


        return false;
    }
}


function getLocalData(
    key,
    defaultValue = null
) {

    try {

        const value =
            localStorage.getItem(
                APP_CONFIG.storagePrefix + key
            );


        if (
            value === null
        ) {

            return defaultValue;
        }


        return JSON.parse(
            value
        );


    } catch (error) {

        console.error(
            "Unable to read local data:",
            error
        );


        return defaultValue;
    }
}


function removeLocalData(
    key
) {

    localStorage.removeItem(
        APP_CONFIG.storagePrefix + key
    );
}


/* ============================================================
   API HEALTH CHECK
   ============================================================ */

async function checkApiConnection() {

    try {

        const response =
            await apiGet("");


        console.log(
            "Node.js API connection successful:",
            response
        );


        return true;


    } catch (error) {

        console.error(
            "Node.js API connection failed:",
            error
        );


        return false;
    }
}


/* ============================================================
   PAGE INITIALIZATION
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeLogoutButtons();


        console.log(
            `${APP_CONFIG.appName} initialized.`
        );


        console.log(
            "Node.js API:",
            APP_CONFIG.apiBaseUrl
        );

    }
);


/* ============================================================
   GLOBAL APPLICATION OBJECT
   ============================================================ */

window.FinanceRecovery = {

    /* Configuration */

    config:
        APP_CONFIG,


    /* API */

    apiUrl,
    apiRequest,
    apiGet,
    apiPost,
    apiPut,
    apiPatch,
    apiDelete,
    apiUpload,


    /* Authentication */

    loginUser,
    logoutUser,
    isLoggedIn,
    requireAuthentication,

    getAuthToken,
    setAuthToken,
    removeAuthToken,


    /* User */

    getCurrentUser,
    setCurrentUser,
    removeCurrentUser,


    /* Notifications */

    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,


    /* UI */

    setLoading,
    escapeHtml,


    /* Formatting */

    formatCurrency,
    formatDate,


    /* Local storage */

    saveLocalData,
    getLocalData,
    removeLocalData,


    /* API */

    checkApiConnection

};

