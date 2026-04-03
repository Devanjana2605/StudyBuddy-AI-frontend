const inputText = document.getElementById("inputText");
const output = document.getElementById("output");

const summarizeBtn = document.getElementById("summarizeBtn");
const explainBtn = document.getElementById("explainBtn");
const quizBtn = document.getElementById("quizBtn");
const saveBtn = document.getElementById("saveBtn");
const viewSavedBtn = document.getElementById("viewSavedBtn");
const clearSavedBtn = document.getElementById("clearSavedBtn");
const savedNotesContainer = document.getElementById("savedNotesContainer");

window.addEventListener("load", async () => {
  await loadSelectedText();
});

window.addEventListener("focus", async () => {
  await loadSelectedText();
});

async function loadSelectedText() {
  const data = await chrome.storage.local.get(["selectedText"]);
  if (data.selectedText) {
    inputText.value = data.selectedText;
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.selectedText) {
    inputText.value = changes.selectedText.newValue || "";
  }
});


// 🔥 BUTTONS NOW USE REAL AI

summarizeBtn.addEventListener("click", () => {
  runAI("Summarize this in simple bullet points:");
});

explainBtn.addEventListener("click", () => {
  runAI("Explain this in very simple words:");
});

quizBtn.addEventListener("click", () => {
  runAI("Create 5 quiz questions with answers:");
});


// 💾 SAVE FUNCTION (same)

saveBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();
  const result = output.textContent.trim();

  if (!text || !result || result === "Output will appear here...") {
    output.textContent = "Nothing to save yet.";
    return;
  }

  const data = await chrome.storage.local.get(["savedNotes"]);
  const savedNotes = data.savedNotes || [];

  savedNotes.push({
    input: text,
    output: result,
    createdAt: new Date().toLocaleString()
  });

  await chrome.storage.local.set({ savedNotes });

  output.textContent += "\n\nSaved successfully.";
  loadSavedNotes();
});

viewSavedBtn.addEventListener("click", () => {
  loadSavedNotes();
});

clearSavedBtn.addEventListener("click", async () => {
  await chrome.storage.local.set({ savedNotes: [] });
  savedNotesContainer.innerHTML = "<p>No saved notes yet.</p>";
});


// 📂 LOAD SAVED NOTES

async function loadSavedNotes() {
  const data = await chrome.storage.local.get(["savedNotes"]);
  const savedNotes = data.savedNotes || [];

  if (savedNotes.length === 0) {
    savedNotesContainer.innerHTML = "<p>No saved notes yet.</p>";
    return;
  }

  savedNotesContainer.innerHTML = "";

  savedNotes
    .slice()
    .reverse()
    .forEach((note, index) => {
      const card = document.createElement("div");
      card.className = "note-card";

      card.innerHTML = `
        <h3>Saved Note ${savedNotes.length - index}</h3>
        <p><strong>Time:</strong> ${note.createdAt}</p>
        <p><strong>Input:</strong> ${escapeHtml(note.input)}</p>
        <p><strong>Output:</strong> ${escapeHtml(note.output)}</p>
      `;

      savedNotesContainer.appendChild(card);
    });
}


// 🤖 AI FUNCTION (IMPORTANT)

async function runAI(instruction) {
  const text = inputText.value.trim();

  if (!text) {
    output.textContent = "Please select or enter some text first.";
    return;
  }

  output.textContent = "Thinking... 🤖";

  try {
    const prompt = `${instruction}\n\n${text}`;

 const response = await fetch("https://studybuddy-backend-lkz8.onrender.com/ai", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ prompt })
});

    const rawText = await response.text();
    console.log("Raw backend response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      output.textContent = "Backend did not return JSON.";
      return;
    }

    if (!response.ok) {
      output.textContent = data.error || "AI request failed.";
      return;
    }

    output.textContent = data.result || "No response received.";
  } catch (error) {
    console.error("Frontend error:", error);
    output.textContent = "Error connecting to AI.";
  }
}

// 🔐 SAFE HTML

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}