console.log('Background script loaded');

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
    chrome.tabs.executeScript(tabId, {
      code: `
        history.pushState(null, null, document.URL);
        window.addEventListener('popstate', function () {
          history.pushState(null, null, document.URL);
        });
      `
    });
  }
});

chrome.tabs.onCreated.addListener(() => {
  startGlobalTimer();
});

chrome.tabs.onRemoved.addListener(() => {
  startGlobalTimer();
});
