console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed. Creating initial alarm.');
  chrome.alarms.create('idleCheck', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'idleCheck') {
    chrome.idle.queryState(60, (state) => {
      if (state === 'idle') {
        console.log('Device is idle. Initiating shutdown.');
        chrome.power.requestShutdown();
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "resetIdleTimer") {
    chrome.idle.setDetectionInterval(60);
    sendResponse({status: "Idle timer reset"});
  }
});
