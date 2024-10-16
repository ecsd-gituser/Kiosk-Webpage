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
  console.log('Message received:', message);
  if (message.action === "startTimer") {
    console.log('Starting timer');
    clearTimeout(logoutTimer);
    logoutTimer = setTimeout(() => {
      console.log('Timer expired, redirecting to logout page');
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          chrome.tabs.update(tab.id, {url: 'logout.html'});
        });
      });
    }, 60000); // 1 minute
    sendResponse({status: "Timer started"});
  }

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  if (message.action === "resetTimer") {
    console.log('Resetting session expiration timer');
    chrome.alarms.clear('sessionExpiration', (wasCleared) => {
      console.log('Previous alarm cleared:', wasCleared);
      chrome.alarms.create('sessionExpiration', { delayInMinutes: 1 });
      console.log('New alarm created');
      sendResponse({status: "Timer reset"});
    });
    return true; // Indicates that the response is sent asynchronously
  }
});
