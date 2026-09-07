
// ============================================================
// FINANCE DATE RECOVERY TOOL
// SETTINGS FRONTEND
// settings.js
// ============================================================

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const settingsForm =
        document.getElementById("settingsForm");

    if (!settingsForm) {
        console.error("Settings form not found.");
        return;
    }


    // ========================================================
    // LOAD CURRENT SETTINGS
    // ========================================================

    async function loadSettings() {

        try {

            const response =
                await apiGet("settings");

            if (!response || !response.success) {

                throw new Error(
                    response?.message ||
                    "Unable to load settings."
                );
            }


            const settings =
                response.data || {};


            const systemName =
                document.getElementById("systemName");

            const recordsPerPage =
                document.getElementById("recordsPerPage");


            if (systemName && settings.systemName) {

                systemName.value =
                    settings.systemName;
            }


            if (
                recordsPerPage &&
                settings.recordsPerPage !== undefined
            ) {

                recordsPerPage.value =
                    settings.recordsPerPage;
            }


        } catch (error) {

            console.error(
                "LOAD SETTINGS ERROR:",
                error
            );


            if (error.status === 401) {

                showError(
                    "Your login session has expired. Please log in again."
                );

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 1500);

                return;
            }


            showError(
                error.message ||
                "Unable to load settings."
            );
        }
    }


    // ========================================================
    // SAVE SETTINGS
    // ========================================================

    settingsForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const systemName =
                document.getElementById("systemName");

            const recordsPerPage =
                document.getElementById("recordsPerPage");


            if (!systemName || !recordsPerPage) {

                showError(
                    "Settings fields could not be found."
                );

                return;
            }


            const settings = {

                systemName:
                    systemName.value.trim(),

                recordsPerPage:
                    recordsPerPage.value
            };


            if (!settings.systemName) {

                showWarning(
                    "Please enter the system name."
                );

                systemName.focus();

                return;
            }


            if (!settings.recordsPerPage) {

                showWarning(
                    "Please select the records per page."
                );

                recordsPerPage.focus();

                return;
            }


            const submitButton =
                settingsForm.querySelector(
                    'button[type="submit"]'
                );


            try {

                if (submitButton) {

                    setLoading(
                        submitButton,
                        true,
                        "Saving..."
                    );
                }


                const response =
                    await apiPost(
                        "settings",
                        settings
                    );


                if (!response || !response.success) {

                    throw new Error(
                        response?.message ||
                        "Unable to save settings."
                    );
                }


                showSuccess(
                    response.message ||
                    "Settings saved successfully."
                );


            } catch (error) {

                console.error(
                    "SAVE SETTINGS ERROR:",
                    error
                );


                if (error.status === 401) {

                    showError(
                        "Your login session has expired. Please log in again."
                    );


                    setTimeout(() => {

                        window.location.href =
                            "index.html";

                    }, 1500);

                    return;
                }


                showError(
                    error.message ||
                    "Unable to save settings."
                );


            } finally {

                if (submitButton) {

                    setLoading(
                        submitButton,
                        false
                    );
                }
            }
        }
    );


    // ========================================================
    // INITIALIZE
    // ========================================================

    loadSettings();

});

