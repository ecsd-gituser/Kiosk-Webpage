let sessionTimeout;
const SESSION_TIMEOUT = 60000; // 1 minute in milliseconds
let sessionActive = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log('ECSD Kiosk extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    sessionActive = true;
    startSessionTimer();
    sendResponse({status: "Timer started"});
  } else if (request.action === "endSession") {
    endSession();
    sendResponse({status: "Session ended"});
  }
});

function startSessionTimer() {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    endSession();
  }, SESSION_TIMEOUT);
}

function endSession() {
  sessionActive = false;
  clearTimeout(sessionTimeout);
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, {url: 'logout.html'});
    }
  });
}

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
