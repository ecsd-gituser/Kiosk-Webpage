let sessionTimeout = 1800; // Default to 30 minutes
let autoSignOut = true; // Default to true

chrome.runtime.onInstalled.addListener(() => {
    loadManagedSettings();
    startSessionCounter();
});

chrome.runtime.onStartup.addListener(() => {
    loadManagedSettings();
    startSessionCounter();
});

function loadManagedSettings() {
    chrome.storage.managed.get(null, function(items) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        if (items.SessionTimeout) {
            sessionTimeout = items.SessionTimeout.Value;
        }
        if (items.AutoSignOut) {
            autoSignOut = items.AutoSignOut.Value;
        }

        console.log('Loaded managed settings - Session timeout:', sessionTimeout, 'Auto sign out:', autoSignOut);
        
        // Recreate the session check alarm with the new timeout
        chrome.alarms.clear('checkSessionStatus');
        chrome.alarms.create('checkSessionStatus', { periodInMinutes: sessionTimeout / 60 });
    });
}

function startSessionCounter() {
    chrome.storage.local.set({sessionCounter: 0, lastActivity: Date.now()});
    chrome.alarms.create('sessionTick', {periodInMinutes: 1});
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'sessionTick') {
        chrome.storage.local.get(['sessionCounter', 'lastActivity'], (result) => {
            let counter = result.sessionCounter || 0;
            let lastActivity = result.lastActivity || Date.now();
            counter++;
            chrome.storage.local.set({sessionCounter: counter});
            
            if (counter >= 50 || (autoSignOut && Date.now() - lastActivity > sessionTimeout * 1000)) {
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
    chrome.storage.local.remove(['sessionCounter', 'sessionActive', 'lastActivity']);
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
        chrome.storage.local.set({sessionActive: true, sessionCounter: 0, lastActivity: Date.now()}, () => {
            chrome.tabs.create({url: 'app.html'});
        });
    } else if (request.action === "updateActivity") {
        chrome.storage.local.set({lastActivity: Date.now()});
    }
    return true; // Indicates that the response is sent asynchronously
});
