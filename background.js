chrome.runtime.onInstalled.addListener(() => {
  startSessionCounter();
});

chrome.runtime.onStartup.addListener(() => {
  startSessionCounter();
});

function startSessionCounter() {
  chrome.storage.local.set({sessionCounter: 0});
  chrome.alarms.create('sessionTick', {periodInMinutes: 1});
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sessionTick') {
    chrome.storage.local.get('sessionCounter', (result) => {
      let counter = result.sessionCounter || 0;
      counter++;
      chrome.storage.local.set({sessionCounter: counter});
      
      if (counter >= 2) {
        resetApp();
      }
    });
  }
});

function resetApp() {
  chrome.storage.local.remove(['sessionCounter', 'sessionActive']);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.reload(tab.id);
    });
  });
}