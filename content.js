function sendSelectedText() {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    console.log("Sending selected text:", selectedText);

    chrome.runtime.sendMessage({
      type: "SELECTED_TEXT",
      text: selectedText
    });
  }
}

document.addEventListener("mouseup", sendSelectedText);
document.addEventListener("keyup", sendSelectedText);