let globalTimer;
const TIMEOUT_DURATION = 60000; // 1 minute in milliseconds
const APP_REFERENCE = 'app_ref=ecsd_kiosk';

function startGlobalTimer() {
  clearTimeout(globalTimer);
  globalTimer = setTimeout(() => {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.update(tab.id, { url: 'logout.html' });
      });
    });
  }, TIMEOUT_DURATION);
}

function addAppReference(details) {
  let url = new URL(details.url);
  if (!url.searchParams.has('app_ref') && !url.pathname.endsWith('index.html') && !url.pathname.endsWith('logout.html')) {
    url.searchParams.append('app_ref', 'ecsd_kiosk');
    return { redirectUrl: url.toString() };
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed.');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (tab.url.includes('index.html')) {
      console.log('Index page loaded. Starting timer.');
      startGlobalTimer();
    }
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.url.includes('index.html')) {
    console.log('Navigated to index. Resetting timer.');
    startGlobalTimer();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "indexLoaded") {
    console.log('Index loaded message received. Starting timer.');
    startGlobalTimer();
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  addAppReference,
  {urls: ["<all_urls>"]},
  ["blocking"]
);

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (!details.url.includes(APP_REFERENCE) && 
      !details.url.includes('index.html') && 
      !details.url.includes('logout.html')) {
    chrome.tabs.update(details.tabId, { 
      url: details.url + (details.url.includes('?') ? '&' : '?') + APP_REFERENCE 
    });
  }
});
