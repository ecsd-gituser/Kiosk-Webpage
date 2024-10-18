const SESSION_TIMEOUT = 60000; // 1 minute in milliseconds
let sessionActive = false;
let sessionTimeout;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Kiosk extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "startTimer") {
        sessionActive = true;
        startSessionTimer();
        sendResponse({ status: "Timer started" });
    } else if (request.action === "endSession") {
        endSession();
        sendResponse({ status: "Session ended" });
    } else if (request.action === "checkSession") {
        sendResponse({ sessionActive });
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.update(tabs[0].id, { url: 'logout.html' });
        }
    });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        if (tab.url.includes('index.html')) {
            sessionActive = false;
            clearTimeout(sessionTimeout);
        } else if (sessionActive && !tab.url.includes('chrome://') && !tab.url.includes('logout.html')) {
            startSessionTimer();
        }
    }
});
