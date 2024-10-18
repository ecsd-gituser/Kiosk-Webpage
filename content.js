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

// Start the session when the page loads
window.onload = function () {
    startSession();
    // Check the session every minute (60000 milliseconds)
    setInterval(checkSession, 60000);
};
