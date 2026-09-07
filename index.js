"use strict";

// ============================================================
// FINANCE DATE RECOVERY TOOL
// index.js
// LOGIN
// ============================================================

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loginButton = document.getElementById("loginButton");


// ============================================================
// CHECK ELEMENTS
// ============================================================

if (!loginForm) {
    console.error("Login form not found.");
}


// ============================================================
// LOGIN FORM
// ============================================================

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value;


    // --------------------------------------------------------
    // CLEAR PREVIOUS ERROR
    // --------------------------------------------------------

    errorMessage.textContent = "";


    // --------------------------------------------------------
    // VALIDATE INPUT
    // --------------------------------------------------------

    if (!username || !password) {

        errorMessage.textContent =
            "Please enter your username and password.";

        return;
    }


    // --------------------------------------------------------
    // SHOW LOADING
    // --------------------------------------------------------

    loginButton.disabled = true;
    loginButton.textContent = "Loading...";


    // --------------------------------------------------------
    // SEND LOGIN REQUEST
    // --------------------------------------------------------

    try {

        const response = await fetch(
            "https://finance-date-recovery-backend.onrender.com/api/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        // ----------------------------------------------------
        // READ RESPONSE
        // ----------------------------------------------------

        const data = await response.json();

        console.log("Login response:", data);


        // ----------------------------------------------------
        // LOGIN SUCCESSFUL
        // ----------------------------------------------------

        if (response.ok && data.success) {


            // ------------------------------------------------
            // CHECK JWT TOKEN
            // ------------------------------------------------

            if (!data.token) {

                console.error(
                    "Login succeeded but no JWT token was returned."
                );

                errorMessage.textContent =
                    "Login succeeded, but no authorization token was returned.";

                loginButton.disabled = false;
                loginButton.textContent = "Login";

                return;
            }


            // ------------------------------------------------
            // SAVE TOKEN
            //
            // IMPORTANT:
            // These names MUST match script.js
            // ------------------------------------------------

            localStorage.setItem(
                "financeRecovery_token",
                data.token
            );


            // ------------------------------------------------
            // SAVE USER
            //
            // IMPORTANT:
            // These names MUST match script.js
            // ------------------------------------------------

            localStorage.setItem(
                "financeRecovery_user",
                JSON.stringify(data.user)
            );


            // ------------------------------------------------
            // VERIFY STORAGE
            // ------------------------------------------------

            console.log(
                "JWT token saved:",
                !!localStorage.getItem(
                    "financeRecovery_token"
                )
            );

            console.log(
                "User saved:",
                !!localStorage.getItem(
                    "financeRecovery_user"
                )
            );


            // ------------------------------------------------
            // GO TO DASHBOARD
            // ------------------------------------------------

            window.location.href =
                "dashboard.html";

            return;
        }


        // ----------------------------------------------------
        // LOGIN FAILED
        // ----------------------------------------------------

        errorMessage.textContent =
            data.message ||
            "Invalid username or password.";

        loginButton.disabled = false;
        loginButton.textContent = "Login";


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        errorMessage.textContent =
            "Unable to connect to the server.";

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }

});