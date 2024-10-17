let timer;

function startTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { url: 'logout.html' });
      });
    });
  }, 60000); // 1 minute
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && !tab.url.includes('index.html')) {
    startTimer();
  }
});
