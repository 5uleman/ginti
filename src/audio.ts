import { NumberEntry } from "./data";

let cachedVoices: SpeechSynthesisVoice[] = [];
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

export const speakNumberEntry = (
  entry: NumberEntry,
  setSpeechActive: (active: boolean) => void,
  showToast: (message: string) => void
) => {
  if (!("speechSynthesis" in window)) {
    showToast("Speech synthesis is unavailable in this environment.");
    return;
  }

  if (!cachedVoices || cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  setSpeechActive(true);
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();

  const voicesList = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  let selectedVoice = null;
  let fallbackUsed = false;

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

  // 3. If unavailable, try Hindi voice (hi-IN)
  if (!selectedVoice) {
    selectedVoice = voicesList.find((v) => {
      const l = v.lang.toLowerCase().replace("_", "-");
      return l === "hi-in";
    });
  }

  // 4. If unavailable, try any voice starting with "hi"
  if (!selectedVoice) {
    selectedVoice = voicesList.find((v) => v.lang.toLowerCase().startsWith("hi"));
  }

  // 5. If unavailable, use the browser default fallback voice
  if (!selectedVoice) {
    fallbackUsed = true;
  }

  const hasRegionalVoice = !fallbackUsed && selectedVoice && (
    selectedVoice.lang.toLowerCase().startsWith("ur") ||
    selectedVoice.lang.toLowerCase().startsWith("hi") ||
    selectedVoice.name.toLowerCase().includes("urdu") ||
    selectedVoice.name.toLowerCase().includes("hindi")
  );

  const textToSpeak = hasRegionalVoice ? entry.nativeScript : entry.romanUrdu;
  
  console.log(`Speaking: [${textToSpeak}]`);

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
  console.log("Voices found count:", voicesList.length);
  console.log("Utterance text:", textToSpeak);
  console.log("Selected voice name:", selectedVoice ? selectedVoice.name : "System/Browser Default");
  console.log("Selected language code:", selectedVoice ? selectedVoice.lang : "System Default Language");
  console.log("Fallback used:", fallbackUsed ? "Yes" : "No");

  utterance.onstart = (evt) => {
    console.log("Speech start event fired:", evt);
  };

  utterance.onend = (evt) => {
    console.log("Speech finished successfully event fired:", evt);
    setSpeechActive(false);
  };

  utterance.onerror = (evt) => {
    console.error("Speech error event fired:", evt);
    setSpeechActive(false);
  };

  window.speechSynthesis.speak(utterance);
};
