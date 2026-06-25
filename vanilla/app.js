// =============================================================================
// GINTI - COMPLETE OFFLINE ENGINE DATASETS & STATES
// =============================================================================

const NUMBERS = [
  // --- Unit 1: Numbers 1 to 20 ---
  { digit: 1, romanUrdu: "Ek", nativeScript: "ایک", unitId: "unit1", searchKeys: ["1", "ek", "ik", "ایک"] },
  { digit: 2, romanUrdu: "Do", nativeScript: "دو", unitId: "unit1", searchKeys: ["2", "do", "du", "دو"] },
  { digit: 3, romanUrdu: "Teen", nativeScript: "تین", unitId: "unit1", searchKeys: ["3", "teen", "tin", "تین"] },
  { digit: 4, romanUrdu: "Chaar", nativeScript: "چار", unitId: "unit1", searchKeys: ["4", "chaar", "char", "چار"] },
  { digit: 5, romanUrdu: "Paanch", nativeScript: "پانچ", unitId: "unit1", searchKeys: ["5", "paanch", "panch", "پانچ"] },
  { digit: 6, romanUrdu: "Chhay", nativeScript: "چھ", unitId: "unit1", searchKeys: ["6", "chhay", "che", "chey", "چھ"] },
  { digit: 7, romanUrdu: "Saat", nativeScript: "سات", unitId: "unit1", searchKeys: ["7", "saat", "sat", "سات"] },
  { digit: 8, romanUrdu: "Aath", nativeScript: "آٹھ", unitId: "unit1", searchKeys: ["8", "aath", "ath", "آٹھ"] },
  { digit: 9, romanUrdu: "Nau", nativeScript: "نو", unitId: "unit1", searchKeys: ["9", "nau", "no", "now", "نو"] },
  { digit: 10, romanUrdu: "Das", nativeScript: "دس", unitId: "unit1", searchKeys: ["10", "das", "dus", "دس"] },
  { digit: 11, romanUrdu: "Gyaarah", nativeScript: "گیارہ", unitId: "unit1", searchKeys: ["11", "gyaarah", "gyara", "giyarah", "گیارہ"] },
  { digit: 12, romanUrdu: "Baarah", nativeScript: "بارہ", unitId: "unit1", searchKeys: ["12", "baarah", "bara", "barah", "بارہ"] },
  { digit: 13, romanUrdu: "Terah", nativeScript: "تیره", unitId: "unit1", searchKeys: ["13", "terah", "tera", "تیرہ"] },
  { digit: 14, romanUrdu: "Chaudah", nativeScript: "چودہ", unitId: "unit1", searchKeys: ["14", "chaudah", "choda", "chauda", "چودہ"] },
  { digit: 15, romanUrdu: "Pandrah", nativeScript: "پندرہ", unitId: "unit1", searchKeys: ["15", "pandrah", "pandra", "pandara", "پندرہ"] },
  { digit: 16, romanUrdu: "Solah", nativeScript: "سولہ", unitId: "unit1", searchKeys: ["16", "solah", "sola", "سولہ"] },
  { digit: 17, romanUrdu: "Satrah", nativeScript: "سترہ", unitId: "unit1", searchKeys: ["17", "satrah", "satra", "سترہ"] },
  { digit: 18, romanUrdu: "Atharah", nativeScript: "اٹھارہ", unitId: "unit1", searchKeys: ["18", "atharah", "athara", "اٹھارہ"] },
  { digit: 19, romanUrdu: "Unnees", nativeScript: "انیس", unitId: "unit1", searchKeys: ["19", "unnees", "unis", "unnis", "انیس"] },
  { digit: 20, romanUrdu: "Bees", nativeScript: "بیس", unitId: "unit1", searchKeys: ["20", "bees", "bis", "بیس"] },

  // --- Unit 2: Numbers 21 to 50 ---
  { digit: 21, romanUrdu: "Ikkees", nativeScript: "اکیس", unitId: "unit2", searchKeys: ["21", "ikkees", "ikis", "اکیس"] },
  { digit: 22, romanUrdu: "Baees", nativeScript: "بائیس", unitId: "unit2", searchKeys: ["22", "baees", "bais", "bayeas", "بائیس"] },
  { digit: 25, romanUrdu: "Pachees", nativeScript: "پچیس", unitId: "unit2", searchKeys: ["25", "pachees", "pachis", "پچیس"] },
  { digit: 30, romanUrdu: "Tees", nativeScript: "تیس", unitId: "unit2", searchKeys: ["30", "tees", "tis", "تیس"] },
  { digit: 35, romanUrdu: "Paintees", nativeScript: "پینتیس", unitId: "unit2", searchKeys: ["35", "paintees", "paints", "paantis", "paintis", "پینتیس"] },
  { digit: 40, romanUrdu: "Chalees", nativeScript: "چالیس", unitId: "unit2", searchKeys: ["40", "chalees", "chalis", "چالیس"] },
  { digit: 45, romanUrdu: "Paintalees", nativeScript: "پینتالیس", unitId: "unit2", searchKeys: ["45", "paintalees", "paintalis", "paantalise", "پینتالیس"] },
  { digit: 50, romanUrdu: "Pachaas", nativeScript: "پچاس", unitId: "unit2", searchKeys: ["50", "pachaas", "pachas", "پچاس"] },
  { digit: 53, romanUrdu: "Tirpan", nativeScript: "ترپن", unitId: "unit2", searchKeys: ["53", "tirpan", "tirpann", "terpan", "ترپن"] },

  // --- Unit 3: Numbers 51 to 75 ---
  { digit: 55, romanUrdu: "Pachpan", nativeScript: "پچپن", unitId: "unit3", searchKeys: ["55", "pachpan", "pachpann", "پچپن"] },
  { digit: 60, romanUrdu: "Saath", nativeScript: "ساٹھ", unitId: "unit3", searchKeys: ["60", "saath", "sath", "ساٹھ"] },
  { digit: 64, romanUrdu: "Chaunsath", nativeScript: "چونسٹھ", unitId: "unit3", searchKeys: ["64", "chaunsath", "chonsath", "chaunsut", "چونسٹھ"] },
  { digit: 70, romanUrdu: "Sattar", nativeScript: "ستر", unitId: "unit3", searchKeys: ["70", "sattar", "satar", "ستر"] },
  { digit: 75, romanUrdu: "Pachhattar", nativeScript: "پچھتر", unitId: "unit3", searchKeys: ["75", "pachhattar", "pachatar", "pichhatar", "پچھتر"] },

  // --- Unit 4: Numbers 76 to 100 ---
  { digit: 80, romanUrdu: "Assi", nativeScript: "اسی", unitId: "unit4", searchKeys: ["80", "assi", "asi", "اسی"] },
  { digit: 81, romanUrdu: "Ikyaasi", nativeScript: "اکیاسی", unitId: "unit4", searchKeys: ["81", "اکیاسی", "ikyaasi", "Ikyaasi", "aikyaasi", "ekyaasi"] },
  { digit: 85, romanUrdu: "Pachasi", nativeScript: "پچاسی", unitId: "unit4", searchKeys: ["85", "pachasi", "pachasi", "پچاسی"] },
  { digit: 87, romanUrdu: "Satasi", nativeScript: "ستاسی", unitId: "unit4", searchKeys: ["87", "satasi", "sataasi", "sattasi", "ستاسی"] },
  { digit: 88, romanUrdu: "Athasi", nativeScript: "اٹھاسی", unitId: "unit4", searchKeys: ["88", "athasi", "ataasi", "athaasi", "اٹھاسی"] },
  { digit: 90, romanUrdu: "Nawwe", nativeScript: "نوے", unitId: "unit4", searchKeys: ["90", "nawwe", "navey", "nave", "نوے"] },
  { digit: 95, romanUrdu: "Pachaanwe", nativeScript: "پچانوے", unitId: "unit4", searchKeys: ["95", "pachaanwe", "pachanway", "پچانوے"] },
  { digit: 99, romanUrdu: "Ninanwe", nativeScript: "ننانوے", unitId: "unit4", searchKeys: ["99", "ninanwe", "ninanway", "naanwe", "ننانوے"] },
  { digit: 100, romanUrdu: "Sau", nativeScript: "سو", unitId: "unit4", searchKeys: ["100", "sau", "so", "ek sau", "سو"] },

  // --- Unit 5: Practical Market Numbers ---
  {
    digit: 150,
    romanUrdu: "Derh Sau",
    nativeScript: "ڈیڑھ سو",
    unitId: "unit5",
    searchKeys: ["150", "derh sau", "dedh so", "dedh sau", "ڈیڑھ سو"],
    context: "Cost of one average plate of street biryani or custom chai"
  },
  {
    digit: 250,
    romanUrdu: "Dhaee Sau",
    nativeScript: "ڈھائی سو",
    unitId: "unit5",
    searchKeys: ["250", "dhaee sau", "dhaye so", "dhai sau", "ڈھائی سو"],
    context: "Price of a standard movie ticket or clean auto-rickshaw fare"
  },
  {
    digit: 500,
    romanUrdu: "Paanch Sau",
    nativeScript: "پانچ سو",
    unitId: "unit5",
    searchKeys: ["500", "paanch sau", "panch sau", "paanchsau", "پانچ سو"],
    context: "A standard green bank note - tip or quick family lunch"
  },
  {
    digit: 1000,
    romanUrdu: "Ek Hazaar",
    nativeScript: "ایک ہزار",
    unitId: "unit5",
    searchKeys: ["1000", "ek hazaar", "ek hazar", "ekhazaar", "hazaar", "hazar", "ایک ہزار"],
    context: "Standard blue note - weekly commute fare or groceries"
  },
  {
    digit: 5000,
    romanUrdu: "Paanch Hazaar",
    nativeScript: "پانچ ہزار",
    unitId: "unit5",
    searchKeys: ["5000", "paanch hazaar", "panch hazar", "پانچ ہزار"],
    context: "Highest bill note value - expensive grocery shopping or small bills"
  }
];

const UNITS = [
  { id: "unit1", title: "Unit 1 — Numbers 1 to 20", emoji: "🌱", range: "1–20" },
  { id: "unit2", title: "Unit 2 — Numbers 21 to 50", emoji: "🚀", range: "21–50" },
  { id: "unit3", title: "Unit 3 — Numbers 51 to 75", emoji: "🎯", range: "51–75" },
  { id: "unit4", title: "Unit 4 — Numbers 76 to 100", emoji: "🌟", range: "76–100" },
  { id: "unit5", title: "Unit 5 — Practical Market Numbers", emoji: "🛒", range: "100–5000" }
];

const LOCAL_STORAGE_KEY = "ginti_emerald_gold_state_vanilla";

// =============================================================================
// APP STATE MANAGER AND STORAGE SYNC PIPELINE
// =============================================================================
let appState = {
  totalXP: 0,
  completedUnits: [], 
  weakAreas: [],
  showScript: true,
  highScore: 0,
  streakDays: 3,
  hasOnboarded: false
};

// Routing variable
let currentScreen = "dashboard"; // "dashboard", "practice", "arcade"

// Running activity variables
let currentQuiz = null;
let currentArcade = null;
let arcadeTimerId = null;

// Audio Speak fallback
let speechSynthesizerActive = false;

// =============================================================================
// DOM CACHE REFERENCES
// =============================================================================
const DOM = {
  onboardingOverlay: document.getElementById("onboarding-overlay"),
  choiceLearnBtn: document.getElementById("choice-learn-btn"),
  choiceLookupBtn: document.getElementById("choice-lookup-btn"),

  lvlDisplay: document.getElementById("lvl-display"),
  xpDisplay: document.getElementById("xp-display"),
  streakCounterVal: document.getElementById("streak-counter-val"),

  scriptToggle: document.getElementById("script-toggle"),
  scriptToggleHandle: document.getElementById("script-toggle-handle"),

  appContainer: document.getElementById("app-container"),
  screenDashboard: document.getElementById("screen-dashboard"),
  screenPractice: document.getElementById("screen-practice"),
  screenArcade: document.getElementById("screen-arcade"),

  gintiSearch: document.getElementById("ginti-search"),
  clearSearchBtn: document.getElementById("clear-search-btn"),
  searchOutcomePanel: document.getElementById("search-outcome-panel"),
  searchBestMatchWrapper: document.getElementById("search-best-match-wrapper"),
  searchResultsList: document.getElementById("search-results-list"),
  searchEntryDetailsBox: document.getElementById("search-entry-details-box"),

  totalXpScorePanel: document.getElementById("total-xp-score-panel"),
  arcadeHighScorePanel: document.getElementById("arcade-high-score-panel"),
  resetAppProgressBtn: document.getElementById("reset-app-progress-btn"),

  weakAreasEmptyState: document.getElementById("weak-areas-empty-state"),
  weakAreasList: document.getElementById("weak-areas-list"),
  clearWeakAreasBtn: document.getElementById("clear-weak-areas-btn"),

  unitsFeed: document.getElementById("units-feed"),
  unitsMasteryCount: document.getElementById("units-mastery-count"),
  quickStartUnitBtn: document.getElementById("quick-start-unit-btn"),
  quickStartArcadeBtn: document.getElementById("quick-start-arcade-btn"),

  practiceBackBtn: document.getElementById("practice-back-btn"),
  questionCounter: document.getElementById("question-counter"),
  practiceProgressFill: document.getElementById("practice-progress-fill"),
  promptDisplay: document.getElementById("prompt-display"),
  practiceTtsTrigger: document.getElementById("practice-tts-trigger"),
  choiceGrid: document.getElementById("choice-grid"),
  practiceFeedbackTray: document.getElementById("practice-feedback-tray"),
  feedbackIconImg: document.getElementById("feedback-icon-img"),
  answerFeedbackMsg: document.getElementById("answer-feedback-msg"),
  feedbackSubMsg: document.getElementById("feedback-sub-msg"),
  nextQuestionBtn: document.getElementById("next-question-btn"),

  arcadeTimer: document.getElementById("arcade-timer"),
  timerDisplay: document.getElementById("timer-display"),
  arcadeScoreDisplay: document.getElementById("arcade-score-display"),
  arcadeAbandonBtn: document.getElementById("arcade-abandon-btn"),
  arcadePanicWarning: document.getElementById("arcade-panic-warning"),
  arcadePromptDisplay: document.getElementById("arcade-prompt-display"),
  arcadeChoiceGrid: document.getElementById("arcade-choice-grid"),
  arcadeInteractiveContainer: document.getElementById("arcade-interactive-container"),
  arcadeEndScreen: document.getElementById("arcade-end-screen"),
  arcadeFinalScore: document.getElementById("arcade-final-score"),
  newHighScoreTag: document.getElementById("new-high-score-tag"),
  arcadeRestartBtn: document.getElementById("arcade-restart-btn"),
  arcadeHomeBtn: document.getElementById("arcade-home-btn"),

  toastNotification: document.getElementById("toast-notification"),
  toastText: document.getElementById("toast-text")
};

// =============================================================================
// SYSTEM SOUND GENERATION ENGINE
// =============================================================================
function playSoundSynth(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === "correct") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === "incorrect") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
      osc.frequency.setValueAtTime(146.83, audioCtx.currentTime + 0.15); // D3
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === "levelUp") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
      osc.frequency.setValueAtTime(329.63, audioCtx.currentTime + 0.08); // E4
      osc.frequency.setValueAtTime(392.00, audioCtx.currentTime + 0.16); // G4
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime + 0.24); // C5
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } else {
      // click
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    }
  } catch (e) {
    // Browser audio policy blocked autoplay or synthesis missing.
  }
}

// =============================================================================
// WEB SPEECH SYNTHESIS NATIVE SPEAK FUNCTION
// =============================================================================
let voices = [];
function populateVoices() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    voices = window.speechSynthesis.getVoices();
  }
}
populateVoices();
if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.onvoiceschanged !== undefined) {
  window.speechSynthesis.onvoiceschanged = populateVoices;
}

function playWordAudio(entry) {
  if (!("speechSynthesis" in window)) {
    showToast("Speech synthesis is unavailable in this browser.");
    return;
  }
  
  if (!voices || voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
  }
  
  speechSynthesizerActive = true;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  
  const list = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
  let v = list.find((x) => {
    const l = x.lang.toLowerCase().replace("_", "-");
    return l === "ur-pk";
  });
  
  if (!v) {
    v = list.find((x) => x.lang.toLowerCase().startsWith("ur"));
  }
  
  if (!v) {
    v = list.find((x) => {
      const l = x.lang.toLowerCase().replace("_", "-");
      return l === "hi-in";
    });
  }
  
  if (!v) {
    v = list.find((x) => x.lang.toLowerCase().startsWith("hi"));
  }
  
  const fb = !v;
  const hasReg = !fb && (
    v.lang.toLowerCase().startsWith("ur") ||
    v.lang.toLowerCase().startsWith("hi") ||
    v.name.toLowerCase().includes("urdu") ||
    v.name.toLowerCase().includes("hindi")
  );
  
  const nativeVal = entry.nativeScript || entry.urdu;
  const romanVal = entry.romanUrdu || entry.roman;
  const txt = hasReg ? nativeVal : (romanVal || nativeVal);
  
  console.log(`Speaking: [${txt}]`);
  
  const u = new SpeechSynthesisUtterance(txt);
  if (!fb) {
    u.voice = v;
    u.lang = v.lang;
  } else {
    console.log("No regional voice found. Using default voice.");
  }
  
  u.rate = 0.85;
  u.pitch = 1.0;
  u.volume = 1.0;
  
  console.log("=== SPEECH SYNTHESIS DEBUG LOGS ===");
  console.log("Voices found count:", list.length);
  console.log("Utterance text:", txt);
  console.log("Selected voice name:", fb ? "System Default" : v.name);
  console.log("Selected language code:", fb ? "System Default Language" : v.lang);
  console.log("Fallback used:", fb ? "Yes" : "No");
  
  u.onstart = function(evt) {
    console.log("Speech start event fired:", evt);
  };
  
  u.onend = function(evt) {
    console.log("Speech finished successfully event fired:", evt);
    speechSynthesizerActive = false;
  };
  
  u.onerror = function(evt) {
    console.error("Speech error event fired:", evt);
    speechSynthesizerActive = false;
  };
  
  window.speechSynthesis.speak(u);
}

// =============================================================================
// TOAST NOTIFICATIONS CORE
// =============================================================================
function showToast(message) {
  DOM.toastText.textContent = message;
  DOM.toastNotification.classList.remove("hidden");
  setTimeout(() => {
    DOM.toastNotification.classList.add("hidden");
  }, 3000);
}

// =============================================================================
// BACKEND DATA LOADING AND STORAGE SYNCHRONIZATION
// =============================================================================
function loadState() {
  const loaded = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (loaded) {
    try {
      appState = JSON.parse(loaded);
    } catch (e) {
      console.error("Local Storage is corrupt. Re-initializing default values.", e);
    }
  }
  syncUiState();
}

function saveState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState));
  syncUiState();
}

function syncUiState() {
  // Sync core numbers XP, Streak and Levels
  const level = Math.max(1, Math.floor(appState.totalXP / 100) + 1);
  DOM.lvlDisplay.textContent = `Level ${level}`;
  DOM.xpDisplay.textContent = `${appState.totalXP} XP Total`;
  DOM.streakCounterVal.textContent = `${appState.streakDays} Day Streak`;

  DOM.totalXpScorePanel.textContent = `${appState.totalXP} XP`;
  DOM.arcadeHighScorePanel.textContent = `${appState.highScore} pts`;

  // Script switch toggle positioning
  if (appState.showScript) {
    DOM.scriptToggle.classList.remove("off");
    document.querySelectorAll(".item-urdu, .toggle-label-urdu").forEach(el => el.classList.remove("hidden"));
  } else {
    DOM.scriptToggle.classList.add("off");
    document.querySelectorAll(".item-urdu, .toggle-label-urdu").forEach(el => el.classList.add("hidden"));
  }

  // Update units card mastery badge visual state
  UNITS.forEach((u) => {
    const card = document.querySelector(`.unit-card[data-unit-id="${u.id}"]`);
    if (card) {
      const badge = card.querySelector(".mastered-badge");
      const fillBar = card.querySelector(".progress-fill");
      const percentage = card.querySelector(".progress-percentage");
      const isFinished = appState.completedUnits.includes(u.id);

      if (isFinished) {
        badge.classList.remove("hidden");
        fillBar.style.width = "100%";
        percentage.textContent = "100%";
      } else {
        badge.classList.add("hidden");
        fillBar.style.width = "0%";
        percentage.textContent = "0%";
      }
    }
  });

  // Calculate mastered units score ratio
  DOM.unitsMasteryCount.textContent = `${appState.completedUnits.length} / 5 Mastered`;

  // Populate mistakes tracking / weaknesses overview
  DOM.weakAreasList.innerHTML = "";
  if (appState.weakAreas.length === 0) {
    DOM.weakAreasEmptyState.classList.remove("hidden");
    DOM.clearWeakAreasBtn.classList.add("hidden");
  } else {
    DOM.weakAreasEmptyState.classList.add("hidden");
    DOM.clearWeakAreasBtn.classList.remove("hidden");

    appState.weakAreas.forEach((digit) => {
      const entObj = NUMBERS.find((n) => n.digit === digit);
      if (entObj) {
        const badge = document.createElement("div");
        badge.className = "weak-badge";
        badge.innerHTML = `
          <span class="weak-badge-digit">${entObj.digit}</span>
          <span>${entObj.romanUrdu}</span>
          <span class="weak-badge-urdu-script ${appState.showScript ? "" : "hidden"}">${entObj.nativeScript}</span>
        `;
        badge.addEventListener("click", () => {
          DOM.gintiSearch.value = entObj.digit;
          handleSearchInput();
          DOM.gintiSearch.scrollIntoView({ behavior: "smooth" });
        });
        DOM.weakAreasList.appendChild(badge);
      }
    });
  }

  // Hide onboarding card if already onboarded
  if (appState.hasOnboarded) {
    DOM.onboardingOverlay.classList.add("hidden");
  } else {
    DOM.onboardingOverlay.classList.remove("hidden");
  }
}

// =============================================================================
// SCREEN VIEW ROUTER DRIVER
// =============================================================================
function changeActiveScreen(target) {
  currentScreen = target;
  DOM.screenDashboard.classList.add("hidden");
  DOM.screenPractice.classList.add("hidden");
  DOM.screenArcade.classList.add("hidden");

  if (target === "dashboard") {
    DOM.screenDashboard.classList.remove("hidden");
  } else if (target === "practice") {
    DOM.screenPractice.classList.remove("hidden");
  } else if (target === "arcade") {
    DOM.screenArcade.classList.remove("hidden");
  }
}

// =============================================================================
// DYNAMIC COMPONENT PARSERS & TRANSLATORS FOR ANY NUMBER IN RANGE 1 - 9999
// =============================================================================
function getValueOfWord(word) {
  const norm = word.trim().toLowerCase();
  if (!norm) return null;

  const multipliers = ["sau", "so", "soo", "سو", "hazaar", "hazar", "ہزار"];
  if (multipliers.includes(norm)) return null;

  // Search inside GINTI_DICTIONARY for sub-values < 100
  const match = GINTI_DICTIONARY.find(
    (item) =>
      item.number < 100 &&
      (item.roman.toLowerCase() === norm ||
        item.urdu === norm ||
        (item.aliases || []).map((k) => k.toLowerCase()).includes(norm))
  );

  return match ? match.number : null;
}

function parseUrduPhraseToNumber(phrase) {
  const normalized = phrase.toLowerCase().trim();
  if (!normalized) return null;

  const tokens = normalized.split(/[\s+]+/);

  let total = 0;
  let tempSum = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;

    const isThousand = ["hazaar", "hazar", "hazaars", "hazars", "ہزار"].includes(token);
    const isHundred = ["sau", "so", "soo", "سو"].includes(token);

    if (isThousand) {
      if (tempSum === 0) tempSum = 1;
      total += tempSum * 1000;
      tempSum = 0;
    } else if (isHundred) {
      if (tempSum === 0) tempSum = 1;
      total += tempSum * 100;
      tempSum = 0;
    } else {
      const val = getValueOfWord(token);
      if (val !== null) {
        tempSum += val;
      }
    }
  }

  total += tempSum;

  if (total > 0 && total <= 9999) {
    return total;
  }
  return null;
}

function generateNumberEntry(digit) {
  const exact = GINTI_DICTIONARY.find((item) => item.number === digit);
  if (exact) {
    return {
      digit: exact.number,
      romanUrdu: exact.roman,
      nativeScript: exact.urdu,
      unitId: exact.unit,
      searchKeys: [exact.number.toString(), exact.roman.toLowerCase(), exact.urdu, ...(exact.aliases || [])],
      context: "Standard numerical unit."
    };
  }

  if (digit <= 0 || digit > 9999) return null;

  const thousands = Math.floor(digit / 1000);
  const hundreds = Math.floor((digit % 1000) / 100);
  const rest = digit % 100;

  const romanParts = [];
  const nativeParts = [];
  const searchKeys = [digit.toString()];

  const getSubParts = (val) => GINTI_DICTIONARY.find((item) => item.number === val);

  if (thousands > 0) {
    const tEntry = getSubParts(thousands);
    if (tEntry) {
      romanParts.push(`${tEntry.roman} Hazaar`);
      nativeParts.push(`${tEntry.urdu} ہزار`);
    } else if (thousands === 1) {
      romanParts.push("Ek Hazaar");
      nativeParts.push("ایک ہزار");
    }
  }

  if (hundreds > 0) {
    const hEntry = getSubParts(hundreds);
    if (hEntry) {
      romanParts.push(`${hEntry.roman} Sau`);
      nativeParts.push(`${hEntry.urdu} سو`);
    } else if (hundreds === 1) {
      romanParts.push("Ek Sau");
      nativeParts.push("ایک سو");
    }
  }

  if (rest > 0) {
    const rEntry = getSubParts(rest);
    if (rEntry) {
      romanParts.push(rEntry.roman);
      nativeParts.push(rEntry.urdu);
    }
  }

  if (romanParts.length === 0) return null;

  const romanUrdu = romanParts.join(" ");
  const nativeScript = nativeParts.join(" ");

  searchKeys.push(romanUrdu.toLowerCase());
  if (romanUrdu.toLowerCase().startsWith("ek ")) {
    searchKeys.push(romanUrdu.toLowerCase().substring(3));
  }
  const altRoman = romanUrdu
    .toLowerCase()
    .replace(/hazaar/g, "hazar")
    .replace(/sau/g, "so");
  if (altRoman !== romanUrdu.toLowerCase()) {
    searchKeys.push(altRoman);
  }

  return {
    digit,
    romanUrdu,
    nativeScript,
    unitId: "unit5",
    searchKeys,
    context: `Translation helper for ${digit}`
  };
}

// =============================================================================
// BIDIRECTIONAL INSTANT PANIC SEARCH HIERARCHY
// =============================================================================
function handleSearchInput() {
  const query = DOM.gintiSearch.value.trim().toLowerCase();
  
  if (!query) {
    DOM.clearSearchBtn.classList.add("hidden");
    DOM.searchOutcomePanel.classList.add("hidden");
    if (DOM.searchBestMatchWrapper) {
      DOM.searchBestMatchWrapper.classList.add("hidden");
    }
    return;
  }

  DOM.clearSearchBtn.classList.remove("hidden");
  DOM.searchOutcomePanel.classList.remove("hidden");

  // Dynamically map standard dictionary entries to search schema
  const searchDatabase = GINTI_DICTIONARY.map((entry) => {
    const searchKeys = [
      entry.number.toString(),
      entry.urdu,
      entry.roman,
      ...(entry.aliases || [])
    ];
    const existingNum = NUMBERS.find(n => n.digit === entry.number);
    return {
      digit: entry.number,
      romanUrdu: entry.roman,
      nativeScript: entry.urdu,
      unitId: entry.unit,
      searchKeys: Array.from(new Set(searchKeys)),
      context: existingNum ? (existingNum.context || "Standard numerical unit.") : "Standard numerical unit."
    };
  });

  // Evaluate matches with scoring across multi-key dictionary schema
  const resultsScored = [];

  let parsedNum = null;
  if (/^\d+$/.test(query)) {
    parsedNum = parseInt(query, 10);
  } else {
    parsedNum = parseUrduPhraseToNumber(query);
  }

  let dynamicEntryAdded = false;
  let dynamicEntry = null;
  if (parsedNum !== null && parsedNum > 0 && parsedNum <= 9999) {
    dynamicEntry = generateNumberEntry(parsedNum);
  }

  for (const entry of searchDatabase) {
    const digitStr = entry.digit.toString().toLowerCase();
    const romanLower = entry.romanUrdu.toLowerCase();
    const native = entry.nativeScript;
    const keysLower = entry.searchKeys.map((k) => k.toLowerCase());

    let isMatch = false;
    let score = 0;

    if (parsedNum !== null && entry.digit === parsedNum) {
      isMatch = true;
      score += 15000;
    }

    // 1. Exact matches:
    if (digitStr === query) {
      isMatch = true;
      score += 10000;
    }
    if (romanLower === query || native === query) {
      isMatch = true;
      score += 8000;
    }
    if (keysLower.includes(query)) {
      isMatch = true;
      score += 7000;
    }

    // 2. Starts-with matches:
    if (romanLower.startsWith(query)) {
      isMatch = true;
      score += 3000;
    }
    if (keysLower.some((k) => k.startsWith(query))) {
      isMatch = true;
      score += 2000;
    }

    // 3. Substring/Includes matches:
    if (romanLower.includes(query)) {
      isMatch = true;
      score += 500;
    }
    if (keysLower.some((k) => k.includes(query))) {
      isMatch = true;
      score += 400;
    }
    if (native.includes(query)) {
      isMatch = true;
      score += 300;
    }

    if (isMatch) {
      resultsScored.push({ entry, score });
      if (parsedNum !== null && entry.digit === parsedNum) {
        dynamicEntryAdded = true;
      }
    }
  }

  if (dynamicEntry && !dynamicEntryAdded) {
    resultsScored.push({
      entry: dynamicEntry,
      score: 9500
    });
  }

  // Sort descending by score, breaking ties with digit ascending
  const results = resultsScored
    .sort((a, b) => b.score - a.score || a.entry.digit - b.entry.digit)
    .map((m) => m.entry);

  // Handle high-contrast topmost match preview bar
  if (results.length > 0 && DOM.searchBestMatchWrapper) {
    const topMatch = results[0];
    DOM.searchBestMatchWrapper.classList.remove("hidden");
    DOM.searchBestMatchWrapper.style.display = "block";
    
    const topAltSpelling = topMatch.searchKeys.filter(sk => sk !== topMatch.digit.toString() && sk !== topMatch.nativeScript).join(", ");
    
    DOM.searchBestMatchWrapper.innerHTML = `
      <div class="best-match-preview-bar animate-fade-in" style="background-color: var(--color-emerald-950); color: #fff; border-radius: 0.75rem; padding: 0.75rem 1rem; border: 2px solid var(--color-emerald-900); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          <span style="font-size: 0.65rem; font-family: var(--font-mono); font-weight: 900; background-color: var(--color-gold-500); color: #0f172a; padding: 0.15rem 0.5rem; border-radius: 9999px;">MATCH FOUND</span>
          <span style="font-size: 1.5rem; font-weight: 900; color: var(--color-gold-400); background-color: rgba(255,255,255,0.1); padding: 0.15rem 0.60rem; border-radius: 0.35rem; font-family: var(--font-mono); border: 1px solid rgba(255,255,255,0.15);">${topMatch.digit}</span>
          <span style="font-size: 1rem; font-weight: 800; color: #fff;">${topMatch.romanUrdu}</span>
          <span style="font-size: 0.75rem; color: var(--color-slate-300);">(${topAltSpelling})</span>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${appState.showScript ? `<span style="font-family: 'Noto Nastaliq Urdu', serif; font-size: 1.25rem; color: #d1fae5;">${topMatch.nativeScript}</span>` : ""}
          <button class="match-preview-play-btn" style="background: rgba(255,255,255,0.1); hover:background: rgba(255,255,255,0.25); border: 1px solid rgba(255,255,255,0.3); border-radius: 0.5rem; padding: 0.35rem; cursor: pointer; color: #fff; display: flex; align-items: center; justify-content: center;">🔊</button>
        </div>
      </div>
    `;
    const playBtn = DOM.searchBestMatchWrapper.querySelector(".match-preview-play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        playWordAudio(topMatch);
      });
    }
  } else if (DOM.searchBestMatchWrapper) {
    DOM.searchBestMatchWrapper.classList.add("hidden");
    DOM.searchBestMatchWrapper.style.display = "none";
  }

  DOM.searchResultsList.innerHTML = "";

  if (results.length === 0) {
    DOM.searchResultsList.innerHTML = `
      <div class="help-empty-state" style="padding: 1.5rem;">
        <span class="help-icon">🔍</span>
        <p>No matching numbers found. Try alternate phonetic inputs.</p>
      </div>
    `;
    DOM.searchEntryDetailsBox.innerHTML = `
      <div class="help-empty-state">
        <span class="help-icon">❓</span>
        <p>No focus detail card available. Broaden your search request.</p>
      </div>
    `;
    return;
  }

  results.forEach((ent) => {
    const cardItem = document.createElement("div");
    cardItem.className = "search-list-item";
    cardItem.style.padding = "0.75rem";
    
    const altSpelling = ent.searchKeys.filter(sk => sk !== ent.digit.toString() && sk !== ent.nativeScript).join(", ");
    const uObj = UNITS.find((u) => u.id === ent.unitId);
    const unitTitle = uObj ? uObj.title.split(" — ")[0] : "Unit 5";

    cardItem.innerHTML = `
      <div class="item-left">
        <span class="item-num-bubble">${ent.digit}</span>
        <div class="item-details" style="display: flex; flex-direction: column; gap: 2px;">
          <h5 style="margin: 0; font-size: 0.9rem; font-weight: 700;">${ent.romanUrdu}</h5>
          <div class="item-aliases-list" style="font-size: 0.70rem; color: #515e61; font-family: var(--font-mono); line-height: 1.2;">
            Spelled: ${altSpelling}
          </div>
          <span style="font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase;">${unitTitle}</span>
        </div>
      </div>
      <div class="item-right">
        <span class="item-urdu ${appState.showScript ? "" : "hidden"}">${ent.nativeScript}</span>
        <button class="item-tts-btn" data-digit="${ent.digit}">🔊</button>
      </div>
    `;

    // Click on individual search list item to focus detail view
    cardItem.addEventListener("click", () => {
      document.querySelectorAll(".search-list-item").forEach(i => i.classList.remove("active"));
      cardItem.classList.add("active");
      triggerFocusCardDetails(ent);
    });

    const speakBtn = cardItem.querySelector(".item-tts-btn");
    speakBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      playSoundSynth("click");
      playWordAudio(ent);
    });

    DOM.searchResultsList.appendChild(cardItem);
  });

  // Highlight first item automatically
  triggerFocusCardDetails(results[0]);
  const firstChild = DOM.searchResultsList.firstElementChild;
  if (firstChild && firstChild.classList.contains("search-list-item")) {
    firstChild.classList.add("active");
  }
}

function triggerFocusCardDetails(ent) {
  DOM.searchEntryDetailsBox.innerHTML = `
    <div class="search-detail-focus-card animate-fade-in">
      <span class="detail-badge">Primary Reference</span>
      <div class="detail-digit">${ent.digit}</div>
      <div class="detail-roman-row">
        <span class="detail-roman">${ent.romanUrdu}</span>
        <button class="detail-tts-trigger">🔊</button>
      </div>
      <div class="detail-urdu ${appState.showScript ? "" : "hidden"}">${ent.nativeScript}</div>
      <div class="detail-context-deck">
        <div class="detail-context-title">Context Marker</div>
        <div class="detail-context-val">${ent.context || "No context card needed. Standard numerical unit."}</div>
      </div>
    </div>
  `;

  const speaker = DOM.searchEntryDetailsBox.querySelector(".detail-tts-trigger");
  if (speaker) {
    speaker.addEventListener("click", () => {
      playSoundSynth("click");
      playWordAudio(ent);
    });
  }
}

// =============================================================================
// PRACTICE LESSONS INTERACTIVE MULTICHOICE ENGINE
// =============================================================================
function getSmartDistractors(entry, pFormat) {
  const exactTypeGoal = pFormat === "roman_to_digit" || pFormat === "script_to_digit";
  const exactScriptGoal = pFormat === "digit_to_script";

  const correctAnswer = exactTypeGoal 
    ? entry.digit 
    : exactScriptGoal 
      ? entry.nativeScript 
      : entry.romanUrdu;

  const candidates = NUMBERS.filter((n) => n.digit !== entry.digit);

  const scored = candidates.map((n) => {
    let score = 0;

    // 1. Same UnitId: +60 points
    if (n.unitId === entry.unitId) {
      score += 60;
    }

    // 2. Numerical closeness
    const diff = Math.abs(n.digit - entry.digit);
    if (diff <= 5) {
      score += 45;
    } else if (diff <= 10) {
      score += 30;
    } else if (diff <= 25) {
      score += 15;
    } else if (diff <= 50) {
      score += 5;
    }

    // 3. Digit structural similarities
    if (n.digit % 10 === entry.digit % 10) {
      score += 25;
    }
    if (Math.floor(n.digit / 10) === Math.floor(entry.digit / 10) && n.digit < 100 && entry.digit < 100) {
      score += 25;
    }
    if (n.digit % 100 === entry.digit % 100) {
      score += 20;
    }
    if (n.digit % 1000 === entry.digit % 1000) {
      score += 20;
    }

    // 4. Phonetic / Roman Urdu Similarity
    const r1 = entry.romanUrdu.toLowerCase();
    const r2 = n.romanUrdu.toLowerCase();
    
    const commonSuffixes = ["tees", "alees", "asi", "wan", "sath", "ttar", "rah", "dah", "ees", "un", "sau", "hazaar"];
    for (const suffix of commonSuffixes) {
      if (r1.endsWith(suffix) && r2.endsWith(suffix)) {
        score += 35;
        break;
      }
    }

    const commonPrefixes = ["tain", "baye", "chha", "sata", "atha", "pan", "cha", "ik", "ba", "te", "sa"];
    for (const prefix of commonPrefixes) {
      if (r1.startsWith(prefix) && r2.startsWith(prefix)) {
        score += 25;
        break;
      }
    }

    if (r1.substring(0, 3) === r2.substring(0, 3)) {
      score += 15;
    }

    // 5. Native Script visual similarity
    const s1 = entry.nativeScript;
    const s2 = n.nativeScript;
    const commonUrduSuffixes = ["تیس", "بیس", "چالیس", "ون", "تر", "سی", "وے", "سو", "ہزار"];
    for (const uSuffix of commonUrduSuffixes) {
      if (s1.endsWith(uSuffix) && s2.endsWith(uSuffix)) {
        score += 35;
        break;
      }
    }

    // Random Jitter
    const jitter = Math.random() * 12;

    return { candidate: n, totalScore: score + jitter };
  });

  const sorted = [...scored].sort((a, b) => b.totalScore - a.totalScore);

  const distractors = [];
  for (const item of sorted) {
    if (distractors.length >= 3) break;
    const cVal = exactTypeGoal 
      ? item.candidate.digit 
      : exactScriptGoal 
        ? item.candidate.nativeScript 
        : item.candidate.romanUrdu;
    
    if (cVal !== correctAnswer && !distractors.includes(cVal)) {
      distractors.push(cVal);
    }
  }

  while (distractors.length < 3) {
    const fallbackNum = Math.floor(Math.random() * 100) + 1;
    const fallbackEntry = NUMBERS.find((num) => num.digit === fallbackNum) || NUMBERS[0];
    const cVal = exactTypeGoal 
      ? fallbackEntry.digit 
      : exactScriptGoal 
        ? fallbackEntry.nativeScript 
        : fallbackEntry.romanUrdu;
    
    if (cVal !== correctAnswer && !distractors.includes(cVal)) {
      distractors.push(cVal);
    }
  }

  return distractors;
}

function makeQuizQuestion(unitId, index) {
  const unitList = NUMBERS.filter((n) => n.unitId === unitId);
  const entry = unitList[index % unitList.length];

  const prompts = ["digit_to_roman", "roman_to_digit", "digit_to_script", "script_to_roman"];
  const pType = prompts[index % prompts.length];

  let pVal = "";
  let cAns = "";

  switch (pType) {
    case "digit_to_roman": pVal = entry.digit; cAns = entry.romanUrdu; break;
    case "roman_to_digit": pVal = entry.romanUrdu; cAns = entry.digit; break;
    case "digit_to_script": pVal = entry.digit; cAns = entry.nativeScript; break;
    case "script_to_roman": pVal = entry.nativeScript; cAns = entry.romanUrdu; break;
  }

  const distractors = getSmartDistractors(entry, pType);
  const choices = [cAns, ...distractors].sort(() => 0.5 - Math.random());

  return { entry, promptType: pType, promptValue: pVal, correctAnswer: cAns, choices };
}

function startUnitQuiz(unitId) {
  playSoundSynth("click");
  DOM.gintiSearch.value = "";
  handleSearchInput(); // Clear search active outcomes

  const list = NUMBERS.filter((n) => n.unitId === unitId);
  if (list.length === 0) return;

  const questions = [];
  for (let i = 0; i < 10; i++) {
    questions.push(makeQuizQuestion(unitId, i));
  }

  currentQuiz = {
    unitId: unitId,
    questions: questions,
    currentIndex: 0,
    score: 0,
    isAnswered: false,
    selectedAnswer: null
  };

  renderQuizCard();
  changeActiveScreen("practice");
}

function renderQuizCard() {
  const currentQ = currentQuiz.questions[currentQuiz.currentIndex];
  
  DOM.questionCounter.textContent = `Card ${currentQuiz.currentIndex + 1} of 10`;
  DOM.practiceProgressFill.style.width = `${((currentQuiz.currentIndex + 1) / 10) * 100}%`;

  DOM.promptDisplay.textContent = currentQ.promptValue;

  if (currentQ.promptType === "script_to_roman") {
    DOM.promptDisplay.className = "urdu-large-script";
  } else {
    DOM.promptDisplay.className = "";
  }

  // Bind dynamic event listeners
  DOM.choiceGrid.innerHTML = "";
  currentQ.choices.forEach((choice, idx) => {
    const btnOption = document.createElement("button");
    btnOption.className = "choice-btn";
    btnOption.innerHTML = typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) 
      ? `<span class="choice-urdu">${choice}</span>` 
      : `<span>${choice}</span>`;

    btnOption.addEventListener("click", () => {
      evaluateChoiceSelection(choice, btnOption);
    });

    DOM.choiceGrid.appendChild(btnOption);
  });

  DOM.practiceFeedbackTray.classList.add("hidden");
  currentQuiz.isAnswered = false;
  currentQuiz.selectedAnswer = null;
}

function animateMascot(isCorrect) {
  const mascot = document.getElementById("ginti-mascot-container");
  if (mascot) {
    const animClass = isCorrect ? "jump" : "shake";
    mascot.classList.add(animClass);
    setTimeout(() => {
      mascot.classList.remove(animClass);
    }, 600);
  }
}

function evaluateChoiceSelection(choiceSelected, elementBtn) {
  if (currentQuiz.isAnswered) return;

  currentQuiz.isAnswered = true;
  currentQuiz.selectedAnswer = choiceSelected;

  const q = currentQuiz.questions[currentQuiz.currentIndex];
  const isCorrect = choiceSelected === q.correctAnswer;

  playSoundSynth(isCorrect ? "correct" : "incorrect");
  animateMascot(isCorrect);

  // Visual cues on choices
  document.querySelectorAll(".choice-btn").forEach((btn) => {
    const innerText = btn.textContent.trim();
    if (innerText === String(q.correctAnswer)) {
      btn.classList.add("correct-feedback");
    } else if (innerText === String(choiceSelected)) {
      btn.classList.add("wrong-feedback");
    } else {
      btn.classList.add("dimmed");
    }
  });

  // Log weaknesses on mistakes
  if (!isCorrect) {
    if (!appState.weakAreas.includes(q.entry.digit)) {
      appState.weakAreas.push(q.entry.digit);
    }
  }

  // Update dynamic XP totals and scores
  appState.totalXP = isCorrect ? appState.totalXP + 10 : appState.totalXP;
  currentQuiz.score = isCorrect ? currentQuiz.score + 10 : currentQuiz.score;
  saveState();

  // Highlight feedback tray attributes
  DOM.practiceFeedbackTray.classList.remove("hidden");
  if (isCorrect) {
    DOM.practiceFeedbackTray.className = "correct-tray";
    DOM.feedbackIconImg.textContent = "✓";
    DOM.answerFeedbackMsg.textContent = "Shabash! Splendid Translation.";
    DOM.feedbackSubMsg.textContent = "Nice matching intuition!";
  } else {
    DOM.practiceFeedbackTray.className = "wrong-tray";
    DOM.feedbackIconImg.textContent = "×";
    DOM.answerFeedbackMsg.textContent = "Wrong selection! Got mistake.";
    DOM.feedbackSubMsg.innerHTML = `Correct mapping: <strong>${q.correctAnswer}</strong>`;
  }
}

function progressQuizStep() {
  const nextIdx = currentQuiz.currentIndex + 1;
  if (nextIdx >= 10) {
    // Reward bonus XP on milestones!
    const isNew = !appState.completedUnits.includes(currentQuiz.unitId);
    if (isNew) {
      appState.completedUnits.push(currentQuiz.unitId);
    }
    appState.totalXP += 50; // Unit completion reward
    saveState();

    playSoundSynth("levelUp");
    showToast("Unit Completed! Awarded +50 Reward XP! 🎉");
    currentQuiz = null;
    changeActiveScreen("dashboard");
  } else {
    currentQuiz.currentIndex = nextIdx;
    renderQuizCard();
  }
}

// =============================================================================
// ARCADE BLITZ GAMEPLAY REACTOR MODE
// =============================================================================
function makeArcadeQuestion() {
  const randomObject = NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  const prompts = ["digit_to_roman", "roman_to_digit", "digit_to_script", "script_to_roman"];
  const selectQueryType = prompts[Math.floor(Math.random() * prompts.length)];

  let pValue = "";
  let cAnswer = "";

  switch (selectQueryType) {
    case "digit_to_roman": pValue = randomObject.digit; cAnswer = randomObject.romanUrdu; break;
    case "roman_to_digit": pValue = randomObject.romanUrdu; cAnswer = randomObject.digit; break;
    case "digit_to_script": pValue = randomObject.digit; cAnswer = randomObject.nativeScript; break;
    case "script_to_roman": pValue = randomObject.nativeScript; cAnswer = randomObject.romanUrdu; break;
  }

  // Draw 3 random targets from pool
  const options = [];
  const expectNumType = typeof cAnswer === "number";
  const expectScriptType = selectQueryType === "digit_to_script";

  const otherList = NUMBERS.filter((n) => n.digit !== randomObject.digit).sort(() => 0.5 - Math.random());
  for (const match of otherList) {
    if (options.length >= 3) break;
    let optionValue = expectNumType ? match.digit : expectScriptType ? match.nativeScript : match.romanUrdu;
    if (!options.includes(optionValue) && optionValue !== cAnswer) {
      options.push(optionValue);
    }
  }

  while (options.length < 3) {
    const padVal = expectNumType ? 888 : "Ek";
    if (padVal !== cAnswer && !options.includes(padVal)) {
      options.push(padVal);
    }
  }

  const shuffledChoices = [cAnswer, ...options].sort(() => 0.5 - Math.random());

  return { entry: randomObject, promptType: selectQueryType, promptValue: pValue, correctAnswer: cAnswer, choices: shuffledChoices };
}

function startArcadeSession() {
  playSoundSynth("click");
  DOM.gintiSearch.value = "";
  handleSearchInput();

  currentArcade = { score: 0, activeQuestion: makeArcadeQuestion(), timeLeft: 30, wrongAnswersCount: 0 };

  DOM.arcadeInteractiveContainer.classList.remove("hidden");
  DOM.arcadeEndScreen.classList.add("hidden");

  renderArcadeLayout();
  changeActiveScreen("arcade");

  if (arcadeTimerId) clearInterval(arcadeTimerId);

  // 30 Seconds Countdown Timer Interval Clock
  arcadeTimerId = setInterval(() => {
    currentArcade.timeLeft--;
    DOM.timerDisplay.textContent = currentArcade.timeLeft;

    if (currentArcade.timeLeft <= 5) {
      DOM.arcadePanicWarning.classList.remove("hidden");
    } else {
      DOM.arcadePanicWarning.classList.add("hidden");
    }

    if (currentArcade.timeLeft <= 0) {
      clearInterval(arcadeTimerId);
      triggerArcadeGameOver();
    }
  }, 1000);
}

function renderArcadeLayout() {
  const activeQ = currentArcade.activeQuestion;
  DOM.arcadeScoreDisplay.textContent = currentArcade.score;
  DOM.timerDisplay.textContent = currentArcade.timeLeft;

  DOM.arcadePromptDisplay.textContent = activeQ.promptValue;

  if (activeQ.promptType === "script_to_roman") {
    DOM.arcadePromptDisplay.className = "urdu-large-script";
  } else {
    DOM.arcadePromptDisplay.className = "";
  }

  DOM.arcadeChoiceGrid.innerHTML = "";
  activeQ.choices.forEach((choice, idx) => {
    const btnArc = document.createElement("button");
    btnArc.className = "arcade-btn";
    btnArc.innerHTML = typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) 
      ? `<span class="choice-urdu">${choice}</span>` 
      : `<span>${choice}</span>`;

    btnArc.addEventListener("click", () => {
      evaluateArcadeReflexSelection(choice);
    });

    DOM.arcadeChoiceGrid.appendChild(btnArc);
  });
}

function evaluateArcadeReflexSelection(choiceSelected) {
  const activeQ = currentArcade.activeQuestion;
  const isCorrect = choiceSelected === activeQ.correctAnswer;

  playSoundSynth(isCorrect ? "correct" : "incorrect");
  animateMascot(isCorrect);

  if (isCorrect) {
    currentArcade.score += 10;
  } else {
    currentArcade.score = Math.max(0, currentArcade.score - 5);
    currentArcade.wrongAnswersCount++;

    // Add mistake references
    if (!appState.weakAreas.includes(activeQ.entry.digit)) {
      appState.weakAreas.push(activeQ.entry.digit);
    }
  }

  currentArcade.activeQuestion = makeArcadeQuestion();
  renderArcadeLayout();
}

function triggerArcadeGameOver() {
  playSoundSynth("levelUp");
  DOM.arcadeInteractiveContainer.classList.add("hidden");
  DOM.arcadeEndScreen.classList.remove("hidden");
  DOM.arcadePanicWarning.classList.add("hidden");

  DOM.arcadeFinalScore.textContent = currentArcade.score;

  const preHighVal = appState.highScore;
  const beatHighScore = currentArcade.score > preHighVal;

  if (beatHighScore && currentArcade.score > 0) {
    appState.highScore = currentArcade.score;
    DOM.newHighScoreTag.classList.remove("hidden");
    showToast("👑 Majestic! Dynamic High Score Shattered!");
  } else {
    DOM.newHighScoreTag.classList.add("hidden");
  }

  // Grant the score points as permanent XP directly
  appState.totalXP += currentArcade.score;
  saveState();
}

function abandonMatchReflex() {
  if (confirm("Do you really want to abandon this arcade match? No milestone points will be recorded.")) {
    if (arcadeTimerId) clearInterval(arcadeTimerId);
    currentArcade = null;
    changeActiveScreen("dashboard");
  }
}

// =============================================================================
// SYSTEM RESET METRICS WIPE
// =============================================================================
function wipeAllProgress() {
  if (confirm("Restore original state? This action wipes all high scores, accumulated XP points, weak areas, and completed units.")) {
    appState = {
      totalXP: 0,
      completedUnits: [],
      weakAreas: [],
      showScript: true,
      highScore: 0,
      streakDays: 3,
      hasOnboarded: false
    };
    saveState();
    changeActiveScreen("dashboard");
    if (arcadeTimerId) clearInterval(arcadeTimerId);
  }
}

// =============================================================================
// GLOBAL DIRECT BIND EVENT INITIALIZERS
// =============================================================================
function initApp() {
  loadState();

  // Onboarding controls click handlers
  DOM.choiceLearnBtn.addEventListener("click", () => {
    playSoundSynth("click");
    appState.hasOnboarded = true;
    saveState();
    showToast("Onboarded! Click Start on Unit 1 to scale!");
  });

  DOM.choiceLookupBtn.addEventListener("click", () => {
    playSoundSynth("click");
    appState.hasOnboarded = true;
    saveState();
    showToast("Lookup Activated! Type Romanized or Numbers.");
    DOM.gintiSearch.focus();
  });

  // Script Toggle buttons event handlers
  DOM.scriptToggle.addEventListener("click", () => {
    playSoundSynth("click");
    appState.showScript = !appState.showScript;
    saveState();
    showToast(appState.showScript ? "Urdu native scripts visible." : "Urdu matching hidden, Roman focused.");
  });

  // Numeric bidirectional searching triggers
  DOM.gintiSearch.addEventListener("input", handleSearchInput);
  DOM.clearSearchBtn.addEventListener("click", () => {
    playSoundSynth("click");
    DOM.gintiSearch.value = "";
    handleSearchInput();
  });

  // Wire up panic-quick-btn suggestion targets in vanilla lookup
  document.querySelectorAll(".panic-quick-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      playSoundSynth("click");
      DOM.gintiSearch.value = btn.getAttribute("data-term");
      handleSearchInput();
    });
  });

  // Unit card button launches
  document.querySelectorAll('.unit-card .unit-action-btn, .unit-card').forEach((cardElement) => {
    cardElement.addEventListener("click", (e) => {
      // Find unit id attribute recursively
      const actionRef = cardElement.getAttribute("data-action");
      if (actionRef === "start-unit") {
        const uId = cardElement.getAttribute("data-unit-id");
        if (uId) startUnitQuiz(uId);
      }
    });
  });

  DOM.quickStartUnitBtn.addEventListener("click", () => {
    // Start first incomplete unit
    const openUnit = UNITS.find((u) => !appState.completedUnits.includes(u.id)) || UNITS[0];
    startUnitQuiz(openUnit.id);
  });

  DOM.quickStartArcadeBtn.addEventListener("click", startArcadeSession);

  // Lesson quiz screen action feedback binds
  DOM.practiceBackBtn.addEventListener("click", () => {
    playSoundSynth("click");
    currentQuiz = null;
    changeActiveScreen("dashboard");
  });

  DOM.practiceTtsTrigger.addEventListener("click", () => {
    if (currentQuiz) {
      const q = currentQuiz.questions[currentQuiz.currentIndex];
      playSoundSynth("click");
      playWordAudio(q.entry);
    }
  });

  DOM.nextQuestionBtn.addEventListener("click", () => {
    playSoundSynth("click");
    progressQuizStep();
  });

  // Arcade Blitz timers
  DOM.arcadeAbandonBtn.addEventListener("click", abandonMatchReflex);

  DOM.arcadeRestartBtn.addEventListener("click", startArcadeSession);
  DOM.arcadeHomeBtn.addEventListener("click", () => {
    playSoundSynth("click");
    currentArcade = null;
    changeActiveScreen("dashboard");
  });

  DOM.resetAppProgressBtn.addEventListener("click", wipeAllProgress);
  DOM.clearWeakAreasBtn.addEventListener("click", () => {
    playSoundSynth("click");
    appState.weakAreas = [];
    saveState();
    showToast("Mistakes logs wiped cleanly!");
  });

  // Header click resets back home recursively
  DOM.headerLogo.addEventListener("click", () => {
    playSoundSynth("click");
    if (currentScreen === "practice") {
      currentQuiz = null;
    } else if (currentScreen === "arcade") {
      if (arcadeTimerId) clearInterval(arcadeTimerId);
      currentArcade = null;
    }
    changeActiveScreen("dashboard");
  });
}

// Kick off initialization
window.addEventListener("DOMContentLoaded", initApp);
