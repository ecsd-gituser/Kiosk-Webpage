let globalTimer;
const APP_REFERENCE = 'app_ref=ecsd_kiosk';

function startGlobalTimer() {
  clearTimeout(globalTimer);
  globalTimer = setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { url: 'logout.html' });
      });
    });
  }, 60000); // 1 minute
}

function addAppReference(details) {
  let url = new URL(details.url);
  if (!url.searchParams.has('app_ref')) {
    url.searchParams.append('app_ref', 'ecsd_kiosk');
    return { redirectUrl: url.toString() };
  }
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.url.includes('mail.google.com') && !details.url.includes(APP_REFERENCE)) {
    chrome.tabs.update(details.tabId, { url: details.url + (details.url.includes('?') ? '&' : '?') + APP_REFERENCE });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    startGlobalTimer();
    if (tab.url.includes(APP_REFERENCE)) {
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
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetTimer") {
    startGlobalTimer();
  } else if (message.action === "clearTimer") {
    clearTimeout(globalTimer);
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  addAppReference,
  {urls: ["<all_urls>"]},
  ["blocking"]
);
