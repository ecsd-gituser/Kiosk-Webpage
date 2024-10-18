// Function to start the session timer
function startSession() {
    chrome.runtime.sendMessage({ action: "startTimer" }, (response) => {
        console.log(response.status);
    });
}

// Function to check the session status
function checkSession() {
    chrome.runtime.sendMessage({ action: "checkSession" }, (response) => {
        if (response.sessionExpired) {
            alert("Your session has expired. You will be logged out.");
            window.location.href = 'logout.html'; // Redirect to logout page
        }
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            console.log("Login button clicked");
            chrome.runtime.sendMessage({ action: "startTimer" });
            // Redirect to the external app or perform login actions here
            window.location.href = 'external-app.html'; // Example redirect
        });
    }
});


// Start the session when the page loads
window.onload = function () {
    startSession();
    // Check the session every minute (60000 milliseconds)
    setInterval(checkSession, 60000);
};
