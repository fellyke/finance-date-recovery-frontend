
// ============================================================
// FINANCE DATE RECOVERY TOOL
// index.js
// LOGIN
// ============================================================

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");


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
    // SEND LOGIN REQUEST
    // --------------------------------------------------------

    try {

        const response = await fetch(
            "http://localhost:5000/api/login",
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
        }


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        errorMessage.textContent =
            "Unable to connect to the server.";
    }

});

