let timer;

function startTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && !tabs[0].url.includes('index.html')) {
        chrome.tabs.update(tabs[0].id, {url: 'logout.html'});
      }
    });
  }, 60000); // 1 minute
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && !tab.url.includes('index.html')) {
    startTimer();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetTimer") {
    startTimer();
  }
});