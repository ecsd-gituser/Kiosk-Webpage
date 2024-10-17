let globalTimer;

function startGlobalTimer() {
  clearTimeout(globalTimer);
  globalTimer = setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { url: 'https://ecsd-gituser.github.io/Kiosk-Webpage/' });
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
