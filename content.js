chrome.runtime.sendMessage({ action: "checkSession" }, (response) => {
    if (response.sessionActive) {
        console.log('Session is active');
    } else {
        console.log('Session has expired');
        // Redirect to logout page if session is not active
        window.location.href = 'logout.html';
    }
});

// Listen for messages from the background script to start or end sessions
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "endSession") {
        // Redirect to logout.html when session ends
        window.location.href = 'logout.html';
    }
});
