let sessionActive = false;
let sessionTimeout; // Variable to hold the timeout reference
const SESSION_TIMEOUT = 60000; // 1 minute in milliseconds

chrome.runtime.onInstalled.addListener(() => {
  console.log('ECSD Kiosk extension installed');
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    sessionActive = true;
    startSessionTimer();
    sendResponse({ status: "Timer started" });
  } else if (request.action === "endSession") {
    endSession();
    sendResponse({ status: "Session ended" });
  } else if (request.action === "checkSession") {
    sendResponse({ sessionExpired: !sessionActive });
  }
});

// Function to start the session timer
function startSessionTimer() {
  clearTimeout(sessionTimeout); // Clear any existing timeout
  sessionTimeout = setTimeout(() => {
    endSession(); // End the session when the timeout occurs
  }, SESSION_TIMEOUT);
}

// Function to end the session
function endSession() {
  sessionActive = false; // Set session to inactive
  clearTimeout(sessionTimeout); // Clear the timeout
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, { url: 'logout.html' }); // Redirect to logout page
    }
  });
}

// Listen for tab updates to manage session state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('index.html')) {
      // Reset the session when navigating to index.html
      sessionActive = false;
      clearTimeout(sessionTimeout);
    } else if (sessionActive && !tab.url.includes('chrome://') && !tab.url.includes('logout.html')) {
      // Refresh the timer for other pages only if the session is active
      startSessionTimer();
    }
  }
});
