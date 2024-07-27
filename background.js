chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "transformXML",
        title: "Transform XML to HTML",
        contexts: ["all"],
        documentUrlPatterns:["*://*/*.xml","file://*/*.xml"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "transformXML") {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });
        }catch (e) {
            console.log(e);
        }
    }
});