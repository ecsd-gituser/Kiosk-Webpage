let globalTimer;

function startGlobalTimer() {
  clearTimeout(globalTimer);
  globalTimer = setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { url: 'index.html' });
      });
    });
  }, 60000); // 1 minute
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed. Starting global timer.');
  startGlobalTimer();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    startGlobalTimer();
  }
});

chrome.tabs.onActivated.addListener(() => {
  startGlobalTimer();
});

// Add this to reset timer on user activity
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.executeScript(tabId, {
      code: `
        ['click', 'keydown', 'mousemove', 'scroll'].forEach(event => {
          document.addEventListener(event, function() {
            chrome.runtime.sendMessage({action: "resetTimer"});
          });
        });
      `
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetTimer") {
    startGlobalTimer();
  }
});
