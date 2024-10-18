let timer;
const TIMEOUT_DURATION = 60000; // 1 minute in milliseconds

function startTimer() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { url: 'logout.html' });
      });
    });
  }, TIMEOUT_DURATION);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTimer") {
    startTimer();
    sendResponse({status: "Timer started"});
  }
  return true;
});

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    id: 'mainWindow',
    bounds: {width: 800, height: 600}
  });
});

if (chrome.power) {
  chrome.power.requestKeepAwake('display');
}
