let globalTimer;
const TIMEOUT_DURATION = 60000; // 1 minute in milliseconds

function startGlobalTimer() {
  clearTimeout(globalTimer);
  globalTimer = setTimeout(checkAndRedirect, TIMEOUT_DURATION);
}

function checkAndRedirect() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0] && !tabs[0].url.includes('index.html')) {
      chrome.tabs.update(tabs[0].id, {url: 'logout.html'});
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed. Starting timer.');
  startGlobalTimer();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated. Resetting timer.');
    startGlobalTimer();
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated. Resetting timer.');
  startGlobalTimer();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetTimer") {
    console.log('Reset timer message received.');
    startGlobalTimer();
    sendResponse({status: "Timer reset"});
  }
});
