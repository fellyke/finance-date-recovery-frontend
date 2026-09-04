// users.js

const usersTable = document.getElementById("usersTable");
const usersBody = document.getElementById("usersBody");
const emptyState = document.querySelector(".empty-state");

const addUserButton = document.getElementById("addUserButton");
const userForm = document.getElementById("userForm");
const saveUserButton = document.getElementById("saveUserButton");
const cancelUserButton = document.getElementById("cancelUserButton");

// Load users
async function loadUsers() {
    try {
        const response = await apiGet("users");

        if (response.success && response.data.length > 0) {
            emptyState.style.display = "none";
            usersTable.style.display = "block";

            usersBody.innerHTML = "";

            response.data.forEach(user => {
                usersBody.innerHTML += `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.username}</td>
                        <td>${user.role}</td>
                        <td>${user.status}</td>
                        <td>${user.date_created}</td>
                        <td>
                            <button class="btn btn-primary">
                                Edit
                            </button>
                        </td>
                    </tr>
                `;
            });
        } else {
            emptyState.style.display = "block";
            usersTable.style.display = "none";
        }

    } catch (error) {
        console.error(error);
    }
}

// Show form
addUserButton.addEventListener("click", function () {
    userForm.style.display = "block";
});

// Cancel form
cancelUserButton.addEventListener("click", function () {
    userForm.style.display = "none";
});

// Save user
saveUserButton.addEventListener("click", async function () {

    const user = {
        name: document.getElementById("userName").value,
        username: document.getElementById("userUsername").value,
        password: document.getElementById("userPassword").value,
        role: document.getElementById("userRole").value
    };

    if (!user.name || !user.username || !user.password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await apiPost("users", user);

        if (response.success) {
            alert("User added successfully.");

            userForm.style.display = "none";

            document.getElementById("userName").value = "";
            document.getElementById("userUsername").value = "";
            document.getElementById("userPassword").value = "";

            loadUsers();
        } else {
            alert(response.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
});

// Start
loadUsers();