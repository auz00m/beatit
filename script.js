/*********************/
/* GLOBAL FUNCTIONS  */
/*********************/

// ----- Global To-Do List -----
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  loadLinks();
  loadGlobalNotes();
  loadGlobalChecklist();
  loadSubjects();
  initPomodoro();
});

// ---- To-Do List ----
function addTask() {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();
  if (!task) return;
  addTaskToList(task);
  saveToLocalArray("tasks", task);
  input.value = "";
}

function addTaskToList(task) {
  const list = document.getElementById("taskList");
  const li = document.createElement("li");
  li.textContent = task;

  const btn = document.createElement("button");
  btn.textContent = "❌";
  btn.onclick = () => {
    li.remove();
    removeFromLocalArray("tasks", task);
  };

  li.appendChild(btn);
  list.appendChild(li);
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.forEach(addTaskToList);
}

// ---- Study Links ----
function addLink() {
  const title = document.getElementById("linkTitle").value.trim();
  const url = document.getElementById("linkURL").value.trim();
  if (!title || !url) return;
  const link = { title, url };
  addLinkToList(link);
  saveToLocalArray("links", link);
  document.getElementById("linkTitle").value = "";
  document.getElementById("linkURL").value = "";
}

function addLinkToList(link) {
  const list = document.getElementById("linkList");
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = link.url;
  a.target = "_blank";
  a.textContent = link.title;

  const btn = document.createElement("button");
  btn.textContent = "❌";
  btn.onclick = () => {
    li.remove();
    removeFromLocalArray("links", link);
  };

  li.appendChild(a);
  li.appendChild(btn);
  list.appendChild(li);
}

function loadLinks() {
  const links = JSON.parse(localStorage.getItem("links")) || [];
  links.forEach(addLinkToList);
}

// ---- Global Notes & Checklist ----
const globalNotesArea = document.getElementById("globalNotes");
globalNotesArea && globalNotesArea.addEventListener("input", () => {
  localStorage.setItem("globalNotes", globalNotesArea.value);
});

function loadGlobalNotes() {
  const saved = localStorage.getItem("globalNotes");
  if (saved && globalNotesArea) globalNotesArea.value = saved;
}

const globalChecklistArea = document.getElementById("globalChecklist");
globalChecklistArea && globalChecklistArea.addEventListener("input", () => {
  localStorage.setItem("globalChecklist", globalChecklistArea.value);
});

function loadGlobalChecklist() {
  const saved = localStorage.getItem("globalChecklist");
  if (saved && globalChecklistArea) globalChecklistArea.value = saved;
}

// ---- Utility Functions ----
function saveToLocalArray(key, item) {
  const data = JSON.parse(localStorage.getItem(key)) || [];
  data.push(item);
  localStorage.setItem(key, JSON.stringify(data));
}

function removeFromLocalArray(key, item) {
  const data = JSON.parse(localStorage.getItem(key)) || [];
  const filtered = data.filter(i => JSON.stringify(i) !== JSON.stringify(item));
  localStorage.setItem(key, JSON.stringify(filtered));
}

/*******************/
/* SUBJECT MODULE  */
/*******************/

// Subjects data is stored as an array of objects in localStorage under "subjects"
// Each subject: { id, name, notes, formulas }
function addSubject() {
  const input = document.getElementById("subjectInput");
  const subjectName = input.value.trim();
  if (!subjectName) return;
  const subject = {
    id: Date.now(),
    name: subjectName,
    notes: "",
    formulas: ""
  };
  saveSubject(subject);
  renderSubject(subject);
  input.value = "";
}

function saveSubject(subject) {
  const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  subjects.push(subject);
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function loadSubjects() {
  const subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  subjects.forEach(renderSubject);
}

function renderSubject(subject) {
  const container = document.getElementById("subjectsContainer");

  const section = document.createElement("div");
  section.classList.add("subject-section");
  section.setAttribute("data-id", subject.id);

  const header = document.createElement("div");
  header.classList.add("subject-header");

  const title = document.createElement("h3");
  title.textContent = subject.name;
  header.appendChild(title);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Remove";
  deleteBtn.onclick = () => {
    section.remove();
    removeSubject(subject.id);
  };
  header.appendChild(deleteBtn);

  section.appendChild(header);

  // Body: Notes and Formulas
  const body = document.createElement("div");
  body.classList.add("subject-body");

  // Notes textarea
  const notesArea = document.createElement("textarea");
  notesArea.placeholder = subject.name + " Notes...";
  notesArea.value = subject.notes;
  notesArea.addEventListener("input", () => {
    updateSubject(subject.id, { notes: notesArea.value });
  });
  body.appendChild(notesArea);

  // Formulas textarea
  const formulaArea = document.createElement("textarea");
  formulaArea.placeholder = subject.name + " Formulas...";
  formulaArea.value = subject.formulas;
  formulaArea.addEventListener("input", () => {
    updateSubject(subject.id, { formulas: formulaArea.value });
  });
  body.appendChild(formulaArea);

  section.appendChild(body);
  container.appendChild(section);
}

function updateSubject(id, newData) {
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  subjects = subjects.map(subj => {
    if (subj.id === id) {
      return { ...subj, ...newData };
    }
    return subj;
  });
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

function removeSubject(id) {
  let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
  subjects = subjects.filter(subj => subj.id !== id);
  localStorage.setItem("subjects", JSON.stringify(subjects));
}

/**********************/
/* POMODORO TIMER     */
/**********************/
let pomodoroInterval;
let timeRemaining = 25 * 60; // 25 minutes in seconds
let isRunning = false;

function initPomodoro() {
  const startPauseBtn = document.getElementById("startPauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  
  startPauseBtn.addEventListener("click", togglePomodoro);
  resetBtn.addEventListener("click", resetPomodoro);
  
  updateTimerDisplay();
}

function togglePomodoro() {
  const startPauseBtn = document.getElementById("startPauseBtn");
  if (!isRunning) {
    pomodoroInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        updateTimerDisplay();
      } else {
        clearInterval(pomodoroInterval);
        alert("Time's up!");
        resetPomodoro();
      }
    }, 1000);
    startPauseBtn.textContent = "Pause";
  } else {
    clearInterval(pomodoroInterval);
    startPauseBtn.textContent = "Start";
  }
  isRunning = !isRunning;
}

function resetPomodoro() {
  clearInterval(pomodoroInterval);
  timeRemaining = 25 * 60;
  isRunning = false;
  document.getElementById("startPauseBtn").textContent = "Start";
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const display = document.getElementById("timerDisplay");
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  display.textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

/**********************/
/* DARK/LIGHT TOGGLE  */
/**********************/
const modeToggle = document.getElementById("modeToggle");
modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  // Optionally, save the mode preference
  localStorage.setItem(
    "mode",
    document.body.classList.contains("light-mode") ? "light" : "dark"
  );
});

// On page load, check mode preference
document.addEventListener("DOMContentLoaded", () => {
  const mode = localStorage.getItem("mode");
  if (mode === "light") {
    document.body.classList.add("light-mode");
  }
});
