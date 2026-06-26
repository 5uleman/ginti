import { NumberEntry } from "./data";

let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// Keep active utterances alive to prevent desktop Chrome garbage collection
const activeUtterances = new Set<SpeechSynthesisUtterance>();

export const speakNumberEntry = (
  entry: NumberEntry,
  setSpeechActive: (active: boolean) => void,
  showToast: (message: string) => void
) => {
  if (!("speechSynthesis" in window)) {
    showToast("Speech synthesis is unavailable in this environment.");
    return;
  }

  // Cancel any ongoing speech first to clear the browser speech queue
  window.speechSynthesis.cancel();

  // A brief delay allows the browser's speechSynthesis engine to complete the cancel operation asynchronously,
  // avoiding a well-known race condition in desktop Chrome where a subsequent speak() call is immediately cancelled.
  setTimeout(() => {
    if (!cachedVoices || cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }

    const voicesList = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    let selectedVoice = null;
    let fallbackUsed = false;

    const isMobile = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Hierarchy:
    // 1. Try exact Urdu voice (ur-PK)
    selectedVoice = voicesList.find((v) => {
      const l = v.lang.toLowerCase().replace("_", "-");
      return l === "ur-pk";
    });

    // 2. If unavailable, try any voice starting with "ur"
    if (!selectedVoice) {
      selectedVoice = voicesList.find((v) => v.lang.toLowerCase().startsWith("ur"));
    }

    // 3. Only on mobile: try Hindi voice (hi-IN) as a pronunciation fallback.
    // On desktop, Hindi voices (e.g. Microsoft/Google Hindi) fed with Latin characters (Roman Urdu) stay completely silent,
    // so we skip them on desktop to let it fall back to standard English/system voices which read Latin script perfectly.
    if (!selectedVoice && isMobile) {
      selectedVoice = voicesList.find((v) => {
        const l = v.lang.toLowerCase().replace("_", "-");
        return l === "hi-in";
      });

      if (!selectedVoice) {
        selectedVoice = voicesList.find((v) => v.lang.toLowerCase().startsWith("hi"));
      }
    }

    if (!selectedVoice) {
      fallbackUsed = true;
    }

    // CRITICAL COMPATIBILITY FIX:
    // Native Urdu voices can read Urdu script characters (entry.nativeScript).
    // Hindi voices and other fallback voices cannot parse Urdu script characters (e.g. Arabic characters like "ایک")
    // and will stay completely silent or crash on desktop browsers.
    // However, Hindi voices and system default voices can read Roman Urdu text (entry.romanUrdu) perfectly.
    // Furthermore, Hindi voices will pronounce Roman Urdu words with a very natural and correct regional accent.
    const isUrduVoice = !fallbackUsed && selectedVoice && (
      selectedVoice.lang.toLowerCase().startsWith("ur") ||
      selectedVoice.name.toLowerCase().includes("urdu")
    );

    const textToSpeak = isUrduVoice ? entry.nativeScript : entry.romanUrdu;

    setSpeechActive(true);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      console.log("No regional voice found. Using default voice.");
    }

    utterance.rate = 0.85; // Slower cadence for clearer learning
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    console.log("=== SPEECH SYNTHESIS DEBUG LOGS ===");
    console.log("Is Mobile Client:", isMobile ? "true" : "false");
    console.log("Voices found count:", voicesList.length);
    console.log("Utterance text:", textToSpeak);
    console.log("Selected voice name:", selectedVoice ? selectedVoice.name : "System/Browser Default");
    console.log("Selected language code:", selectedVoice ? selectedVoice.lang : "System Default Language");
    console.log("Is Urdu Voice:", isUrduVoice ? "true" : "false");
    console.log("Fallback used:", fallbackUsed ? "Yes" : "No");

    // Add reference to prevent garbage collection on desktop Chrome
    activeUtterances.add(utterance);

    // Safety timeout fallback to prevent the speaker button from getting permanently disabled
    // (e.g. if events don't fire due to iframe policy or browser audio blockage)
    const safetyTimeoutId = setTimeout(() => {
      console.warn("Speech playback safety timeout reached. Force resetting speechActive state.");
      activeUtterances.delete(utterance);
      setSpeechActive(false);
    }, 3500);

    utterance.onstart = (evt) => {
      console.log("Speech start event fired:", evt);
    };

    utterance.onend = (evt) => {
      console.log("Speech finished successfully event fired:", evt);
      clearTimeout(safetyTimeoutId);
      activeUtterances.delete(utterance);
      setSpeechActive(false);
    };

    utterance.onerror = (evt) => {
      console.error("Speech error event fired:", evt);
      clearTimeout(safetyTimeoutId);
      activeUtterances.delete(utterance);
      setSpeechActive(false);
    };

    // Ensure the synthesis queue is not in a paused state, then speak
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }, 50);
};
