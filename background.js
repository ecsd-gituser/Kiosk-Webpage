let sessionTimeout;
const SESSION_TIMEOUT = 60000; // 1 minute in milliseconds

chrome.runtime.onInstalled.addListener(() => {
  console.log('ECSD Kiosk extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    startSessionTimer();
    sendResponse({status: "Timer started"});
  }
});

function startSessionTimer() {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.update(tabs[0].id, {url: 'logout.html'});
      }
    });
  }, SESSION_TIMEOUT);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('index.html')) {
      // Reset the timer when navigating to index.html
      startSessionTimer();
    } else if (!tab.url.includes('chrome://')) {
      // Start or continue the timer for other non-chrome URLs
      startSessionTimer();
    }
  }
});
