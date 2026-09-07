
// ============================================================
// FINANCE DATE RECOVERY TOOL
// index.js
// LOGIN
// ============================================================

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loginButton = document.getElementById("loginButton");


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
        // READ API RESPONSE
        // ----------------------------------------------------

        const data = await response.json();

        console.log("Login response:", data);


        // ----------------------------------------------------
        // LOGIN SUCCESSFUL
        // ----------------------------------------------------

        if (data.success) {


            // ------------------------------------------------
            // CHECK THAT TOKEN EXISTS
            // ------------------------------------------------

            if (!data.token) {

                console.error(
                    "Login succeeded but no JWT token was returned."
                );

                errorMessage.textContent =
                    "Login succeeded, but the server did not return an authorization token.";

                // Restore button
                loginButton.disabled = false;
                loginButton.textContent = "Login";

                return;
            }


            // ------------------------------------------------
            // SAVE JWT TOKEN
            // ------------------------------------------------

            localStorage.setItem(
                "token",
                data.token
            );


            // ------------------------------------------------
            // SAVE USER INFORMATION
            // ------------------------------------------------

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            console.log("JWT token saved.");
            console.log("User saved.");


            // ------------------------------------------------
            // GO TO DASHBOARD
            // ------------------------------------------------

            window.location.href =
                "dashboard.html";

        } else {

            // ------------------------------------------------
            // LOGIN FAILED
            // ------------------------------------------------

            errorMessage.textContent =
                data.message || "Invalid username or password.";

            // Restore button
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        errorMessage.textContent =
            "Unable to connect to the server.";

        // Restore button
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }

});

