// settings.js

const settingsForm = document.getElementById("settingsForm");

settingsForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const settings = {
        systemName: document.getElementById("systemName").value,
        recordsPerPage: document.getElementById("recordsPerPage").value
    };

    try {
        const response = await apiPost("settings", settings);

        if (response.success) {
            alert("Settings saved successfully.");
        } else {
            alert(response.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to the server.");
    }
});