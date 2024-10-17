console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed. Creating initial alarm.');
  chrome.alarms.create('sessionExpiration', { delayInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sessionExpiration') {
    console.log('Session expiration alarm triggered');
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        console.log('Redirecting tab to logout page:', tab.id);
        chrome.tabs.update(tab.id, { url: 'logout.html' });
      });
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startTimer") {
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.update(tab.id, {url: 'logout.html'});
        });
      });
    }, 60000); // 1 minute
    sendResponse({status: "Timer started"});
  } else if (message.action === "resetTimer") {
    chrome.alarms.clear('sessionExpiration', (wasCleared) => {
      chrome.alarms.create('sessionExpiration', { delayInMinutes: 1 });
      sendResponse({status: "Timer reset"});
    });
    return true;
  }
});
