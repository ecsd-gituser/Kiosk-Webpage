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
            
            if (counter >= 50) {
                resetApp();
            }
        });
    } else if (alarm.name === 'checkSessionStatus') {
        chrome.storage.sync.get(['kioskSessionEnded'], function(result) {
            if (result.kioskSessionEnded) {
                resetApp();
            }
        });
    }
});

function resetApp() {
    chrome.storage.local.remove(['sessionCounter', 'sessionActive']);
    chrome.storage.sync.remove('kioskSessionEnded');
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            chrome.tabs.remove(tab.id);
        });
    });
    chrome.tabs.create({url: 'index.html'});
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "login") {
        chrome.storage.local.set({sessionActive: true, sessionCounter: 0}, () => {
            chrome.tabs.create({url: 'app.html'});
        });
    }
    return true; // Indicates that the response is sent asynchronously
});

// Create an alarm to check session status every 30 seconds
chrome.alarms.create('checkSessionStatus', { periodInMinutes: 0.5 });
