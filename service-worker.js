chrome.runtime.onInstalled.addListener(() => {
  console.log("StudyBuddy AI installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SELECTED_TEXT") {
    console.log("Received in service worker:", message.text);

    chrome.storage.local.set({ selectedText: message.text }, () => {
      console.log("Selected text saved:", message.text);
    });
  }
});