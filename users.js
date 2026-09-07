// ============================================================
// FINANCE DATE RECOVERY TOOL
// users.js
// Frontend User Management
// ============================================================

"use strict";


// ============================================================
// ELEMENTS
// ============================================================

const usersTable = document.getElementById("usersTable");
const usersBody = document.getElementById("usersBody");
const emptyState = document.getElementById("emptyState");

const addUserButton = document.getElementById("addUserButton");
const userForm = document.getElementById("userForm");
const saveUserButton = document.getElementById("saveUserButton");
const cancelUserButton = document.getElementById("cancelUserButton");

const userName = document.getElementById("userName");
const userUsername = document.getElementById("userUsername");
const userPassword = document.getElementById("userPassword");
const userRole = document.getElementById("userRole");


// ============================================================
// API URL
// ============================================================

const USERS_API =
    "https://finance-date-recovery-backend.onrender.com/api/users";


// ============================================================
// CURRENT EDITING USER
// ============================================================

let editingUserId = null;


// ============================================================
// NOTIFICATION HELPER
// ============================================================

function notify(title, message, type = "success") {

    // Use the notification system from script.js
    if (typeof showNotification === "function") {

        showNotification(
            title,
            message,
            type
        );

        return;
    }

    // Fallback if showNotification does not exist
    alert(`${title}\n\n${message}`);
}


// ============================================================
// AUTHORIZATION HEADER
// ============================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
}


// ============================================================
// LOAD USERS
// ============================================================

async function loadUsers() {

    try {

        const response =
            await apiGet("users");


        // ----------------------------------------------------
        // ERROR
        // ----------------------------------------------------

        if (!response.success) {

            notify(
                "Unable to Load Users",
                response.message ||
                "Users could not be loaded.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // NO USERS
        // ----------------------------------------------------

        if (
            !response.data ||
            response.data.length === 0
        ) {

            emptyState.style.display =
                "block";

            usersTable.style.display =
                "none";

            return;
        }


        // ----------------------------------------------------
        // SHOW TABLE
        // ----------------------------------------------------

        emptyState.style.display =
            "none";

        usersTable.style.display =
            "block";

        usersBody.innerHTML = "";


        // ----------------------------------------------------
        // DISPLAY USERS
        // ----------------------------------------------------

        response.data.forEach(user => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${escapeHTML(user.name)}
                </td>

                <td>
                    ${escapeHTML(user.username)}
                </td>

                <td>
                    ${escapeHTML(user.role)}
                </td>

                <td>
                    <span class="status-badge">
                        ${escapeHTML(user.status)}
                    </span>
                </td>

                <td>
                    ${escapeHTML(user.date_created || "")}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-primary edit-user-button"
                        data-id="${user.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="btn change-password-button"
                        data-id="${user.id}"
                    >
                        Password
                    </button>

                    <button
                        type="button"
                        class="btn delete-user-button"
                        data-id="${user.id}"
                        data-name="${escapeHTML(user.name)}"
                    >
                        Delete
                    </button>

                </td>
            `;


            usersBody.appendChild(row);

        });


        // ----------------------------------------------------
        // ADD BUTTON EVENTS
        // ----------------------------------------------------

        document
            .querySelectorAll(".edit-user-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                this.dataset.id
                            );

                        editUser(id);
                    }
                );

            });


        document
            .querySelectorAll(".change-password-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                this.dataset.id
                            );

                        changePassword(id);
                    }
                );

            });


        document
            .querySelectorAll(".delete-user-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                this.dataset.id
                            );

                        const name =
                            this.dataset.name;

                        deleteUser(
                            id,
                            name
                        );
                    }
                );

            });

    } catch (error) {

        console.error(
            "Load users error:",
            error
        );

        notify(
            "Connection Error",
            "Unable to connect to the server.",
            "error"
        );
    }
}


// ============================================================
// ADD USER BUTTON
// ============================================================

addUserButton.addEventListener(
    "click",
    function () {

        editingUserId = null;

        clearUserForm();

        userForm.style.display =
            "block";

        // Change heading
        const heading =
            userForm.querySelector("h3");

        if (heading) {
            heading.textContent =
                "Add New User";
        }

        saveUserButton.textContent =
            "Save User";
    }
);


// ============================================================
// CANCEL FORM
// ============================================================

cancelUserButton.addEventListener(
    "click",
    function () {

        editingUserId = null;

        clearUserForm();

        userForm.style.display =
            "none";
    }
);


// ============================================================
// SAVE USER
// ADD OR EDIT
// ============================================================

saveUserButton.addEventListener(
    "click",
    async function () {

        const name =
            userName.value.trim();

        const username =
            userUsername.value.trim();

        const password =
            userPassword.value;

        const role =
            userRole.value;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!name || !username || !role) {

            notify(
                "Missing Information",
                "Please fill in the name, username and role.",
                "warning"
            );

            return;
        }


        // Password is required only when adding
        if (
            editingUserId === null &&
            !password
        ) {

            notify(
                "Missing Password",
                "Please enter a password.",
                "warning"
            );

            return;
        }


        try {

            saveUserButton.disabled =
                true;

            saveUserButton.textContent =
                editingUserId === null
                    ? "Saving..."
                    : "Updating...";


            // =================================================
            // ADD USER
            // =================================================

            if (editingUserId === null) {

                const user = {

                    name: name,

                    username: username,

                    password: password,

                    role: role

                };


                const response =
                    await apiPost(
                        "users",
                        user
                    );


                if (!response.success) {

                    notify(
                        "User Not Added",
                        response.message ||
                        "Unable to create user.",
                        "error"
                    );

                    return;
                }


                notify(
                    "User Added",
                    "User was created successfully.",
                    "success"
                );

            }


            // =================================================
            // EDIT USER
            // =================================================

            else {

                const response =
                    await fetch(
                        `${USERS_API}/${editingUserId}`,
                        {
                            method: "PUT",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify({
                                    name,
                                    username,
                                    role,
                                    status: "Active"
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!data.success) {

                    notify(
                        "Update Failed",
                        data.message ||
                        "Unable to update user.",
                        "error"
                    );

                    return;
                }


                notify(
                    "User Updated",
                    "User details were updated successfully.",
                    "success"
                );
            }


            // ------------------------------------------------
            // RESET FORM
            // ------------------------------------------------

            editingUserId = null;

            clearUserForm();

            userForm.style.display =
                "none";


            // ------------------------------------------------
            // REFRESH USERS
            // ------------------------------------------------

            await loadUsers();

        } catch (error) {

            console.error(
                "Save user error:",
                error
            );

            notify(
                "Server Error",
                "Unable to connect to the server.",
                "error"
            );

        } finally {

            saveUserButton.disabled =
                false;

            saveUserButton.textContent =
                "Save User";
        }
    }
);


// ============================================================
// EDIT USER
// ============================================================

async function editUser(id) {

    try {

        const response =
            await apiGet("users");


        if (
            !response.success ||
            !response.data
        ) {

            notify(
                "Error",
                "Unable to load user information.",
                "error"
            );

            return;
        }


        const user =
            response.data.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!user) {

            notify(
                "User Not Found",
                "The selected user could not be found.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // FILL FORM
        // ----------------------------------------------------

        editingUserId =
            Number(user.id);

        userName.value =
            user.name || "";

        userUsername.value =
            user.username || "";

        userPassword.value =
            "";

        userRole.value =
            user.role || "Staff";


        // ----------------------------------------------------
        // CHANGE FORM TITLE
        // ----------------------------------------------------

        const heading =
            userForm.querySelector("h3");

        if (heading) {

            heading.textContent =
                "Edit User";
        }


        saveUserButton.textContent =
            "Update User";


        userForm.style.display =
            "block";


        // Scroll to form
        userForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {

        console.error(
            "Edit user error:",
            error
        );

        notify(
            "Error",
            "Unable to load user information.",
            "error"
        );
    }
}


// ============================================================
// CHANGE PASSWORD
// ============================================================

async function changePassword(id) {

    try {

        const response =
            await apiGet("users");


        if (
            !response.success ||
            !response.data
        ) {

            notify(
                "Error",
                "Unable to load user information.",
                "error"
            );

            return;
        }


        const user =
            response.data.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!user) {

            notify(
                "User Not Found",
                "The selected user could not be found.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // ASK FOR NEW PASSWORD
        // ----------------------------------------------------

        const newPassword =
            prompt(
                `Enter a new password for ${user.username}:`
            );


        if (newPassword === null) {
            return;
        }


        const password =
            newPassword.trim();


        if (!password) {

            notify(
                "Invalid Password",
                "Password cannot be empty.",
                "warning"
            );

            return;
        }


        if (password.length < 6) {

            notify(
                "Password Too Short",
                "Password must be at least 6 characters long.",
                "warning"
            );

            return;
        }


        // ----------------------------------------------------
        // CONFIRM PASSWORD
        // ----------------------------------------------------

        const confirmation =
            prompt(
                "Enter the new password again to confirm:"
            );


        if (confirmation === null) {
            return;
        }


        if (
            confirmation !==
            password
        ) {

            notify(
                "Passwords Do Not Match",
                "The two passwords are different.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // SEND REQUEST
        // ----------------------------------------------------

        const updateResponse =
            await fetch(
                `${USERS_API}/${id}/password`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify({
                            password:
                                password
                        })
                }
            );


        const data =
            await updateResponse.json();


        if (!data.success) {

            notify(
                "Password Change Failed",
                data.message ||
                "Unable to change password.",
                "error"
            );

            return;
        }


        notify(
            "Password Changed",
            `Password for ${user.username} was changed successfully.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        notify(
            "Server Error",
            "Unable to change the password.",
            "error"
        );
    }
}


// ============================================================
// DELETE USER
// ============================================================

async function deleteUser(
    id,
    name
) {

    // --------------------------------------------------------
    // CONFIRMATION
    // --------------------------------------------------------

    const confirmed =
        confirm(
            `Are you sure you want to delete user "${name}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${USERS_API}/${id}`,
                {
                    method: "DELETE",

                    headers:
                        getAuthHeaders()
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            notify(
                "Delete Failed",
                data.message ||
                "Unable to delete user.",
                "error"
            );

            return;
        }


        notify(
            "User Deleted",
            `${name} was deleted successfully.`,
            "success"
        );


        // ----------------------------------------------------
        // REFRESH TABLE
        // ----------------------------------------------------

        await loadUsers();

    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        notify(
            "Server Error",
            "Unable to connect to the server.",
            "error"
        );
    }
}


// ============================================================
// CLEAR USER FORM
// ============================================================

function clearUserForm() {

    userName.value =
        "";

    userUsername.value =
        "";

    userPassword.value =
        "";

    userRole.value =
        "Administrator";
}


// ============================================================
// ESCAPE HTML
// Prevents user data from being interpreted as HTML
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// START
// ============================================================

loadUsers();