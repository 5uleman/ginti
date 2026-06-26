import React, { useState, useEffect, useRef } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  Search, 
  Flame, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  X, 
  Zap, 
  Sparkles, 
  SearchX, 
  ChevronRight, 
  RotateCcw,
  BookMarked,
  VolumeX,
  Play,
  Share2,
  Trash2,
  Lock,
  Star,
  RefreshCw,
  HelpCircle,
  Home,
  LifeBuoy,
  Sun,
  Moon,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  XCircle,
  Clock,
  Info
} from "lucide-react";
import { NUMBERS, UNITS, NumberEntry, Unit } from "./data";
import { speakNumberEntry } from "./audio";
import { getNumberExplanation, FAMILY_STYLES } from "./explanations";

// Premium Speaker Icon Component
const PremiumSpeakerIcon = ({ 
  className = "w-full h-full text-emerald-800",
  style 
}: { 
  className?: string; 
  style?: React.CSSProperties; 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={`${className} transition-transform duration-100 group-active:scale-90 active:scale-90`}
      style={style}
    >
      <path d="M13.5 4.06c0-.75-.74-1.24-1.42-.89l-4.66 2.33H4.5A2.25 2.25 0 0 0 2.25 7.75v8.5A2.25 2.25 0 0 0 4.5 18.5h2.92l4.66 2.33c.68.34 1.42-.15 1.42-.89V4.06Z" />
      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" d="M16.5 8.5c.6.9 1 2.1 1 3.5s-.4 2.6-1 3.5" />
      <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" d="M19.5 5.5c1.2 1.8 2 4.1 2 6.5s-.8 4.7-2 6.5" />
    </svg>
  );
};

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface AppState {
  totalXP: number;
  completedUnits: string[]; // List of completed unit ids
  weakAreas: number[]; // List of digits where user made mistakes
  showScript: boolean; // Urdu Native toggle status
  highScore: number; // Highest score achieved in Arcade Blitz
  masteryStreak: number; // Number of correct answers in a row
  streakDays: number; // Simulated/Local streak days
  lastActiveDate?: string; // Last active date in YYYY-MM-DD
  hasOnboarded: boolean;
  unitStagesProgress?: Record<string, number>;
  arenaMin?: number;
  arenaMax?: number;
  arenaStageProgress?: number;
  arenaWeakMap?: Record<number, number>;
  arenaSlowMap?: Record<number, number>;
  arenaCorrectMap?: Record<number, number>;
  arenaRangeHistory?: { min: number; max: number }[];
  isDarkMode?: boolean;
  arenaStarted?: boolean;
  arenaCompleted?: boolean;
}

type ScreenType = "dashboard" | "practice" | "arcade" | "unit-journey" | "training-arena";

interface QuizQuestion {
  entry: NumberEntry;
  promptType: "digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_roman" | "script_to_digit";
  promptValue: string | number;
  correctAnswer: string | number;
  choices: (string | number)[];
}

interface QuizState {
  unitId: string;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: boolean[];
  userAnswer: string | number | null;
  isAnswered: boolean;
  score: number;
  hearts: number;
  showHeartsRefill: boolean;
  isStage5Test?: boolean;
  mithuFeedback?: { title: string; subtitle: string };
}

interface ArcadeState {
  score: number;
  activeQuestion: QuizQuestion | null;
  timeLeft: number;
  isGameOver: boolean;
  totalAnswered: number;
  wrongCount: number;
  selectedAnswer?: string | number | null;
  isAnswered?: boolean;
}

interface RecoveryRoundState {
  originalMode: "journey_stage2" | "journey_stage3" | "journey_stage5" | "arena_stage2" | "arena_stage3" | "arena_stage5";
  unitId?: string;
  questions: any[];
  currentIndex: number;
  userAnswer: string | number | null;
  isAnswered: boolean;
  score: number;
  attemptsMap: Record<number, number>; // digit -> fail count
  initialMistakes: NumberEntry[];
  mastered: number[];
  failedPermanently: number[];
  isDone: boolean;
  mithuFeedback?: { title: string; subtitle: string };
}

const LOCAL_STORAGE_KEY = "ginti_emerald_gold_state";

// =============================================================================
// SMART DISTRACTORS GENERATION UTILITY (CHALLENGING & PHONETICALLY AWARE)
// =============================================================================
export function getSmartDistractors(
  entry: NumberEntry,
  pFormat: "digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_roman" | "script_to_digit",
  pool?: NumberEntry[]
): (string | number)[] {
  const exactTypeGoal = pFormat === "roman_to_digit" || pFormat === "script_to_digit";
  const exactScriptGoal = pFormat === "digit_to_script";

  const correctAnswer = exactTypeGoal 
    ? entry.digit 
    : exactScriptGoal 
      ? entry.nativeScript 
      : entry.romanUrdu;

  const candidatesPool = pool && pool.length >= 4 ? pool : NUMBERS;
  const candidates = candidatesPool.filter((n) => n.digit !== entry.digit);

  const scored = candidates.map((n) => {
    let score = 0;

    // 1. Same UnitId: +60 points (High priority to keep distractors inside the same unit)
    if (n.unitId === entry.unitId) {
      score += 60;
    }

    // 2. Numerical closeness (distance)
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
    // Units digit match (e.g. 33 vs 23, 13, 43)
    if (n.digit % 10 === entry.digit % 10) {
      score += 25;
    }
    // Tens digit match (e.g. 33 vs 31, 32, 35)
    if (Math.floor(n.digit / 10) === Math.floor(entry.digit / 10) && n.digit < 100 && entry.digit < 100) {
      score += 25;
    }
    // For large numbers / Unit 5 compatibility (multiples of 50/100/1000)
    if (n.digit % 100 === entry.digit % 100) {
      score += 20;
    }
    if (n.digit % 1000 === entry.digit % 1000) {
      score += 20;
    }

    // 4. Phonetic / Roman Urdu Similarity (lowercase comparison)
    const r1 = entry.romanUrdu.toLowerCase();
    const r2 = n.romanUrdu.toLowerCase();
    
    // Shared suffix (e.g. "tees", "alees", "asi", "wan", "sath", "ttar", "rah", "dah")
    const commonSuffixes = ["tees", "alees", "asi", "wan", "sath", "ttar", "rah", "dah", "ees", "un", "sau", "hazaar"];
    for (const suffix of commonSuffixes) {
      if (r1.endsWith(suffix) && r2.endsWith(suffix)) {
        score += 35;
        break;
      }
    }

    // Shared prefix (e.g. "tain", "baye", "chha", "sata", "atha")
    const commonPrefixes = ["tain", "baye", "chha", "sata", "atha", "pan", "cha", "ik", "ba", "te", "sa"];
    for (const prefix of commonPrefixes) {
      if (r1.startsWith(prefix) && r2.startsWith(prefix)) {
        score += 25;
        break;
      }
    }

    // Substring similarity
    if (r1.substring(0, 3) === r2.substring(0, 3)) {
      score += 15;
    }

    // 5. Native Script visual similarity (Urdu characters)
    const s1 = entry.nativeScript;
    const s2 = n.nativeScript;
    // Check if they share ending characters in Urdu (e.g., "تیس", "بیس", "اس", "ون", "تر", "سی", "وے", "سو")
    const commonUrduSuffixes = ["تیس", "بیس", "چالیس", "ون", "تر", "سی", "وے", "سو", "ہزار"];
    for (const uSuffix of commonUrduSuffixes) {
      if (s1.endsWith(uSuffix) && s2.endsWith(uSuffix)) {
        score += 35;
        break;
      }
    }

    // Random Jitter to keep options fresh and dynamic
    const jitter = Math.random() * 12;

    return { candidate: n, totalScore: score + jitter };
  });

  // Sort descending by calculated priority score
  const sorted = [...scored].sort((a, b) => b.totalScore - a.totalScore);

  // Pick top 3 unique values mapped to correct format
  const distractors: (string | number)[] = [];
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

  // Safe fallback if we can't get enough distractors
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

// =============================================================================
// MITHU DYNAMIC PERSONALITY FEEDBACK POOLS & GENERATORS
// =============================================================================
const MITHU_CORRECT_POOL = [
  "Shabash! 🌟",
  "Wah! Spot on.",
  "Bilkul sahi! ✔️",
  "Zabardast! 🔥",
  "Kamaal! 🚀",
  "Bohat khoob!",
  "Sahi pakray!",
  "Perfect! 💎",
  "Nice! 👍",
  "Great job! ⭐",
  "Kya baat hai!",
  "Mashallah! 🙌",
  "Sahi ja rahe!"
];

const MITHU_WRONG_POOL = [
  "Oops! ⚠️",
  "Koi baat nahi.",
  "Try again!",
  "Tricky card!",
  "Dobara koshish!",
  "Aik aur try!",
  "Nazdeek thay!",
  "Almost! 🔍"
];

const MITHU_PROGRESS_EARLY = [
  "Shabash! Go.",
  "Great start!",
  "Bohat acha!",
  "Nice start!",
  "Sahi ja rahe!"
];

const MITHU_PROGRESS_MID = [
  "Zabardast! ⚡",
  "Halfway there!",
  "Keep on! 🏃",
  "Great pace!"
];

const MITHU_PROGRESS_NEAR = [
  "Almost there!",
  "Finish close!",
  "Last stretch!",
  "Almost done!"
];

const MITHU_PROGRESS_STELLAR = [
  "Perfect run!",
  "Flawless! 🎯",
  "Champion! 🏆",
  "Unstoppable!"
];

const MITHU_RECOVERY_POOL = [
  "Focused!",
  "Much better!",
  "Getting there!"
];

const MITHU_UNIT_COMPLETION_POOL = [
  "Mubarak! 🎉",
  "Complete! 🏆",
  "Finished! 🌟",
  "Clear! ✨",
  "Kamyab! 🎖️",
  "Done! 🚀",
  "Success! 👑"
];

const MITHU_CORRECT_SUBTITLE_POOL = [
  "Keep going!",
  "Urdu intuition growing!",
  "You're doing amazing!",
  "Sahi ja rahe ho!",
  "Keep it up!",
  "Awesome job!",
  "You've got this!",
  "Excellent! 👍",
  "Bohat acha!",
  "Brilliant!"
];

const selectMessageWithVariety = (pool: string[], recentMessages: string[]): string => {
  let available = pool.filter(msg => !recentMessages.includes(msg));
  if (available.length === 0) {
    const lastTwo = recentMessages.slice(-2);
    available = pool.filter(msg => !lastTwo.includes(msg));
    if (available.length === 0) {
      available = pool;
    }
  }
  return available[Math.floor(Math.random() * available.length)];
};

const getMithuCorrectFeedback = (
  currentIndex: number, 
  totalQuestions: number, 
  consecutiveCorrect: number,
  isRecovery: boolean,
  recentMessages: string[]
): { title: string; subtitle: string } => {
  let pool: string[] = [];
  const remaining = totalQuestions - (currentIndex + 1);
  
  if (isRecovery) {
    pool = MITHU_CORRECT_POOL;
  } else if (remaining > 0 && remaining <= 3) {
    pool = MITHU_PROGRESS_NEAR;
  } else if (consecutiveCorrect >= 3) {
    pool = MITHU_PROGRESS_STELLAR;
  } else if (currentIndex < 2) {
    pool = Math.random() < 0.5 ? MITHU_PROGRESS_EARLY : MITHU_CORRECT_POOL;
  } else if (remaining > 3 && currentIndex >= 2) {
    pool = Math.random() < 0.5 ? MITHU_PROGRESS_MID : MITHU_CORRECT_POOL;
  } else {
    pool = MITHU_CORRECT_POOL;
  }
  
  const title = selectMessageWithVariety(pool, recentMessages);
  
  let subtitle = "Urdu intuition growing!";
  if (isRecovery) {
    subtitle = "You corrected this card!";
  } else if (remaining === 0) {
    subtitle = "Ready for scorecard!";
  } else if (consecutiveCorrect >= 3) {
    subtitle = `${consecutiveCorrect} correct in a row! 🔥`;
  } else {
    // Select a randomized subtitle from correct subtitle pool
    subtitle = MITHU_CORRECT_SUBTITLE_POOL[Math.floor(Math.random() * MITHU_CORRECT_SUBTITLE_POOL.length)];
  }
  
  return { title, subtitle };
};

const getMithuWrongFeedback = (
  isRecovery: boolean,
  recentMessages: string[]
): { title: string; subtitle: string } => {
  const pool = MITHU_WRONG_POOL;
  const title = selectMessageWithVariety(pool, recentMessages);
  
  let subtitle = "Practice makes perfect!";
  if (isRecovery) {
    subtitle = "We will master this.";
  } else {
    subtitle = "A small mistake is a step forward.";
  }
  
  return { title, subtitle };
};

const getMithuUnitCompletionMessage = (recentMessages: string[]): string => {
  return selectMessageWithVariety(MITHU_UNIT_COMPLETION_POOL, recentMessages);
};

// =============================================================================
// MITHU MASCOT COMPONENT (Urdu Numeric Sage Companion)
// =============================================================================
const MithuMascot = ({ mood, size = 84 }: { mood: "happy" | "thinking" | "sad" | "sparkly"; size?: number }) => {
  let eyes = (
    <>
      <circle cx="38" cy="42" r="6" fill="#1e293b" />
      <circle cx="36" cy="40" r="2" fill="#ffffff" />
      <circle cx="62" cy="42" r="6" fill="#1e293b" />
      <circle cx="60" cy="40" r="2" fill="#ffffff" />
    </>
  );
  if (mood === "sad") {
    eyes = (
      <>
        <path d="M 32 45 Q 38 39 44 45" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 56 45 Q 62 39 68 45" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    );
  } else if (mood === "sparkly") {
    eyes = (
      <>
        <circle cx="38" cy="42" r="7.5" fill="#1e293b" />
        <circle cx="35" cy="39" r="2.8" fill="#ffffff" />
        <circle cx="41" cy="45" r="1.2" fill="#ffffff" />
        
        <circle cx="62" cy="42" r="7.5" fill="#1e293b" />
        <circle cx="59" cy="39" r="2.8" fill="#ffffff" />
        <circle cx="65" cy="45" r="1.2" fill="#ffffff" />
      </>
    );
  } else if (mood === "thinking") {
    eyes = (
      <>
        <circle cx="38" cy="42" r="6" fill="#1e293b" />
        <circle cx="36" cy="40" r="2" fill="#ffffff" />
        <circle cx="62" cy="42" r="6" fill="#1e293b" />
        <circle cx="60" cy="40" r="2" fill="#ffffff" />
      </>
    );
  }

  const crestColor = "#d4af37"; // Gold crest
  const bodyColor = "#107e4a";  // Urdu Emerald body
  const bellyColor = "#ecfdf5"; // Light Mint belly
  const beakColor = "#f59e0b";  // orange beak

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-md select-none shrink-0 transform hover:scale-105 transition duration-200">
      {/* Golden crest plumage */}
      <path d="M 50 25 Q 40 10 32 18 Q 41 24 50 32" fill={crestColor} />
      <path d="M 50 25 Q 60 10 68 18 Q 59 24 50 32" fill={crestColor} />
      <path d="M 50 25 Q 50 6 44 8 Q 47 18 50 32" fill="#e2b93c" />

      {/* Body */}
      <circle cx="50" cy="55" r="30" fill={bodyColor} />
      
      {/* Side wings */}
      <ellipse cx="20" cy="55" rx="5" ry="11" fill="#046a38" />
      <ellipse cx="80" cy="55" rx="5" ry="11" fill="#046a38" />

      {/* Soft light belly */}
      <ellipse cx="50" cy="71" rx="16" ry="12" fill={bellyColor} />

      {/* Eyes */}
      {eyes}

      {/* Rosy cheeks */}
      {mood !== "sad" && (
        <>
          <circle cx="27" cy="49" r="4" fill="#f87171" opacity="0.4" />
          <circle cx="73" cy="49" r="4" fill="#f87171" opacity="0.4" />
        </>
      )}

      {/* Beak */}
      <path d="M 44 47 Q 50 41 56 47 Q 50 63 44 47" fill={beakColor} />
      <path d="M 44 47 Q 50 50 56 47" stroke="#d97706" strokeWidth="1" fill="none" />

      {/* Sparkling stars when sparkly mood */}
      {mood === "sparkly" && (
        <>
          <path d="M 10 20 L 12 25 L 17 25 L 13 28 L 15 33 L 10 30 L 5 33 L 7 28 L 3 25 L 8 25 Z" fill="#fbbf24" transform="scale(0.65)" />
          <path d="M 120 15 L 122 20 L 127 20 L 123 23 L 125 28 L 120 25 L 115 28 L 117 23 L 113 20 L 118 20 Z" fill="#fbbf24" transform="scale(0.65)" />
        </>
      )}
    </svg>
  );
};



// Helper to select a random number from a pool while avoiding recently asked digits
const getRandomObjectAvoidingRecent = (
  pool: NumberEntry[],
  recentDigits: number[],
  maxExclusionRatio: number = 0.5
): NumberEntry => {
  if (pool.length === 0) {
    return NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
  }
  
  // Calculate how many we can actually exclude based on pool size
  const maxToExclude = Math.floor(pool.length * maxExclusionRatio);
  
  // Get the most recent exclusions (end of the array has the most recent items)
  const activeExclusions = recentDigits.slice(-Math.max(1, maxToExclude));
  
  const filtered = pool.filter((n) => !activeExclusions.includes(n.digit));
  const finalPool = filtered.length > 0 ? filtered : pool;
  
  return finalPool[Math.floor(Math.random() * finalPool.length)];
};

// =============================================================================
// HEARTS DISPLAY WITH EVENT-DRIVEN ANIMATIONS
// =============================================================================
const HeartsDisplay = ({ hearts, isDarkMode }: { hearts: number; isDarkMode: boolean }) => {
  const [prevHearts, setPrevHearts] = useState(hearts);
  const [lostIndexes, setLostIndexes] = useState<number[]>([]);

  useEffect(() => {
    if (hearts < prevHearts) {
      const newlyLost: number[] = [];
      for (let i = hearts; i < prevHearts; i++) {
        newlyLost.push(i);
      }
      setLostIndexes(prev => [...prev, ...newlyLost]);

      const timer = setTimeout(() => {
        setLostIndexes(prev => prev.filter(idx => !newlyLost.includes(idx)));
      }, 1000);

      setPrevHearts(hearts);
      return () => clearTimeout(timer);
    } else {
      setPrevHearts(hearts);
      setLostIndexes([]);
    }
  }, [hearts, prevHearts]);

  return (
    <div className="flex items-center gap-0.5 select-none" title="Ginti Lives">
      {Array.from({ length: 5 }).map((_, hIdx) => {
        const isActive = hIdx < hearts;
        const isLost = lostIndexes.includes(hIdx);

        if (isLost) {
          // Play loss animation once
          return (
            <motion.span
              key={hIdx}
              className="text-xs inline-block"
              initial={{ scale: 1.1, opacity: 1 }}
              animate={{
                scale: [1.1, 1.6, 0.95],
                opacity: [1, 0.8, 0.2],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
              style={{ filter: "grayscale(100%)" }}
            >
              ❤️
            </motion.span>
          );
        }

        if (!isActive) {
          // Inactive still heart
          return (
            <span
              key={hIdx}
              className="text-xs inline-block scale-95 opacity-20 filter grayscale transition-all duration-300"
            >
              ❤️
            </span>
          );
        }

        // Active hearts - check warning state
        if (hearts === 2) {
          // Gentle warning pulse
          return (
            <motion.span
              key={hIdx}
              className="text-xs inline-block filter-none"
              animate={{
                scale: [1.1, 1.22, 1.1],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ❤️
            </motion.span>
          );
        }

        if (hearts === 1) {
          // Strong critical pulse
          return (
            <motion.span
              key={hIdx}
              className="text-xs inline-block filter-none"
              animate={{
                scale: [1.1, 1.35, 1.1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ❤️
            </motion.span>
          );
        }

        // Active still hearts (hearts >= 3)
        return (
          <span
            key={hIdx}
            className="text-xs inline-block scale-110 filter-none transition-all duration-300"
          >
            ❤️
          </span>
        );
      })}
    </div>
  );
};

const getInitialDarkMode = (): boolean => {
  const manualPref = localStorage.getItem("ginti_theme_pref");
  if (manualPref === "dark") return true;
  if (manualPref === "light") return false;
  
  // No theme preference exists in localStorage, detect user's system/browser theme
  if (typeof window !== "undefined" && window.matchMedia) {
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return isSystemDark;
  }
  
  // if no preference exists, default to light mode
  return false;
};

export default function App() {
  // =============================================================================
  // APP STATES
  // =============================================================================
  const [appState, setAppState] = useState<AppState>({
    totalXP: 0,
    completedUnits: [],
    weakAreas: [],
    showScript: true,
    highScore: 0,
    masteryStreak: 0,
    streakDays: 3, // Premium initial starter streak
    lastActiveDate: undefined,
    hasOnboarded: false,
    unitStagesProgress: {},
    arenaMin: 30,
    arenaMax: 100,
    arenaStageProgress: 1,
    arenaWeakMap: {},
    arenaSlowMap: {},
    arenaCorrectMap: {},
    arenaRangeHistory: [],
    isDarkMode: getInitialDarkMode(),
    arenaStarted: false,
    arenaCompleted: false,
  });

  const [activeScreen, setActiveScreen] = useState<ScreenType>("dashboard");
  const [onboardingActive, setOnboardingActive] = useState<boolean>(true);
  
  // Custom Unit Stages & Journey States
  const [selectedJourneyUnitId, setSelectedJourneyUnitId] = useState<string | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);
  const [nextStageToFocus, setNextStageToFocus] = useState<number | null>(null);
  const [journeyStage1Finished, setJourneyStage1Finished] = useState<boolean>(false);
  const [arenaStage1Finished, setArenaStage1Finished] = useState<boolean>(false);
  const journeyStage1ScrollRef = useRef<HTMLDivElement | null>(null);
  const arenaStage1ScrollRef = useRef<HTMLDivElement | null>(null);

  // Animate header streak icon only on increase
  const [triggerHeaderFlameAnimate, setTriggerHeaderFlameAnimate] = useState<boolean>(false);
  const prevStreakRef = useRef<number>(-1);

  // Mithu Learning Assistant state
  const [digitMistakes, setDigitMistakes] = useState<Record<number, number>>({});
  const [mithuExplanationDigit, setMithuExplanationDigit] = useState<number | null>(null);
  const [mithuLanguage, setMithuLanguage] = useState<"ur" | "en">("ur");
  const mithuExplanationDigitRef = useRef<number | null>(null);
  useEffect(() => {
    mithuExplanationDigitRef.current = mithuExplanationDigit;
  }, [mithuExplanationDigit]);
  const [showMithuSuggestDigit, setShowMithuSuggestDigit] = useState<number | null>(null);

  // Gameplay States for Stage 2 (Recognition Quiz)
  const [stageQuizIdx, setStageQuizIdx] = useState<number>(0);
  const [stageQuizScore, setStageQuizScore] = useState<number>(0);
  const [stageQuizSelected, setStageQuizSelected] = useState<string | number | null>(null);
  const [stageQuizAnswered, setStageQuizAnswered] = useState<boolean>(false);
  const [stageQuizQuestions, setStageQuizQuestions] = useState<QuizQuestion[]>([]);

  // Gameplay States for Stage 3 (Listening Selector)
  const [stageListIdx, setStageListIdx] = useState<number>(0);
  const [stageListSelected, setStageListSelected] = useState<string | number | null>(null);
  const [stageListAnswered, setStageListAnswered] = useState<boolean>(false);
  const [stageListQuestions, setStageListQuestions] = useState<any[]>([]);
  const [stageListSpeakerAnimate, setStageListSpeakerAnimate] = useState<boolean>(false);
  const [arenaListSpeakerAnimate, setArenaListSpeakerAnimate] = useState<boolean>(false);

  // Gameplay States for Stage 4 (Speedy Arcade Challenge)
  const [stageArcadeTime, setStageArcadeTime] = useState<number>(30);
  const [stageArcadeScore, setStageArcadeScore] = useState<number>(0);
  const [stageArcadeActiveQ, setStageArcadeActiveQ] = useState<QuizQuestion | null>(null);
  const [stageArcadeOver, setStageArcadeOver] = useState<boolean>(false);
  const [stageArcadeSelected, setStageArcadeSelected] = useState<string | number | null>(null);
  const [stageArcadeAnswered, setStageArcadeAnswered] = useState<boolean>(false);
  const stageArcadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to track recently asked digits to prevent rapid repetition across game modes
  const recentArcadeDigitsRef = useRef<number[]>([]);
  const recentUnitArcadeDigitsRef = useRef<Record<string, number[]>>({});
  const recentArenaArcadeDigitsRef = useRef<number[]>([]);

  // =============================================================================
  // TRAINING ARENA TRANSIENT SCREEN STATE
  // =============================================================================
  const [isTrainingActive, setIsTrainingActive] = useState<boolean>(false);
  const [arenaActiveStage, setArenaActiveStage] = useState<number | null>(null);
  const [isArenaSetupOpen, setIsArenaSetupOpen] = useState<boolean>(false);

  // Training Arena Manual Edit states
  const [isEditingMin, setIsEditingMin] = useState<boolean>(false);
  const [isEditingMax, setIsEditingMax] = useState<boolean>(false);
  const [tempMinStr, setTempMinStr] = useState<string>("");
  const [tempMaxStr, setTempMaxStr] = useState<string>("");

  // Training Arena Quiz & Auditory Progress states
  const [arenaQuizIdx, setArenaQuizIdx] = useState<number>(0);
  const [arenaQuizScore, setArenaQuizScore] = useState<number>(0);
  const [arenaQuizSelected, setArenaQuizSelected] = useState<string | number | null>(null);
  const [arenaQuizAnswered, setArenaQuizAnswered] = useState<boolean>(false);
  const [arenaQuizQuestions, setArenaQuizQuestions] = useState<QuizQuestion[]>([]);
  const [arenaQuestionStartTime, setArenaQuestionStartTime] = useState<number>(0);

  // Gameplay States for Training Arena Stage 3 (Listening)
  const [arenaListIdx, setArenaListIdx] = useState<number>(0);
  const [arenaListSelected, setArenaListSelected] = useState<string | number | null>(null);
  const [arenaListAnswered, setArenaListAnswered] = useState<boolean>(false);
  const [arenaListQuestions, setArenaListQuestions] = useState<any[]>([]);

  // Gameplay States for Training Arena Stage 4 (Arcade Speed Blitz)
  const [arenaArcadeTime, setArenaArcadeTime] = useState<number>(30);
  const [arenaArcadeScore, setArenaArcadeScore] = useState<number>(0);
  const [arenaArcadeActiveQ, setArenaArcadeActiveQ] = useState<QuizQuestion | null>(null);
  const [arenaArcadeOver, setArenaArcadeOver] = useState<boolean>(false);
  const [arenaArcadeSelected, setArenaArcadeSelected] = useState<string | number | null>(null);
  const [arenaArcadeAnswered, setArenaArcadeAnswered] = useState<boolean>(false);
  const arenaArcadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSearchEntry, setSelectedSearchEntry] = useState<NumberEntry | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("ginti_recent_searches");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveSearchToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("ginti_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeSearchFromHistory = (query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(q => q.toLowerCase() !== query.toLowerCase());
      localStorage.setItem("ginti_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllSearchHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem("ginti_recent_searches");
  };

  useEffect(() => {
    if (!searchQuery || !searchQuery.trim()) return;
    const currentQuery = searchQuery;
    const timer = setTimeout(() => {
      if (searchQuery === currentQuery) {
        const matches = handleQuerySearch();
        if (matches.length > 0) {
          saveSearchToHistory(currentQuery);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Practice & Quiz Arenas
  const [quizState, setQuizState] = useState<QuizState | null>(null);

  // Recovery systems state
  const [recoveryState, setRecoveryState] = useState<RecoveryRoundState | null>(null);
  const [stageQuizMistakes, setStageQuizMistakes] = useState<QuizQuestion[]>([]);
  const [stageListMistakes, setStageListMistakes] = useState<any[]>([]);
  const [stage5Mistakes, setStage5Mistakes] = useState<QuizQuestion[]>([]);
  const [arenaQuizMistakes, setArenaQuizMistakes] = useState<QuizQuestion[]>([]);
  const [arenaListMistakes, setArenaListMistakes] = useState<any[]>([]);

  // Arcade Blitz Arena
  const [arcadeState, setArcadeState] = useState<ArcadeState | null>(null);
  const arcadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech and Audio state
  const [speechActive, setSpeechActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mascot dynamic animations (jump, shake)
  const [mascotAnimation, setMascotAnimation] = useState<"jump" | "shake" | "">("");
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [aboutExpanded, setAboutExpanded] = useState<boolean>(false);
  
  // Mastery Streak states
  const [showStreakPopup, setShowStreakPopup] = useState<boolean>(false);
  const [streakCelebration, setStreakCelebration] = useState<{ message: string; streak: number } | null>(null);
  
  // Unit Completion states
  const [completedUnitPopup, setCompletedUnitPopup] = useState<string | null>(null);
  const [nextUnitToFocus, setNextUnitToFocus] = useState<string | null>(null);
  const [highlightedUnitId, setHighlightedUnitId] = useState<string | null>(null);
  
  // Mithu recent feedback texts to enforce the Variety Rule
  const recentMithuMessagesRef = useRef<string[]>([]);
  const trackMithuMessage = (msg: string) => {
    if (!msg) return;
    recentMithuMessagesRef.current.push(msg);
    if (recentMithuMessagesRef.current.length > 10) {
      recentMithuMessagesRef.current.shift();
    }
  };

  // =============================================================================
  // STREAK TRACKING HELPERS (DUOLINGO FUNCTIONALITY)
  // =============================================================================
  const getTodayString = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getYesterdayString = (): string => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const checkAndResetStreakOnStartup = (currentState: AppState): AppState => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastActive = currentState.lastActiveDate;

    if (lastActive && lastActive !== today && lastActive !== yesterday) {
      // Streak has broken because the last active date was older than yesterday.
      return {
        ...currentState,
        streakDays: 0,
      };
    }
    return currentState;
  };

  const markUserActive = (currentState: AppState): AppState => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastActive = currentState.lastActiveDate;

    let newStreak = currentState.streakDays;

    if (!lastActive) {
      // First active practice: establish today's active date; preserve the initial starter streak.
      newStreak = Math.max(3, currentState.streakDays);
    } else if (lastActive === today) {
      // Already active today; streak days unchanged
      newStreak = currentState.streakDays;
    } else if (lastActive === yesterday) {
      // Consecutive active practice day! Streak increments!
      newStreak = currentState.streakDays + 1;
    } else {
      // Streak was broken or skipped, started practicing today, set to 1
      newStreak = 1;
    }

    return {
      ...currentState,
      streakDays: newStreak,
      lastActiveDate: today,
    };
  };

  // =============================================================================
  // LIFE RECORD LOAD AND PERSISTENCE SYNC
  // =============================================================================
  useEffect(() => {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    const initialTheme = getInitialDarkMode();
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        const hasThemePref = localStorage.getItem("ginti_theme_pref") !== null;
        const finalDark = hasThemePref ? (localStorage.getItem("ginti_theme_pref") === "dark") : (parsed.isDarkMode ?? initialTheme);

        const restored: AppState = {
          totalXP: parsed.totalXP ?? 0,
          completedUnits: parsed.completedUnits ?? [],
          weakAreas: parsed.weakAreas ?? [],
          showScript: parsed.showScript ?? true,
          highScore: parsed.highScore ?? 0,
          masteryStreak: parsed.masteryStreak ?? 0,
          streakDays: parsed.streakDays ?? 3,
          lastActiveDate: parsed.lastActiveDate,
          hasOnboarded: parsed.hasOnboarded ?? false,
          unitStagesProgress: parsed.unitStagesProgress ?? {},
          arenaMin: parsed.arenaMin ?? 30,
          arenaMax: parsed.arenaMax ?? 100,
          arenaStageProgress: parsed.arenaStageProgress ?? 1,
          arenaWeakMap: parsed.arenaWeakMap ?? {},
          arenaSlowMap: parsed.arenaSlowMap ?? {},
          arenaCorrectMap: parsed.arenaCorrectMap ?? {},
          arenaRangeHistory: parsed.arenaRangeHistory ?? [],
          isDarkMode: finalDark,
          arenaStarted: parsed.arenaStarted ?? false,
          arenaCompleted: parsed.arenaCompleted ?? false,
        };
        const checkedState = checkAndResetStreakOnStartup(restored);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checkedState));
        prevStreakRef.current = checkedState.masteryStreak ?? 0;
        setAppState(checkedState);
        setOnboardingActive(!parsed.hasOnboarded);
      } catch (err) {
        console.error("Local Storage restoration error. Restarting configuration.", err);
      }
    } else {
      // First launch (no rawData), setAppState with getInitialDarkMode()
      setAppState((prev) => ({ ...prev, isDarkMode: initialTheme }));
    }
  }, []);

  // Trigger header streak icon animation only when the streak increases
  useEffect(() => {
    const currentStreak = appState.masteryStreak ?? 0;
    if (prevStreakRef.current === -1) {
      prevStreakRef.current = currentStreak;
      return;
    }
    if (currentStreak > prevStreakRef.current && currentStreak > 0) {
      setTriggerHeaderFlameAnimate(true);
      const timer = setTimeout(() => {
        setTriggerHeaderFlameAnimate(false);
      }, 1000);
      prevStreakRef.current = currentStreak;
      return () => clearTimeout(timer);
    } else {
      prevStreakRef.current = currentStreak;
    }
  }, [appState.masteryStreak]);

  // Scroll to top of viewport on screen transitions to counteract vertical height issues
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeScreen]);

  // Synchronize document-level classes for seamless dark status mapping
  useEffect(() => {
    if (appState.isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [appState.isDarkMode]);

  const saveState = (updated: AppState) => {
    let finalState = updated;
    if (updated.totalXP > appState.totalXP) {
      finalState = markUserActive(updated);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalState));
    setAppState(finalState);
  };

  const incrementMasteryStreak = () => {
    setAppState((prev) => {
      const nextStreak = (prev.masteryStreak ?? 0) + 1;
      
      // Check milestones
      let milestoneMsg = "";
      if (nextStreak === 10) {
        milestoneMsg = "Wah! 10 ka streak! Keep going!";
      } else if (nextStreak === 20) {
        milestoneMsg = "Wah! 20 ka streak!";
      } else if (nextStreak === 50) {
        milestoneMsg = "Zabardast! 50 lagataar sahi jawab!";
      } else if (nextStreak === 100) {
        milestoneMsg = "100! Aaj to aag laga di!";
      }

      if (milestoneMsg) {
        setTimeout(() => {
          setStreakCelebration({ message: milestoneMsg, streak: nextStreak });
          playSoundSynth("levelUp");
          // Auto-dismiss after 4 seconds
          setTimeout(() => {
            setStreakCelebration(prevCel => {
              if (prevCel?.streak === nextStreak) return null;
              return prevCel;
            });
          }, 4000);
        }, 300);
      }

      const updated = {
        ...prev,
        masteryStreak: nextStreak,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const resetMasteryStreak = (digit?: number) => {
    setAppState((prev) => {
      if ((prev.masteryStreak ?? 0) === 0) return prev; // no-op if already 0
      const updated = {
        ...prev,
        masteryStreak: 0,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (digit !== undefined) {
      setDigitMistakes((prev) => {
        const nextCount = (prev[digit] ?? 0) + 1;
        if (nextCount >= 2) {
          setShowMithuSuggestDigit(digit);
        }
        return {
          ...prev,
          [digit]: nextCount,
        };
      });
    }
  };

  const getStreakBadgeStyles = () => {
    const streak = appState.masteryStreak ?? 0;
    if (streak === 0) {
      return "streak-badge-zero hover:bg-slate-50/50 shadow-xs";
    }
    return "streak-badge-active hover:bg-orange-100/50 shadow-xs";
  };

  const getFlameIconStyles = () => {
    const streak = appState.masteryStreak ?? 0;
    if (streak === 0) {
      return "text-slate-400 fill-none";
    }
    return "text-orange-500 fill-orange-400 flame-active";
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const renderMithuHelpBadge = (digit: number) => {
    const hasMistakes = (digitMistakes[digit] ?? 0) > 0;
    const isSuggesting = showMithuSuggestDigit === digit;
    const isStruggling = isSuggesting || hasMistakes;
    const isArcade = activeScreen === "arcade";

    if (isStruggling) {
      const btnStyle = isArcade
        ? "bg-emerald-950/80 hover:bg-emerald-900/80 border-emerald-900 text-emerald-300 ring-emerald-900/20"
        : appState.isDarkMode 
          ? "bg-emerald-950/90 hover:bg-emerald-900/90 border-emerald-800 text-emerald-300 ring-emerald-900/40" 
          : "bg-[#ecfdf5] hover:bg-[#d1fae5] border-emerald-300 text-emerald-800 ring-emerald-300/40";

      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            playSoundSynth("click");
            setMithuExplanationDigit(digit);
            if (showMithuSuggestDigit === digit) {
              setShowMithuSuggestDigit(null);
            }
          }}
          className={`px-2.5 py-1 border-2 rounded-full text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95 select-none shadow-xs animate-pulse ring-2 ${btnStyle}`}
          title="Need help? Mithu is ready to guide you!"
        >
          <span className="inline-block animate-bounce text-xs">🦜</span>
          <span className="font-black uppercase tracking-wider text-[9px]">
            Mithu Can Help!
          </span>
        </button>
      );
    }

    const btnStyle = isArcade
      ? "bg-emerald-950/80 hover:bg-emerald-900/80 border-emerald-900/80 text-emerald-300"
      : appState.isDarkMode 
        ? "bg-emerald-950/90 hover:bg-emerald-900/90 border-emerald-800 text-emerald-300" 
        : "bg-[#ecfdf5] hover:bg-[#d1fae5] border-emerald-300 text-emerald-800";

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          playSoundSynth("click");
          setMithuExplanationDigit(digit);
        }}
        className={`px-2.5 py-1 border rounded-full text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all duration-100 hover:scale-105 active:scale-95 select-none shadow-xs ${btnStyle}`}
        title="Need Help? Ask Mithu!"
      >
        <span className="text-xs">🦜</span>
        <span>Help</span>
      </button>
    );
  };

  // =============================================================================
  // NEOCLASSICAL SYNTH SOUNDS
  // =============================================================================
  const playSoundSynth = (type: "correct" | "incorrect" | "click" | "levelUp") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (type === "correct") {
        // High-Fidelity spark bells arpeggio with warm triangle harmonic octave layer
        const playTone = (freq: number, startTime: number, duration: number) => {
          const oscNode = audioCtx.createOscillator();
          const harmonicsNode = audioCtx.createOscillator();
          const gainNodeNode = audioCtx.createGain();
          
          oscNode.type = "sine";
          oscNode.frequency.setValueAtTime(freq, startTime);

          harmonicsNode.type = "triangle";
          harmonicsNode.frequency.setValueAtTime(freq * 2, startTime);
          
          gainNodeNode.gain.setValueAtTime(0.06, startTime);
          gainNodeNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          oscNode.connect(gainNodeNode);
          harmonicsNode.connect(gainNodeNode);
          gainNodeNode.connect(audioCtx.destination);
          
          oscNode.start(startTime);
          harmonicsNode.start(startTime);
          oscNode.stop(startTime + duration + 0.1);
          harmonicsNode.stop(startTime + duration + 0.1);
        };

        const now = audioCtx.currentTime;
        // Ascent notes: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz) spaced 60ms apart
        playTone(523.25, now, 0.15);
        playTone(659.25, now + 0.06, 0.15);
        playTone(783.99, now + 0.12, 0.15);
        playTone(1046.50, now + 0.18, 0.35);
      } else if (type === "incorrect") {
        // Dual discordant detuned waveforms descending pitch slide for rich buzzy game console feel
        const osc = audioCtx.createOscillator();
        const oscDetuned = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.35);

        oscDetuned.type = "sawtooth";
        oscDetuned.frequency.setValueAtTime(235, audioCtx.currentTime);
        oscDetuned.frequency.exponentialRampToValueAtTime(105, audioCtx.currentTime + 0.35);
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.37);
        
        osc.connect(gainNode);
        oscDetuned.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        oscDetuned.start();
        osc.stop(audioCtx.currentTime + 0.4);
        oscDetuned.stop(audioCtx.currentTime + 0.4);
      } else if (type === "levelUp") {
        // Multi-level triumphant fanfare!
        const playTone = (freq: number, startTime: number, duration: number) => {
          const oscNode = audioCtx.createOscillator();
          const gainNodeNode = audioCtx.createGain();
          
          oscNode.type = "sine";
          oscNode.frequency.setValueAtTime(freq, startTime);
          
          gainNodeNode.gain.setValueAtTime(0.06, startTime);
          gainNodeNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
          
          oscNode.connect(gainNodeNode);
          gainNodeNode.connect(audioCtx.destination);
          
          oscNode.start(startTime);
          oscNode.stop(startTime + duration + 0.05);
        };

        const t = audioCtx.currentTime;
        playTone(261.63, t, 0.12);        // C4
        playTone(329.63, t + 0.08, 0.12); // E4
        playTone(392.00, t + 0.16, 0.12); // G4
        playTone(523.25, t + 0.24, 0.4);  // C5
        playTone(659.25, t + 0.32, 0.4);  // E5
      } else {
        // click
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(750, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      // Ignore browser policy roadblocks silently
    }
  };

  // =============================================================================
  // WEB SPEECH SYNTHESIS ENGINE
  // =============================================================================
  const playWordAudio = (entry: NumberEntry) => { speakNumberEntry(entry, setSpeechActive, showToast); };
  
  const formatValueForDisplay = (val: string | number): string | number => {
    if (typeof val !== "string") return val;
    if (!appState.showScript) {
      if (val.match(/[\u0600-\u06FF]/)) {
        const found = NUMBERS.find((n) => n.nativeScript === val);
        if (found) {
          return found.romanUrdu;
        }
        const trimmed = val.trim();
        const matched = NUMBERS.find((n) => n.nativeScript.trim() === trimmed);
        if (matched) {
          return matched.romanUrdu;
        }
      }
    }
    return val;
  };

  const getDisplayPromptValue = (question: any): string | number => {
    if (!question) return "";
    const originalPrompt = question.promptValue;
    const formattedPrompt = formatValueForDisplay(originalPrompt);
    const formattedCorrect = formatValueForDisplay(question.correctAnswer);
    
    if (formattedPrompt === formattedCorrect && question.entry) {
      return question.entry.digit;
    }
    return originalPrompt;
  };
  const unused_playWordAudio = (entry: NumberEntry) => {
    if (!("speechSynthesis" in window)) {
      showToast("Speech synthesis is unavailable in this environment.");
      return;
    }
    setSpeechActive(true);
    window.speechSynthesis.cancel();

    // Priority select regional voices (verified)
    const voices = window.speechSynthesis.getVoices();
    
    // 1. Preferred regional Urdu voice (ur-PK)
    let targetVoice = voices.find((v) => {
      const l = v.lang.toLowerCase().replace("_", "-");
      return l === "ur-pk" || l === "ur_pk" || l.startsWith("ur-");
    });

    // 2. Second preference: regional Hindi voice (hi-IN)
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const l = v.lang.toLowerCase().replace("_", "-");
        return l === "hi-in" || l === "hi_in" || l.startsWith("hi-");
      });
    }

    // 3. Fallback: Any voice containing 'ur' in name or lang
    if (!targetVoice) {
      targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("ur") || v.name.toLowerCase().includes("urdu"));
    }

    // 4. Fallback: Any voice containing 'hi' in name or lang
    if (!targetVoice) {
      targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi") || v.name.toLowerCase().includes("hindi"));
    }

    // Determine what text to speak.
    // If we have an Urdu or Hindi voice, we speak the nativeScript for maximum authentic pronunciation.
    // Otherwise, speaking Arabic/Urdu characters on an English/Default voice results in complete silence or crash, 
    // so we fall back to the phonetic Roman spelling (romanUrdu).
    const hasUrduOrHindiVoice = !!(targetVoice && (
      targetVoice.lang.toLowerCase().startsWith("ur") ||
      targetVoice.lang.toLowerCase().startsWith("hi") ||
      targetVoice.name.toLowerCase().includes("urdu") ||
      targetVoice.name.toLowerCase().includes("hindi")
    ));

    const textToSpeak = hasUrduOrHindiVoice ? entry.nativeScript : entry.romanUrdu;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (targetVoice) {
      utterance.voice = targetVoice;
      utterance.lang = targetVoice.lang;
    } else {
      // If no explicit voice object is found, try to hint the synthesis engine to use Urdu or Hindi language
      // But keep romanUrdu as the spoken text so it is legible for western TTS voices.
      utterance.lang = "ur-PK"; 
      console.warn("No Urdu (ur-PK) or Hindi (hi-IN) voice found in speechSynthesis.getVoices(). Falling back to system default.");
    }

    utterance.rate = 0.85; // Slower cadence for clear learning
    utterance.pitch = 1.0;  // Standard warm pitch
    utterance.volume = 1.0; // Max volume

    // Logging execution as requested
    console.log("=== SPEECH SYNTHESIS DEBUG LOGS ===");
    console.log("Text to speak:", textToSpeak);
    if (targetVoice) {
      console.log("Selected voice name:", targetVoice.name);
      console.log("Selected voice language:", targetVoice.lang);
    } else {
      console.log("Selected voice name: None (System Default)");
      console.log("Selected voice language: Fallback (ur-PK or default)");
    }
    console.log("Calling window.speechSynthesis.speak() now...");

    utterance.onend = () => {
      console.log("Speech finished playing successfully.");
      setSpeechActive(false);
    };
    utterance.onerror = (err) => {
      console.error("Speech playback error:", err);
      setSpeechActive(false);
    };

    window.speechSynthesis.speak(utterance);

    // Safety timeout fallback
    setTimeout(() => {
      setSpeechActive(false);
    }, 2500);
  };

  // =============================================================================
  // DYNAMIC COMPONENT PARSERS & TRANSLATORS FOR ANY NUMBER IN RANGE 1 - 9999
  // =============================================================================
  const getValueOfWord = (word: string): number | null => {
    const norm = word.trim().toLowerCase();
    if (!norm) return null;

    const multipliers = ["sau", "so", "soo", "سو", "hazaar", "hazar", "ہزار"];
    if (multipliers.includes(norm)) return null;

    const match = NUMBERS.find(
      (num) =>
        num.digit < 100 &&
        (num.romanUrdu.toLowerCase() === norm ||
          num.nativeScript === norm ||
          num.searchKeys.map((k) => k.toLowerCase()).includes(norm))
    );

    return match ? match.digit : null;
  };

  const parseUrduPhraseToNumber = (phrase: string): number | null => {
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
  };

  const generateNumberEntry = (digit: number): NumberEntry | null => {
    const exact = NUMBERS.find((n) => n.digit === digit);
    if (exact) return exact;

    if (digit <= 0 || digit > 9999) return null;

    const thousands = Math.floor(digit / 1000);
    const hundreds = Math.floor((digit % 1000) / 100);
    const rest = digit % 100;

    const romanParts: string[] = [];
    const nativeParts: string[] = [];
    const searchKeys: string[] = [digit.toString()];

    if (thousands > 0) {
      const tEntry = NUMBERS.find((n) => n.digit === thousands);
      if (tEntry) {
        romanParts.push(`${tEntry.romanUrdu} Hazaar`);
        nativeParts.push(`${tEntry.nativeScript} ہزار`);
      } else if (thousands === 1) {
        romanParts.push("Ek Hazaar");
        nativeParts.push("ایک ہزار");
      }
    }

    if (hundreds > 0) {
      const hEntry = NUMBERS.find((n) => n.digit === hundreds);
      if (hEntry) {
        romanParts.push(`${hEntry.romanUrdu} Sau`);
        nativeParts.push(`${hEntry.nativeScript} سو`);
      } else if (hundreds === 1) {
        romanParts.push("Ek Sau");
        nativeParts.push("ایک سو");
      }
    }

    if (rest > 0) {
      const rEntry = NUMBERS.find((n) => n.digit === rest);
      if (rEntry) {
        romanParts.push(rEntry.romanUrdu);
        nativeParts.push(rEntry.nativeScript);
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
  };

  // =============================================================================
  // PANIC SEARCH ENGINE MATCHES WITH PHONETIC FUZZY RESILIENCE
  // =============================================================================
  // Levenshtein distance metric for robust fuzzy comparison
  const getLevenshteinDistance = (s1: string, s2: string): number => {
    const len1 = s1.length;
    const len2 = s2.length;
    if (len1 === 0) return len2;
    if (len2 === 0) return len1;

    let prevRow = Array.from({ length: len2 + 1 }, (_, i) => i);
    for (let i = 1; i <= len1; i++) {
      const currRow = [i];
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        currRow.push(
          Math.min(
            prevRow[j] + 1, // deletion
            currRow[j - 1] + 1, // insertion
            prevRow[j - 1] + cost // substitution
          )
        );
      }
      prevRow = currRow;
    }
    return prevRow[len2];
  };

  // Convert Roman Urdu terms to a standardized phonetic base key to cope with spelling inconsistencies
  const getPhoneticKey = (s: string): string => {
    let res = s.toLowerCase().trim();
    
    // Replace double character sets with simple equivalents
    res = res.replace(/aa/g, "a");
    res = res.replace(/ee/g, "i");
    res = res.replace(/oo/g, "u");
    res = res.replace(/tt/g, "t");
    res = res.replace(/kk/g, "k");
    res = res.replace(/pp/g, "p");
    res = res.replace(/ss/g, "s");
    res = res.replace(/dd/g, "d");
    res = res.replace(/rr/g, "r");
    res = res.replace(/nn/g, "n");
    res = res.replace(/ll/g, "l");
    res = res.replace(/mm/g, "m");
    res = res.replace(/ff/g, "f");
    res = res.replace(/cc/g, "c");
    res = res.replace(/yy/g, "y");
    
    // Convert popular Urdu Romanization aspirate glyphs
    res = res.replace(/kh/g, "k");
    res = res.replace(/gh/g, "g");
    res = res.replace(/th/g, "t");
    res = res.replace(/ph/g, "p");
    res = res.replace(/jh/g, "j");
    res = res.replace(/chh/g, "ch");
    res = res.replace(/ch/g, "c");

    // Standardize vowels and modern diphthongs
    res = res.replace(/ay/g, "e");
    res = res.replace(/ai/g, "e");
    res = res.replace(/ey/g, "e");
    res = res.replace(/v/g, "w");
    res = res.replace(/y/g, "i");
    
    // Clean trailing voiceless breathings
    if (res.endsWith("ah")) {
      res = res.slice(0, -2) + "a";
    }
    
    return res;
  };

  const handleQuerySearch = (): NumberEntry[] => {
    if (!searchQuery.trim()) return [];
    const queryNormalized = searchQuery.trim().toLowerCase();
    const queryPhonetic = getPhoneticKey(queryNormalized);

    const matchesList: { entry: NumberEntry; score: number }[] = [];

    let parsedNum: number | null = null;
    if (/^\d+$/.test(queryNormalized)) {
      parsedNum = parseInt(queryNormalized, 10);
    } else {
      parsedNum = parseUrduPhraseToNumber(queryNormalized);
    }

    let dynamicEntryAdded = false;
    let dynamicEntry: NumberEntry | null = null;
    if (parsedNum !== null && parsedNum > 0 && parsedNum <= 9999) {
      dynamicEntry = generateNumberEntry(parsedNum);
    }

    for (const num of NUMBERS) {
      const digitStr = num.digit.toString();
      const romanLower = num.romanUrdu.toLowerCase();
      const native = num.nativeScript;
      const keysLower = num.searchKeys.map((k) => k.toLowerCase());

      let isMatch = false;
      let score = 0;

      // 1. Direct parsed/structured number equality (highest priority)
      if (parsedNum !== null && num.digit === parsedNum) {
        isMatch = true;
        score += 15000;
      }

      // 2. Exact matches
      if (digitStr === queryNormalized) {
        isMatch = true;
        score += 10000;
      }
      if (romanLower === queryNormalized || native === queryNormalized) {
        isMatch = true;
        score += 8000;
      }
      if (keysLower.includes(queryNormalized)) {
        isMatch = true;
        score += 7000;
      }

      // 3. Phonetic Exact Equals (Matches phonetic roman spelling variations)
      const romanPhonetic = getPhoneticKey(romanLower);
      if (romanPhonetic === queryPhonetic) {
        isMatch = true;
        score += 6500;
      }
      
      const keysPhonetic = keysLower.map(k => getPhoneticKey(k));
      if (keysPhonetic.includes(queryPhonetic)) {
        isMatch = true;
        score += 6000;
      }

      // 4. Starts-with matches
      if (romanLower.startsWith(queryNormalized)) {
        isMatch = true;
        score += 3000;
      }
      if (keysLower.some((k) => k.startsWith(queryNormalized))) {
        isMatch = true;
        score += 2000;
      }
      if (romanPhonetic.startsWith(queryPhonetic) && queryPhonetic.length >= 3) {
        isMatch = true;
        score += 1800;
      }

      // 5. Substring/Includes matches
      if (romanLower.includes(queryNormalized)) {
        isMatch = true;
        score += 500;
      }
      if (keysLower.some((k) => k.includes(queryNormalized))) {
        isMatch = true;
        score += 400;
      }
      if (native.includes(queryNormalized)) {
        isMatch = true;
        score += 300;
      }
      if (romanPhonetic.includes(queryPhonetic) && queryPhonetic.length >= 3) {
        isMatch = true;
        score += 250;
      }

      // 6. True Fuzzy Levenshtein Distance Match (very resilient to small typos)
      if (queryNormalized.length >= 3) {
        const romanDist = getLevenshteinDistance(queryNormalized, romanLower);
        const maxLenRoman = Math.max(queryNormalized.length, romanLower.length);
        const romanSimilarity = maxLenRoman === 0 ? 1 : 1 - romanDist / maxLenRoman;

        if (romanSimilarity >= 0.70 || romanDist <= 2) {
          isMatch = true;
          score += Math.round(romanSimilarity * 1500);
        }

        // Check best match across all search keys too
        for (const key of keysLower) {
          if (key.length >= 3) {
            const keyDist = getLevenshteinDistance(queryNormalized, key);
            const maxLenKey = Math.max(queryNormalized.length, key.length);
            const keySimilarity = maxLenKey === 0 ? 1 : 1 - keyDist / maxLenKey;

            if (keySimilarity >= 0.70 || keyDist <= 2) {
              isMatch = true;
              score += Math.round(keySimilarity * 1200);
            }
          }
        }
      }

      if (isMatch) {
        matchesList.push({ entry: num, score });
        if (parsedNum !== null && num.digit === parsedNum) {
          dynamicEntryAdded = true;
        }
      }
    }

    if (dynamicEntry && !dynamicEntryAdded) {
      matchesList.push({
        entry: dynamicEntry,
        score: 9500
      });
    }

    return matchesList
      .sort((a, b) => b.score - a.score || a.entry.digit - b.entry.digit)
      .map((m) => m.entry);
  };

  // =============================================================================
  // PRACTICE ARENA CONSTRUCTOR
  // =============================================================================
  const setupUnitQuiz = (unitId: string) => {
    // Acquire numbers exclusively inside this unit
    const unitList = NUMBERS.filter((n) => n.unitId === unitId);
    if (unitList.length === 0) return;

    const shuffledUnitList = [...unitList].sort(() => 0.5 - Math.random());
    const queryDecks: QuizQuestion[] = [];
    const promptFormats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? [
          "digit_to_script",
          "script_to_digit",
        ]
      : [
          "digit_to_roman",
          "roman_to_digit",
        ];

    // Build exactly 10 high-fidelity randomized questions with robust matching candidates
    for (let i = 0; i < 10; i++) {
      const entry = shuffledUnitList[i % shuffledUnitList.length];
      const pFormat = promptFormats[Math.floor(Math.random() * promptFormats.length)];

      let promptValue: string | number = "";
      let correctAnswer: string | number = "";

      switch (pFormat) {
        case "digit_to_roman":
          promptValue = entry.digit;
          correctAnswer = entry.romanUrdu;
          break;
        case "roman_to_digit":
          promptValue = entry.romanUrdu;
          correctAnswer = entry.digit;
          break;
        case "digit_to_script":
          promptValue = entry.digit;
          correctAnswer = entry.nativeScript;
          break;
        case "script_to_digit":
          promptValue = entry.nativeScript;
          correctAnswer = entry.digit;
          break;
      }

      const distractors = getSmartDistractors(entry, pFormat, NUMBERS);
      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

      queryDecks.push({
        entry,
        promptType: pFormat,
        promptValue,
        correctAnswer,
        choices,
      });
    }

    setQuizState({
      unitId,
      questions: queryDecks,
      currentIndex: 0,
      answers: [],
      userAnswer: null,
      isAnswered: false,
      score: 0,
      hearts: 5,
      showHeartsRefill: false,
    });

    setSearchQuery("");
    setSelectedSearchEntry(null);
    setActiveScreen("practice");
  };

  // =============================================================================
  // TRAINING ARENA (PERSONALIZED NUMBER MASTERY) LOGIC SYSTEM
  // =============================================================================
  const getArenaNumbersPool = (): NumberEntry[] => {
    const minVal = appState.arenaMin ?? 30;
    const maxVal = appState.arenaMax ?? 100;
    const filtered = NUMBERS.filter((n) => n.digit >= Math.min(minVal, maxVal) && n.digit <= Math.max(minVal, maxVal));
    if (filtered.length === 0) {
      return NUMBERS; // Fallback to all entry records if filtered subset results in empty
    }
    return filtered;
  };

  const getAdaptiveSortedList = (pool: NumberEntry[], count: number): NumberEntry[] => {
    const weakMap = appState.arenaWeakMap ?? {};
    const slowMap = appState.arenaSlowMap ?? {};
    const correctMap = appState.arenaCorrectMap ?? {};
    const weakAreas = appState.weakAreas ?? [];

    const scored = pool.map((num) => {
      const wrongs = weakMap[num.digit] ?? 0;
      const corrects = correctMap[num.digit] ?? 0;
      const slows = slowMap[num.digit] ?? 0;
      const attempts = wrongs + corrects;
      const accuracy = attempts > 0 ? corrects / attempts : -1;

      let score = 0;

      // 1. Frequently missed numbers (accuracy below 60% and has attempts)
      if (attempts > 0 && accuracy < 0.6) {
        score += 300 + wrongs * 45;
      } else if (wrongs > 0) {
        // General wrong answers
        score += 150 + wrongs * 25;
      }

      // 2. Recently incorrect answers (within weakAreas cache)
      if (weakAreas.includes(num.digit)) {
        score += 100;
      }

      // 3. Slow answers
      if (slows > 0) {
        score += 60 + slows * 15;
      }

      // 4. New/unpracticed numbers
      if (attempts === 0) {
        score += 120; // Ensure they get introduced before fully mastered ones
      }

      // 5. Correctly mastered numbers (accuracy >= 80% or corrects >= 3)
      if (attempts > 0 && accuracy >= 0.8) {
        score += 10; // Low priority so they appear way less frequently
      } else if (attempts > 0) {
        // Mid tier mastery
        score += 40;
      }

      // Add mathematical randomness jitter to keep the quiz feeling dynamic, fresh, and varied
      const jitter = Math.random() * 30;

      return { num, prScore: score + jitter };
    });

    // Sort descending by calculated priority score
    const sorted = [...scored].sort((a, b) => b.prScore - a.prScore);

    const result: NumberEntry[] = [];
    
    // Pick unique values from sorted priority list
    for (const item of sorted) {
      if (result.length >= count) break;
      if (!result.some((r) => r.digit === item.num.digit)) {
        result.push(item.num);
      }
    }

    // Fill pool leftovers if unique choices are exhausted
    while (result.length < count && result.length < pool.length) {
      const remaining = pool.filter((p) => !result.some((r) => r.digit === p.digit));
      if (remaining.length === 0) break;
      result.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }

    // Force repetitions if count exceeded the pool boundaries
    while (result.length < count) {
      result.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    return result;
  };

  const getAdaptiveArenaList = (count: number): NumberEntry[] => {
    const pool = getArenaNumbersPool();
    return getAdaptiveSortedList(pool, count);
  };

  const saveArenaStageProgress = (completedStage: number) => {
    const currentProgress = appState.arenaStageProgress ?? 1;
    let nextProgress = currentProgress;
    if (completedStage >= currentProgress) {
      nextProgress = Math.min(5, completedStage + 1);
    }
    const updated: AppState = {
      ...appState,
      arenaStageProgress: nextProgress,
      totalXP: appState.totalXP + 25, // Generous XP award bounty
    };
    if (completedStage === 5) {
      updated.arenaCompleted = true;
      updated.arenaStarted = false;
    }
    saveState(updated);
    playSoundSynth("levelUp");
  };

  const recordArenaResponse = (digit: number, isCorrect: boolean, elapsedMs: number) => {
    const isSlow = !isCorrect ? false : elapsedMs > 4000;
    
    const currentCorrects = appState.arenaCorrectMap ?? {};
    const currentWrongs = appState.arenaWeakMap ?? {};
    const currentSlows = appState.arenaSlowMap ?? {};

    const updatedCorrects = { ...currentCorrects };
    const updatedWrongs = { ...currentWrongs };
    const updatedSlows = { ...currentSlows };

    if (isCorrect) {
      updatedCorrects[digit] = (updatedCorrects[digit] ?? 0) + 1;
      if (updatedWrongs[digit]) {
        // Slowly decay weak score of digits on correct hits to maintain equilibrium
        updatedWrongs[digit] = Math.max(0, updatedWrongs[digit] - 1);
      }
    } else {
      updatedWrongs[digit] = (updatedWrongs[digit] ?? 0) + 1;
    }

    if (isSlow) {
      updatedSlows[digit] = (updatedSlows[digit] ?? 0) + 1;
    }

    const updated = {
      ...appState,
      arenaCorrectMap: updatedCorrects,
      arenaWeakMap: updatedWrongs,
      arenaSlowMap: updatedSlows,
      weakAreas: !isCorrect && !appState.weakAreas.includes(digit)
        ? [...appState.weakAreas, digit]
        : appState.weakAreas
    };
    saveState(updated);
  };

  const setupArenaStage2Quiz = () => {
    playSoundSynth("click");
    setArenaQuizMistakes([]);
    const activeList = getAdaptiveArenaList(5);
    const pool = getArenaNumbersPool();

    const questions: QuizQuestion[] = [];
    const formats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? ["digit_to_script", "script_to_digit"]
      : ["digit_to_roman", "roman_to_digit"];

    for (let i = 0; i < 5; i++) {
      const entry = activeList[i];
      const pFormat = formats[Math.floor(Math.random() * formats.length)];
      let promptValue: string | number = "";
      let correctAnswer: string | number = "";

      if (pFormat === "digit_to_roman") {
        promptValue = entry.digit;
        correctAnswer = entry.romanUrdu;
      } else if (pFormat === "roman_to_digit") {
        promptValue = entry.romanUrdu;
        correctAnswer = entry.digit;
      } else if (pFormat === "digit_to_script") {
        promptValue = entry.digit;
        correctAnswer = entry.nativeScript;
      } else {
        promptValue = entry.nativeScript;
        correctAnswer = entry.digit;
      }

      const distractors = getSmartDistractors(entry, pFormat, pool);
      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({ entry, promptType: pFormat, promptValue, correctAnswer, choices });
    }

    setArenaQuizQuestions(questions);
    setArenaQuizIdx(0);
    setArenaQuizScore(0);
    setArenaQuizSelected(null);
    setArenaQuizAnswered(false);
    setArenaQuestionStartTime(Date.now());
    setArenaActiveStage(2);
    setActiveScreen("training-arena");
  };

  const setupArenaStage3Listening = () => {
    playSoundSynth("click");
    setArenaListMistakes([]);
    const activeList = getAdaptiveArenaList(5);
    const pool = getArenaNumbersPool();

    const questions: any[] = [];
    for (let i = 0; i < 5; i++) {
      const entry = activeList[i];
      const correctAnswer = entry.digit;
      const distractors = getSmartDistractors(entry, "roman_to_digit", pool) as number[];

      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({ entry, correctAnswer, choices });
    }

    setArenaListQuestions(questions);
    setArenaListIdx(0);
    setArenaListSelected(null);
    setArenaListAnswered(false);
    setArenaQuestionStartTime(Date.now());
    setArenaActiveStage(3);
    setActiveScreen("training-arena");
  };

  const makeSingleArenaArcadeQuestion = (): QuizQuestion => {
    const pool = getArenaNumbersPool();
    // Get top 8 adaptive candidates (or less if pool is smaller)
    const countToFetch = Math.min(8, pool.length);
    const activeList = getAdaptiveArenaList(countToFetch);
    const entry = getRandomObjectAvoidingRecent(activeList, recentArenaArcadeDigitsRef.current, 0.5);
    
    // Update recent
    recentArenaArcadeDigitsRef.current = [...recentArenaArcadeDigitsRef.current, entry.digit].slice(-15);
    
    const formats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? ["digit_to_script", "script_to_digit"]
      : ["digit_to_roman", "roman_to_digit"];
    const pFormat = formats[Math.floor(Math.random() * formats.length)];
    let promptValue: string | number = "";
    let correctAnswer: string | number = "";

    if (pFormat === "digit_to_roman") {
      promptValue = entry.digit;
      correctAnswer = entry.romanUrdu;
    } else if (pFormat === "roman_to_digit") {
      promptValue = entry.romanUrdu;
      correctAnswer = entry.digit;
    } else if (pFormat === "digit_to_script") {
      promptValue = entry.digit;
      correctAnswer = entry.nativeScript;
    } else {
      promptValue = entry.nativeScript;
      correctAnswer = entry.digit;
    }

    const distractors = getSmartDistractors(entry, pFormat, pool);
    const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
    return { entry, promptType: pFormat, promptValue, correctAnswer, choices };
  };

  const startArenaStage4Arcade = () => {
    playSoundSynth("click");
    setArenaArcadeScore(0);
    setArenaArcadeTime(30);
    setArenaArcadeOver(false);
    setArenaArcadeSelected(null);
    setArenaArcadeAnswered(false);

    const q = makeSingleArenaArcadeQuestion();
    setArenaArcadeActiveQ(q);
    setArenaActiveStage(4);
    setActiveScreen("training-arena");
  };

  const setupArenaStage5Mastery = () => {
    playSoundSynth("click");
    setArenaQuizMistakes([]);
    const activeList = getAdaptiveArenaList(10);
    const pool = getArenaNumbersPool();

    const questions: QuizQuestion[] = [];
    const formats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? ["digit_to_script", "script_to_digit"]
      : ["digit_to_roman", "roman_to_digit"];

    for (let i = 0; i < 10; i++) {
       const entry = activeList[i];
       const pFormat = formats[Math.floor(Math.random() * formats.length)];
       let promptValue: string | number = "";
       let correctAnswer: string | number = "";

      if (pFormat === "digit_to_roman") {
        promptValue = entry.digit;
        correctAnswer = entry.romanUrdu;
      } else if (pFormat === "roman_to_digit") {
        promptValue = entry.romanUrdu;
        correctAnswer = entry.digit;
      } else if (pFormat === "digit_to_script") {
        promptValue = entry.digit;
        correctAnswer = entry.nativeScript;
      } else {
        promptValue = entry.nativeScript;
        correctAnswer = entry.digit;
      }

      const distractors = getSmartDistractors(entry, pFormat, pool);
      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({ entry, promptType: pFormat, promptValue, correctAnswer, choices });
    }

    setArenaQuizQuestions(questions);
    setArenaQuizIdx(0);
    setArenaQuizScore(0);
    setArenaQuizSelected(null);
    setArenaQuizAnswered(false);
    setArenaQuestionStartTime(Date.now());
    setArenaActiveStage(5);
    setActiveScreen("training-arena");
  };

  // =============================================================================
  // GINTI JOURNEY STAGES LOGIC SYSTEM
  // =============================================================================
  const getUnitProgress = (unitId: string): number => {
    return appState.unitStagesProgress?.[unitId] ?? 1;
  };

  const saveUnitStageProgress = (unitId: string, completedStage: number) => {
    const currentProgress = getUnitProgress(unitId);
    if (completedStage >= currentProgress) {
      const nextProgress = Math.min(5, completedStage + 1);
      const updatedProgress = {
        ...(appState.unitStagesProgress ?? {}),
        [unitId]: nextProgress,
      };
      const updated = {
        ...appState,
        unitStagesProgress: updatedProgress,
        totalXP: appState.totalXP + 15, // Micro XP award for finishing a stage!
      };
      saveState(updated);
      playSoundSynth("levelUp");
    }
  };

  // Automatically scroll to the next unlocked stage in the Unit Journey selection map when progressing
  useEffect(() => {
    if (activeScreen === "unit-journey" && activeStageIndex === null && selectedJourneyUnitId && nextStageToFocus !== null) {
      const timer = setTimeout(() => {
        const nextStageElement = document.getElementById(`journey-stage-row-${nextStageToFocus}`);
        if (nextStageElement) {
          nextStageElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setNextStageToFocus(null); // Clear target after scrolling
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeScreen, activeStageIndex, selectedJourneyUnitId, nextStageToFocus]);

  // Automatically scroll to and highlight the next available unit card on returning to dashboard
  useEffect(() => {
    if (activeScreen === "dashboard" && nextUnitToFocus !== null) {
      const timer = setTimeout(() => {
        const targetId = nextUnitToFocus;
        setNextUnitToFocus(null); // Clear first to avoid re-triggering
        
        const nextUnitElement = document.getElementById(`unit-card-${targetId}`);
        if (nextUnitElement) {
          nextUnitElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // Set highlight
          setHighlightedUnitId(targetId);
          const clearHighlightTimer = setTimeout(() => {
            setHighlightedUnitId((curr) => curr === targetId ? null : curr);
          }, 3500);
          return () => clearTimeout(clearHighlightTimer);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [activeScreen, nextUnitToFocus]);

  const startUnitJourney = (unitId: string) => {
    const unitIndex = UNITS.findIndex((u) => u.id === unitId);
    const isUnlocked = unitIndex === 0 || appState.completedUnits.includes(UNITS[unitIndex - 1].id) || appState.completedUnits.includes(unitId);
    
    if (!isUnlocked) {
      playSoundSynth("incorrect");
      showToast("This unit is locked! Please complete earlier units first. 🔒");
      return;
    }

    playSoundSynth("click");
    setSelectedJourneyUnitId(unitId);
    setActiveStageIndex(null); // Back to the journey stages list view!
    setActiveScreen("unit-journey");
    window.scrollTo({ top: 0 }); // Scroll window to top instantly when entering
  };

  const setupStage2Quiz = (unitId: string) => {
    playSoundSynth("click");
    const unitList = NUMBERS.filter((n) => n.unitId === unitId);
    if (unitList.length === 0) return;

    setStageQuizMistakes([]);
    const shuffledUnitList = getAdaptiveSortedList(unitList, 5);
    const questions: QuizQuestion[] = [];
    const formats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? ["digit_to_script", "script_to_digit"]
      : ["digit_to_roman", "roman_to_digit"];

    for (let i = 0; i < 5; i++) {
      const entry = shuffledUnitList[i % shuffledUnitList.length];
      const pFormat = formats[Math.floor(Math.random() * formats.length)];
      let promptValue: string | number = "";
      let correctAnswer: string | number = "";

      if (pFormat === "digit_to_roman") {
        promptValue = entry.digit;
        correctAnswer = entry.romanUrdu;
      } else if (pFormat === "roman_to_digit") {
        promptValue = entry.romanUrdu;
        correctAnswer = entry.digit;
      } else if (pFormat === "digit_to_script") {
        promptValue = entry.digit;
        correctAnswer = entry.nativeScript;
      } else {
        promptValue = entry.nativeScript;
        correctAnswer = entry.digit;
      }

      const distractors = getSmartDistractors(entry, pFormat, NUMBERS);
      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({ entry, promptType: pFormat, promptValue, correctAnswer, choices });
    }

    setStageQuizQuestions(questions);
    setStageQuizIdx(0);
    setStageQuizScore(0);
    setStageQuizSelected(null);
    setStageQuizAnswered(false);
    setActiveStageIndex(2);
  };

  const setupStage3Listening = (unitId: string) => {
    playSoundSynth("click");
    const unitList = NUMBERS.filter((n) => n.unitId === unitId);
    if (unitList.length === 0) return;

    setStageListMistakes([]);
    const shuffledUnitList = getAdaptiveSortedList(unitList, 5);
    const questions: any[] = [];
    for (let i = 0; i < 5; i++) {
      const entry = shuffledUnitList[i % shuffledUnitList.length];
      const correctAnswer = entry.digit;
      const distractors = getSmartDistractors(entry, "roman_to_digit", NUMBERS) as number[];

      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      questions.push({ entry, correctAnswer, choices });
    }

    setStageListQuestions(questions);
    setStageListIdx(0);
    setStageListSelected(null);
    setStageListAnswered(false);
    setActiveStageIndex(3);
  };

  const makeSingleUnitArcadeQuestion = (unitId: string): QuizQuestion => {
    const unitList = NUMBERS.filter((n) => n.unitId === unitId);
    
    // Get recent for this unit
    const recent = recentUnitArcadeDigitsRef.current[unitId] || [];
    const entry = getRandomObjectAvoidingRecent(unitList, recent, 0.5);
    
    // Update recent
    recentUnitArcadeDigitsRef.current[unitId] = [...recent, entry.digit].slice(-10);

    const formats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? ["digit_to_script", "script_to_digit"]
      : ["digit_to_roman", "roman_to_digit"];
    const pFormat = formats[Math.floor(Math.random() * formats.length)];
    let promptValue: string | number = "";
    let correctAnswer: string | number = "";

    if (pFormat === "digit_to_roman") {
      promptValue = entry.digit;
      correctAnswer = entry.romanUrdu;
    } else if (pFormat === "roman_to_digit") {
      promptValue = entry.romanUrdu;
      correctAnswer = entry.digit;
    } else if (pFormat === "digit_to_script") {
      promptValue = entry.digit;
      correctAnswer = entry.nativeScript;
    } else {
      promptValue = entry.nativeScript;
      correctAnswer = entry.digit;
    }

    const distractors = getSmartDistractors(entry, pFormat, NUMBERS);
    const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
    return { entry, promptType: pFormat, promptValue, correctAnswer, choices };
  };

  const startStage4Arcade = () => {
    playSoundSynth("click");
    setStageArcadeScore(0);
    setStageArcadeTime(30);
    setStageArcadeOver(false);
    setStageArcadeSelected(null);
    setStageArcadeAnswered(false);

    const q = makeSingleUnitArcadeQuestion(selectedJourneyUnitId!);
    setStageArcadeActiveQ(q);
    setActiveStageIndex(4);
  };

  const setupStage5Quiz = (unitId: string) => {
    playSoundSynth("click");
    const unitList = NUMBERS.filter((n) => n.unitId === unitId);
    if (unitList.length === 0) return;

    setStage5Mistakes([]);
    const shuffledUnitList = getAdaptiveSortedList(unitList, 10);
    const queryDecks: QuizQuestion[] = [];
    const formats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? ["digit_to_script", "script_to_digit"]
      : ["digit_to_roman", "roman_to_digit"];

    for (let i = 0; i < 10; i++) {
      const entry = shuffledUnitList[i % shuffledUnitList.length];
      const pFormat = formats[Math.floor(Math.random() * formats.length)];

      let promptValue: string | number = "";
      let correctAnswer: string | number = "";

      if (pFormat === "digit_to_roman") {
        promptValue = entry.digit;
        correctAnswer = entry.romanUrdu;
      } else if (pFormat === "roman_to_digit") {
        promptValue = entry.romanUrdu;
        correctAnswer = entry.digit;
      } else if (pFormat === "digit_to_script") {
        promptValue = entry.digit;
        correctAnswer = entry.nativeScript;
      } else {
        promptValue = entry.nativeScript;
        correctAnswer = entry.digit;
      }

      const distractors = getSmartDistractors(entry, pFormat, NUMBERS);
      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

      queryDecks.push({
        entry,
        promptType: pFormat,
        promptValue,
        correctAnswer,
        choices,
      });
    }

    setQuizState({
      unitId,
      questions: queryDecks,
      currentIndex: 0,
      answers: [],
      userAnswer: null,
      isAnswered: false,
      score: 0,
      hearts: 5,
      showHeartsRefill: false,
      isStage5Test: true,
    });

    setSearchQuery("");
    setSelectedSearchEntry(null);
    setActiveScreen("practice");
  };

  const refillHearts = (useXP: boolean) => {
    playSoundSynth("levelUp");
    if (useXP) {
      setAppState((prev) => {
        const updated = {
          ...prev,
          totalXP: Math.max(0, prev.totalXP - 20),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      showToast("Spent 20 XP! Mithu restored your 5 Hearts. ❤️");
    } else {
      showToast("Mithu gifted you 5 free Hearts! Shabash! 🦜❤️");
    }
    
    if (quizState) {
      setQuizState({
        ...quizState,
        hearts: 5,
        showHeartsRefill: false,
        userAnswer: null,
        isAnswered: false,
      });
    }
  };

  const chooseQuizAnswer = (choice: string | number) => {
    if (!quizState || quizState.isAnswered) return;

    const currQuestion = quizState.questions[quizState.currentIndex];
    const correct = choice === currQuestion.correctAnswer;

    if (correct) {
      incrementMasteryStreak();
    } else {
      resetMasteryStreak(currQuestion.entry.digit);
    }

    playSoundSynth(correct ? "correct" : "incorrect");
    setMascotAnimation(correct ? "jump" : "shake");
    setTimeout(() => {
      setMascotAnimation("");
    }, 600);

    const answersList = [...quizState.answers, correct];
    const newScore = correct ? quizState.score + 10 : quizState.score;

    let updatedWeakAreas = [...appState.weakAreas];
    if (!correct) {
      setStage5Mistakes((prev) => [...prev, currQuestion]);
      if (!updatedWeakAreas.includes(currQuestion.entry.digit)) {
        updatedWeakAreas.push(currQuestion.entry.digit);
      }
    }

    const nextHearts = correct ? quizState.hearts : Math.max(0, quizState.hearts - 1);
    const depleted = nextHearts === 0;

    setAppState((prev) => {
      let stateUpdate = {
        ...prev,
        totalXP: correct ? prev.totalXP + 10 : prev.totalXP,
        weakAreas: updatedWeakAreas,
      };
      if (stateUpdate.totalXP > prev.totalXP) {
        stateUpdate = markUserActive(stateUpdate);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateUpdate));
      return stateUpdate;
    });

    // Count consecutive correct answers in the current quiz session
    let consecutiveCount = 0;
    for (let i = answersList.length - 1; i >= 0; i--) {
      if (answersList[i]) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    const cFeedback = getMithuCorrectFeedback(
      quizState.currentIndex,
      quizState.questions.length,
      correct ? consecutiveCount : 0,
      false,
      recentMithuMessagesRef.current
    );
    const wFeedback = getMithuWrongFeedback(false, recentMithuMessagesRef.current);
    const chosenFeedback = correct ? cFeedback : wFeedback;
    trackMithuMessage(chosenFeedback.title);

    setQuizState({
      ...quizState,
      userAnswer: choice,
      isAnswered: true,
      answers: answersList,
      score: newScore,
      hearts: nextHearts,
      showHeartsRefill: depleted,
      mithuFeedback: chosenFeedback,
    });
  };

  const progressPractice = () => {
    if (!quizState) return;

    const nextIndex = quizState.currentIndex + 1;
    if (nextIndex >= quizState.questions.length) {
      if (stage5Mistakes.length > 0) {
        const uId = quizState.unitId;
        setQuizState(null);
        setTimeout(() => {
          startRecoveryRound("journey_stage5", stage5Mistakes, uId);
        }, 50);
        return;
      }
      // Completed full set! Save completion milestones
      const isNewCompletion = !appState.completedUnits.includes(quizState.unitId);
      const unitsArray = isNewCompletion
        ? [...appState.completedUnits, quizState.unitId]
        : appState.completedUnits;

      const nextJourneyProgress = {
        ...(appState.unitStagesProgress ?? {}),
        [quizState.unitId]: 5,
      };

      const updated = {
        ...appState,
        completedUnits: unitsArray,
        totalXP: appState.totalXP + 50, // Major completion reward!
        unitStagesProgress: nextJourneyProgress,
      };

      saveState(updated);
      playSoundSynth("levelUp");
      
      const celebratoryMsg = getMithuUnitCompletionMessage(recentMithuMessagesRef.current);
      trackMithuMessage(celebratoryMsg);
      
      if (quizState.isStage5Test) {
        showToast(`${celebratoryMsg} Stage 5 Cleared! You have Mastered the whole Unit! 🏆✨`);
        setCompletedUnitPopup(quizState.unitId);
      } else {
        showToast(`${celebratoryMsg} Stage Completed! Awarded +50 Reward XP! 🎉`);
      }
      
      setQuizState(null);
      setActiveScreen("dashboard");
    } else {
      setQuizState({
        ...quizState,
        currentIndex: nextIndex,
        userAnswer: null,
        isAnswered: false,
      });
    }
  };

  // MISTAKE RECOVERY CHALLENGE SYSTEM (Duolingo style correction loop)
  const startRecoveryRound = (
    originalMode: "journey_stage2" | "journey_stage3" | "journey_stage5" | "arena_stage2" | "arena_stage3" | "arena_stage5",
    mistakeQuestions: any[],
    unitId?: string
  ) => {
    const initialMistakes: NumberEntry[] = [];
    const uniqueDigits = new Set<number>();
    
    // Extract unique mistake entries
    for (const q of mistakeQuestions) {
      if (q && q.entry && !uniqueDigits.has(q.entry.digit)) {
        uniqueDigits.add(q.entry.digit);
        initialMistakes.push(q.entry);
      }
    }

    if (initialMistakes.length === 0) {
      setRecoveryState(null);
      return;
    }

    const questions = initialMistakes.map((entry) => {
      const formats: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
        ? ["digit_to_script", "script_to_digit"]
        : ["digit_to_roman", "roman_to_digit"];
      const pFormat = formats[Math.floor(Math.random() * formats.length)];
      let promptValue: string | number = "";
      let correctAnswer: string | number = "";

      if (pFormat === "digit_to_roman") {
        promptValue = entry.digit;
        correctAnswer = entry.romanUrdu;
      } else if (pFormat === "roman_to_digit") {
        promptValue = entry.romanUrdu;
        correctAnswer = entry.digit;
      } else if (pFormat === "digit_to_script") {
        promptValue = entry.digit;
        correctAnswer = entry.nativeScript;
      } else {
        promptValue = entry.nativeScript;
        correctAnswer = entry.digit;
      }

      const distractors = getSmartDistractors(entry, pFormat, NUMBERS);
      const choices = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());
      
      return {
        entry,
        promptType: pFormat,
        promptValue,
        correctAnswer,
        choices
      };
    });

    const attemptsMap: Record<number, number> = {};
    for (const entry of initialMistakes) {
      attemptsMap[entry.digit] = 0;
    }

    setRecoveryState({
      originalMode,
      unitId,
      questions,
      currentIndex: 0,
      userAnswer: null,
      isAnswered: false,
      score: 0,
      attemptsMap,
      initialMistakes,
      mastered: [],
      failedPermanently: [],
      isDone: false,
    });
  };

  const handleRecoveryAnswer = (choice: string | number) => {
    if (!recoveryState || recoveryState.isAnswered) return;

    const currentQ = recoveryState.questions[recoveryState.currentIndex];
    const correct = choice === currentQ.correctAnswer;

    if (correct) {
      incrementMasteryStreak();
    } else {
      resetMasteryStreak(currentQ.entry.digit);
    }

    playSoundSynth(correct ? "correct" : "incorrect");
    setMascotAnimation(correct ? "jump" : "shake");
    setTimeout(() => {
      setMascotAnimation("");
    }, 600);

    const activeQuestions = [...recoveryState.questions];
    const attemptsMap = { ...recoveryState.attemptsMap };
    const mastered = [...recoveryState.mastered];
    const failedPermanently = [...recoveryState.failedPermanently];

    const digit = currentQ.entry.digit;
    const currentFails = attemptsMap[digit] ?? 0;

    if (correct) {
      // Answered correctly! If it wasn't already failed 3 times, mark as mastered
      if (!mastered.includes(digit) && !failedPermanently.includes(digit)) {
        mastered.push(digit);
      }
    } else {
      const nextFails = currentFails + 1;
      attemptsMap[digit] = nextFails;

      if (nextFails < 3) {
        // Less than 3 fails: Duolingo style: Re-queue question at the end for retries!
        // Clone with newly randomized choices
        const reQueuedQuestion = {
          ...currentQ,
          choices: [...currentQ.choices].sort(() => 0.5 - Math.random())
        };
        activeQuestions.push(reQueuedQuestion);
        showToast(`Mithu says: Re-queueing digit ${digit} for reinforcement loop! ⚠️`);
      } else {
        // Failed 3 times: stop forcing it, explain, move to failedPermanently
        if (!failedPermanently.includes(digit)) {
          failedPermanently.push(digit);
        }
        showToast(`Dafa! Limit reached for ${digit}. Review it in Stage 1!`);
      }
    }

    // Variety pool Selection for recovery
    const cFeedback = getMithuCorrectFeedback(
      recoveryState.currentIndex,
      recoveryState.questions.length,
      0,
      true,
      recentMithuMessagesRef.current
    );
    const wFeedback = getMithuWrongFeedback(true, recentMithuMessagesRef.current);
    const chosenFeedback = correct ? cFeedback : wFeedback;
    trackMithuMessage(chosenFeedback.title);

    setRecoveryState({
      ...recoveryState,
      questions: activeQuestions,
      userAnswer: choice,
      isAnswered: true,
      score: correct ? recoveryState.score + 10 : recoveryState.score,
      attemptsMap,
      mastered,
      failedPermanently,
      mithuFeedback: chosenFeedback,
    });
  };

  const advanceRecoveryRound = () => {
    if (!recoveryState) return;
    const nextIdx = recoveryState.currentIndex + 1;
    if (nextIdx >= recoveryState.questions.length) {
      setRecoveryState({
        ...recoveryState,
        currentIndex: nextIdx,
        userAnswer: null,
        isAnswered: false,
        isDone: true
      });
    } else {
      setRecoveryState({
        ...recoveryState,
        currentIndex: nextIdx,
        userAnswer: null,
        isAnswered: false
      });
    }
  };

  const exitQuiz = () => {
    playSoundSynth("click");
    const testMode = quizState?.isStage5Test;
    setQuizState(null);
    if (testMode) {
      setActiveScreen("unit-journey");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setActiveScreen("dashboard");
    }
  };

  // =============================================================================
  // ARCADE BLITZ ENGINE (⚡ COUNTDOWN REFLEXES CHALLENGE)
  // =============================================================================
  const makeArcadeQuestion = (): QuizQuestion => {
    const randomObject = getRandomObjectAvoidingRecent(NUMBERS, recentArcadeDigitsRef.current, 0.5);
    
    // Update the recent list
    recentArcadeDigitsRef.current = [...recentArcadeDigitsRef.current, randomObject.digit].slice(-40);

    const options: ("digit_to_roman" | "roman_to_digit" | "digit_to_script" | "script_to_digit")[] = appState.showScript
      ? ["digit_to_script", "script_to_digit"]
      : ["digit_to_roman", "roman_to_digit"];
    const selection = options[Math.floor(Math.random() * options.length)];

    let pValue: string | number = "";
    let cAnswer: string | number = "";

    switch (selection) {
      case "digit_to_roman":
        pValue = randomObject.digit;
        cAnswer = randomObject.romanUrdu;
        break;
      case "roman_to_digit":
        pValue = randomObject.romanUrdu;
        cAnswer = randomObject.digit;
        break;
      case "digit_to_script":
        pValue = randomObject.digit;
        cAnswer = randomObject.nativeScript;
        break;
      case "script_to_digit":
        pValue = randomObject.nativeScript;
        cAnswer = randomObject.digit;
        break;
    }

    // Distractors
    const choicesList: (string | number)[] = [];
    const isNumTarget = typeof cAnswer === "number";
    const isScriptTarget = selection === "digit_to_script";

    const others = NUMBERS.filter((n) => n.digit !== randomObject.digit);
    const randomizedPool = others.sort(() => 0.5 - Math.random());

    for (const piece of randomizedPool) {
      if (choicesList.length >= 3) break;
      let targetValue = isNumTarget ? piece.digit : isScriptTarget ? piece.nativeScript : piece.romanUrdu;
      if (!choicesList.includes(targetValue) && targetValue !== cAnswer) {
        choicesList.push(targetValue);
      }
    }

    while (choicesList.length < 3) {
      const placeholder = isNumTarget ? 888 : "Ek";
      if (placeholder !== cAnswer && !choicesList.includes(placeholder)) {
        choicesList.push(placeholder);
      }
    }

    const shuffled = [cAnswer, ...choicesList].sort(() => 0.5 - Math.random());

    return {
      entry: randomObject,
      promptType: selection,
      promptValue: pValue,
      correctAnswer: cAnswer,
      choices: shuffled,
    };
  };

  const startArcadeMode = () => {
    playSoundSynth("click");
    setSearchQuery("");
    setSelectedSearchEntry(null);

    setArcadeState({
      score: 0,
      activeQuestion: makeArcadeQuestion(),
      timeLeft: 30,
      isGameOver: false,
      totalAnswered: 0,
      wrongCount: 0,
    });

    setActiveScreen("arcade");

    if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);

    arcadeTimerRef.current = setInterval(() => {
      if (mithuExplanationDigitRef.current !== null) {
        return;
      }
      setArcadeState((prev) => {
        if (!prev) return null;
        if (prev.timeLeft <= 1) {
          // Time completed
          if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);
          
          const reachedScore = prev.score;
          
          setAppState((currentAppState) => {
            const currentHigh = currentAppState.highScore;
            const nextHigh = reachedScore > currentHigh;

            let saved = {
              ...currentAppState,
              highScore: nextHigh ? reachedScore : currentHigh,
              totalXP: currentAppState.totalXP + reachedScore, // Real XP earned matches scorecard points
            };
            
            if (reachedScore > 0) {
              saved = markUserActive(saved);
            }
            
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saved));
            return saved;
          });

          playSoundSynth("levelUp");

          return {
            ...prev,
            timeLeft: 0,
            isGameOver: true,
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);
  };

  const selectArcadeOption = (choiceSelected: string | number) => {
    if (!arcadeState || arcadeState.isGameOver || arcadeState.isAnswered) return;

    const currQ = arcadeState.activeQuestion;
    if (!currQ) return;

    const correctMatch = choiceSelected === currQ.correctAnswer;

    if (correctMatch) {
      incrementMasteryStreak();
    } else {
      resetMasteryStreak(currQ.entry.digit);
    }

    playSoundSynth(correctMatch ? "correct" : "incorrect");
    setMascotAnimation(correctMatch ? "jump" : "shake");
    setTimeout(() => {
      setMascotAnimation("");
    }, 600);

    const calculatedScore = correctMatch ? arcadeState.score + 10 : Math.max(0, arcadeState.score - 5);
    const completedChallenges = arcadeState.totalAnswered + 1;
    const errorsCounter = correctMatch ? arcadeState.wrongCount : arcadeState.wrongCount + 1;

    let weakAreasUpdate = [...appState.weakAreas];
    if (!correctMatch && !weakAreasUpdate.includes(currQ.entry.digit)) {
      weakAreasUpdate.push(currQ.entry.digit);
      setAppState((prev) => {
        const temp = { ...prev, weakAreas: weakAreasUpdate };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(temp));
        return temp;
      });
    }

    // Set immediate feedback state showing which button was clicked
    setArcadeState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        selectedAnswer: choiceSelected,
        isAnswered: true,
      };
    });

    // Advance to next question after a very brief, satisfying feedback pause (450ms)
    setTimeout(() => {
      setArcadeState((prev) => {
        if (!prev || prev.isGameOver) return prev;
        return {
          ...prev,
          score: calculatedScore,
          totalAnswered: completedChallenges,
          wrongCount: errorsCounter,
          activeQuestion: makeArcadeQuestion(),
          selectedAnswer: null,
          isAnswered: false,
        };
      });
    }, 450);
  };

  const checkJourneyScroll = () => {
    const el = journeyStage1ScrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    const noScrollNeeded = el.scrollHeight <= el.clientHeight;
    if (isAtBottom || noScrollNeeded) {
      if (!journeyStage1Finished) {
        playSoundSynth("levelUp");
        setJourneyStage1Finished(true);
      }
    }
  };

  const checkArenaScroll = () => {
    const el = arenaStage1ScrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    const noScrollNeeded = el.scrollHeight <= el.clientHeight;
    if (isAtBottom || noScrollNeeded) {
      if (!arenaStage1Finished) {
        playSoundSynth("levelUp");
        setArenaStage1Finished(true);
      }
    }
  };

  useEffect(() => {
    if (activeStageIndex === 1) {
      setJourneyStage1Finished(false);
      // Wait a tick for DOM rendering of list items to check if no scroll is needed
      setTimeout(() => {
        checkJourneyScroll();
      }, 100);
    }
  }, [activeStageIndex, selectedJourneyUnitId]);

  useEffect(() => {
    if (arenaActiveStage === 1) {
      setArenaStage1Finished(false);
      // Wait a tick for DOM rendering of list items to check if no scroll is needed
      setTimeout(() => {
        checkArenaScroll();
      }, 100);
    }
  }, [arenaActiveStage]);

  useEffect(() => {
    if (activeStageIndex === 3) {
      setStageListSpeakerAnimate(true);
      const timer = setTimeout(() => {
        setStageListSpeakerAnimate(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeStageIndex, stageListIdx]);

  useEffect(() => {
    if (arenaActiveStage === 3) {
      setArenaListSpeakerAnimate(true);
      const timer = setTimeout(() => {
        setArenaListSpeakerAnimate(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [arenaActiveStage, arenaListIdx]);

  useEffect(() => {
    return () => {
      if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);
    };
  }, []);

  const closeArcadeFrame = () => {
    if (arcadeTimerRef.current) clearInterval(arcadeTimerRef.current);
    setArcadeState(null);
    setActiveScreen("dashboard");
  };

  // =============================================================================
  // SUB-STAGES SPEED TRIAL COUNTDOWN
  // =============================================================================
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (activeStageIndex === 4 && !stageArcadeOver) {
      timerId = setInterval(() => {
        if (mithuExplanationDigitRef.current !== null) {
          return;
        }
        setStageArcadeTime((prev) => {
          if (prev <= 1) {
            setStageArcadeOver(true);
            if (timerId) clearInterval(timerId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [activeStageIndex, stageArcadeOver]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (arenaActiveStage === 4 && !arenaArcadeOver) {
      timerId = setInterval(() => {
        if (mithuExplanationDigitRef.current !== null) {
          return;
        }
        setArenaArcadeTime((prev) => {
          if (prev <= 1) {
            setArenaArcadeOver(true);
            if (timerId) clearInterval(timerId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [arenaActiveStage, arenaArcadeOver]);

  // =============================================================================
  // RESET DEVELOPMENT PROGRESS WIPE
  // =============================================================================
  const flushAppProgress = () => {
    playSoundSynth("click");
    setShowResetConfirm(true);
  };

  const performAppReset = () => {
    playSoundSynth("click");
    const resetState: AppState = {
      totalXP: 0,
      completedUnits: [],
      weakAreas: [],
      showScript: true,
      highScore: 0,
      masteryStreak: 0,
      streakDays: 3,
      hasOnboarded: false,
      unitStagesProgress: {},
      arenaMin: 30,
      arenaMax: 100,
      arenaStageProgress: 1,
      arenaWeakMap: {},
      arenaSlowMap: {},
      arenaCorrectMap: {},
      arenaStarted: false,
      arenaCompleted: false,
    };
    saveState(resetState);
    setOnboardingActive(true);
    setActiveScreen("dashboard");
    setIsTrainingActive(false);
    setArenaActiveStage(null);
    setSearchQuery("");
    setSelectedSearchEntry(null);
    setQuizState(null);
    setArcadeState(null);
    setShowResetConfirm(false);
    showToast("Progress wiped cleanly. Goodbye! ✨");
  };

  const cancelAppReset = () => {
    playSoundSynth("click");
    setShowResetConfirm(false);
  };

  const handleOnboardMode = (typeChoice: "learn" | "lookup") => {
    playSoundSynth("click");
    const updated = {
      ...appState,
      hasOnboarded: true,
    };
    saveState(updated);
    setOnboardingActive(false);

    if (typeChoice === "lookup") {
      const searchBox = document.getElementById("ginti-search");
      if (searchBox) searchBox.focus();
      showToast("Lookup Activated! Type Romanized (e.g., Saat) or numbers.");
    } else {
      showToast("Let's scale Urdu counting! Unit 1 unlocked.");
    }
  };

  // =============================================================================
  // INTERACTIVE BENTO CARD PRESETS
  // =============================================================================
  const matchingSearchResults = handleQuerySearch();
  const activeLevel = Math.max(1, Math.floor(appState.totalXP / 100) + 1);

  return (
    <div className="min-h-screen relative flex flex-col justify-between">
      
      {/* Visual Header System Notifications Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-full text-xs md:text-sm font-semibold tracking-wide shadow-2xl flex items-center gap-2"
          >
            <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Dialog Panel Backdrop Overlay */}
      <AnimatePresence>
        {onboardingActive && (
          <motion.div 
            id="onboarding-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-3.5 sm:p-4"
          >
            <motion.div 
              id="onboarding-card"
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-white rounded-[2rem] p-5 xs:p-7 md:p-10 max-w-xl w-[calc(100%-1rem)] xs:w-full border border-slate-200 text-center relative overflow-hidden max-h-[calc(100vh-2.5rem)] sm:max-h-[85vh] overflow-y-auto"
            >
              {/* Premium Top Line Accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-700 via-emerald-600 to-amber-500" />
              
              <div className="mx-auto flex justify-center mb-3 sm:mb-6 transform scale-[0.85] xs:scale-100 origin-center">
                <MithuMascot mood="happy" />
              </div>

              <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2 sm:mb-3 font-sans">
                Welcome to <span className="text-emerald-800">Ginti</span>
              </h1>
              
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-4 sm:mb-8 max-w-md mx-auto px-1 sm:px-0">
                Ever spoken perfect conversational Urdu—but when a micro-merchant yells out <span className="font-semibold text-slate-900">"Tirpan"</span> or <span className="font-semibold text-slate-900">"Chaunsath"</span>, you panic? <span className="text-emerald-700 font-semibold">Ginti</span> bridges this exact gap instantly.
              </p>

              <div id="onboarding-choices" className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch justify-center">
                <button 
                  onClick={() => handleOnboardMode("learn")}
                  className="flex-1 btn-primary py-2.5 sm:py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-center cursor-pointer"
                >
                  <span className="font-extrabold flex items-center justify-center gap-1">
                    📚 Learn Systematically
                  </span>
                  <span className="opacity-85 text-[10px] font-normal leading-tight">Step-by-step unit exercises</span>
                </button>

                <button 
                  onClick={() => handleOnboardMode("lookup")}
                  className="flex-1 btn-secondary py-2.5 sm:py-4 px-4 sm:px-6 rounded-2xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-center cursor-pointer"
                >
                  <span className="font-extrabold flex items-center justify-center gap-1">
                    ⚡ Instant Search Hub
                  </span>
                  <span className="opacity-85 text-[10px] font-normal leading-tight">Phonetic lookup dictionary</span>
                </button>
              </div>

              <p className="text-[9.5px] sm:text-[10px] text-slate-400 mt-4 sm:mt-8 italic">
                Designed to run completely client-side. Complete matching intuition anytime, anywhere.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Reset Progress Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div 
            id="reset-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div 
              id="reset-confirm-card"
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="bg-white rounded-[2rem] p-6 sm:p-7 max-w-sm w-full border-2 border-slate-200 border-b-[6px] border-b-slate-350 text-center relative overflow-hidden shadow-2xl animate-scale-up"
            >
              {/* Premium Warning Top Stripe */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-rose-600" />
              
              {/* 3D Rose/Crimson Alert Badge */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center mb-4 border-2 border-rose-500 border-b-[5px] border-b-rose-900 shadow-md mt-2 relative select-none animate-pulse">
                <AlertCircle className="w-8 h-8 text-white stroke-[2.5]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight leading-none mb-1 font-sans">
                Reset all progress?
              </h2>

              <p className="text-[10px] sm:text-[10.5px] font-black text-rose-600 uppercase tracking-widest font-mono mb-4">
                IRREVERSIBLE ACTION WARNING
              </p>
              
              <p className="text-xs sm:text-[13px] text-slate-500 font-semibold leading-relaxed mb-6 max-w-[290px] mx-auto">
                Are you absolutely sure? This will permanently wipe your accumulated <strong className="text-slate-800 font-extrabold">XP</strong>, reset all milestones to <strong className="text-slate-800 font-extrabold">Unit 0</strong>, and erase your <strong className="text-slate-800 font-extrabold">Targeted Practice Numbers</strong>.
              </p>

              <div id="reset-confirm-actions" className="flex flex-col gap-3">
                <button 
                  onClick={performAppReset}
                  className="w-full bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-rose-500 border-b-[5px] border-b-rose-700 transition-all duration-100 cursor-pointer flex items-center justify-center gap-2 py-3.5 shadow-md select-none hover:from-rose-600 hover:to-rose-700 active:translate-y-[2px] active:border-b-[3px]"
                >
                  🔥 YES, RESET MY PROGRESS
                </button>

                <button 
                  onClick={cancelAppReset}
                  className="w-full bg-slate-50 hover:bg-slate-100/80 text-slate-600 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase border-2 border-slate-200 border-b-[5px] border-b-slate-350 transition-all duration-100 cursor-pointer flex items-center justify-center gap-2 py-3.5 shadow-sm select-none active:translate-y-[2px] active:border-b-[3px]"
                >
                  Cancel, Keep Learning
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mastery Streak Popup Modal */}
      <AnimatePresence>
        {showStreakPopup && (() => {
          const streakVal = appState.masteryStreak ?? 0;
          let mithuMood: "thinking" | "happy" | "sparkly" = "thinking";
          let mithuDialogueRoman = "Ginti seekhein aur\napna flame roshan karein! 🎯";
          let mithuDialogueEng = "Build your Mastery Streak! Correct answers in any game or level keep the fire burning.";

          if (streakVal >= 10) {
            mithuMood = "sparkly";
            mithuDialogueRoman = "Subhanallah! Aap tou bilkul\nGinti ke shehenshah hain! 👑";
            mithuDialogueEng = "Absolutely legendary accuracy! You have achieved ultimate master-level Urdu numbers intuition.";
          } else if (streakVal >= 5) {
            mithuMood = "sparkly";
            mithuDialogueRoman = "Kamal kar diya! Aap ka learning\nflame bohot garam hai! 🔥";
            mithuDialogueEng = "Your learning flame is burning hot! Let's push for an even bigger milestone.";
          } else if (streakVal >= 1) {
            mithuMood = "happy";
            mithuDialogueRoman = "Zabardast! Is momentum ko\nbarqarar rakhna hai! 🚀";
            mithuDialogueEng = "You're building solid momentum! Keep choosing correct answers to watch your flame grow.";
          }

          return (
            <div id="streak-popup-overlay" className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-sm sm:max-w-2xl bg-gradient-to-b from-emerald-50/90 via-emerald-50/20 to-white dark:from-[#14321f] dark:via-[#0c1c11] dark:to-[#08120b] border-[3px] border-emerald-100 dark:border-[#22442c] border-b-[8px] border-b-emerald-200 dark:border-b-[#0b140e] rounded-[2.5rem] p-5 sm:p-6 shadow-2xl overflow-hidden"
              >
                {/* Premium Gradient Top-bar Accent */}
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />
                
                {/* Ambient glowing radial light background */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400/10 to-transparent blur-2xl pointer-events-none" />

                <button
                  onClick={() => {
                    playSoundSynth("click");
                    setShowStreakPopup(false);
                  }}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-stretch sm:gap-6 mt-2">
                  
                  {/* Left Section (Header, Title, Companion Bubble) */}
                  <div className="flex-1 flex flex-col justify-between text-center sm:text-left">
                    <div>
                      {/* Visual Header Title */}
                      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-1">
                        Mastery Streak
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                        Accuracy &amp; Momentum Tracker
                      </p>

                      {/* Companion Dialogue Box */}
                      <div className="flex gap-3 items-center bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-3.5 mb-4 text-left relative w-full">
                        {/* Mascot */}
                        <div className="relative shrink-0 flex items-center justify-center">
                          <div className={`absolute inset-0 ${appState.isDarkMode ? "bg-emerald-400/20" : "bg-amber-400/20"} rounded-full blur-xs animate-pulse`} />
                          <div className="relative z-10 w-12 h-12 flex items-center justify-center scale-95">
                            <MithuMascot mood={mithuMood} size={46} />
                          </div>
                        </div>
                        {/* Bubble Content */}
                        <div className="min-w-0 flex-1">
                          <span className="text-[8px] uppercase font-black text-emerald-700 dark:text-emerald-400 tracking-widest block mb-0.5">
                            Mithu says
                          </span>
                          <p className="font-sans text-xs xs:text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug mb-1 italic whitespace-pre-line">
                            "{mithuDialogueRoman}"
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                            {mithuDialogueEng}
                          </p>
                        </div>
                      </div>

                      {/* Integrated Feature Info Section (Desktop/Tablet Layout Only) */}
                      <div className="mt-4 bg-slate-500/5 dark:bg-emerald-950/10 border border-slate-100/50 dark:border-emerald-900/10 rounded-3xl p-4 hidden sm:block text-left">
                        <div className="flex items-start gap-3">
                          <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                              Global Tracker Mechanics
                            </h4>
                            <p className="text-[11.5px] font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">
                              Consecutive correct answers are calculated globally across all <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Units</span>, <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Stages</span>, and <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Custom Games</span>! Keep learning to lock in high mastery.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section (Tactile Gamified Streak Card & Button) */}
                  <div className="w-full sm:w-[250px] shrink-0 flex flex-col justify-between mt-2 sm:mt-0">
                    
                    {/* Tactile Gamified Streak Card */}
                    <div className="relative w-full bg-gradient-to-b from-orange-50/60 to-amber-50/20 dark:from-orange-950/10 dark:to-amber-950/5 border-2 border-orange-200 dark:border-orange-900/30 border-b-[6px] border-b-orange-300 dark:border-b-orange-950 rounded-[2rem] p-4 mb-4 overflow-hidden shadow-xs">
                      {/* Flame decor details */}
                      <div className="absolute -left-3 -bottom-3 w-12 h-12 text-orange-500/5 dark:text-orange-500/10 pointer-events-none">
                        <Flame className="w-full h-full fill-current" />
                      </div>
                      <div className="absolute -right-3 -top-3 w-12 h-12 text-amber-500/5 dark:text-amber-500/10 pointer-events-none">
                        <Flame className="w-full h-full fill-current" />
                      </div>

                      <div className="flex flex-col items-center text-center">
                        {/* Interactive Flame Container */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 border-2 shadow-xs ${getStreakBadgeStyles()}`}>
                          <Flame className={`w-7 h-7 ${getFlameIconStyles()}`} />
                        </div>

                        <span className="text-[8px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest block mb-0.5">
                          Your Current Streak
                        </span>
                        
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight flex items-center justify-center gap-1 leading-none py-0.5">
                          <span className="text-2xl">🔥</span>
                          <span>{streakVal}</span>
                        </div>

                        <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-900/80 border border-orange-100 dark:border-orange-950 text-[10px] font-black text-orange-700 dark:text-orange-300 shadow-3xs">
                          <span>⚡</span>
                          <span>{streakVal === 0 ? "No Active Streak" : `${streakVal} Correct`}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subtitle Info Description (Mobile Layout only) */}
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed px-2 mb-4 block sm:hidden text-center">
                      Consecutive correct answers are calculated globally across all Units, Stages, and Custom Games! Keep learning to lock in high mastery.
                    </p>

                    {/* Primary 3D Tactile CTA Button */}
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setShowStreakPopup(false);
                      }}
                      className={`w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-full py-2.5 px-5 font-black tracking-wide text-xs sm:text-sm shadow-md cursor-pointer select-none transition-all ${
                        appState.isDarkMode 
                          ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                          : "border-2 border-emerald-700 border-b-[6px] border-b-emerald-800 active:translate-y-[4px] active:border-b-[2px]"
                      }`}
                    >
                      Keep Learning! 🚀
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Mastery Streak Milestone Celebration Toast */}
      <AnimatePresence>
        {streakCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            onClick={() => setStreakCelebration(null)}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[170] w-[calc(100%-2rem)] max-w-sm bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-4 shadow-2xl flex items-center gap-3 cursor-pointer select-none text-left"
          >
            <div className="w-12 h-12 shrink-0">
              <MithuMascot mood="sparkly" size={46} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 block uppercase tracking-widest leading-none mb-1">
                Milestone Celebration! 🎉
              </span>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-snug">
                {streakCelebration.message}
              </h4>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unit Mastered Completion Popup Modal */}
      <AnimatePresence>
        {completedUnitPopup && (() => {
          const unit = UNITS.find((u) => u.id === completedUnitPopup);
          if (!unit) return null;

          const currentIndex = UNITS.findIndex((u) => u.id === completedUnitPopup);
          const nextUnitAvailable = currentIndex !== -1 && currentIndex + 1 < UNITS.length ? UNITS[currentIndex + 1] : null;

          return (
            <div id="unit-complete-popup-overlay" className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="relative w-full max-w-sm sm:max-w-lg bg-gradient-to-b from-amber-50/90 via-amber-50/20 to-white dark:from-[#3a2c0f] dark:via-[#1f1707] dark:to-[#0f0b03] border-[3px] border-amber-200 dark:border-[#523d14] border-b-[8px] border-b-amber-300 dark:border-b-[#1c1505] rounded-[2.5rem] p-4.5 sm:p-5.5 shadow-2xl overflow-hidden text-center text-slate-800 dark:text-slate-200"
              >
                {/* Premium Gradient Top-bar Accent */}
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />
                
                {/* Ambient glowing radial light background */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent blur-2xl pointer-events-none" />

                <button
                  onClick={() => {
                    playSoundSynth("click");
                    setCompletedUnitPopup(null);
                  }}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center gap-3 sm:gap-3.5 mt-1">
                  {/* Huge Animated Trophy Badge */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-400 text-emerald-950 rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 border-amber-200 border-b-4 border-b-amber-700 shadow-md transform rotate-3 select-none animate-bounce">
                    🏆
                  </div>

                  <div>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                      Unit Milestone Cleared
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mt-0.5">
                      {unit.title} Mastered! 🎉
                    </h2>
                  </div>

                  {/* Character feedback box */}
                  <div className="bg-gradient-to-br from-emerald-800/10 to-teal-800/5 border border-emerald-800/15 rounded-2xl p-3 sm:p-3.5 flex gap-3.5 items-center text-left w-full">
                    <MithuMascot mood="sparkly" />
                    <div className="flex-1">
                      <p className="text-[12px] text-slate-700 dark:text-slate-300 font-extrabold leading-tight">
                        "Mashallah! Aap ne kamaal kar diya!"
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-semibold">
                        You successfully conquered all five stages of {unit.numbersRange} training! Your Urdu numbers reflex is absolutely top-tier.
                      </p>
                    </div>
                  </div>

                  {/* Rewards Row */}
                  <div className="grid grid-cols-2 gap-2.5 w-full mt-0.5">
                    <div className="bg-amber-100/40 dark:bg-[#251e0f]/85 border border-amber-200/70 dark:border-[#4d3d1e]/80 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-[inset_0_1.5px_3px_rgba(139,92,26,0.06)] dark:shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.4)]">
                      <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Rewards</span>
                      <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+50 XP ⚡</span>
                    </div>
                    <div className="bg-amber-100/40 dark:bg-[#251e0f]/85 border border-amber-200/70 dark:border-[#4d3d1e]/80 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-[inset_0_1.5px_3px_rgba(139,92,26,0.06)] dark:shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.4)]">
                      <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Status</span>
                      <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 uppercase tracking-wide">🏆 Master Badge</span>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="w-full mt-2">
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setCompletedUnitPopup(null);
                        setActiveScreen("dashboard");
                        if (nextUnitAvailable) {
                          setNextUnitToFocus(nextUnitAvailable.id);
                        } else {
                          // Mastered everything! Scroll to Unit 5
                          setNextUnitToFocus("unit5");
                        }
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-emerald-950 border-2 border-amber-400 border-b-[6px] border-b-amber-700 active:translate-y-[4px] active:border-b-[2px] transition-all rounded-full py-2.5 sm:py-3 px-5 font-black tracking-wide text-xs sm:text-sm shadow-md cursor-pointer select-none uppercase"
                    >
                      {nextUnitAvailable ? `Continue to ${nextUnitAvailable.title} 🚀` : "Finish Learning! Let's Celebrate! 👑"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* Mithu Learning Assistant Explanation Overlay Card */}
      <AnimatePresence>
        {mithuExplanationDigit !== null && (() => {
          const entry = NUMBERS.find(n => n.digit === mithuExplanationDigit);
          if (!entry) return null;
          const explanation = getNumberExplanation(mithuExplanationDigit, entry.romanUrdu);
          const famStyle = FAMILY_STYLES[explanation.familyId] || FAMILY_STYLES.single;

          return (
            <motion.div
              id="mithu-explanation-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-[200] flex items-center justify-center p-3"
            >
              <motion.div
                id="mithu-explanation-card"
                initial={{ scale: 0.93, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.93, y: 15 }}
                className="bg-white rounded-[2.5rem] w-full max-w-sm border-[4px] border-emerald-300 border-b-[10px] border-b-emerald-500 overflow-hidden relative shadow-2xl flex flex-col p-4 gap-3 text-slate-800"
              >
                {/* Premium colored stripe accent */}
                <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300" />

                {/* Card Header */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🦜</span>
                    <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-widest font-mono">
                      Mithu's Code Decoder
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Small unobtrusive English language toggle button */}
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setMithuLanguage(prev => prev === "ur" ? "en" : "ur");
                      }}
                      className="px-2 py-1 text-[9px] font-extrabold rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-800 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 select-none cursor-pointer transition-all active:scale-95 shadow-xs"
                      title={mithuLanguage === "ur" ? "Switch to English explanation" : "Switch to Urdu explanation"}
                    >
                      <span className="text-[10px]">🌐</span>
                      <span>{mithuLanguage === "ur" ? "EN" : "UR"}</span>
                    </button>

                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setMithuExplanationDigit(null);
                      }}
                      className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center border-2 border-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-200 dark:border-emerald-800 cursor-pointer transition active:scale-90 ginti-decoder-close-btn"
                      aria-label="Close decoder"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Word is the Star */}
                <div className="text-center py-1.5 flex flex-col items-center">
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none mb-2">
                    {explanation.word}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 ginti-decoder-top-badge">
                      Digit {entry.digit}
                    </span>
                    {entry.nativeScript && (
                      <span className="text-[14px] font-bold text-emerald-800 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200 font-urdu leading-none dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 ginti-decoder-top-badge">
                        {entry.nativeScript}
                      </span>
                    )}
                  </div>
                </div>

                {/* Visual Word Breakdown Blocks (No more clinical tables!) */}
                <div className="flex items-center justify-center gap-2.5 py-1">
                  {/* Digit Clue Block (Vibrant but soft Sky/Teal Theme) */}
                  <div className="flex-1 px-3 py-2 bg-sky-50 border-2 border-sky-200 border-b-[5px] border-b-sky-300 text-sky-800 rounded-2xl text-center shadow-xs dark:bg-sky-950/40 dark:border-sky-900/60 dark:border-b-sky-850 dark:text-sky-300 ginti-decoder-prefix-block">
                    <span className="text-xl font-black block tracking-tight leading-none text-sky-700 dark:text-sky-300">{explanation.prefix}</span>
                    <span className="text-[9px] font-black text-sky-500 dark:text-sky-400 block leading-none mt-1 uppercase tracking-wide">
                      {mithuLanguage === "en" ? explanation.prefixMeaningEn : explanation.prefixMeaning}
                    </span>
                  </div>
                  
                  <span className="text-slate-400 font-black text-xl">+</span>

                  {/* Family Clue Block (Consistent Family Theme) */}
                  <div className={`flex-1 px-3 py-2 border-2 border-b-[5px] rounded-2xl text-center shadow-xs ginti-decoder-suffix-block ${famStyle.badgeBg} ${famStyle.badgeBorder} ${famStyle.badgeText} ${
                    explanation.familyId === "tees" ? "border-b-violet-300 dark:border-b-violet-500" :
                    explanation.familyId === "chalees" ? "border-b-emerald-300 dark:border-b-emerald-500" :
                    explanation.familyId === "awan" ? "border-b-orange-300 dark:border-b-orange-500" :
                    explanation.familyId === "sath" ? "border-b-teal-300 dark:border-b-teal-500" :
                    explanation.familyId === "hattar" ? "border-b-fuchsia-300 dark:border-b-fuchsia-500" :
                    explanation.familyId === "asi" ? "border-b-rose-300 dark:border-b-rose-500" :
                    explanation.familyId === "nawey" ? "border-b-amber-300 dark:border-b-amber-500" :
                    explanation.familyId === "dahae" ? "border-b-yellow-300 dark:border-b-yellow-500" :
                    explanation.familyId === "ees" ? "border-b-purple-300 dark:border-b-purple-500" :
                    "border-b-slate-300 dark:border-b-slate-500"
                  } ${
                    explanation.familyId === "tees" ? "dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-900/60" :
                    explanation.familyId === "chalees" ? "dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60" :
                    explanation.familyId === "awan" ? "dark:bg-orange-950/40 dark:text-orange-350 dark:border-orange-900/60" :
                    explanation.familyId === "sath" ? "dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/60" :
                    explanation.familyId === "hattar" ? "dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-900/60" :
                    explanation.familyId === "asi" ? "dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60" :
                    explanation.familyId === "nawey" ? "dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60" :
                    explanation.familyId === "dahae" ? "dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-900/60" :
                    explanation.familyId === "ees" ? "dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60" :
                    "dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-900/60"
                  }`} data-family={explanation.familyId}>
                    <span className="text-xl font-black block tracking-tight leading-none">{explanation.suffix}</span>
                    <span className="text-[9px] font-black opacity-85 block leading-none mt-1 uppercase tracking-wide">
                      {famStyle.name}
                    </span>
                  </div>
                </div>

                {/* Short Pattern-Based Dialogue Bubble (Mithu Mascot + Clue explanation merged) */}
                <div className="flex items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/40 border-2 border-emerald-100/70 dark:border-emerald-900/60 rounded-2xl p-3 relative ginti-decoder-bubble">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center relative select-none bg-emerald-100/30 rounded-full">
                    <div className="absolute inset-0 bg-emerald-300/20 rounded-full blur-xs animate-pulse" />
                    <MithuMascot mood="happy" size={46} />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest block leading-none mb-1">
                      {mithuLanguage === "en" ? "Mithu guides you:" : "Mithu ka mashwara:"}
                    </span>
                    <p className="text-[11.5px] font-black text-emerald-950 dark:text-emerald-100 leading-snug">
                      "{mithuLanguage === "en" 
                        ? `${explanation.mithuHeaderEn.replace("👀", "").trim()} 👀 ${explanation.simpleExplanationEn}`
                        : `${explanation.mithuHeader.replace("👀", "").trim()} 👀 ${explanation.simpleExplanation}`}"
                    </p>
                  </div>
                </div>

                {/* Close/Action Button */}
                <button
                  onClick={() => {
                    playSoundSynth("click");
                    setMithuExplanationDigit(null);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-white border-2 border-emerald-500 border-b-[6px] border-b-emerald-700 active:translate-y-[4px] active:border-b-[2px] transition-all rounded-full py-3 font-black text-xs uppercase tracking-wider cursor-pointer shadow-md select-none mt-1 ginti-samajh-gaya-btn"
                >
                  {mithuLanguage === "en" ? "Got It! 👍" : "Samajh Gaya! 👍"}
                </button>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Floating Training Arena Setup Panel Modal */}
      <AnimatePresence>
        {isArenaSetupOpen && (
          <motion.div 
            id="arena-setup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-start sm:items-center justify-center p-3 sm:p-6 overflow-y-auto pt-4 pb-4 xs:pt-6 sm:py-6"
          >
            <motion.div 
              id="arena-setup-card"
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-[2rem] sm:rounded-[2.5rem] border-[3px] sm:border-[4px] border-emerald-800 border-b-[8px] sm:border-b-[12px] border-b-emerald-955 text-white max-w-xl w-full p-4 xs:p-5 sm:p-8 relative flex flex-col shadow-2xl max-h-[calc(100vh-2rem)] sm:max-h-[85vh] my-auto"
            >
              {/* 3D background grid pattern overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />

              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-emerald-850 pb-4 mb-4 shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400 text-emerald-950 font-black rounded-xl flex items-center justify-center text-xl border-2 border-amber-300 border-b-[4px] border-b-amber-700 shadow-md transform hover:rotate-6 transition select-none">
                    ⚔️
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-amber-300 uppercase tracking-tight leading-none">
                      Arena Setup
                    </h2>
                    <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mt-1">
                      "Choose your battlefield boundaries"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playSoundSynth("click");
                    setIsArenaSetupOpen(false);
                  }}
                  className="w-8 h-8 rounded-lg bg-emerald-955 hover:bg-emerald-900 flex items-center justify-center border border-emerald-800 hover:border-emerald-700 transition cursor-pointer select-none"
                >
                  <X className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable Setup Section */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 sm:gap-5 relative z-10">
                
                {/* Sliders Container */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Min Bound Selector */}
                  <div className="bg-emerald-950/60 border-2 border-emerald-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col gap-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-black tracking-widest text-emerald-300">
                        Start Bound (Min)
                      </span>
                      {isEditingMin ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tempMinStr}
                          autoFocus
                          placeholder="Min"
                          onBlur={() => {
                            setIsEditingMin(false);
                            const parsed = parseInt(tempMinStr);
                            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                              const currMax = appState.arenaMax ?? 100;
                              const nextMin = Math.min(parsed, currMax);
                              saveState({
                                ...appState,
                                arenaMin: nextMin
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const parsed = parseInt(tempMinStr);
                              if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                                const currMax = appState.arenaMax ?? 100;
                                const nextMin = Math.min(parsed, currMax);
                                saveState({
                                  ...appState,
                                  arenaMin: nextMin
                                });
                              }
                              setIsEditingMin(false);
                              playSoundSynth("click");
                            } else if (e.key === "Escape") {
                              setIsEditingMin(false);
                            }
                          }}
                          onChange={(e) => setTempMinStr(e.target.value)}
                          className="w-16 text-center font-mono text-xs font-black text-amber-400 bg-emerald-950 border border-amber-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-300 py-0.5"
                        />
                      ) : (
                        <button
                          onClick={() => {
                            playSoundSynth("click");
                            setTempMinStr((appState.arenaMin ?? 30).toString());
                            setIsEditingMin(true);
                          }}
                          title="Click to type custom start bound"
                          className="font-mono text-xs font-black text-amber-300 bg-emerald-900/85 hover:bg-emerald-800/80 hover:scale-105 active:scale-95 px-2.5 py-0.5 rounded-lg border border-emerald-800 cursor-pointer transition-all flex items-center gap-1 select-none"
                        >
                          <span>{appState.arenaMin ?? 30}</span>
                          <span className="text-[10px] opacity-70">✏️</span>
                        </button>
                      )}
                    </div>
                    
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={appState.arenaMin ?? 30}
                      onChange={(e) => {
                        playSoundSynth("click");
                        const val = parseInt(e.target.value);
                        const currMax = appState.arenaMax ?? 100;
                        const nextMin = Math.min(val, currMax);
                        saveState({
                          ...appState,
                          arenaMin: nextMin
                        });
                      }}
                      className="w-full h-2 bg-emerald-900/80 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none border border-emerald-800"
                    />
                    <div className="flex justify-between text-[9px] text-emerald-400/80 font-mono font-bold px-1 select-none">
                      <span>0 (Sifr)</span>
                      <span>50 (Pachaas)</span>
                    </div>
                  </div>

                  {/* Max Bound Selector */}
                  <div className="bg-emerald-955/65 border-2 border-emerald-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col gap-2 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-black tracking-widest text-emerald-300">
                        End Bound (Max)
                      </span>
                      {isEditingMax ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tempMaxStr}
                          autoFocus
                          placeholder="Max"
                          onBlur={() => {
                            setIsEditingMax(false);
                            const parsed = parseInt(tempMaxStr);
                            if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                              const currMin = appState.arenaMin ?? 30;
                              const nextMax = Math.max(parsed, currMin);
                              saveState({
                                ...appState,
                                arenaMax: nextMax
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const parsed = parseInt(tempMaxStr);
                              if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                                const currMin = appState.arenaMin ?? 30;
                                const nextMax = Math.max(parsed, currMin);
                                saveState({
                                  ...appState,
                                  arenaMax: nextMax
                                });
                              }
                              setIsEditingMax(false);
                              playSoundSynth("click");
                            } else if (e.key === "Escape") {
                              setIsEditingMax(false);
                            }
                          }}
                          onChange={(e) => setTempMaxStr(e.target.value)}
                          className="w-16 text-center font-mono text-xs font-black text-amber-400 bg-emerald-950 border border-amber-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-300 py-0.5"
                        />
                      ) : (
                        <button
                          onClick={() => {
                            playSoundSynth("click");
                            setTempMaxStr((appState.arenaMax ?? 100).toString());
                            setIsEditingMax(true);
                          }}
                          title="Click to type custom end bound"
                          className="font-mono text-xs font-black text-amber-300 bg-emerald-900/85 hover:bg-emerald-800/80 hover:scale-105 active:scale-95 px-2.5 py-0.5 rounded-lg border border-emerald-800 cursor-pointer transition-all flex items-center gap-1 select-none"
                        >
                          <span>{appState.arenaMax ?? 100}</span>
                          <span className="text-[10px] opacity-70">✏️</span>
                        </button>
                      )}
                    </div>

                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={appState.arenaMax ?? 100}
                      onChange={(e) => {
                        playSoundSynth("click");
                        const val = parseInt(e.target.value);
                        const currMin = appState.arenaMin ?? 30;
                        const nextMax = Math.max(val, currMin);
                        saveState({
                          ...appState,
                          arenaMax: nextMax
                        });
                      }}
                      className="w-full h-2 bg-emerald-900/80 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none border border-emerald-800"
                    />
                    <div className="flex justify-between text-[9px] text-emerald-400/80 font-mono font-bold px-1 select-none">
                      <span>50 (Pachaas)</span>
                      <span>100 (Sau)</span>
                    </div>
                  </div>
                </div>

                {/* Range Preview Badge */}
                <div className="bg-emerald-955/90 border-2 border-emerald-800/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3.5 shadow-lg select-none">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-500/30 font-black flex items-center justify-center text-xl shrink-0">
                    🎯
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">
                      Dynamic Battlefield Range
                    </div>
                    <div className="text-sm font-black text-white mt-1 font-sans flex items-center gap-2 flex-wrap">
                      <span>Urdu Numbers Pool:</span>
                      <span className="bg-emerald-900/80 text-amber-300 font-mono text-xs px-2.5 py-0.5 rounded-lg border border-emerald-805">
                        {appState.arenaMin ?? 30} → {appState.arenaMax ?? 100}
                      </span>
                      <span className="text-emerald-300 text-xs font-bold">
                        ({Math.max(0, (appState.arenaMax ?? 100) - (appState.arenaMin ?? 30) + 1)} total scales)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preset Fast Selection & Custom Selection History */}
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] uppercase font-black text-emerald-300 tracking-wider flex items-center gap-1.5 select-none font-sans">
                    <span>⚡ Quick presets & previous ranges:</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-left">
                    {[
                      { label: "20 - 70", min: 20, max: 70 },
                      { label: "30 - 100", min: 30, max: 100 },
                      { label: "0 - 100", min: 0, max: 100 }
                    ].map((pr) => {
                      const isCurrentPreset = (appState.arenaMin ?? 30) === pr.min && (appState.arenaMax ?? 100) === pr.max;
                      return (
                        <button
                          key={pr.label}
                          onClick={() => {
                            playSoundSynth("click");
                            saveState({
                              ...appState,
                              arenaMin: pr.min,
                              arenaMax: pr.max
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer select-none active:scale-95 ${
                            isCurrentPreset 
                              ? "bg-amber-400 text-emerald-955 border-amber-300 font-extrabold shadow-sm"
                              : "bg-emerald-955/60 text-emerald-300 border-emerald-850 hover:bg-emerald-900 hover:text-white"
                          }`}
                        >
                          {pr.label}
                        </button>
                      );
                    })}

                    {/* Custom selections history */}
                    {(appState.arenaRangeHistory ?? []).map((past, pIdx) => {
                      const isGeneral = [
                        { min: 20, max: 70 },
                        { min: 30, max: 100 },
                        { min: 0, max: 100 }
                      ].some(g => g.min === past.min && g.max === past.max);

                      if (isGeneral) return null;

                      const isCurrentPast = (appState.arenaMin ?? 30) === past.min && (appState.arenaMax ?? 100) === past.max;
                      return (
                        <button
                          key={`past-${pIdx}`}
                          onClick={() => {
                            playSoundSynth("click");
                            saveState({
                              ...appState,
                              arenaMin: past.min,
                              arenaMax: past.max
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer select-none active:scale-95 flex items-center gap-1 ${
                            isCurrentPast 
                              ? "bg-amber-400 text-emerald-950 border-amber-300 shadow-sm"
                              : "bg-emerald-900/80 border-emerald-800 text-amber-200/90 hover:bg-emerald-850"
                          }`}
                        >
                          <span>🕒</span>
                          <span>{past.min} - {past.max}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Action Launch Bar */}
              <div className="border-t border-emerald-850 pt-3 mt-3 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-center justify-between shrink-0 relative z-10">
                <button
                  onClick={() => {
                    playSoundSynth("click");
                    setIsArenaSetupOpen(false);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl sm:rounded-2xl border-2 border-emerald-850 hover:border-emerald-750 bg-transparent text-emerald-200 hover:text-white text-xs sm:text-sm uppercase font-black tracking-wider transition duration-100 cursor-pointer active:scale-95 select-none text-center"
                >
                  Back to Dashboard
                </button>

                <button
                  onClick={() => {
                    playSoundSynth("click");
                    // Capture current range in history!
                    const startRangeMin = appState.arenaMin ?? 30;
                    const startRangeMax = appState.arenaMax ?? 100;
                    let history = appState.arenaRangeHistory ?? [];
                    history = history.filter(h => !(h.min === startRangeMin && h.max === startRangeMax));
                    history = [{ min: startRangeMin, max: startRangeMax }, ...history].slice(0, 4);
                    
                    saveState({
                      ...appState,
                      arenaMin: startRangeMin,
                      arenaMax: startRangeMax,
                      arenaRangeHistory: history,
                      arenaStarted: true,
                      arenaCompleted: false,
                      arenaStageProgress: 1,
                    });
                    
                    setIsArenaSetupOpen(false);
                    setIsTrainingActive(true);
                    setArenaActiveStage(null);
                    setActiveScreen("training-arena");
                  }}
                  className="w-full sm:w-auto py-2.5 sm:py-3.5 px-5 sm:px-6 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-955 font-black text-xs sm:text-sm rounded-xl sm:rounded-2xl uppercase tracking-wider border-2 border-amber-300 border-b-[4px] sm:border-b-[5px] border-b-amber-700 active:border-b-[2px] active:translate-y-[2px] cursor-pointer shadow-md transition-all duration-100 active:scale-[0.99] flex items-center justify-center gap-1.5 select-none"
                >
                  <span>Start Training</span>
                  <Play className="w-3.5 h-3.5 text-emerald-955 fill-amber-950/20" />
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================================================================
          GLOBAL STICKY HEADER
          ============================================================================= */}
      <header 
        id="global-header" 
        className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b-2 border-slate-200 px-2.5 py-2 sm:px-4 sm:py-3.5 w-full shadow-sm"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between w-full">
          <div 
            onClick={closeArcadeFrame}
            className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-7.5 h-7.5 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-black transition group-hover:scale-105 active:scale-95 border-2 border-emerald-500 border-b-[3px] sm:border-b-4 border-b-emerald-950 text-xs sm:text-base select-none">
              G
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-xs sm:text-base md:text-lg text-slate-800 tracking-tight group-hover:text-emerald-700 transition leading-none">
                Ginti
              </h1>
              <p className="text-[7.5px] sm:text-[8px] text-slate-405 font-black uppercase tracking-wide font-mono hidden xs:block mt-0.5 select-none leading-none">
                Urdu Numbers
              </p>
            </div>
          </div>

          {/* Global Progress Indicators - Inline sleek layout (highly readable, uncluttered) */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-nowrap shrink-0">
            
            {/* XP Button - Tactile Styled matching Urdu script switcher button style */}
            <button
              onClick={() => {
                playSoundSynth("click");
                showToast(`Keep practicing! You have accumulated ${appState.totalXP} XP.`);
              }}
              className="flex items-center justify-center gap-1.5 h-[30px] sm:h-[38px] px-2 sm:px-3 rounded-full border-2 transition-all duration-100 cursor-pointer select-none active:translate-y-[1.5px] bg-white border-slate-200 border-b-[3.5px] sm:border-b-[4.5px] border-b-slate-300 text-slate-700 hover:bg-slate-50/50 shadow-xs"
              title="Total XP - Click to check status"
            >
              <span className="text-xs sm:text-sm select-none leading-none translate-y-[-0.5px]">⭐</span>
              <span className="font-mono font-black text-slate-700 leading-none tracking-tight flex items-center">
                {appState.totalXP}<span className="text-[7.5px] sm:text-[8.5px] text-slate-400 font-bold ml-0.5 uppercase tracking-wide">XP</span>
              </span>
            </button>

            {/* Mastery Streak Badge - Tactile 3D style */}
            <button
              onClick={() => {
                playSoundSynth("click");
                setShowStreakPopup(true);
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 h-[30px] sm:h-[38px] px-2 sm:px-3 rounded-full border-2 transition-all duration-100 cursor-pointer select-none active:translate-y-[1.5px] border-b-[3.5px] sm:border-b-[4.5px] ${getStreakBadgeStyles()}`}
              title="Mastery Streak - Click to view true value"
            >
              <Flame className={`w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 ${
                appState.masteryStreak === 0 
                  ? "text-slate-400 fill-none" 
                  : `text-orange-500 fill-orange-400 ${triggerHeaderFlameAnimate ? "flame-pop-once" : ""}`
              }`} />
              <span className="font-mono font-black text-xs sm:text-sm leading-none translate-y-[-0.5px]">
                {appState.masteryStreak > 99 ? "99+" : appState.masteryStreak || 0}
              </span>
            </button>

            {/* Urdu Script Switcher - Highly Refined & Center-Aligned Tactile 3D button */}
            <div className="flex items-center pl-1.5 sm:pl-3 border-l-2 border-slate-200">
              <button
                id="script-toggle"
                onClick={() => {
                  playSoundSynth("click");
                  const nextState = !appState.showScript;
                  const updated = { ...appState, showScript: nextState };
                  saveState(updated);
                  showToast(nextState ? "Urdu Script shown." : "Urdu Script hidden.");
                }}
                className={`flex items-center justify-center gap-1.5 h-[30px] sm:h-[38px] px-2 sm:px-3 rounded-full border-2 transition-all duration-100 cursor-pointer select-none active:translate-y-[1.5px] ${
                  appState.isDarkMode
                    ? (appState.showScript
                        ? "bg-[#0c2417] border-[#064e3b] border-b-[3.5px] sm:border-b-[4.5px] border-b-[#047857] text-emerald-300 font-black shadow-xs"
                        : "bg-white border-slate-200 border-b-[3.5px] sm:border-b-[4.5px] border-b-slate-300 text-slate-400 hover:bg-slate-50/50 shadow-xs")
                    : (appState.showScript
                        ? "bg-emerald-50 border-emerald-500 border-b-[3.5px] sm:border-b-[4.5px] border-b-emerald-700 text-emerald-950 font-black shadow-xs"
                        : "bg-white border-slate-200 border-b-[3.5px] sm:border-b-[4.5px] border-b-slate-300 text-slate-500 hover:bg-slate-50/50")
                }`}
                title="Toggle Urdu Nastaliq Script"
              >
                <span className={`font-urdu font-black text-[10px] sm:text-[12.5px] leading-none select-none transition-all flex items-center justify-center translate-y-[-1px] ${
                  appState.isDarkMode 
                    ? (appState.showScript ? "text-emerald-300" : "text-slate-400")
                    : (appState.showScript ? "text-emerald-950" : "text-slate-400")
                }`}>
                  اردو
                </span>
                <div
                  className={`relative h-3.5 w-7 sm:h-[18px] sm:w-[2.1rem] rounded-full transition-colors duration-200 shrink-0 border border-t-[1.5px] border-b-[0.5px] shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.18)] ${
                    appState.showScript 
                      ? (appState.isDarkMode ? "bg-emerald-700 border-emerald-900" : "bg-emerald-600 border-emerald-800") 
                      : (appState.isDarkMode ? "bg-slate-800 border-slate-900" : "bg-slate-300 border-slate-400/80")
                  }`}
                >
                  <span
                    className={`absolute top-[1px] left-[1px] sm:top-[1.5px] sm:left-[1.5px] w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-b from-white via-white to-slate-200 shadow-[0_1.5px_3px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.3)] border-b-[1.5px] border-b-slate-400 transform transition-transform duration-200 ease-in-out ${
                      appState.showScript 
                        ? "translate-x-[14px] sm:translate-x-[16px]" 
                        : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Theme Toggle - Highly Polished Tactile 3D button */}
            <div className="flex items-center pl-1.5 sm:pl-3 border-l-2 border-slate-200">
              <button
                id="theme-toggle"
                onClick={() => {
                  playSoundSynth("click");
                  const nextDark = !appState.isDarkMode;
                  localStorage.setItem("ginti_theme_pref", nextDark ? "dark" : "light");
                  const updated = { ...appState, isDarkMode: nextDark };
                  saveState(updated);
                  showToast(nextDark ? "Midnight Jade theme active" : "Classic Emerald theme active");
                }}
                className={`flex items-center justify-center p-2 sm:p-2.5 rounded-full border-2 transition-all duration-100 cursor-pointer select-none active:translate-y-[1.5px] ${
                  appState.isDarkMode 
                    ? "bg-[#111A14] border-[#22382c] border-b-[3.5px] sm:border-b-[4.5px] border-b-[#2b4435] text-amber-400 shadow-xs" 
                    : "bg-white border-slate-200 border-b-[3.5px] sm:border-b-[4.5px] border-b-slate-300 text-yellow-500 hover:bg-slate-50/55"
                }`}
                title={appState.isDarkMode ? "Switch to Classic Emerald" : "Switch to Midnight Jade"}
              >
                {appState.isDarkMode ? (
                  <motion.div
                    whileTap={{ scale: 0.8, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-300" />
                  </motion.div>
                ) : (
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800 fill-emerald-100" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* =============================================================================
          unified #app-container WRAPPING SCREENS
          ============================================================================= */}
      <main id="app-container" className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 pt-1.5 sm:pt-2.5 pb-6 sm:pb-8 flex flex-col justify-start">
        
        <AnimatePresence mode="wait">
          {recoveryState && (() => {
            const currentQ = recoveryState.questions[recoveryState.currentIndex];
            const isFinished = recoveryState.isDone;

            if (isFinished) {
              return (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-3.5 sm:p-4">
                  <motion.div
                    id="screen-recovery-summary"
                    key="recovery-summary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="max-w-md w-full p-4 sm:p-5 flex flex-col items-center justify-center text-center gap-3 bg-white border-2 border-slate-200 rounded-3xl shadow-lg py-5 sm:py-6 text-slate-800 animate-scale-up border-b-4 border-b-slate-300 relative overflow-hidden"
                  >
                    {/* Decorative Emerald Elegant Light Ray Background Accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500" />
                    
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 font-black rounded-2xl flex items-center justify-center text-xl border border-amber-300 border-b-4 border-b-amber-600 shadow-sm relative group select-none animate-bounce" title="Mithu Victory Icon">
                      🏆
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        Correction Complete!
                      </h3>
                      <p className="text-[10px] sm:text-xs text-slate-500 max-w-xs font-semibold leading-relaxed mt-1">
                        You resolved all mistake cards! Every mistake is a step forward.
                      </p>
                    </div>

                    <div className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[1.5rem] p-4 flex flex-col gap-3 text-left shadow-inner">
                      <div>
                        <span className="text-[9px] font-black uppercase text-emerald-800 block mb-1.5 tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ✅ Now Mastered ({recoveryState.mastered.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {recoveryState.mastered.length > 0 ? (
                            recoveryState.mastered.map((m) => (
                              <span key={m} className="bg-emerald-50 text-emerald-850 text-[10px] px-2.5 py-1 font-bold rounded-lg border border-emerald-150 shadow-xs flex items-center gap-1">
                                Digit {formatValueForDisplay(m)}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">None mastered</span>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-3">
                        <span className="text-[9px] font-black uppercase text-rose-500 block mb-1.5 tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-450" />
                          ⚠️ Retained for Review ({recoveryState.failedPermanently.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {recoveryState.failedPermanently.length > 0 ? (
                            recoveryState.failedPermanently.map((v) => (
                              <span key={v} className="bg-rose-50 text-rose-750 text-[10px] px-2.5 py-1 font-bold rounded-lg border border-rose-205 shadow-xs flex items-center gap-1">
                                Digit {formatValueForDisplay(v)}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">None remaining</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {recoveryState.failedPermanently.length > 0 && (
                      <div className="text-[10px] sm:text-[11px] text-indigo-800 font-extrabold flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-150 rounded-xl py-2 px-3 self-center leading-snug">
                        <span className="text-xs">💡</span> 
                        <span>Try the Practice or Training Arena to master tricky values!</span>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        const mode = recoveryState.originalMode;
                        const uId = recoveryState.unitId;

                        if (mode === "journey_stage2" && uId) {
                          saveUnitStageProgress(uId, 2);
                          setStageQuizIdx(5); // Show stage end screen
                        } else if (mode === "journey_stage3" && uId) {
                          saveUnitStageProgress(uId, 3);
                          setStageListIdx(5); // Show stage end screen
                        } else if (mode === "journey_stage5" && uId) {
                          const isNewCompletion = !appState.completedUnits.includes(uId);
                          const unitsArray = isNewCompletion
                            ? [...appState.completedUnits, uId]
                            : appState.completedUnits;

                          const nextJourneyProgress = {
                            ...(appState.unitStagesProgress ?? {}),
                            [uId]: 5,
                          };

                          const updated = {
                            ...appState,
                            completedUnits: unitsArray,
                            totalXP: appState.totalXP + 50,
                            unitStagesProgress: nextJourneyProgress,
                          };

                          saveState(updated);
                          playSoundSynth("levelUp");
                          const celebratoryMsg = getMithuUnitCompletionMessage(recentMithuMessagesRef.current);
                          trackMithuMessage(celebratoryMsg);
                          showToast(`${celebratoryMsg} Stage 5 Cleared! You have Mastered the whole Unit! 🏆✨`);
                          setCompletedUnitPopup(uId);
                          setActiveScreen("dashboard");
                        } else if (mode === "arena_stage2") {
                          saveArenaStageProgress(2);
                          setArenaQuizIdx(5); // Show stage end screen
                        } else if (mode === "arena_stage3") {
                          saveArenaStageProgress(3);
                          setArenaListIdx(5); // Show stage end screen
                        } else if (mode === "arena_stage5") {
                          saveArenaStageProgress(5);
                          setArenaQuizIdx(10); // Show stage end screen
                        }

                        setRecoveryState(null);
                      }}
                      className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-3 px-5 font-black uppercase text-xs tracking-wider cursor-pointer shadow-md transition-all duration-150 ${
                        appState.isDarkMode 
                          ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2 active:scale-[0.99]" 
                          : "border-2 border-emerald-500 border-b-[5px] border-b-emerald-800 active:border-b-[2px] active:translate-y-0.5 active:scale-[0.99]"
                      }`}
                    >
                      Save Progress & Complete 🎉
                    </button>
                  </motion.div>
                </div>
              );
            }

            if (!currentQ) return null;

            return (
              <motion.div
                id="screen-recovery"
                key="recovery-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="max-w-md mx-auto w-full p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3.5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <button 
                    onClick={() => {
                      playSoundSynth("click");
                      setRecoveryState(null);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Home className="w-3.5 h-3.5 text-slate-500" />
                    <span>Exit Drill</span>
                  </button>
                  
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      Card {recoveryState.currentIndex + 1} of {recoveryState.questions.length}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase text-rose-500 bg-rose-50 border border-rose-100 px-2 rounded-full py-0.5 tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      🛡️ Correction
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((recoveryState.currentIndex + 1) / recoveryState.questions.length) * 100}%` }}
                  />
                </div>

                {/* Prompt Card */}
                <div id="prompt-card" className="modern-card p-4 sm:p-5 flex flex-col items-center justify-center text-center relative overflow-hidden bg-white min-h-[145px] sm:min-h-[165px] gap-2.5">
                  <div className="text-[9px] font-mono uppercase font-black text-slate-400 tracking-wider">
                    Mistake Rectification
                  </div>
                  <div 
                    className={`font-black tracking-tight flex items-center justify-center transition-all duration-150 ${
                      appState.isDarkMode ? 'text-white' : 'text-slate-900'
                    } ${
                      appState.showScript &&
                      typeof getDisplayPromptValue(currentQ) === 'string' && 
                      (getDisplayPromptValue(currentQ) as string).match(/[\u0600-\u06FF]/)
                        ? `text-5xl sm:text-[3.75rem] font-urdu leading-none pt-3 pb-5 -translate-y-2 sm:-translate-y-2.5 ${appState.isDarkMode ? 'text-white' : 'text-emerald-800'}`
                        : 'text-4xl sm:text-[3.25rem] leading-none py-2'
                    }`}
                  >
                    {formatValueForDisplay(getDisplayPromptValue(currentQ))}
                  </div>

                  {/* Redesigned interactive tactile speaker button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => playWordAudio(currentQ.entry)}
                      disabled={speechActive}
                      className={`w-[2.35rem] h-[2.35rem] rounded-full border-2 border-emerald-100 bg-emerald-50/40 flex items-center justify-center shadow-xs transition hover:scale-105 active:scale-95 disabled:opacity-50 text-emerald-800 cursor-pointer border-b-[3.5px] border-b-emerald-200 active:translate-y-[1.5px] active:border-b-[1.5px] ${
                        speechActive ? 'pulse-primary-emerald' : ''
                      }`}
                      title="Hear pronunciation audio"
                    >
                      <PremiumSpeakerIcon className="w-4 h-4 text-emerald-700" />
                    </button>
                    <p className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-wider">
                      Tap speaker to hear pronunciation
                    </p>
                  </div>
                </div>

                {/* Choice buttons */}
                <div id="choice-grid" className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {currentQ.choices.map((choice: any, index: number) => {
                    const isSelected = recoveryState.userAnswer === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    
                    let cardStyle = "ginti-choice-btn";
                    if (recoveryState.isAnswered) {
                      if (isCorrectVal) {
                        cardStyle = "ginti-choice-btn-correct";
                      } else if (isSelected) {
                        cardStyle = "ginti-choice-btn-incorrect";
                      } else {
                        cardStyle = "ginti-choice-btn-dimmed";
                      }
                    }

                    return (
                      <button
                        key={index}
                        disabled={recoveryState.isAnswered}
                        onClick={() => handleRecoveryAnswer(choice)}
                        className={`choice-btn py-2.5 px-3 text-center text-base sm:text-lg md:text-xl font-black transition-all cursor-pointer flex flex-col items-center justify-center min-h-[50px] sm:min-h-[58px] w-full ${cardStyle}`}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-lg sm:text-xl font-urdu leading-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback footer */}
                {recoveryState.isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 sm:p-3 px-4 sm:px-5 rounded-[1.75rem] border-2 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                      recoveryState.userAnswer === currentQ.correctAnswer
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 border-b-[5px] border-b-emerald-500/90 shadow-sm"
                        : "bg-rose-50 border-rose-300 text-rose-955 border-b-[5px] border-b-rose-450 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-left w-full sm:w-auto">
                      <div className="scale-[0.58] -my-5 -mx-2.5 select-none shrink-0" id="recovery-avatar">
                        <MithuMascot mood={recoveryState.userAnswer === currentQ.correctAnswer ? "sparkly" : "sad"} />
                      </div>
                      
                      {recoveryState.userAnswer === currentQ.correctAnswer ? (
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-black flex items-center gap-1 text-emerald-900 leading-tight">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{recoveryState.mithuFeedback?.title ?? "Correct Answer! Shabash!"}</span>
                          </div>
                          <span className={`text-[9.5px] block leading-tight mt-1 font-bold ${
                            appState.isDarkMode ? "text-emerald-300" : "text-emerald-950"
                          }`}>
                            {recoveryState.mithuFeedback?.subtitle ?? "You corrected this mistake card successfully."}
                          </span>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-black flex items-center gap-1 text-rose-900 leading-tight">
                            <XCircle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-300 shrink-0" />
                            <span>{recoveryState.mithuFeedback?.title ?? "Incorrect! Let's reinforce."}</span>
                          </div>
                          <span className={`text-[9.5px] block leading-tight mt-1 font-bold ${
                            appState.isDarkMode ? "text-rose-300" : "text-rose-950"
                          }`}>
                            {recoveryState.mithuFeedback?.subtitle ?? "Correct answer:"}{" "}
                            <span className={`font-extrabold rounded px-1 border ${
                              appState.isDarkMode
                                ? "bg-rose-950 text-rose-200 border-rose-900/60"
                                : "bg-rose-100/70 text-rose-950 border-rose-200"
                            }`}>
                              {formatValueForDisplay(currentQ.correctAnswer)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => advanceRecoveryRound()}
                      className="btn-primary w-full sm:w-auto px-4.5 py-2 rounded-xl text-[10.5px] font-black transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })()}

          {!recoveryState && activeScreen === "dashboard" && (() => {
            const hasProgress = appState.completedUnits.length > 0 || 
              Object.values(appState.unitStagesProgress || {}).some(progress => (progress as number) > 1) ||
              appState.totalXP > 0;

            const nextUnit = UNITS.find(u => !appState.completedUnits.includes(u.id)) || UNITS[0];
            const recommendedProgress = getUnitProgress(nextUnit.id);
            const isNextUnitCompleted = appState.completedUnits.includes(nextUnit.id);
            const nextUnitPercent = isNextUnitCompleted ? 100 : Math.round(((recommendedProgress - 1) / 5) * 100);

            // Construct smart, contextual recommendations based on user progress and specified priorities
            let recTitle = "Mithu Recommends";
            let recSubtitle = nextUnit.title;
            let recText = "";
            let recProgressPercent = nextUnitPercent;
            let recButtonText = "Start Learning";
            let recAction = () => startUnitJourney(nextUnit.id);

            if (!isNextUnitCompleted) {
              if (recommendedProgress > 1) {
                // Priority 1 & 2: Continue unfinished stage / unit
                recTitle = `🦜 Continue Stage ${recommendedProgress}`;
                recSubtitle = nextUnit.title;
                recProgressPercent = nextUnitPercent;
                recText = `You are already ${nextUnitPercent}% through! Let's keep your streak active and clear Stage ${recommendedProgress} in ${nextUnit.title} right now.`;
                recButtonText = `Resume Stage ${recommendedProgress}`;
              } else {
                // Priority 3 & 4: Start the next unlocked unit / Unit ready
                const hasCompletedAny = appState.completedUnits.length > 0;
                recTitle = hasCompletedAny ? `🦜 ${nextUnit.title} is ready!` : "Mithu Recommends";
                recSubtitle = nextUnit.title;
                recProgressPercent = 0;
                recText = `Ready to master Urdu counting in the range of ${nextUnit.numbersRange}? Let's jump in!`;
                recButtonText = "Start Learning";
              }
            } else {
              // Priority 5: If all currently available units are completed:
              // - Recommend Blitz Mode.
              // - Recommend Training Arena.
              // - Recommend improving previous performance.
              const blitzScore = appState.highScore || 0;
              const hasPlayedBlitz = blitzScore > 0;

              if (!hasPlayedBlitz) {
                recTitle = "🦜 Try Blitz Mode for a speed challenge! ⚡";
                recSubtitle = "Arcade Blitz Challenge";
                recProgressPercent = 100;
                recText = "All units completed! Test your speed and reflexes in our high-energy Ginti Blitz challenge.";
                recButtonText = "Play Ginti Blitz";
                recAction = () => {
                  const blitzBtn = document.querySelector(".ginti-blitz-play-btn") as HTMLElement;
                  if (blitzBtn) {
                    blitzBtn.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => blitzBtn.click(), 500);
                  }
                };
              } else if (blitzScore < 30) {
                recTitle = "🦜 Can you beat your best Blitz score? ⚡";
                recSubtitle = "Break Your Record";
                recProgressPercent = 100;
                recText = `Your current best Blitz score is ${blitzScore} hits! Challenge yourself to beat your record and sharpen your rapid reflexes.`;
                recButtonText = "Play Blitz Again";
                recAction = () => {
                  const blitzBtn = document.querySelector(".ginti-blitz-play-btn") as HTMLElement;
                  if (blitzBtn) {
                    blitzBtn.scrollIntoView({ behavior: "smooth", block: "center" });
                    setTimeout(() => blitzBtn.click(), 500);
                  }
                };
              } else {
                recTitle = "🦜 Challenge yourself in Training Arena! 🎯";
                recSubtitle = "Practice & Pronunciation";
                recProgressPercent = 100;
                recText = "Sharpen your skills, pronunciation, and spelling in the targeted Training Arena stages.";
                recButtonText = "Enter Arena";
                recAction = () => {
                  setActiveScreen("training-arena");
                  window.scrollTo({ top: 0 });
                };
              }
            }

            return (
              <motion.div
                id="screen-dashboard"
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="max-w-xl md:max-w-2xl mx-auto w-full flex flex-col gap-4.5 sm:gap-6"
              >
              
              {/* Mascot Welcome & Direct Recommended Next Step (Duolingo/Mimo-styled high-impact pathway start) */}
              {hasProgress && (
                <div className="bg-gradient-to-br from-emerald-800 via-emerald-850 to-emerald-900 text-white p-3.5 sm:p-5 rounded-[1.75rem] sm:rounded-[2rem] border-2 border-emerald-600/95 border-b-[5px] sm:border-b-[6px] border-b-emerald-950/90 shadow-[0_4px_0_#042414] sm:shadow-[0_6px_0_#042414] relative overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-5">
                  {/* Backglow decoration for modernist depth */}
                  <div className="absolute -right-12 -bottom-12 w-44 h-44 bg-emerald-700/35 rounded-full blur-2xl pointer-events-none" />
                  <div className={`absolute -left-12 -top-12 w-32 h-32 ${appState.isDarkMode ? "bg-emerald-500/20" : "bg-amber-400/10"} rounded-full blur-xl pointer-events-none`} />
                  
                  {/* Visual Top Row for Mobile (Mascot & Text side-by-side to save excessive vertical height) */}
                  <div className="flex items-center gap-3.5 sm:gap-4.5 flex-1 min-w-0">
                    {/* Integrated Mascot Pedestal Group */}
                    <div className={`relative shrink-0 flex items-center justify-center p-0.5 sm:p-1 rounded-full border border-white/5 shadow-inner ${
                      appState.isDarkMode 
                        ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/5" 
                        : "bg-gradient-to-br from-amber-400/15 to-amber-500/5"
                    }`}>
                      <div className={`absolute inset-0 rounded-full blur-sm ${
                        appState.isDarkMode 
                          ? "bg-emerald-500/15" 
                          : "bg-amber-400/10"
                      }`} />
                      <div id="ginti-mascot-container" className={`relative z-10 scale-75 sm:scale-100 filter drop-shadow-md origin-center -m-1.5 sm:m-0 ${mascotAnimation}`}>
                        <MithuMascot mood={appState.weakAreas.length > 2 ? "thinking" : "happy"} />
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-white dark:border-[#0b3a22] text-[8px] sm:text-[9.5px] ${
                        activeLevel >= 10 
                          ? "px-1.5 sm:px-2 min-w-5 h-5 sm:min-w-6.5 sm:h-6.5" 
                          : "w-5 h-5 sm:w-6.5 sm:h-6.5"
                      } flex items-center justify-center rounded-full font-black text-slate-905 dark:text-[#0b2414] shadow-md select-none tracking-tight`}>
                        Lv{activeLevel}
                      </span>
                    </div>
                    
                    {/* Clean, Scannable Content Block */}
                    <div className="flex-1 min-w-0 flex flex-col gap-0.5 sm:gap-1">
                      <div>
                        <span className="text-[8px] sm:text-[9.5px] text-amber-300 font-black uppercase tracking-wider mb-0.5 block">
                          {recTitle}
                        </span>
                        <h3 className="text-xs sm:text-base font-black text-white leading-tight truncate">
                          {recSubtitle}
                        </h3>
                      </div>
                      
                      <p className="text-[9.5px] sm:text-[11px] text-emerald-100/90 font-medium leading-normal max-w-sm sm:max-w-none line-clamp-2 sm:line-clamp-none">
                        {recText}
                      </p>
                      
                      {/* Visual mini progress inline */}
                      <div className="flex items-center gap-2 w-full max-w-[200px] sm:max-w-[250px] mt-0.5">
                        <div className="flex-1 bg-emerald-950/40 h-1.5 sm:h-2.5 rounded-full overflow-hidden border border-emerald-700 p-[1px] sm:p-[1.5px] shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500" 
                            style={{ width: `${recProgressPercent}%` }} 
                          />
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-extrabold text-amber-300 tracking-wide font-mono">
                          {recProgressPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Balanced CTA Button - Compact height on mobile, full size on desktop */}
                  <button
                    onClick={recAction}
                    className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-amber-400 hover:bg-amber-300 active:translate-y-[1px] sm:active:translate-y-[2px] active:border-b-2 text-emerald-950 rounded-xl font-black text-xs sm:text-sm tracking-tight border-2 border-amber-300 border-b-[3px] sm:border-b-[4px] border-b-amber-600 transition-all duration-100 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 z-10 shadow-md"
                  >
                    <span>
                      {recButtonText}
                    </span>
                    <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-950 fill-emerald-950 stroke-none" />
                  </button>
                </div>
              )}

              {/* Grid layout separating search learning tool and premium arcade game action */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 relative z-30">
                
                {/* 1. Instant Lookup Card (Search Learning Tool) */}
                <section 
                  id="panic-search-hub" 
                  className="bg-white col-span-12 sm:col-span-8 rounded-[1.75rem] border-2 border-slate-200/90 border-b-[6px] border-b-slate-350 relative p-4 sm:p-5 flex flex-col gap-3 transition-all duration-200 shadow-sm animate-fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="p-1 rounded-lg bg-emerald-50 text-emerald-800 shrink-0">
                        <Search className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-800 leading-none">
                          Instant Lookup
                        </h3>
                        <p className="text-[9px] text-slate-450 font-bold leading-none mt-1">
                          Type any number or phonetic Urdu
                        </p>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                      1-5000
                    </span>
                  </div>

                  {/* Input and Overlay container */}
                  <div className="relative w-full z-45">
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          id="ginti-search"
                          placeholder="Search number, word, or Urdu (e.g., 35, paintees...)"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedSearchEntry(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const matches = handleQuerySearch();
                              if (matches.length > 0) {
                                saveSearchToHistory(searchQuery);
                              }
                            }
                          }}
                          onBlur={() => {
                            const matches = handleQuerySearch();
                            if (matches.length > 0) {
                              saveSearchToHistory(searchQuery);
                            }
                          }}
                          className="w-full bg-slate-50 focus:bg-white text-xs text-slate-900 px-3.5 py-2.5 pl-9 rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:outline-none transition-all duration-150 font-semibold shadow-inner"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        
                        {searchQuery && (
                          <button 
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedSearchEntry(null);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 bg-slate-200/60 hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer flex items-center justify-center w-5 h-5"
                          >
                            <X className="w-2.5 h-2.5 text-slate-500" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Recent Search History Pills */}
                    {recentSearches.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px] w-full">
                        <span className="text-slate-400 font-bold flex items-center gap-1 shrink-0 mr-1 select-none">
                          <Clock className="w-3 h-3 text-slate-400" /> Recent
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 flex-1 min-w-0">
                          {recentSearches.map((query) => (
                            <div
                              key={query}
                              className="inline-flex items-center bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-full text-slate-600 hover:text-emerald-800 text-[9px] font-black transition select-none overflow-hidden"
                            >
                              <button
                                onClick={() => {
                                  playSoundSynth("click");
                                  setSearchQuery(query);
                                  setSelectedSearchEntry(null);
                                  saveSearchToHistory(query);
                                }}
                                className="pl-2.5 pr-2 py-1 font-black transition cursor-pointer select-none outline-none text-left"
                              >
                                {query}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playSoundSynth("click");
                                  removeSearchFromHistory(query);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:scale-115 active:scale-95 transition cursor-pointer select-none outline-none font-black text-[11px] border-l border-slate-200/40 leading-none"
                                title="Remove search"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        {recentSearches.length >= 3 && (
                          <button
                            onClick={clearAllSearchHistory}
                            className="text-slate-400 hover:text-rose-500 text-[8px] font-extrabold uppercase tracking-wider ml-auto select-none cursor-pointer hover:underline transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    )}

                    {/* Common Confusions Shortcuts */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="text-slate-400 font-bold flex items-center gap-0.5 shrink-0 mr-1">
                        💡 Confused?
                      </span>
                      {[
                        { label: "88", term: "atasi" },
                        { label: "87", term: "satasi" },
                        { label: "77", term: "sathattar" },
                        { label: "99", term: "ninanwe" },
                        { label: "69", term: "unhattar" },
                        { label: "150", term: "derh sau" }
                      ].map((btn) => (
                        <button
                          key={btn.label}
                          onClick={() => {
                            playSoundSynth("click");
                            setSearchQuery(btn.term);
                            setSelectedSearchEntry(null);
                          }}
                          className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 active:bg-emerald-100 border border-slate-200 rounded-full text-slate-600 hover:text-emerald-800 text-[9px] font-black transition cursor-pointer select-none"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    {/* Search Outcomes Absolute Floating Overlay */}
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.div 
                          key="search-outcomes-overlay"
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.99 }}
                          transition={{ type: "spring", duration: 0.25 }}
                          className="absolute left-0 right-0 top-full mt-2.5 p-3.5 sm:p-4.5 bg-slate-100 border-2 border-slate-200 border-b-[8px] border-b-slate-350 shadow-[0_16px_40px_rgba(15,23,42,0.16)] rounded-[2.25rem] z-50 flex flex-col gap-3.5 max-h-[385px] overflow-y-auto overflow-x-hidden"
                        >
                          
                          {/* Top standby / banner style for the absolute top match */}
                          {matchingSearchResults.length > 0 && (
                            <div className="bg-gradient-to-r from-emerald-900 to-emerald-950 text-white rounded-[1.5rem] p-3 flex items-center justify-between gap-2 border-2 border-emerald-700 border-b-[5px] border-b-emerald-950 shadow-md">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-xs font-mono bg-amber-400 font-extrabold text-emerald-950 border border-amber-300 border-b-[3px] border-b-amber-600 px-2.5 py-0.5 rounded-[0.75rem] shadow-xs shrink-0 select-none">
                                  {matchingSearchResults[0].digit}
                                </span>
                                <div className="truncate">
                                  <span className="text-xs font-black truncate text-amber-300 block">
                                    {matchingSearchResults[0].romanUrdu}
                                  </span>
                                  {appState.showScript && (
                                    <span className="text-[10px] font-urdu leading-none text-emerald-250/90 font-medium">
                                      {matchingSearchResults[0].nativeScript}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => playWordAudio(matchingSearchResults[0])}
                                className="p-2 bg-emerald-800 hover:bg-emerald-700 active:translate-y-[1px] active:border-b-2 border-2 border-emerald-600 border-b-4 border-b-emerald-955 rounded-[0.75rem] text-white transition cursor-pointer shrink-0 shadow-xs"
                              >
                                <PremiumSpeakerIcon className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300/10" style={{ fill: "currentColor" }} />
                              </button>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* Matching results feed list */}
                            <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-1">
                              <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">
                                Matches ({matchingSearchResults.length})
                              </div>

                              {matchingSearchResults.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 flex flex-col items-center justify-center gap-1 bg-white rounded-[1.5rem] border-2 border-dashed border-slate-200">
                                  <SearchX className="w-6 h-6 text-slate-300" />
                                  <span className="text-[11px] font-bold">No matching numbers found.</span>
                                  <span className="text-[9px] text-slate-400">
                                    Try alternate spelling configurations.
                                  </span>
                                </div>
                              ) : (
                                matchingSearchResults.map((ent) => {
                                  const isSelected = selectedSearchEntry?.digit === ent.digit;
                                  return (
                                    <div
                                      key={ent.digit}
                                      onClick={() => {
                                        playSoundSynth("click");
                                        setSelectedSearchEntry(ent);
                                        saveSearchToHistory(searchQuery);
                                      }}
                                      className={`p-2.5 text-left rounded-[1.25rem] border-2 transition duration-75 cursor-pointer flex items-center justify-between active:translate-y-[1.5px] active:border-b-[2px] ${
                                        isSelected
                                          ? "bg-emerald-50 border-emerald-500 border-b-[5px] border-b-emerald-700 font-bold shadow-xs text-emerald-950"
                                          : "bg-white border-slate-200 border-b-[4px] border-b-slate-300 hover:bg-slate-50/50 hover:border-slate-300 hover:border-b-[4.5px]"
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className={`font-extrabold text-[10px] w-7 h-7 border rounded-[0.75rem] flex items-center justify-center shrink-0 shadow-xs ${
                                          isSelected ? "bg-emerald-200 border-emerald-300 text-emerald-950 dark:!text-[#0b2414]" : "bg-slate-50 border-slate-200"
                                        }`}>
                                          {ent.digit}
                                        </span>
                                        <div className="truncate">
                                          <div className={`text-xs font-black leading-tight ${isSelected ? "text-emerald-950" : "text-slate-800"}`}>
                                            {ent.romanUrdu}
                                          </div>
                                          <div className="text-[8.5px] text-slate-400 font-semibold font-mono leading-none mt-0.5 truncate">
                                            {ent.searchKeys.filter(a => a !== ent.digit.toString()).slice(0, 2).join(", ")}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {appState.showScript && (
                                          <span className={`text-[10px] font-urdu leading-none pt-0.5 pr-2 border-r ${
                                            isSelected ? "border-emerald-200 font-bold" : "border-slate-150"
                                          }`}>
                                            {ent.nativeScript}
                                          </span>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            playWordAudio(ent);
                                          }}
                                          className={`p-1.5 border-2 rounded-[0.75rem] text-slate-700 cursor-pointer transition-all duration-75 ${
                                            isSelected 
                                              ? "bg-emerald-600 hover:bg-emerald-550 border-emerald-700 border-b-[4px] hover:border-b-[5px] active:translate-y-[2px] active:border-b-2 text-white" 
                                              : "bg-slate-100 hover:bg-slate-150 border-slate-300 border-b-[4px] hover:border-b-[5px] active:translate-y-[2px] active:border-b-2"
                                          }`}
                                        >
                                          <PremiumSpeakerIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-emerald-850"}`} />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            {/* Detail viewer panel for selected item */}
                            <div className="bg-white rounded-[1.5rem] border-2 border-slate-200 border-b-[6px] border-b-slate-350 p-3.5 flex flex-col items-center justify-center relative select-none">
                              <AnimatePresence mode="wait">
                                {selectedSearchEntry ? (
                                  <motion.div 
                                    key={selectedSearchEntry.digit}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    className="w-full text-center flex flex-col items-center gap-2 animate-scale-up"
                                  >
                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full select-none border border-emerald-100">
                                      Card Detail
                                    </span>

                                    <div className="text-3.5xl font-black text-slate-800 leading-none">
                                      {selectedSearchEntry.digit}
                                    </div>

                                    <div className="text-sm font-black text-slate-800 flex items-center gap-1.5 justify-center leading-none">
                                      <span>{selectedSearchEntry.romanUrdu}</span>
                                      <button
                                        onClick={() => playWordAudio(selectedSearchEntry)}
                                        className="p-1.5 bg-amber-400 hover:bg-amber-300 active:translate-y-[2px] active:border-b-2 border-2 border-amber-300 border-b-4 border-b-amber-600 rounded-[0.75rem] text-amber-955 hover:scale-105 shadow-xs shrink-0 cursor-pointer transition-all duration-75"
                                      >
                                        <PremiumSpeakerIcon className="w-3.5 h-3.5 fill-amber-100/10 text-amber-955" style={{ fill: "currentColor" }} />
                                      </button>
                                    </div>

                                    {appState.showScript && (
                                      <div className={`text-xl font-urdu font-black leading-normal pt-0.5 ${
                                        appState.isDarkMode ? "text-white" : "text-emerald-850"
                                      }`}>
                                        {selectedSearchEntry.nativeScript}
                                      </div>
                                    )}

                                    <div className="text-[9.5px] text-slate-450 leading-tight font-medium max-w-[170px] mx-auto">
                                      {selectedSearchEntry.context || "Standard counting vocabulary element."}
                                    </div>
                                  </motion.div>
                                ) : (
                                  <div className="text-slate-400 text-[10px] flex flex-col items-center gap-2 py-3 text-center">
                                    <HelpCircle className="w-7 h-7 text-emerald-800/60 animate-pulse" />
                                    <span className="font-bold text-slate-500">Pick any card</span>
                                    <span className="text-[9px] text-slate-400 max-w-[155px]">
                                      Select an item from the list to reveal audio, script, and contextual learning details.
                                    </span>
                                  </div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>

                {/* 2. Blitz Premium Game Card */}
                <div 
                  className="col-span-12 sm:col-span-4 bg-gradient-to-br from-amber-50 to-amber-100/40 rounded-[1.75rem] border-2 border-amber-200 border-b-[6px] border-b-amber-400 p-4 sm:p-5 flex flex-col justify-between gap-3.5 relative shadow-sm transition-all duration-200 hover:shadow-md animate-fade-in text-justify"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-lg bg-amber-400 text-amber-950 animate-pulse shrink-0 ginti-blitz-zap-container">
                          <Zap className="w-4 h-4 fill-amber-900 stroke-none" />
                        </span>
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-amber-955 text-justify">Ginti Blitz</h3>
                          <p className="text-[9px] text-amber-805 font-bold leading-none mt-0.5 text-justify">
                            Speed Play
                          </p>
                        </div>
                      </div>
                      <span className={`text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        appState.isDarkMode 
                          ? "text-amber-200 bg-amber-950/60 border border-amber-700/60" 
                          : "text-amber-905 bg-amber-200/50 border border-amber-300/40"
                      }`}>
                        Arcade
                      </span>
                    </div>
                    
                    <p className={`text-[10.5px] leading-normal font-bold mt-1 text-justify ${
                      appState.isDarkMode 
                        ? "text-amber-100" 
                        : "text-amber-900/90"
                    }`}>
                      Match fast under timer pressure! Keep your streak and set a high score.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-amber-805 px-1">
                      <span>Personal Best:</span>
                      <span className={`font-black ${
                        appState.isDarkMode 
                          ? "text-amber-300" 
                          : "text-amber-950"
                      }`}>{appState.highScore} pts</span>
                    </div>
                    <button 
                      onClick={startArcadeMode}
                      className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 active:translate-y-[2px] active:border-b-2 text-amber-950 text-xs font-black border-2 border-amber-300 border-b-[4px] border-b-amber-600 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-100 shadow-xs ginti-blitz-play-btn"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-900 fill-amber-900/20" />
                      <span>Start Ginti Blitz</span>
                    </button>
                  </div>
                </div>

              </div>

              <section 
                id="training-arena-panel" 
                className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-[2rem] border-[4px] border-emerald-800 border-b-[12px] border-b-emerald-955 relative pt-[18px] pb-[18px] px-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-[18px] sm:gap-5 text-white shadow-xl overflow-hidden"
              >
                {/* 3D background grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />
                
                <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 relative z-10 text-center sm:text-left">
                  <div className="w-14 h-14 bg-amber-400 text-emerald-950 font-black rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 border-amber-300 border-b-[5px] border-b-amber-700 shadow-md transform hover:rotate-6 transition select-none">
                    ⭐
                  </div>
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl font-black text-amber-300 tracking-tight leading-none uppercase">
                        Training Arena
                      </h3>
                      <span className="text-[9px] uppercase font-black text-amber-400 bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-700 font-mono shadow-inner select-none whitespace-nowrap hidden xs:inline-block">
                        Personal Practice
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 font-medium leading-relaxed max-w-sm mt-[7px] sm:mt-2">
                      Design your own custom battlefield. Set dynamic boundaries from 0 to 100 to practice and strengthen your target list of Urdu numbers.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 w-full sm:w-auto shrink-0">
                  {appState.arenaStarted && !appState.arenaCompleted ? (
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setActiveScreen("training-arena");
                        setArenaActiveStage(null);
                      }}
                      className="w-full sm:w-auto py-2.5 px-6 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm rounded-2xl uppercase tracking-wider border-2 border-amber-300 border-b-[5px] border-b-amber-700 active:border-b-[2px] active:translate-y-[3px] cursor-pointer shadow-md transition-all duration-100 flex flex-col items-center justify-center select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Continue Arena</span>
                        <Play className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950/20" />
                      </div>
                      <span className="text-[10px] text-emerald-950/80 font-bold tracking-tight normal-case mt-0.5">
                        {(appState.arenaMin !== undefined ? appState.arenaMin : 30)}–{(appState.arenaMax !== undefined ? appState.arenaMax : 100)} • Stage {appState.arenaStageProgress ?? 1}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setIsArenaSetupOpen(true);
                      }}
                      className="w-full sm:w-auto py-3 px-6 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-xs sm:text-sm rounded-2xl uppercase tracking-wider border-2 border-amber-300 border-b-[5px] border-b-amber-700 active:border-b-[2px] active:translate-y-[3px] cursor-pointer shadow-md transition-all duration-100 flex items-center justify-center gap-1.5 select-none"
                    >
                      <span>Enter Arena</span>
                      <Play className="w-3.5 h-3.5 text-emerald-950 fill-emerald-950/20" />
                    </button>
                  )}
                </div>
              </section>

              {/* Interactive Practice Units list */}
              <section id="milestone-roadmap" className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4 text-emerald-800 mr-0.5" />
                    <span>Your Learning Journey</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    {appState.completedUnits.length} / 5 Mastered
                  </span>
                </div>

                {/* Vertical roadmap track container */}
                <div id="units-feed" className="milestone-roadmap relative flex flex-col gap-5 sm:gap-6 pl-4 py-1.5">

                  {UNITS.map((unit, index) => {
                    const isFinished = appState.completedUnits.includes(unit.id);
                    const isCurrent = nextUnit.id === unit.id;
                    const isLocked = !isFinished && !isCurrent;
                    const count = NUMBERS.filter(n => n.unitId === unit.id).length;
                    const unitProgressVal = getUnitProgress(unit.id);
                    const unitPercent = isFinished 
                      ? 100 
                      : isCurrent 
                        ? Math.max(0, Math.round(((unitProgressVal - 1) / 5) * 100))
                        : 0;
                    const isHighlighted = highlightedUnitId === unit.id;

                    return (
                      <div 
                        key={unit.id}
                        data-unit-id={unit.id}
                        className="milestone-row relative z-10 flex gap-3 sm:gap-5 items-center w-full"
                      >
                        {/* Compact Circular 3D Step Node on the left */}
                        <div className="milestone-node shrink-0 relative w-14 sm:w-[76px] self-stretch flex items-center justify-center">
                          {/* Row-segmented connection track line going upwards */}
                          {index > 0 && (
                            <div className="absolute left-1/2 -translate-x-1/2 w-[8px] sm:w-[10px] top-0 h-1/2 pointer-events-none z-0">
                              <div className={`w-full h-full ginti-roadmap-track-bg ${index === UNITS.length - 1 ? 'rounded-b-full' : ''}`} />
                              {index <= appState.completedUnits.length && (
                                <div className={`absolute inset-0 ginti-roadmap-track-fill transition-all duration-500 ${index === UNITS.length - 1 ? 'rounded-b-full' : ''}`} />
                              )}
                            </div>
                          )}

                          {/* Row-segmented connection track line going downwards */}
                          {index < UNITS.length - 1 && (
                            <div className="absolute left-1/2 -translate-x-1/2 w-[8px] sm:w-[10px] top-1/2 h-1/2 pointer-events-none z-0">
                              <div className={`w-full h-full ginti-roadmap-track-bg ${index === 0 ? 'rounded-t-full' : ''}`} />
                              {index < appState.completedUnits.length && (
                                <div className={`absolute inset-0 ginti-roadmap-track-fill transition-all duration-500 ${index === 0 ? 'rounded-t-full' : ''}`} />
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => {
                              if (isLocked) {
                                playSoundSynth("incorrect");
                                showToast(`Master the active unit first to unlock ${unit.title}! 🔒`);
                                return;
                              }
                              startUnitJourney(unit.id);
                            }}
                            className={`w-14 h-14 sm:w-[76px] sm:h-[76px] rounded-full flex items-center justify-center select-none cursor-pointer relative text-xl sm:text-2xl z-10 ${
                              isFinished
                                ? "ginti-node-finished"
                                : isCurrent
                                  ? "ginti-node-current ginti-pulse-active"
                                  : "ginti-node-locked cursor-not-allowed"
                            }`}
                          >
                            <span>{unit.emoji}</span>

                            {/* Status Overlay Badge on bottom-right of the circle node */}
                            <span className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4.5 h-4.5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full text-[8.5px] sm:text-[10px] font-black border border-white shadow-xs ${
                              isFinished
                                ? "bg-emerald-700 text-amber-300"
                                : isCurrent
                                  ? "bg-amber-400 text-emerald-950 animate-bounce"
                                  : "bg-slate-250 text-slate-500 ginti-status-badge-locked"
                            }`}>
                              {isFinished ? "✓" : isCurrent ? "⚡" : "🔒"}
                            </span>
                          </button>
                        </div>

                        {/* Interactive Step Card on the right */}
                        <article 
                          id={`unit-card-${unit.id}`}
                          className={`flex-1 relative overflow-hidden rounded-2xl p-3 sm:p-4.5 transition-all duration-300 border-2 flex flex-col justify-between ${
                            isCurrent 
                              ? "bg-gradient-to-br from-emerald-50/10 via-white to-amber-50/15 border-amber-400/90 border-b-[5px] border-b-amber-500 shadow-md ring-4 ring-amber-400/5"
                              : isFinished 
                                ? "bg-emerald-50/5 hover:bg-emerald-50/10 border-emerald-600/20 hover:border-emerald-600/35 hover:shadow-sm"
                                : "bg-white border-slate-200/65 opacity-70 cursor-not-allowed"
                          }`}
                        >
                          {isFinished && (
                            <div className="absolute top-0 right-0 bg-emerald-700 text-amber-300 font-extrabold text-[8px] sm:text-[9px] tracking-wider px-3 py-1 rounded-bl-xl uppercase flex items-center gap-0.5 shadow-xs select-none border-l border-b border-emerald-600/20">
                              <span>Mastered</span>
                              <CheckCircle2 className="w-3 h-3 text-amber-350" />
                            </div>
                          )}
                          
                          {isCurrent && (
                            <div className="absolute top-0 right-0 bg-amber-400 text-emerald-950 font-black text-[8px] sm:text-[9px] tracking-widest px-3 py-1 rounded-bl-xl uppercase select-none flex items-center gap-1 border-l border-b border-amber-500/35">
                              <Sparkles className="w-2.5 h-2.5 animate-pulse text-emerald-950 fill-emerald-950/20" />
                              <span>Next up</span>
                            </div>
                          )}

                          {isLocked && (
                            <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 font-bold text-[8px] sm:text-[9px] tracking-wider px-2.5 py-1 rounded-bl-xl uppercase flex items-center gap-1 select-none border-l border-b border-slate-300/30">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Locked</span>
                            </div>
                          )}

                          <div className="flex flex-col gap-1 pr-[60px]">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight truncate">
                                {unit.title}
                              </h4>
                              <span className="text-[8px] font-mono font-extrabold bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 inline-block uppercase mt-0.5 tracking-wider whitespace-nowrap">
                                {unit.numbersRange} ({count} entries)
                              </span>
                            </div>

                            <p className="text-[10.5px] text-slate-550 leading-relaxed font-semibold max-w-sm">
                              {unit.description}
                            </p>
                          </div>

                          {/* Progress sliders & active step buttons */}
                          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div className="flex-1 flex items-center gap-1.5">
                              <div className="flex-1 bg-slate-120 h-2 rounded-full overflow-hidden border border-slate-200/40">
                                <div 
                                  className={`h-full transition-all duration-500 rounded-full ${isFinished ? 'bg-emerald-600' : isCurrent ? 'bg-gradient-to-r from-amber-400 to-amber-300 animate-pulse' : 'bg-slate-300'}`}
                                  style={{ width: `${unitPercent}%` }} 
                                />
                              </div>
                              <span className="text-[8.5px] font-black text-slate-400 font-mono">
                                {isFinished ? "100%" : isCurrent ? `${unitPercent}%` : "0%"}
                              </span>
                            </div>

                            {isCurrent && (
                              <button
                                onClick={() => startUnitJourney(unit.id)}
                                className={`unit-action-btn flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] rounded-xl transition-all cursor-pointer shadow-sm ${
                                  appState.isDarkMode 
                                    ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                                    : "border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                                }`}
                              >
                                <span>{unitPercent > 0 ? "Continue" : "Start"}</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isFinished && (
                              <button
                                onClick={() => startUnitJourney(unit.id)}
                                className="unit-action-btn flex items-center gap-0.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 active:translate-y-[1px] border border-slate-250 hover:border-slate-300 text-slate-700 text-[10px] font-black rounded-xl cursor-pointer transition-all"
                              >
                                <span>Review</span>
                                <RotateCcw className="w-2.5 h-2.5 ml-0.5 text-slate-400" />
                              </button>
                            )}

                            {isLocked && (
                              <button
                                onClick={() => {
                                  playSoundSynth("incorrect");
                                  showToast(`Master the active unit first to unlock ${unit.title}! 🔒`);
                                }}
                                className="unit-action-btn flex items-center gap-0.5 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-bold cursor-not-allowed"
                              >
                                <span>Locked</span>
                                <Lock className="w-2.5 h-2.5 ml-0.5 text-slate-400" />
                              </button>
                            )}
                          </div>

                        </article>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Stats & Streak Bento grid - Positioned right above targeted practice numbers */}
              <div id="insights-panel" className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {/* Stat 1: Total XP */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600/30 hover:shadow-md transition-all duration-200 select-none">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
                    <Award className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-tight">Total XP</span>
                    <span className="text-sm font-black text-slate-800 leading-none">
                      <strong>{appState.totalXP}</strong> <span className="text-[10px] font-bold text-slate-400 font-mono">XP</span>
                    </span>
                  </div>
                </div>

                {/* Stat 2: Mastery Streak */}
                <button
                  onClick={() => {
                    playSoundSynth("click");
                    setShowStreakPopup(true);
                  }}
                  className="flex items-center text-left gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-orange-500/30 hover:shadow-md transition-all duration-200 select-none cursor-pointer active:translate-y-[1px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-xs ginti-stat-mastery-streak-box">
                    <Flame className="w-5 h-5 fill-orange-400 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-tight">Mastery Streak</span>
                    <span className="text-sm font-black text-slate-800 leading-none">
                      <strong>{appState.masteryStreak ?? 0}</strong> <span className="text-[10px] font-bold text-slate-400 font-mono">In A Row</span>
                    </span>
                  </div>
                </button>

                {/* Stat 3: Arcade Blitz record - spanned on small screens for solid look */}
                <div className="col-span-2 sm:col-span-1 flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-400/35 hover:shadow-md transition-all duration-200 select-none">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0 shadow-xs ginti-stat-blitz-record-box">
                    <Zap className="w-5 h-5 fill-amber-400 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-tight">Blitz Record</span>
                    <span className="text-sm font-black text-slate-800 leading-none">
                      <strong>{appState.highScore}</strong> <span className="text-[10px] font-bold text-slate-400 font-mono">pts</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Targeted mistakes list tray */}
              <div className="bg-white rounded-[1.75rem] p-4.5 border border-slate-100 shadow-xs flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    🎯 Targeted Practice Numbers ({appState.weakAreas.length})
                  </h4>
                  {appState.weakAreas.length > 0 && (
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        const cleared = { ...appState, weakAreas: [] };
                        saveState(cleared);
                        showToast("Mistakes history cleared.");
                      }}
                      className="text-[9px] text-slate-400 hover:text-slate-600 font-bold transition flex items-center gap-0.5 cursor-pointer"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Clear history</span>
                    </button>
                  )}
                </div>

                {appState.weakAreas.length === 0 ? (
                  <p id="weak-areas-empty-state" className="text-[11px] text-slate-400 italic">
                    Splendid accuracy! Answer quiz options correctly to track milestones.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5" id="weak-areas-list">
                    {appState.weakAreas.map((digit) => {
                      const associated = NUMBERS.find(n => n.digit === digit);
                      return (
                        <span 
                          key={digit}
                          onClick={() => {
                            if (associated) {
                              playSoundSynth("click");
                              setSelectedSearchEntry(associated);
                              // Smoothly scroll to lookup
                              const elementInput = document.getElementById("ginti-search");
                              elementInput?.scrollIntoView({ behavior: "smooth" });
                            }
                          }}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 active:translate-y-[1px] border border-rose-200/80 border-b-[3.5px] border-b-rose-300/80 text-rose-700 text-[11px] font-black rounded-full flex items-center gap-1 transition-all cursor-pointer select-none shadow-sm"
                        >
                          <span className="bg-white px-1.5 py-0.5 rounded-full border border-rose-200/50 shadow-xs text-[9px] font-black text-rose-800">
                            {digit}
                          </span>
                          <span className="truncate max-w-[80px] font-black">{associated?.romanUrdu || "Unknown"}</span>
                          {appState.showScript && (
                            <span className={`font-urdu leading-none pt-0.5 text-xs font-bold ${
                              appState.isDarkMode ? "text-rose-200/90" : "text-rose-800/80"
                            }`}>
                              {associated?.nativeScript}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reset progress options beautifully positioned at bottom scale link */}
              <div className="flex justify-center pt-1 pb-4">
                <button
                  id="reset-app-progress-btn"
                  onClick={flushAppProgress}
                  className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset Application Progress</span>
                </button>
              </div>

            </motion.div>
          );
        })()}

        {/* =============================================================================
            SCREEN B: PRACTICE ARENA (QUIZ MODE)
            ============================================================================= */}
        {!recoveryState && activeScreen === "practice" && quizState && (
          <motion.div
            id="screen-practice"
            key="practice"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="max-w-md mx-auto w-full p-3.5 sm:p-5 flex flex-col gap-2.5 sm:gap-3.5"
          >
            
            {quizState.showHeartsRefill ? (
              <div className="modern-card p-6 text-center flex flex-col items-center gap-4 bg-white max-w-sm mx-auto animate-scale-up">
                <MithuMascot mood="sad" />
                <h3 className="text-lg font-black text-rose-700 leading-tight">Out of Hearts!</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  "Oh no! Ginti lives depleted. But don't fret—Ginti is a safe place to learn. Would you like me to unlock your lesson?"
                </p>
                
                <div className="flex flex-col gap-2 w-full mt-2">
                  <button
                    onClick={() => refillHearts(true)}
                    disabled={appState.totalXP < 20}
                    className="w-full btn-gold py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>❤️ Save with 20 XP</span>
                    <span className="bg-amber-950/20 text-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                      Your XP: {appState.totalXP}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => refillHearts(false)}
                    className="w-full btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🦜 Mithu's Magic (Free Refill!)</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Practice Header with back route */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2" id="practice-header">
                  <button 
                    id="practice-back-btn"
                    onClick={exitQuiz}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                  
                  <div className="flex flex-col items-end gap-0.5">
                    <span id="question-counter" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      Card {quizState.currentIndex + 1} of {quizState.questions.length}
                    </span>
                    {/* Red Duolingo-styled hearts */}
                    <HeartsDisplay hearts={quizState.hearts} isDarkMode={appState.isDarkMode} />
                  </div>
                </div>

                {/* Visual Mini Progress Bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-700 transition-all duration-350"
                    style={{ width: `${((quizState.currentIndex + 1) / quizState.questions.length) * 100}%` }}
                  />
                </div>

                {/* MAIN PROMPT CARD - Height optimized to avoid layout shifts */}
                <div id="prompt-card" className="modern-card p-4 sm:p-5 flex flex-col items-center justify-center text-center relative bg-white min-h-[145px] sm:min-h-[165px] gap-2.5">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[9px] font-mono uppercase font-black text-slate-400 tracking-wider text-left">
                      Evaluate Translation
                    </span>
                    {renderMithuHelpBadge(quizState.questions[quizState.currentIndex].entry.digit)}
                  </div>

                  <div 
                    id="prompt-display" 
                    className={`font-black tracking-tight flex items-center justify-center transition-all duration-150 ${
                      appState.isDarkMode ? 'text-white' : 'text-slate-900'
                    } ${
                      appState.showScript &&
                      typeof getDisplayPromptValue(quizState.questions[quizState.currentIndex]) === 'string' && 
                      (getDisplayPromptValue(quizState.questions[quizState.currentIndex]) as string).match(/[\u0600-\u06FF]/)
                        ? `text-5xl sm:text-[3.75rem] font-urdu leading-none pt-3 pb-5 -translate-y-2 sm:-translate-y-2.5 ${appState.isDarkMode ? 'text-white' : 'text-emerald-800'}`
                        : 'text-4xl sm:text-[3.25rem] leading-none py-2'
                    }`}
                  >
                    {formatValueForDisplay(getDisplayPromptValue(quizState.questions[quizState.currentIndex]))}
                  </div>

                  {/* Redesigned interactive tactile speaker button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      id="prompt-audio-btn"
                      onClick={() => playWordAudio(quizState.questions[quizState.currentIndex].entry)}
                      disabled={speechActive}
                      className={`w-[2.35rem] h-[2.35rem] rounded-full border-2 border-emerald-100 bg-emerald-50/40 flex items-center justify-center shadow-xs transition hover:scale-105 active:scale-95 disabled:opacity-50 text-emerald-800 cursor-pointer border-b-[3.5px] border-b-emerald-200 active:translate-y-[1.5px] active:border-b-[1.5px] ${
                        speechActive ? 'pulse-primary-emerald' : ''
                      }`}
                      aria-label="Hear correct pronunciation"
                      title="Hear pronunciation audio"
                    >
                      <PremiumSpeakerIcon className="w-4 h-4 text-emerald-700" />
                    </button>
                    <p id="prompt-text-fallback" className="text-[8.5px] text-slate-400 font-extrabold uppercase tracking-wider">
                      Tap speaker to hear pronunciation
                    </p>
                  </div>
                </div>

                {/* Quiz Instructions Helper Banner */}
                {quizState.unitId === "unit1" && (
                  <div id="first-lesson-hint" className="py-1.5 px-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-emerald-800 block leading-normal">
                      Identify the perfect match translation choice card located below.
                    </span>
                  </div>
                )}

                {/* Mithu Learning Assistant Suggestion Banner */}
                {showMithuSuggestDigit === quizState.questions[quizState.currentIndex].entry.digit && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-2.5 px-4 bg-amber-55 border-2 border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-center justify-between text-left shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🦜</span>
                      <div>
                        <p className="text-xs font-black text-amber-950 dark:text-amber-200 leading-tight">Need help with this word?</p>
                        <p className="text-[10px] font-bold text-amber-850 dark:text-amber-300/80 leading-none mt-0.5">Mithu can help with clues!</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setMithuExplanationDigit(showMithuSuggestDigit);
                        setShowMithuSuggestDigit(null);
                      }}
                      className={`px-3 py-1.5 border rounded-full font-black text-[10px] cursor-pointer active:scale-95 transition-all shadow-xs flex items-center gap-1 ${
                        appState.isDarkMode 
                          ? "bg-emerald-950/90 hover:bg-emerald-900/90 border-emerald-800 text-emerald-300" 
                          : "bg-[#ecfdf5] hover:bg-[#d1fae5] border-emerald-300 text-emerald-800"
                      }`}
                    >
                      <span>🦜 Clues</span>
                    </button>
                  </motion.div>
                )}

                {/* CHOICE GRID - Controlled dimensions and row spans */}
                <div id="choice-grid" className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {quizState.questions[quizState.currentIndex].choices.map((choice, idx) => {
                    const isCorrectVal = choice === quizState.questions[quizState.currentIndex].correctAnswer;
                    const isSelected = choice === quizState.userAnswer;
                    const hasBeenAnswered = quizState.isAnswered;

                    // Build reactive feedback card styling classes using modern tactile classes
                    let cardStyle = "ginti-choice-btn";
                    if (hasBeenAnswered) {
                      if (isCorrectVal) {
                        cardStyle = "ginti-choice-btn-correct";
                      } else if (isSelected) {
                        cardStyle = "ginti-choice-btn-incorrect";
                      } else {
                        cardStyle = "ginti-choice-btn-dimmed";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        className={`choice-btn py-2.5 px-3 text-center text-base sm:text-lg md:text-xl font-black transition-all cursor-pointer flex flex-col items-center justify-center min-h-[50px] sm:min-h-[58px] w-full ${cardStyle}`}
                        onClick={() => chooseQuizAnswer(choice)}
                        disabled={hasBeenAnswered}
                        data-index={idx}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-lg sm:text-xl font-urdu leading-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* RESULT PANEL FOOTER TRAY */}
                {quizState.isAnswered && (
                  <motion.div 
                    id="practice-footer"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2 sm:p-2.5 px-3.5 sm:px-4 rounded-[1.75rem] border-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3.5 ${
                      quizState.userAnswer === quizState.questions[quizState.currentIndex].correctAnswer
                        ? "bg-emerald-50 border-emerald-300 text-emerald-950 border-b-[5px] border-b-emerald-500/90 shadow-sm"
                        : "bg-rose-50 border-rose-300 text-rose-950 border-b-[5px] border-b-rose-400/90 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-left w-full sm:w-auto">
                      {/* Reactive avatar response */}
                      <div id="mithu-avatar" className={`scale-[0.58] -my-5 -mx-2.5 select-none shrink-0 ${mascotAnimation}`}>
                        <MithuMascot mood={quizState.userAnswer === quizState.questions[quizState.currentIndex].correctAnswer ? "sparkly" : "sad"} />
                      </div>
                      
                      {quizState.userAnswer === quizState.questions[quizState.currentIndex].correctAnswer ? (
                        <div className="min-w-0 flex-1">
                          <div id="answer-feedback-msg" className="text-[12.5px] font-black flex items-center gap-1 text-emerald-900 leading-tight">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span>{quizState.mithuFeedback?.title ?? "Shabash!"}</span>
                          </div>
                          <span className={`text-[9.5px] block leading-tight mt-1 font-bold ${
                            appState.isDarkMode ? "text-emerald-300" : "text-emerald-950"
                          }`}>
                            {quizState.mithuFeedback?.subtitle ?? "Your Urdu intuition is growing sharp!"}
                          </span>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <div id="answer-feedback-msg" className="text-[12.5px] font-black flex items-center gap-1 text-rose-950 leading-tight">
                            <X className="w-3.5 h-3.5 text-rose-600 bg-rose-100 dark:text-rose-100 dark:bg-rose-900/80 rounded-full p-0.5 shrink-0" />
                            <span>{quizState.mithuFeedback?.title ?? "Koi baat nahi."}</span>
                          </div>
                          <span className={`text-[9.5px] block leading-tight mt-1 font-bold ${
                            appState.isDarkMode ? "text-rose-300" : "text-rose-950"
                          }`}>
                            {quizState.mithuFeedback?.subtitle ?? "Correct answer:"}{" "}
                            <strong className={`font-extrabold px-1 py-0.5 rounded shadow-xs border ${
                              appState.isDarkMode
                                ? "bg-rose-950 text-rose-200 border-rose-900/60"
                                : "bg-rose-100/70 text-rose-950 border-rose-200"
                            }`}>
                              {formatValueForDisplay(quizState.questions[quizState.currentIndex].correctAnswer)}
                            </strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      id="next-question-btn"
                      onClick={progressPractice}
                      className="btn-primary w-full sm:w-auto px-4.5 py-2 rounded-xl text-[10.5px] font-black transition flex items-center justify-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>{quizState.currentIndex + 1 >= quizState.questions.length ? "Finish" : "Next Card"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}
              </>
            )}

          </motion.div>
        )}

        {/* =============================================================================
            SCREEN C: ARCADE BLITZ SPEED CHALLENGE
            ============================================================================= */}
        {!recoveryState && activeScreen === "arcade" && arcadeState && (
          <motion.div
            id="screen-arcade"
            key="arcade"
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="max-w-xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4.5 text-center relative"
          >
            
            {/* PRESSURE HEADER CONTROLS */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="arcade-header">
              
              <div className="text-left">
                <span id="arcade-timer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-sm rounded-full shadow-inner leading-none">
                  ⏱️ <span id="timer-display" className="font-mono text-base">{arcadeState.timeLeft}</span>s
                </span>
              </div>

              <div className="text-right flex items-center gap-4">
                <span id="arcade-score" className="text-sm font-bold text-slate-700">
                  Score: <strong id="arcade-score-display" className="text-base text-emerald-800 font-black">{arcadeState.score}</strong> pts
                </span>
                
                <button
                  onClick={closeArcadeFrame}
                  className={`p-1 px-3 border aspect-square rounded-full flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                    appState.isDarkMode
                      ? "border-rose-900/50 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 hover:border-rose-800"
                      : "border-rose-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
                  }`}
                  title="Abandon match"
                >
                  Abandon
                </button>
              </div>

            </div>

            {/* Time Warning Pulsating Overlay */}
            {arcadeState.timeLeft <= 5 && !arcadeState.isGameOver && (
              <div className="animate-pulse text-rose-600 font-sans font-black text-xs uppercase tracking-widest bg-rose-50 border border-rose-200 py-2 rounded-xl">
                ⚠️ RAPID INTUITION: TIMER CRITICALLY LOW!
              </div>
            )}

            {/* GAME CORE ACTIVE CONTENT SWITCH */}
            {!arcadeState.isGameOver ? (
              <div className="flex flex-col gap-6">
                
                {/* PROMPT BOX */}
                <div id="arcade-prompt" className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-5 md:p-6 flex flex-col items-center justify-center min-h-[110px] sm:min-h-[130px] relative shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-[#D4AF37] font-extrabold text-left">
                      RAPID-FIRE CHIP
                    </span>
                    {renderMithuHelpBadge(arcadeState.activeQuestion.entry.digit)}
                  </div>

                  <div 
                    id="arcade-prompt-display" 
                    className={`font-black tracking-tight my-1.5 sm:my-2 ${
                      appState.showScript &&
                      typeof getDisplayPromptValue(arcadeState.activeQuestion) === 'string' &&
                      (getDisplayPromptValue(arcadeState.activeQuestion) as string).match(/[\u0600-\u06FF]/)
                        ? 'text-5xl sm:text-[3.75rem] font-urdu leading-none pt-3 pb-5 -translate-y-2 sm:-translate-y-2.5 text-[#fefce8] flex items-center justify-center text-center'
                        : 'text-4xl sm:text-5xl md:text-6xl text-[#fefce8]'
                    }`}
                  >
                    {formatValueForDisplay(getDisplayPromptValue(arcadeState.activeQuestion))}
                  </div>

                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal">
                    Double speed matches (+10 pts reward, -5 pts crash penalties)
                  </span>
                </div>

                 {/* ARCADE OPTION DECKS */}
                <div id="arcade-choice-grid" className="grid grid-cols-2 gap-3">
                  {arcadeState.activeQuestion?.choices.map((choice, idx) => {
                    const isCorrectVal = choice === arcadeState.activeQuestion?.correctAnswer;
                    const isSelected = choice === arcadeState.selectedAnswer;
                    const hasBeenAnswered = arcadeState.isAnswered;

                    let cardStyle = "ginti-choice-btn";
                    if (hasBeenAnswered) {
                      if (isCorrectVal) {
                        cardStyle = "ginti-choice-btn-correct";
                      } else if (isSelected) {
                        cardStyle = "ginti-choice-btn-incorrect";
                      } else {
                        cardStyle = "ginti-choice-btn-dimmed";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        className={`arcade-btn py-3 sm:py-4 px-3 text-center text-base sm:text-lg md:text-xl font-black transition-all cursor-pointer flex flex-col items-center justify-center min-h-[58px] sm:min-h-[64px] ${cardStyle}`}
                        onClick={() => selectArcadeOption(choice)}
                        disabled={hasBeenAnswered}
                        data-index={idx}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-xl sm:text-2xl font-urdu leading-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>
            ) : (
              
              /* ARCADE DISMISSED END SCREEN CARD */
              <div 
                id="arcade-end-screen" 
                className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border-2 border-slate-200 border-b-[6px] border-b-slate-350 p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center relative shadow-xl max-w-md mx-auto w-full animate-fade-in animate-scale-up my-auto"
              >
                
                {/* 3D Circular Crown/Pedestal */}
                {arcadeState.score >= appState.highScore && arcadeState.score > 0 ? (
                  <div className="w-18 h-18 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-amber-950 border-2 border-amber-300 border-b-[5px] border-b-amber-800 shadow-md relative mb-3 animate-bounce select-none">
                    <Star className="w-9 h-9 fill-amber-100 text-amber-950" />
                    <div className="absolute -top-2 bg-rose-500 text-white font-black text-[8px] px-2 py-0.5 rounded-full border border-rose-450 uppercase tracking-wider animate-pulse whitespace-nowrap">
                      👑 Record
                    </div>
                  </div>
                ) : (
                  <div className="w-18 h-18 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white border-2 border-emerald-400 border-b-[5px] border-b-emerald-900 shadow-sm relative mb-4 select-none">
                    <Award className="w-9 h-9 text-amber-300 fill-amber-300/15" />
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                  Blitz Completed!
                </h2>

                <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Standard Speed Reflex Report
                </p>

                {/* Score & Best */}
                <div className="my-4 text-center">
                  <div className="text-4xl sm:text-5xl font-black text-slate-800 font-mono tracking-tight leading-none flex items-center justify-center gap-1">
                    <span>{arcadeState.score}</span>
                    <span className="text-lg font-black text-slate-400 font-sans tracking-wide">PTS</span>
                  </div>
                  <p className="text-[11px] font-extrabold text-slate-500 mt-1">
                    Personal Best: <strong className="text-emerald-700 font-black">{appState.highScore} pts</strong>
                  </p>
                </div>

                {/* Performance Badge / Message */}
                <div className="w-full mb-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl leading-snug">
                  <p className="text-xs sm:text-sm font-black text-slate-700">
                    {(() => {
                      const correct = arcadeState.totalAnswered - arcadeState.wrongCount;
                      const accuracy = arcadeState.totalAnswered > 0 ? (correct / arcadeState.totalAnswered) : 0;
                      if (accuracy === 1 && correct > 0) return "⚡ Lightning Reflexes! Absolute Master!";
                      if (accuracy >= 0.8 && correct > 0) return "🔥 Ginti Champion! Outstanding speed!";
                      if (accuracy >= 0.5 && correct > 0) return "✨ Solid Momentum! Keep counting!";
                      if (correct > 0) return "👍 Standard Effort! Keep training your reflexes!";
                      return "🌱 Keep practicing! Focus and speed up next time!";
                    })()}
                  </p>
                </div>

                {/* High Record broken banner */}
                {arcadeState.score >= appState.highScore && arcadeState.score > 0 && (
                  <div className="w-full bg-amber-50 border-2 border-amber-200 border-b-[3px] border-b-amber-400 rounded-xl py-1.5 px-3 mb-4 text-[10px] font-black text-amber-850 uppercase tracking-widest flex items-center justify-center gap-1 shadow-xs animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>👑 NEW ALL-TIME RECORD SHATTERED!</span>
                  </div>
                )}

                {/* Tactical Stats Grid - Same Ginti Design Language */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                  
                  {/* Stat Card 1: Experience */}
                  <div className="bg-slate-50 border-2 border-slate-200 border-b-[4px] border-b-slate-350 rounded-2xl p-2.5 flex flex-col items-center justify-center select-none">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                      ⭐ Earned
                    </span>
                    <span className="text-sm font-black text-slate-700 font-mono">
                      +{arcadeState.score} XP
                    </span>
                  </div>

                  {/* Stat Card 2: Precision Accuracy */}
                  <div className="bg-slate-50 border-2 border-slate-200 border-b-[4px] border-b-slate-350 rounded-2xl p-2.5 flex flex-col items-center justify-center select-none">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                      🎯 Precision
                    </span>
                    <span className="text-sm font-black text-emerald-700 font-mono">
                      {(() => {
                        const correct = arcadeState.totalAnswered - arcadeState.wrongCount;
                        return arcadeState.totalAnswered > 0 
                          ? Math.round((correct / arcadeState.totalAnswered) * 100) 
                          : 0;
                      })()}%
                    </span>
                  </div>

                  {/* Stat Card 3: Matches Correct */}
                  <div className="bg-slate-50 border-2 border-slate-200 border-b-[4px] border-b-slate-350 rounded-2xl p-2.5 flex flex-col items-center justify-center select-none">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                      ✅ Correct
                    </span>
                    <span className="text-sm font-black text-blue-750 font-mono">
                      {arcadeState.totalAnswered - arcadeState.wrongCount} matches
                    </span>
                  </div>

                  {/* Stat Card 4: Action Mistake Count */}
                  <div className="bg-slate-50 border-2 border-slate-200 border-b-[4px] border-b-slate-350 rounded-2xl p-2.5 flex flex-col items-center justify-center select-none">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                      ❌ Mistakes
                    </span>
                    <span className="text-sm font-black text-rose-700 font-mono">
                      {arcadeState.wrongCount} times
                    </span>
                  </div>

                </div>

                {/* Tactile Actions Deck */}
                <div className="flex flex-col gap-3 w-full">
                  <button
                    id="arcade-restart-btn"
                    onClick={startArcadeMode}
                    className="w-full btn-gold py-3.5 px-6 rounded-full text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md select-none tracking-wide"
                  >
                    <Play className="w-4 h-4 fill-amber-950 stroke-none" />
                    <span>RETRY BLITZ MATCH</span>
                  </button>

                  <button
                    id="arcade-home-btn"
                    onClick={closeArcadeFrame}
                    className="w-full btn-secondary py-3.5 px-6 rounded-full text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-sm select-none tracking-wide"
                  >
                    <span>BACK TO DASHBOARD</span>
                  </button>
                </div>

              </div>
            )}

          </motion.div>
        )}

        {/* =============================================================================
            SCREEN D: UNIT JOURNEY WORKFLOW
            ============================================================================= */}
        {!recoveryState && activeScreen === "unit-journey" && selectedJourneyUnitId && (() => {
          const unit = UNITS.find((u) => u.id === selectedJourneyUnitId);
          if (!unit) return null;

          const progress = getUnitProgress(selectedJourneyUnitId);

          // If activeStageIndex is null, we display the Journey Stages selection map
          if (activeStageIndex === null) {
            return (
              <div id="screen-unit-journey" className="max-w-md mx-auto w-full p-4 flex flex-col gap-5 animate-fade-in">
                {/* Header block */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setActiveScreen("dashboard");
                    }}
                    className="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl cursor-pointer transition active:scale-95"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1">
                      {unit.emoji} {unit.numbersRange} Learn Journey
                    </span>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mt-1">
                      {unit.title}
                    </h2>
                  </div>
                </div>

                {/* Card with description of unit */}
                <div className="bg-gradient-to-br from-emerald-800/10 to-teal-800/5 border border-emerald-800/15 rounded-2xl p-4 flex gap-3.5 items-start">
                  <MithuMascot mood="thinking" />
                  <div className="flex-1">
                    <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                      {unit.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <span>Completed units unlock automatically! Progress:</span>
                      <span className="text-amber-750 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 font-extrabold">
                        Stage {progress === 5 ? "5/5 (Ready for Test)" : `${progress - 1}/5 Completed`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Vertical Step Road map ladder */}
                <div className="relative flex flex-col gap-4 mt-2">
                  {/* Visual central vertical path line matching dashboard roadmap */}
                  <div className="absolute left-[39px] -translate-x-1/2 w-[10px] top-[39px] bottom-[39px] pointer-events-none z-0">
                    {/* Muted outer track background */}
                    <div className="w-full h-full ginti-roadmap-track-bg rounded-full" />
                    {/* Emerald progress track fill */}
                    <div
                      className="absolute top-0 left-0 w-full ginti-roadmap-track-fill rounded-full transition-all duration-500"
                      style={{ height: `${((progress - 1) / 4) * 100}%` }}
                    />
                  </div>

                  {[
                    {
                      id: 1,
                      name: "Stage 1: Learning Introduction",
                      desc: "Study the standard Roman Urdu spellings, pronunciation dynamics & script matching.",
                      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
                    },
                    {
                      id: 2,
                      name: "Stage 2: Word & Digit Matching",
                      desc: "Complete the interactive 5-question visual recognition deck to construct mental associations.",
                      icon: <Zap className="w-5 h-5 text-amber-500" />,
                    },
                    {
                      id: 3,
                      name: "Stage 3: Pronunciation & Auditory",
                      desc: "Tackle 5 vocal sound prompts to lock dynamic listening comprehension.",
                      icon: <PremiumSpeakerIcon className="w-5 h-5 text-rose-500" />,
                    },
                    {
                      id: 4,
                      name: "Stage 4: Rapid Blitz Arcade",
                      desc: "Perform under a 30-second rapid stopwatch to lock speed matching reflexes.",
                      icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
                    },
                    {
                      id: 5,
                      name: "Stage 5: Final Mastery Test",
                      desc: "Tackle a comprehensive mixed-challenge assessment to fully master this unit! (+50 XP)",
                      icon: <Star className="w-5 h-5 text-amber-600" />,
                    },
                  ].map((stg) => {
                    const isUnlocked = stg.id <= progress;
                    const isDone = stg.id < progress;
                    const isCurrent = stg.id === progress;

                    let cardBg = "bg-slate-50/50 border-slate-200/50 opacity-60";

                    if (isDone) {
                      cardBg = "bg-white hover:bg-slate-50/50 border-slate-200 hover:border-slate-350 cursor-pointer shadow-xs transition-all";
                    } else if (isCurrent) {
                      cardBg = "bg-gradient-to-r from-amber-50/50 to-white hover:from-amber-50 hover:to-slate-50/50 border-amber-300 hover:border-amber-400 cursor-pointer shadow-sm active:scale-[0.98] transition-all";
                    }

                    return (
                      <div key={stg.id} className="flex gap-4 items-center relative z-10 animate-fade-in" id={`journey-stage-row-${stg.id}`}>
                        {/* Circular Milestone Node with 3D tactile design */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => {
                            if (!isUnlocked) {
                              playSoundSynth("incorrect");
                              showToast(`Stage ${stg.id} is locked! Clear previous stages first. 🔒`);
                              return;
                            }
                            console.log(`Starting Stage ${stg.id} inside unit ${selectedJourneyUnitId}`);
                            if (stg.id === 1) setActiveStageIndex(1);
                            if (stg.id === 2) setupStage2Quiz(selectedJourneyUnitId);
                            if (stg.id === 3) setupStage3Listening(selectedJourneyUnitId);
                            if (stg.id === 4) startStage4Arcade();
                            if (stg.id === 5) setupStage5Quiz(selectedJourneyUnitId);
                          }}
                          className={`w-[78px] h-[78px] p-0 m-0 rounded-full flex flex-col items-center justify-center font-black text-center shrink-0 select-none transition relative z-10 cursor-pointer ${
                            isDone
                              ? "ginti-node-finished"
                              : isCurrent
                                ? "ginti-node-current ginti-pulse-active"
                                : "ginti-node-locked cursor-not-allowed"
                          }`}
                        >
                          <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-80 leading-none text-center w-full block pl-[0.05em] m-0">Stage</span>
                          <span className="text-2xl font-black mt-0.5 text-center w-full block tabular-nums m-0">{stg.id}</span>

                          {/* Status Overlay Badge on bottom-right of the circle node */}
                          <span className={`absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black border border-white shadow-xs ${
                            isDone
                              ? "bg-emerald-700 text-amber-300"
                              : isCurrent
                                ? "bg-amber-400 text-emerald-950 animate-bounce"
                                : "bg-slate-300 text-slate-500 ginti-status-badge-locked"
                          }`}>
                            {isDone ? "✓" : isCurrent ? "⚡" : "🔒"}
                          </span>
                        </motion.button>

                        {/* Description Card */}
                        <div
                          className={`flex-1 rounded-2xl border p-4 flex gap-3.5 items-center select-none ${cardBg}`}
                          onClick={() => {
                            if (!isUnlocked) {
                              playSoundSynth("incorrect");
                              showToast(`Stage ${stg.id} is locked! Clear previous stages first. 🔒`);
                              return;
                            }
                            console.log(`Starting Stage ${stg.id} inside unit ${selectedJourneyUnitId}`);
                            if (stg.id === 1) setActiveStageIndex(1);
                            if (stg.id === 2) setupStage2Quiz(selectedJourneyUnitId);
                            if (stg.id === 3) setupStage3Listening(selectedJourneyUnitId);
                            if (stg.id === 4) startStage4Arcade();
                            if (stg.id === 5) setupStage5Quiz(selectedJourneyUnitId);
                          }}
                        >
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center self-start shrink-0">
                            {stg.icon}
                          </div>
                          <div>
                            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 leading-none">
                              <span>{stg.name}</span>
                              {isDone && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border dark:border-emerald-800/50 px-1.5 py-0.5 rounded-md font-bold leading-none">
                                  Done
                                </span>
                              )}
                              {isCurrent && (
                                <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md font-black animate-pulse leading-none">
                                  Play
                                </span>
                              )}
                            </h3>
                            <p className="text-[10px] text-slate-500 leading-normal mt-1">
                              {stg.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Reset Section */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setActiveScreen("dashboard");
                    }}
                    className="btn-secondary py-3 px-6 rounded-xl text-xs font-bold w-full cursor-pointer"
                  >
                    Back to Main Roadmap
                  </button>
                </div>
              </div>
            );
          }

          const filteredList = NUMBERS.filter((n) => n.unitId === selectedJourneyUnitId);

          // STAGE 1: INTRO STUDY SHEET
          if (activeStageIndex === 1) {
            return (
              <motion.div
                key="stage-1-deck"
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="max-w-md mx-auto w-full"
              >
                <div id="screen-journey-stage-1" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4">
                  {/* Header sub block */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="stage1-header">
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setActiveStageIndex(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Stages</span>
                    </button>
                    <div className="text-right">
                      <span className="text-[9px] font-black text-emerald-600 block">STAGE 1/5 • DIALECT MAP</span>
                      <span className="text-xs font-black text-slate-800">Learn Urdu Phrases</span>
                    </div>
                  </div>

                  <div className="text-center bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex flex-col items-center">
                    <MithuMascot mood="happy" />
                    <h3 className="text-sm font-black text-slate-800 mt-2 leading-none">Vocalize and Memorize!</h3>
                    <p className="text-[10px] text-slate-500 leading-normal mt-1.5 max-w-xs">
                      Tap the cards below to play clear speech pronunciations! Pay close attention to romanizations.
                    </p>
                  </div>

                  {/* Grid list of terms */}
                  <div
                    ref={journeyStage1ScrollRef}
                    onScroll={checkJourneyScroll}
                    className="grid grid-cols-1 gap-2.5 max-h-[385px] overflow-y-auto pt-3 px-1.5 pb-2 pr-1 border-b border-dashed border-slate-200/50"
                    id="stage1-cards-grid"
                  >
                    {filteredList.map((item) => (
                      <div
                        key={item.digit}
                        onClick={() => {
                          playSoundSynth("click");
                          playWordAudio(item);
                        }}
                        className="bg-white hover:bg-emerald-50/10 border border-slate-200 hover:border-emerald-500/30 rounded-2xl p-3 flex items-center justify-between transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-black text-slate-800 shadow-inner">
                            {item.digit}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5 leading-none">
                              <span>{item.romanUrdu}</span>
                            </div>
                            <div className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                              Numerical Code Index Key
                            </div>
                          </div>
                        </div>

                        {/* Right Hand Urudu native transcription */}
                        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                          {/* Mithu persistent Help trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playSoundSynth("click");
                              setMithuExplanationDigit(item.digit);
                            }}
                            className={`px-1.5 py-0.5 sm:px-2.5 sm:py-1 border rounded-full text-[9px] sm:text-[10px] font-black flex items-center gap-0.5 hover:scale-105 active:scale-95 transition cursor-pointer select-none shadow-xs ${
                              appState.isDarkMode 
                                ? "bg-emerald-950/90 hover:bg-emerald-900/90 border-emerald-800 text-emerald-300" 
                                : "bg-[#ecfdf5] hover:bg-[#d1fae5] border-emerald-300 text-emerald-800"
                            }`}
                            title="See Mithu's decoding clues!"
                          >
                            <span>🦜 Clues</span>
                          </button>

                          <span className={`text-xl sm:text-2xl font-normal font-urdu tracking-wide leading-none select-none ${
                            appState.isDarkMode ? "text-white" : "text-emerald-800"
                          }`}>
                            {item.nativeScript}
                          </span>
                          <div className="p-1 sm:p-1.5 bg-slate-50 border border-slate-200/50 rounded-lg text-slate-400 hover:text-emerald-600 transition shrink-0">
                            <PremiumSpeakerIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic Finish Line Overlay Takeover */}
                  {journeyStage1Finished ? (
                    <motion.div
                      key="journey-stage-1-finished-overlay"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-emerald-50/95 border-2 border-emerald-500 rounded-3xl p-6 text-center shadow-lg flex flex-col items-center justify-center gap-4 mt-2"
                    >
                      <MithuMascot mood="happy" />
                      
                      <h3 className="text-base font-black text-slate-800 leading-tight">
                        You have completed the exploration! 🎉
                      </h3>
                      
                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                        Mithu has recorded your training history. What is your next play?
                      </p>

                      <div className="flex flex-col gap-3 w-full mt-2">
                        {/* Option Button A (Progress Forward) */}
                        <button
                          onClick={() => {
                            playSoundSynth("click");
                            saveUnitStageProgress(selectedJourneyUnitId!, 1);
                            setJourneyStage1Finished(false);
                            setNextStageToFocus(2);
                            setActiveStageIndex(null);
                          }}
                          className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-3.5 px-5 font-black uppercase text-xs tracking-wider cursor-pointer transition-all shadow-md ${
                            appState.isDarkMode 
                              ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                              : "border-2 border-emerald-500 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                          }`}
                        >
                          CONTINUE TO NEXT STAGE
                        </button>

                        {/* Option Button B (Loop Reset Review) */}
                        <button
                          onClick={() => {
                            playSoundSynth("click");
                            setJourneyStage1Finished(false);
                            if (journeyStage1ScrollRef.current) {
                              journeyStage1ScrollRef.current.scrollTop = 0;
                            }
                          }}
                          className="w-full bg-white hover:bg-slate-50 text-slate-700 rounded-2xl py-3.5 px-5 font-bold uppercase text-xs tracking-wider border-2 border-slate-200 border-b-4 border-b-slate-300 active:translate-y-[2px] active:border-b-2 cursor-pointer transition-all"
                        >
                          REVIEW EXPLORARENA AGAIN
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 mt-1">
                      <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 animate-pulse">
                        ↕️ Scroll all the way to complete this module
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          }

          // STAGE 2: MULTIPLE CHOICE RECOGNITION DECK
          if (activeStageIndex === 2) {
            const hasFinishedQuiz = stageQuizIdx >= stageQuizQuestions.length;
            
            if (hasFinishedQuiz) {
              return (
                <div id="screen-journey-stage-2-end" className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center text-center gap-3 animate-scale-up py-6 sm:py-8 my-auto">
                  <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-200 mb-1 shadow-sm animate-bounce">
                    <Star className="w-7 h-7 fill-amber-300" />
                  </div>

                  <h3 className="text-xl font-black text-slate-800 font-extrabold">Stage 2 Matches Completed!</h3>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                    Splendid translation recognition matches! Your scorecard logged <span className="font-extrabold text-slate-800">{stageQuizScore} / {stageQuizQuestions.length} correct</span>.
                  </p>

                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    <button
                      onClick={() => {
                        saveUnitStageProgress(selectedJourneyUnitId, 2);
                        setNextStageToFocus(3);
                        setActiveStageIndex(null);
                      }}
                      className="w-full btn-gold py-3 px-5 rounded-2xl text-xs font-black cursor-pointer shadow-md"
                    >
                      Unlock Stage 3: Listening (+15 XP) 🎉
                    </button>
                    <button
                      onClick={() => setupStage2Quiz(selectedJourneyUnitId)}
                      className="w-full btn-secondary py-3 px-5 rounded-2xl text-xs font-bold cursor-pointer"
                    >
                      Retry Recognition Match
                    </button>
                  </div>
                </div>
              );
            }

            const currentQ = stageQuizQuestions[stageQuizIdx];
            if (!currentQ) return null;

            return (
              <div id="screen-journey-stage-2" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in">
                {/* Header sub block */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="stage2-header">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setActiveStageIndex(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Exit Stage</span>
                  </button>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-amber-500 block">STAGE 2/5 • RECOGNITION</span>
                    <span className="text-xs font-black text-slate-800">Question {stageQuizIdx + 1} of 5</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${((stageQuizIdx + 1) / 5) * 100}%` }}
                  />
                </div>

                {/* Question query box */}
                <div className="modern-card p-5 text-center bg-slate-50 border border-slate-200/80 rounded-2xl shadow-inner mt-2 flex flex-col items-center relative">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                      Translate value:
                    </span>
                    {renderMithuHelpBadge(currentQ.entry.digit)}
                  </div>
                  <div className={`text-3xl font-extrabold leading-none py-2 tracking-tight ${
                    appState.showScript && typeof getDisplayPromptValue(currentQ) === "string" && (getDisplayPromptValue(currentQ) as string).match(/[\u0600-\u06FF]/) ? "font-urdu" : ""
                  } ${appState.isDarkMode ? "text-white" : "text-slate-800"}`}>
                    {formatValueForDisplay(getDisplayPromptValue(currentQ))}
                  </div>
                </div>

                {/* Interactive choice grid list */}
                <div className="grid grid-cols-2 gap-3 mt-2" id="stage2-choices-grid">
                  {currentQ.choices.map((choice, index) => {
                    const isSelected = stageQuizSelected === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    let bStyle = "bg-white border-slate-200 hover:border-slate-350 active:scale-98 text-slate-800";

                    if (stageQuizAnswered) {
                      if (isCorrectVal) {
                        bStyle = "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 shadow-md";
                      } else if (isSelected) {
                        bStyle = "bg-rose-500 border-rose-600 text-white shadow-rose-200 shadow-md";
                      } else {
                        bStyle = "bg-slate-50/50 border-slate-100/50 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={index}
                        disabled={stageQuizAnswered}
                        onClick={() => {
                          const isCorrect = choice === currentQ.correctAnswer;
                          if (isCorrect) {
                            incrementMasteryStreak();
                          } else {
                            resetMasteryStreak(currentQ.entry.digit);
                          }
                          playSoundSynth(isCorrect ? "correct" : "incorrect");
                          setStageQuizSelected(choice);
                          setStageQuizAnswered(true);
                          
                          if (isCorrect) {
                            setStageQuizScore((s) => s + 1);
                          } else {
                            setStageQuizMistakes((prev) => [...prev, currentQ]);
                          }

                          // Auto advance after short timer frame
                          setTimeout(() => {
                            setStageQuizSelected(null);
                            setStageQuizAnswered(false);
                            setStageQuizIdx((prev) => prev + 1);
                          }, 1200);
                        }}
                        className={`py-4 px-3 rounded-2xl border-2 text-center text-base sm:text-lg md:text-xl font-black transition-all flex flex-col items-center justify-center min-h-[72px] cursor-pointer shadow-xs ${bStyle}`}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-2xl font-urdu select-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          // STAGE 3: LISTENING PRONUNCIATION SELECTOR
          if (activeStageIndex === 3) {
            const hasFinishedListening = stageListIdx >= stageListQuestions.length;

            if (hasFinishedListening) {
              return (
                <div id="screen-journey-stage-3-end" className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center text-center gap-3 animate-scale-up py-6 sm:py-8 my-auto">
                  <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 border border-rose-200 mb-1 shadow-sm animate-bounce">
                    <Star className="w-7 h-7 fill-rose-300" />
                  </div>

                  <h3 className="text-xl font-black text-slate-800 font-extrabold">Stage 3 Listening Cleared!</h3>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed font-semibold">
                    Terrific dialect phonology matches! You parsed oral Urdu sounds like a real native!
                  </p>

                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    <button
                      onClick={() => {
                        saveUnitStageProgress(selectedJourneyUnitId, 3);
                        setNextStageToFocus(4);
                        setActiveStageIndex(null);
                      }}
                      className="w-full btn-gold py-3 px-5 rounded-2xl text-xs font-black animate-pulse shadow-md cursor-pointer"
                    >
                      Unlock Stage 4: Arcade Blitz (+15 XP) 🎉
                    </button>
                    <button
                      onClick={() => setupStage3Listening(selectedJourneyUnitId)}
                      className="w-full btn-secondary py-3 px-5 rounded-2xl text-xs font-bold cursor-pointer"
                    >
                      Retry Sound Listening Loop
                    </button>
                  </div>
                </div>
              );
            }

            const currentQ = stageListQuestions[stageListIdx];
            if (!currentQ) return null;

            return (
              <div id="screen-journey-stage-3" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in">
                {/* Header sub block */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="stage3-header">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setActiveStageIndex(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Exit Stage</span>
                  </button>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-rose-600 block">STAGE 3/5 • LISTEN COMPREHENSION</span>
                    <span className="text-xs font-black text-slate-800">Question {stageListIdx + 1} of 5</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${((stageListIdx + 1) / 5) * 100}%` }}
                  />
                </div>

                {/* Big speaker audio activator button box */}
                <div className="modern-card p-5 text-center bg-slate-50 border border-slate-200/80 rounded-2xl shadow-inner mt-2 flex flex-col items-center relative">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">
                      Listen comprehension:
                    </span>
                    {renderMithuHelpBadge(currentQ.entry.digit)}
                  </div>
                  
                  {/* Clean layout container with outline removed as requested */}
                  <div className="flex items-center justify-center py-2.5 mt-1 mb-2">
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        playWordAudio(currentQ.entry);
                        setStageListSpeakerAnimate(true);
                        const timer = setTimeout(() => {
                          setStageListSpeakerAnimate(false);
                        }, 1200);
                      }}
                      className="w-20 h-20 bg-rose-600 hover:bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-rose-500 border-b-[6px] border-b-rose-800 transition-all duration-100 active:translate-y-[4.5px] active:border-b-2 cursor-pointer shadow-lg select-none"
                    >
                      <PremiumSpeakerIcon className={`w-9 h-9 text-white ${stageListSpeakerAnimate ? 'animate-bounce' : ''}`} />
                    </button>
                  </div>

                  <span className="text-[11px] font-black text-rose-600 dark:text-rose-400 mt-4 uppercase tracking-widest animate-pulse">
                    🔊 Tap speaker to vocalize sound
                  </span>
                </div>

                {/* Option targets choice buttons */}
                <div className="grid grid-cols-2 gap-3 mt-2" id="stage3-choices-grid">
                  {currentQ.choices.map((choice: any, index: number) => {
                    const isSelected = stageListSelected === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    let bStyle = "bg-white border-slate-200 hover:border-slate-350 active:scale-98 text-slate-800";

                    if (stageListAnswered) {
                      if (isCorrectVal) {
                        bStyle = "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 shadow-md";
                      } else if (isSelected) {
                        bStyle = "bg-rose-500 border-rose-600 text-white shadow-rose-205 shadow-md";
                      } else {
                        bStyle = "bg-slate-50/50 border-slate-100/50 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={index}
                        disabled={stageListAnswered}
                        onClick={() => {
                          const isCorrect = choice === currentQ.correctAnswer;
                          if (isCorrect) {
                            incrementMasteryStreak();
                          } else {
                            resetMasteryStreak();
                          }
                          playSoundSynth(isCorrect ? "correct" : "incorrect");
                          setStageListSelected(choice);
                          setStageListAnswered(true);

                          if (!isCorrect) {
                            setStageListMistakes((prev) => [...prev, currentQ]);
                          }

                          // Advance state
                          setTimeout(() => {
                            setStageListSelected(null);
                            setStageListAnswered(false);
                            setStageListIdx((prev) => prev + 1);
                          }, 1200);
                        }}
                        className={`py-4 px-3 rounded-2xl border-2 text-center text-xl font-bold font-sans transition-all flex flex-col items-center justify-center min-h-[72px] cursor-pointer shadow-xs ${bStyle}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          // STAGE 4: SPEED ARCADE BLITZ CHALLENGE
          if (activeStageIndex === 4) {
            if (stageArcadeOver) {
              const pass = stageArcadeScore >= 3;
              return (
                <div id="screen-journey-stage-4-end" className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center text-center gap-3 animate-scale-up py-6 sm:py-8 my-auto">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 border border-indigo-200 mb-1 shadow-sm">
                    {pass ? (
                      <Star className="w-7 h-7 fill-indigo-300 text-indigo-500" />
                    ) : (
                      <Lock className="w-7 h-7 text-slate-400" />
                    )}
                  </div>

                  <h3 className="text-xl font-black text-slate-800 font-extrabold">
                    {pass ? "Stage 4 Blitz Completed!" : "Need 3 Hits to Clear!"}
                  </h3>
                  
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed font-semibold">
                    {pass 
                      ? `Fantastic reaction reflexes! You completed the stopwatch run with a grand total of ${stageArcadeScore} correct matched parameters!`
                      : `You finished with ${stageArcadeScore} matches. Keep practicing and aim for at least 3 correct matches to unlock the Final Mastery Test!`}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    {pass ? (
                      <button
                        onClick={() => {
                          saveUnitStageProgress(selectedJourneyUnitId, 4);
                          setNextStageToFocus(5);
                          setActiveStageIndex(null);
                        }}
                        className="w-full btn-gold py-3 px-5 rounded-2xl text-xs font-black uppercase shadow-md cursor-pointer animate-pulse"
                      >
                        Proceed to Stage 5: Mastery Test (+15 XP) 🎉
                      </button>
                    ) : (
                      <button
                        onClick={startStage4Arcade}
                        className="w-full btn-gold py-3.5 px-5 rounded-2xl text-xs font-black uppercase cursor-pointer"
                      >
                        Play Blitz Stage Again
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveStageIndex(null);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full btn-secondary py-3 px-5 rounded-2xl text-xs font-bold cursor-pointer"
                    >
                      Exit Speed Challenge
                    </button>
                  </div>
                </div>
              );
            }

            const currentQ = stageArcadeActiveQ;
            if (!currentQ) return null;

            return (
              <div id="screen-journey-stage-4" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in">
                {/* Header sub block */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3" id="stage4-header">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setStageArcadeOver(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Quit Match</span>
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 rounded-full px-2.5 py-1 flex items-center gap-1 select-none">
                      ⏱️ <span className="font-mono text-indigo-700 font-extrabold">{stageArcadeTime}s</span>
                    </span>
                    <span className="text-xs font-black text-rose-900 bg-rose-50 rounded-full px-2.5 py-1 select-none">
                      ⚡ <span className="font-semibold text-rose-700">{stageArcadeScore} hits</span>
                    </span>
                  </div>
                </div>

                {/* Progress Visual Timer horizontal line bar */}
                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${(stageArcadeTime / 30) * 100}%` }}
                  />
                </div>

                {/* Active challenge focus question */}
                <div className="modern-card p-5 text-center bg-slate-50 border border-slate-200/80 rounded-2xl shadow-inner mt-2 flex flex-col items-center relative">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-left">
                      Speedy translation:
                    </span>
                    {renderMithuHelpBadge(currentQ.entry.digit)}
                  </div>
                  <div className={`text-3xl font-extrabold leading-none py-2 tracking-tight ${
                    appState.showScript && typeof getDisplayPromptValue(currentQ) === "string" && (getDisplayPromptValue(currentQ) as string).match(/[\u0600-\u06FF]/) ? "font-urdu" : ""
                  } ${appState.isDarkMode ? "text-white" : "text-slate-800"}`}>
                    {formatValueForDisplay(getDisplayPromptValue(currentQ))}
                  </div>
                </div>

                {/* Choices choices option grid container */}
                <div className="grid grid-cols-2 gap-3 mt-2" id="stage4-choices-grid">
                  {currentQ.choices.map((choice, index) => {
                    const isSelected = stageArcadeSelected === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    let bStyle = "bg-white border-slate-200 hover:border-slate-350 active:scale-98 text-slate-800";

                    if (stageArcadeAnswered) {
                      if (isCorrectVal) {
                        bStyle = "bg-emerald-500 border-emerald-600 text-white shadow-emerald-200 shadow-md";
                      } else if (isSelected) {
                        bStyle = "bg-rose-500 border-rose-600 text-white shadow-rose-200 shadow-md";
                      } else {
                        bStyle = "bg-slate-50/50 border-slate-100/50 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={index}
                        disabled={stageArcadeAnswered}
                        onClick={() => {
                          const isCorrect = choice === currentQ.correctAnswer;
                          if (isCorrect) {
                            incrementMasteryStreak();
                          } else {
                            resetMasteryStreak();
                          }
                          playSoundSynth(isCorrect ? "correct" : "incorrect");
                          setStageArcadeSelected(choice);
                          setStageArcadeAnswered(true);

                          if (isCorrect) {
                            setStageArcadeScore((s) => s + 1);
                          }

                          // Rapid speed change mechanics (400ms flash gap)
                          setTimeout(() => {
                            setStageArcadeSelected(null);
                            setStageArcadeAnswered(false);
                            const nextQ = makeSingleUnitArcadeQuestion(selectedJourneyUnitId);
                            setStageArcadeActiveQ(nextQ);
                          }, 400);
                        }}
                        className={`py-4 px-3 rounded-2xl border-2 text-center text-base sm:text-lg md:text-xl font-black transition-all flex flex-col items-center justify-center min-h-[72px] cursor-pointer shadow-xs ${bStyle}`}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-2xl font-urdu select-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })()}

        {/* =============================================================================
            SCREEN E: TRAINING ARENA WORKFLOW
            ============================================================================= */}
        {!recoveryState && activeScreen === "training-arena" && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center">
            {(() => {
          const minRange = appState.arenaMin ?? 30;
          const maxRange = appState.arenaMax ?? 100;
          const stageProgress = appState.arenaStageProgress ?? 1;

          // If stage selection mode
          if (arenaActiveStage === null) {
            return (
              <div id="screen-training-arena" className="max-w-md mx-auto w-full p-4 flex flex-col gap-5 animate-fade-in text-slate-800">
                {/* Header block with elegant dark forest color theme */}
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 rounded-[2rem] border-4 border-emerald-800 border-b-[10px] border-b-emerald-955 relative text-white shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />
                  
                  <div className="flex items-center gap-3 relative z-10">
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setActiveScreen("dashboard");
                      }}
                      className="p-2 bg-emerald-950 hover:bg-emerald-800 border-2 border-emerald-700/80 rounded-2xl cursor-pointer transition active:scale-95 text-emerald-300"
                      title="Back to Dashboard"
                    >
                      <ArrowLeft className="w-5 h-5 leading-none" />
                    </button>
                    <div>
                      <h2 className="text-xl font-extrabold text-amber-300 tracking-tight leading-none uppercase font-sans">
                        Combat Arena
                      </h2>
                      <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mt-1">
                        Bilingual Battleground
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 bg-emerald-950/80 rounded-2xl border border-emerald-850 p-3.5 flex flex-col gap-1 relative z-10">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Selected Range Bounds
                    </div>
                    <div className="text-sm font-black flex items-center gap-1.5">
                      <span className="font-mono text-amber-300 text-lg">{minRange}</span>
                      <span className="opacity-60 text-xs">→</span>
                      <span className="font-mono text-lg text-amber-300">{maxRange}</span>
                    </div>
                    <div className="text-[10px] text-emerald-300/80 italic mt-1 leading-relaxed">
                      Unlocked up to Stage {stageProgress} based on performance. Check details below!
                    </div>
                  </div>
                </div>

                {/* Vertical Stage Maps or Timeline */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider font-mono">
                    Training Stage progression
                  </h3>

                  {/* STAGE 1: EXP REINFORCEMEMT REVIEW */}
                  <div className="bg-white border-2 border-slate-200 border-b-[6px] border-b-slate-350 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg select-none border ${
                        appState.isDarkMode 
                          ? "bg-amber-950/40 text-amber-300 border-amber-900/40" 
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        1
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Stage 1: Soundboard Explore</h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">Interactive range visualizer dictionary</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        setArenaActiveStage(1);
                      }}
                      className={`py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all ${
                        appState.isDarkMode 
                          ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                          : "border-2 border-emerald-500 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                      }`}
                    >
                      EXPLORE
                    </button>
                  </div>

                  {/* STAGE 2: TRANSLATION MCQ */}
                  <div className="bg-white border-2 border-slate-200 border-b-[6px] border-b-slate-350 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg select-none border ${
                        appState.isDarkMode 
                          ? "bg-sky-950/40 text-sky-300 border-sky-900/40" 
                          : "bg-sky-100 text-sky-800 border-sky-200"
                      }`}>
                        2
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Stage 2: MCQ Translation Duel</h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">5 multiple-choice matching cards</p>
                      </div>
                    </div>
                    <button
                      onClick={setupArenaStage2Quiz}
                      className="py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black uppercase tracking-wider border-2 border-sky-500 border-b-4 border-b-sky-800 active:translate-y-[2px] active:border-b-2 cursor-pointer transition-all"
                    >
                      START
                    </button>
                  </div>

                  {/* STAGE 3: LISTENING AUDITOR */}
                  <div className={`border-2 rounded-3xl p-4 flex items-center justify-between gap-3 transition-colors ${
                    stageProgress >= 2 
                      ? "bg-white border-slate-200 border-b-[6px] border-b-slate-350 shadow-xs" 
                      : "bg-slate-50/70 border-slate-200/60 border-b-4 border-b-slate-200 opacity-65"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg select-none border ${
                        stageProgress >= 2 
                          ? (appState.isDarkMode ? "bg-indigo-950/40 text-indigo-300 border-indigo-900/40" : "bg-indigo-100 text-indigo-800 border-indigo-200") 
                          : "bg-slate-200 text-slate-400 border-slate-300"
                      }`}>
                        {stageProgress >= 2 ? "3" : <Lock className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-black uppercase tracking-tight ${stageProgress >= 2 ? "text-slate-800" : "text-slate-400"}`}>
                          Stage 3: Ear Trainer Auditory Duel
                        </h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">Listen to numeral, select matching digit</p>
                      </div>
                    </div>
                    <button
                      disabled={stageProgress < 2}
                      onClick={() => {
                        setArenaQuizScore(0);
                        setupArenaStage3Listening();
                      }}
                      className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        stageProgress >= 2 
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 border-b-4 border-b-indigo-800 active:translate-y-[2px] active:border-b-2 cursor-pointer" 
                          : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
                      }`}
                    >
                      START
                    </button>
                  </div>

                  {/* STAGE 4: SPEED BLITZ ARCADE */}
                  <div className={`border-2 rounded-3xl p-4 flex items-center justify-between gap-3 transition-colors ${
                    stageProgress >= 3 
                      ? "bg-white border-slate-200 border-b-[6px] border-b-slate-350 shadow-xs" 
                      : "bg-slate-50/70 border-slate-200/60 border-b-4 border-b-slate-200 opacity-65"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg select-none border ${
                        stageProgress >= 3 
                          ? (appState.isDarkMode ? "bg-rose-950/40 text-rose-300 border-rose-900/40" : "bg-rose-100 text-rose-800 border-rose-200") 
                          : "bg-slate-200 text-slate-400 border-slate-300"
                      }`}>
                        {stageProgress >= 3 ? "4" : <Lock className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-black uppercase tracking-tight ${stageProgress >= 3 ? "text-slate-800" : "text-slate-400"}`}>
                          Stage 4: Stopwatch Countdown Blitz
                        </h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">30 seconds speed reflex time trials</p>
                      </div>
                    </div>
                    <button
                      disabled={stageProgress < 3}
                      onClick={startArenaStage4Arcade}
                      className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        stageProgress >= 3 
                          ? "bg-rose-600 hover:bg-rose-500 text-white border-rose-500 border-b-4 border-b-rose-800 active:translate-y-[2px] active:border-b-2 cursor-pointer" 
                          : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
                      }`}
                    >
                      START
                    </button>
                  </div>

                  {/* STAGE 5: MASTERY GRAND CHAMPIONSHIP */}
                  <div className={`border-2 rounded-3xl p-4 flex items-center justify-between gap-3 transition-colors ${
                    stageProgress >= 4 
                      ? "bg-white border-slate-200 border-b-[6px] border-b-slate-350 shadow-xs" 
                      : "bg-slate-50/70 border-slate-200/60 border-b-4 border-b-slate-200 opacity-65"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg select-none border ${
                        stageProgress >= 4 
                          ? (appState.isDarkMode ? "bg-amber-950/40 text-amber-300 border-amber-900/40" : "bg-amber-100 text-amber-800 border-amber-200") 
                          : "bg-slate-200 text-slate-400 border-slate-300"
                      }`}>
                        {stageProgress >= 4 ? "5" : <Lock className="w-4.5 h-4.5" />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-black uppercase tracking-tight ${stageProgress >= 4 ? "text-slate-800" : "text-slate-400"}`}>
                          Stage 5: Ultimate Mastery Battle
                        </h4>
                        <p className="text-[11px] text-slate-500 font-semibold leading-none mt-1">10 legendary mixed translation trials</p>
                      </div>
                    </div>
                    <button
                      disabled={stageProgress < 4}
                      onClick={setupArenaStage5Mastery}
                      className={`py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                        stageProgress >= 4 
                          ? "bg-amber-500 hover:bg-amber-450 text-emerald-950 border-amber-400 border-b-4 border-b-amber-700 active:translate-y-[2px] active:border-b-2 cursor-pointer" 
                          : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60"
                      }`}
                    >
                      START
                    </button>
                  </div>

                </div>

                <div className="mt-2 text-center text-[10.5px] text-slate-400 font-mono italic">
                  Progress status is updated to Cloud Run container cache instantly.
                </div>
              </div>
            );
          }

          // STAGE 1: INTERACTIVE DECK EXPLORER SCREEN
          if (arenaActiveStage === 1) {
            // Get list of entry records in the range pool
            const rangePool = getArenaNumbersPool();
            return (
              <div id="screen-arena-stage-1" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in text-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 border-b border-slate-100 pb-3 w-full">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setArenaActiveStage(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 cursor-pointer transition flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>Back to Stages</span>
                  </button>
                  <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    STAGE 1: SOUND EXPLORER DECK
                  </span>
                </div>

                <div className="bg-emerald-50 border border-emerald-200/50 rounded-2xl p-4 text-center">
                  <h3 className="text-base font-black text-emerald-900 leading-tight">Interactive Soundboard lookup</h3>
                  <p className="text-[11px] text-emerald-700 leading-normal mt-1">Tap a card to speak out loud. Familiarize bilingual recognition prior to taking translation challenge.</p>
                </div>

                {/* Grid layout of all number cards in subset pool */}
                <div
                  ref={arenaStage1ScrollRef}
                  onScroll={checkArenaScroll}
                  className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pt-3 px-1.5 pb-2 pr-1 border-b border-dashed border-slate-200"
                >
                  {rangePool.map((entry, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        playSoundSynth("click");
                        playWordAudio(entry);
                      }}
                      className="bg-white border-2 border-slate-200 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border-b-[5px] border-b-slate-300 hover:border-b-[4px] p-4 rounded-2xl flex flex-col items-center gap-2 transition-all text-center cursor-pointer group relative"
                    >
                      <span className="font-mono text-2xl font-black text-slate-900 group-hover:text-emerald-700">
                        {entry.digit}
                      </span>
                      <div className="flex flex-col select-none">
                        <span className={`text-xs font-sans font-extrabold tracking-tight leading-none ${
                          appState.isDarkMode ? "text-emerald-300" : "text-indigo-700"
                        }`}>
                          {entry.romanUrdu}
                        </span>
                        {appState.showScript && (
                          <span className={`text-lg font-urdu leading-normal mt-1 block ${
                            appState.isDarkMode ? "text-white" : "text-emerald-700"
                          }`}>
                            {entry.nativeScript}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 w-full justify-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-150 shadow-xs shrink-0 ${
                          appState.isDarkMode 
                            ? "bg-emerald-950/90 hover:bg-emerald-900/90 border border-emerald-800 text-emerald-300" 
                            : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                        }`}>
                          <PremiumSpeakerIcon className={`w-4 h-4 ${
                            appState.isDarkMode ? "text-emerald-300" : "text-emerald-600 group-hover:text-white"
                          }`} />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSoundSynth("click");
                            setMithuExplanationDigit(entry.digit);
                          }}
                          className={`px-2 py-1 border rounded-full text-[9px] font-black flex items-center gap-0.5 hover:scale-105 active:scale-95 transition cursor-pointer select-none shadow-xs ${
                            appState.isDarkMode 
                              ? "bg-emerald-950/90 hover:bg-emerald-900/90 border-emerald-800 text-emerald-300" 
                              : "bg-[#ecfdf5] hover:bg-[#d1fae5] border-emerald-300 text-emerald-800"
                          }`}
                          title="View decoding patterns"
                        >
                          🦜 Clues
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Finish Line Overlay Takeover */}
                {arenaStage1Finished ? (
                  <motion.div
                    key="arena-stage-1-finished-overlay"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50/95 border-2 border-emerald-500 rounded-3xl p-6 text-center shadow-lg flex flex-col items-center justify-center gap-4 mt-2"
                  >
                    <MithuMascot mood="happy" />
                    
                    <h3 className="text-base font-black text-slate-800 leading-tight">
                      You have completed the exploration! 🎉
                    </h3>
                    
                    <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
                      Mithu has recorded your training history. What is your next play?
                    </p>

                    <div className="flex flex-col gap-3 w-full mt-2">
                      {/* Option Button A (Progress Forward) */}
                      <button
                        onClick={() => {
                          playSoundSynth("click");
                          saveArenaStageProgress(1);
                          setArenaStage1Finished(false);
                          setArenaActiveStage(null);
                        }}
                        className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-3.5 px-5 font-black uppercase text-xs tracking-wider cursor-pointer transition-all shadow-md ${
                          appState.isDarkMode 
                            ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                            : "border-2 border-emerald-500 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                        }`}
                      >
                        CONTINUE TO NEXT STAGE
                      </button>

                      {/* Option Button B (Loop Reset Review) */}
                      <button
                        onClick={() => {
                          playSoundSynth("click");
                          setArenaStage1Finished(false);
                          if (arenaStage1ScrollRef.current) {
                            arenaStage1ScrollRef.current.scrollTop = 0;
                          }
                        }}
                        className="w-full bg-white hover:bg-slate-50 text-slate-700 rounded-2xl py-3.5 px-5 font-bold uppercase text-xs tracking-wider border-2 border-slate-200 border-b-4 border-b-slate-300 active:translate-y-[2px] active:border-b-2 cursor-pointer transition-all"
                      >
                        REVIEW EXPLORARENA AGAIN
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center py-2 bg-indigo-50/50 rounded-xl border border-indigo-100/60 mt-1">
                    <span className="text-[10px] text-slate-500 flex items-center justify-center gap-1.5 animate-pulse">
                      ↕️ Scroll all the way to complete this module
                    </span>
                  </div>
                )}
              </div>
            );
          }

          // STAGE 2: TRANSLATION MCQ WORKFLOW
          if (arenaActiveStage === 2) {
            // Check if finished
            if (arenaQuizIdx >= 5) {
              const pass = arenaQuizScore >= 3;
              return (
                <div id="screen-arena-stage-2-end" className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center text-center gap-3 animate-scale-up py-6 sm:py-8 my-auto text-slate-800">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 text-emerald-950 font-black rounded-2xl flex items-center justify-center text-xl border border-amber-300 border-b-4 border-b-amber-700 shadow-md">
                    🏁
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {pass ? "MCQ translation Duel Complete!" : "Need 3 Hits to Clear!"}
                  </h3>
                  
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
                    {pass 
                      ? `Brilliant progress reflexes! You solved ${arenaQuizScore} out of 5 equations correctly and scored +25 XP!`
                      : `You correctly answered ${arenaQuizScore}/5. Retake this trial to unlock the Ear Trainer Auditory Stage.`}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    {pass ? (
                      <button
                        onClick={() => {
                          saveArenaStageProgress(2);
                          setArenaActiveStage(null);
                        }}
                        className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-3 px-5 font-black uppercase text-xs tracking-wider cursor-pointer shadow-md animate-pulse transition-all ${
                          appState.isDarkMode 
                            ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                            : "border-2 border-emerald-500 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                        }`}
                      >
                        Unlock Stage 3: Listening Duel (+25 XP) 🎉
                      </button>
                    ) : (
                      <button
                        onClick={setupArenaStage2Quiz}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white rounded-2xl py-3 px-5 font-black text-xs uppercase cursor-pointer"
                      >
                        Try Challenge Again
                      </button>
                    )}
                    <button
                      onClick={() => setArenaActiveStage(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3 px-5 text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      Exit to Stages Map
                    </button>
                  </div>
                </div>
              );
            }

            const currentQ = arenaQuizQuestions[arenaQuizIdx];
            if (!currentQ) return null;

            return (
              <div id="screen-arena-stage-2" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in text-slate-800 font-sans">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 border-b border-slate-100 pb-3 w-full">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setArenaActiveStage(null);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <span>Quit Challenge</span>
                  </button>
                  <span className="text-xs font-extrabold text-slate-900 bg-slate-100 rounded-full px-2.5 py-1">
                    Question <span className="font-mono text-indigo-700">{arenaQuizIdx + 1}</span> of 5
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${((arenaQuizIdx + 1) / 5) * 100}%` }}
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center shadow-inner mt-2 flex flex-col items-center relative">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-left">
                      Translation match:
                    </span>
                    {renderMithuHelpBadge(currentQ.entry.digit)}
                  </div>
                  <div className={`text-4xl font-extrabold leading-none py-2 tracking-tight ${
                    appState.showScript && typeof getDisplayPromptValue(currentQ) === "string" && (getDisplayPromptValue(currentQ) as string).match(/[\u0600-\u06FF]/) ? "font-urdu" : ""
                  } ${appState.isDarkMode ? "text-white" : "text-slate-800"}`}>
                    {formatValueForDisplay(getDisplayPromptValue(currentQ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {currentQ.choices.map((choice, index) => {
                    const isSelected = arenaQuizSelected === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    
                    let buttonClass = "w-full py-4 px-3 border-2 text-center text-base sm:text-lg md:text-xl font-black transition-all duration-150 flex flex-col items-center justify-center min-h-[72px] cursor-pointer shadow-xs ";

                    if (arenaQuizAnswered) {
                      if (isCorrectVal) {
                        buttonClass += "bg-emerald-500 border-emerald-600 border-b-[2px] text-white shadow-emerald-250 shadow-md rounded-3xl translate-y-0.5";
                      } else if (isSelected) {
                        buttonClass += "bg-rose-500 border-rose-600 border-b-[2px] text-white shadow-rose-250 shadow-md rounded-3xl translate-y-0.5";
                      } else {
                        buttonClass += "bg-slate-50/50 border-slate-100/50 border-b-[2px] text-slate-400 opacity-50 rounded-xl translate-y-0.5";
                      }
                    } else {
                      buttonClass += "bg-white border-slate-200 text-slate-800 border-b-[5px] border-b-slate-300 hover:border-b-[4px] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-[2px] active:scale-[0.98] rounded-xl";
                    }

                    return (
                      <button
                        key={index}
                        disabled={arenaQuizAnswered}
                        onClick={() => {
                          const elapsed = Date.now() - arenaQuestionStartTime;
                          const isCorrect = choice === currentQ.correctAnswer;
                          if (isCorrect) {
                            incrementMasteryStreak();
                          } else {
                            resetMasteryStreak();
                          }
                          playSoundSynth(isCorrect ? "correct" : "incorrect");
                          setArenaQuizSelected(choice);
                          setArenaQuizAnswered(true);

                          if (isCorrect) {
                            setArenaQuizScore((s) => s + 1);
                          } else {
                            setArenaQuizMistakes((prev) => [...prev, currentQ]);
                          }

                          recordArenaResponse(currentQ.entry.digit, isCorrect, elapsed);

                          const latestMistakes = isCorrect 
                            ? arenaQuizMistakes 
                            : [...arenaQuizMistakes, currentQ];

                          // Advance state on delay timer
                          setTimeout(() => {
                            setArenaQuizSelected(null);
                            setArenaQuizAnswered(false);
                            const nextIdx = arenaQuizIdx + 1;
                            if (nextIdx >= 5) {
                              if (latestMistakes.length > 0) {
                                startRecoveryRound("arena_stage2", latestMistakes);
                              } else {
                                setArenaQuizIdx(nextIdx);
                              }
                            } else {
                              setArenaQuizIdx(nextIdx);
                              setArenaQuestionStartTime(Date.now());
                            }
                          }, 1200);
                        }}
                        className={buttonClass}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-2xl font-urdu select-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          // STAGE 3: LISTENING AUDIT DUEL WORKFLOW
          if (arenaActiveStage === 3) {
            // Check if finished
            if (arenaListIdx >= 5) {
              const pass = arenaQuizScore >= 3;
              return (
                <div id="screen-arena-stage-3-end" className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center text-center gap-3 animate-scale-up py-6 sm:py-8 my-auto text-slate-800">
                  <div className="w-12 h-12 bg-indigo-105 rounded-2xl flex items-center justify-center text-indigo-750 border border-indigo-200 mb-1 shadow-sm">
                    {pass ? (
                      <Star className="w-6 h-6 fill-indigo-300 text-indigo-600 animate-spin-once" />
                    ) : (
                      <Lock className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                    {pass ? "Auditory Training Duel Complete!" : "Need 3 Hits to Clear!"}
                  </h3>
                  
                  <p className="text-xs text-slate-505 max-w-xs leading-relaxed font-semibold">
                    {pass 
                      ? `Fantastic matching reflexes! You correctly translated ${arenaQuizScore} spoken Urdu numerals and scored +25 XP!`
                      : `You finished with ${arenaQuizScore}/5 matches. Practice some more then retry the Listening Duel.`}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    {pass ? (
                      <button
                        onClick={() => {
                          saveArenaStageProgress(3);
                          setArenaActiveStage(null);
                        }}
                        className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-3 px-5 font-black uppercase text-xs tracking-wider cursor-pointer shadow-md animate-pulse transition-all ${
                          appState.isDarkMode 
                            ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                            : "border-2 border-emerald-500 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                        }`}
                      >
                        Unlock Stage 4: Speed Blitz (+25 XP) 🎉
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setArenaQuizScore(0);
                          setupArenaStage3Listening();
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl py-3 px-5 font-black text-xs uppercase cursor-pointer"
                      >
                        Try Challenge Again
                      </button>
                    )}
                    <button
                      onClick={() => setArenaActiveStage(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3 px-5 text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      Exit to Stages Map
                    </button>
                  </div>
                </div>
              );
            }

            const currentQ = arenaListQuestions[arenaListIdx];
            if (!currentQ) return null;

            return (
              <div id="screen-arena-stage-3" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in text-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 border-b border-slate-100 pb-3 w-full">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setArenaActiveStage(null);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <span>Quit Challenge</span>
                  </button>
                  <span className="text-xs font-extrabold text-slate-900 bg-slate-100 rounded-full px-2.5 py-1">
                    Question <span className="font-mono text-indigo-700">{arenaListIdx + 1}</span> of 5
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${((arenaListIdx + 1) / 5) * 100}%` }}
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-center shadow-inner mt-2 flex flex-col items-center relative">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest text-left">
                      Listening comprehension:
                    </span>
                    {renderMithuHelpBadge(currentQ.entry.digit)}
                  </div>
                  
                  {/* Clean layout container with outline removed as requested */}
                  <div className="flex items-center justify-center py-2.5 mt-1 mb-2">
                    <button
                      onClick={() => {
                        playSoundSynth("click");
                        playWordAudio(currentQ.entry);
                        setArenaListSpeakerAnimate(true);
                        const timer = setTimeout(() => {
                           setArenaListSpeakerAnimate(false);
                        }, 1200);
                      }}
                      className="w-20 h-20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center border-2 border-indigo-400 border-b-[6px] border-b-indigo-850 transition-all duration-100 active:translate-y-[4.5px] active:border-b-2 cursor-pointer shadow-lg select-none"
                      title="Speak Spoken Numeral"
                    >
                      <PremiumSpeakerIcon className={`w-9 h-9 text-white ${arenaListSpeakerAnimate ? 'animate-bounce' : ''}`} />
                    </button>
                  </div>
                  <span className="text-[10px] text-indigo-550 dark:text-indigo-400 font-extrabold uppercase tracking-widest mt-3.5 block animate-pulse">
                    REPLAY NUMERAL
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {currentQ.choices.map((choice, index) => {
                    const isSelected = arenaListSelected === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    
                    let buttonClass = "w-full py-4.5 px-3 border-2 text-center text-lg font-mono font-black transition-all duration-150 flex flex-col items-center justify-center min-h-[72px] cursor-pointer shadow-xs ";

                    if (arenaListAnswered) {
                      if (isCorrectVal) {
                        buttonClass += "bg-emerald-500 border-emerald-600 border-b-[2px] text-white shadow-emerald-250 shadow-md rounded-3xl translate-y-0.5";
                      } else if (isSelected) {
                        buttonClass += "bg-rose-500 border-rose-600 border-b-[2px] text-white shadow-rose-250 shadow-md rounded-3xl translate-y-0.5";
                      } else {
                        buttonClass += "bg-slate-50/50 border-slate-100/50 border-b-[2px] text-slate-400 opacity-50 rounded-xl translate-y-0.5";
                      }
                    } else {
                      buttonClass += "bg-white border-slate-200 text-slate-800 border-b-[5px] border-b-slate-300 hover:border-b-[4px] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-[2px] active:scale-[0.98] rounded-xl";
                    }

                    return (
                      <button
                        key={index}
                        disabled={arenaListAnswered}
                        onClick={() => {
                          const elapsed = Date.now() - arenaQuestionStartTime;
                          const isCorrect = choice === currentQ.correctAnswer;
                          if (isCorrect) {
                            incrementMasteryStreak();
                          } else {
                            resetMasteryStreak();
                          }
                          playSoundSynth(isCorrect ? "correct" : "incorrect");
                          setArenaListSelected(choice);
                          setArenaListAnswered(true);

                          if (isCorrect) {
                            setArenaQuizScore((s) => s + 1);
                          } else {
                            setArenaListMistakes((prev) => [...prev, currentQ]);
                          }

                          recordArenaResponse(currentQ.entry.digit, isCorrect, elapsed);

                          const latestMistakes = isCorrect 
                            ? arenaListMistakes 
                            : [...arenaListMistakes, currentQ];

                          // Advance state on delay timer
                          setTimeout(() => {
                            setArenaListSelected(null);
                            setArenaListAnswered(false);
                            const nextIdx = arenaListIdx + 1;
                            if (nextIdx >= 5) {
                              if (latestMistakes.length > 0) {
                                startRecoveryRound("arena_stage3", latestMistakes);
                              } else {
                                setArenaListIdx(nextIdx);
                              }
                            } else {
                              setArenaListIdx(nextIdx);
                              setArenaQuestionStartTime(Date.now());
                            }
                          }, 1200);
                        }}
                        className={buttonClass}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          // STAGE 4: SPEED ARCADE BLITZ TIME TRIAL WORKFLOW
          if (arenaActiveStage === 4) {
            if (arenaArcadeOver) {
              const pass = arenaArcadeScore >= 3;
              return (
                <div id="screen-arena-stage-4-end" className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center text-center gap-3 animate-scale-up py-6 sm:py-8 my-auto text-slate-800">
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl flex items-center justify-center text-white border-2 border-rose-455 border-b-4 border-b-rose-900 shadow-sm">
                    {pass ? (
                      <Star className="w-6 h-6 fill-rose-200 text-white animate-bounce" />
                    ) : (
                      <Lock className="w-6 h-6 text-white/80" />
                    )}
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 pb-1 leading-tight">
                    {pass ? "Stopwatch Blitz Completed!" : "Need 3 Hits to Clear!"}
                  </h3>
                  
                  <p className="text-xs text-slate-505 max-w-xs leading-relaxed font-semibold">
                    {pass 
                      ? `Phenomenal reflex translation! You completed the run scoring ${arenaArcadeScore} correct matches in 30s!`
                      : `You finished with ${arenaArcadeScore} hits. Reach at least 3 correct matches to pass Ginti's Stopwatch evaluation.`}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    {pass ? (
                      <button
                        onClick={() => {
                          saveArenaStageProgress(4);
                          setArenaActiveStage(null);
                        }}
                        className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-3 px-5 font-black uppercase text-xs tracking-wider cursor-pointer shadow-md animate-pulse transition-all ${
                          appState.isDarkMode 
                            ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                            : "border-2 border-emerald-500 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                        }`}
                      >
                        Proceed to Stage 5: Mastery Battle (+25 XP) 🎉
                      </button>
                    ) : (
                      <button
                        onClick={startArenaStage4Arcade}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-2xl py-3 px-5 font-black text-xs uppercase cursor-pointer"
                      >
                        Play Speed Blitz Again
                      </button>
                    )}
                    <button
                      onClick={() => setArenaActiveStage(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3 px-5 text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      Exit to Stages Map
                    </button>
                  </div>
                </div>
              );
            }

            const currentQ = arenaArcadeActiveQ;
            if (!currentQ) return null;

            return (
              <div id="screen-arena-stage-4" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in text-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 border-b border-slate-100 pb-3 w-full">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setArenaArcadeOver(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <span>Quit Match</span>
                  </button>
                  <div className="flex items-center gap-3 justify-center">
                    <span className="text-xs font-black text-slate-900 bg-slate-100 rounded-full px-2.5 py-1 flex items-center gap-1 select-none">
                      ⏱️ <span className="font-mono text-rose-600 font-extrabold">{arenaArcadeTime}s</span>
                    </span>
                    <span className="text-xs font-black text-emerald-950 bg-emerald-50 rounded-full px-2.5 py-1 select-none">
                      🔥 <span className="font-semibold text-emerald-700">{arenaArcadeScore} hits</span>
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${(arenaArcadeTime / 30) * 100}%` }}
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200/85 rounded-2xl p-5 text-center shadow-inner mt-2 flex flex-col items-center relative">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-left">
                      Speed blitz match:
                    </span>
                    {renderMithuHelpBadge(currentQ.entry.digit)}
                  </div>
                  <div className={`text-3xl font-extrabold leading-none py-2 tracking-tight ${
                    appState.showScript && typeof getDisplayPromptValue(currentQ) === "string" && (getDisplayPromptValue(currentQ) as string).match(/[\u0600-\u06FF]/) ? "font-urdu" : ""
                  } ${appState.isDarkMode ? "text-white" : "text-slate-800"}`}>
                    {formatValueForDisplay(getDisplayPromptValue(currentQ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {currentQ.choices.map((choice, index) => {
                    const isSelected = arenaArcadeSelected === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    
                    let buttonClass = "w-full py-4 px-3 border-2 text-center text-base sm:text-lg md:text-xl font-black transition-all duration-150 flex flex-col items-center justify-center min-h-[72px] cursor-pointer shadow-xs ";

                    if (arenaArcadeAnswered) {
                      if (isCorrectVal) {
                        buttonClass += "bg-emerald-500 border-emerald-600 border-b-[2px] text-white shadow-emerald-200 shadow-md rounded-3xl translate-y-0.5";
                      } else if (isSelected) {
                        buttonClass += "bg-rose-500 border-rose-600 border-b-[2px] text-white shadow-rose-200 shadow-md rounded-3xl translate-y-0.5";
                      } else {
                        buttonClass += "bg-slate-50/50 border-slate-100/50 border-b-[2px] text-slate-400 opacity-50 rounded-xl translate-y-0.5";
                      }
                    } else {
                      buttonClass += "bg-white border-slate-200 text-slate-800 border-b-[5px] border-b-slate-300 hover:border-b-[4px] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-[2px] active:scale-[0.98] rounded-xl";
                    }

                    return (
                      <button
                        key={index}
                        disabled={arenaArcadeAnswered}
                        onClick={() => {
                          const isCorrect = choice === currentQ.correctAnswer;
                          if (isCorrect) {
                            incrementMasteryStreak();
                          } else {
                            resetMasteryStreak();
                          }
                          playSoundSynth(isCorrect ? "correct" : "incorrect");
                          setArenaArcadeSelected(choice);
                          setArenaArcadeAnswered(true);

                          if (isCorrect) {
                            setArenaArcadeScore((s) => s + 1);
                          }

                          // Rapid speed change mechanics (400ms flash gap)
                          setTimeout(() => {
                            setArenaArcadeSelected(null);
                            setArenaArcadeAnswered(false);
                            const nextQ = makeSingleArenaArcadeQuestion();
                            setArenaArcadeActiveQ(nextQ);
                          }, 400);
                        }}
                        className={buttonClass}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-2xl font-urdu select-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          // STAGE 5: ULTRA MASTERY GRAND FINAL BATTLE
          if (arenaActiveStage === 5) {
            // Check if finished (10 questions total)
            if (arenaQuizIdx >= 10) {
              const pass = arenaQuizScore >= 7;
              return (
                <div id="screen-arena-stage-5-end" className="max-w-md mx-auto w-full p-4 flex-1 flex flex-col items-center justify-center text-center gap-3 animate-scale-up py-6 sm:py-8 my-auto text-slate-800">
                  <div className="w-14 h-14 bg-amber-400 text-emerald-950 rounded-full flex items-center justify-center text-xl border border-amber-300 border-b-4 border-b-amber-700 shadow-md transform hover:rotate-6 transition select-none animate-bounce">
                    🏆
                  </div>

                  <h3 className="text-xl font-black text-slate-900 font-extrabold leading-tight">
                    {pass ? "Grand Final Mastery Completed! 🎉" : "Need 7 Correct Answers to Master!"}
                  </h3>
                  
                  <p className="text-xs text-slate-505 max-w-xs leading-relaxed font-semibold">
                    {pass 
                      ? `Incredible! You solved ${arenaQuizScore}/10 mixed trials and achieved total Ginti range mastery for ${minRange} → ${maxRange}! Awarded +100 bonus XP!`
                      : `You correctly answered ${arenaQuizScore}/10 questions. Review some elements in Stage 1 and retake the Final Battle.`}
                  </p>

                  <div className="flex flex-col gap-2.5 w-full mt-2">
                    {pass ? (
                      <button
                        onClick={() => {
                          playSoundSynth("levelUp");
                          saveArenaStageProgress(5);
                          setArenaActiveStage(null);
                        }}
                        className={`w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl py-3 px-5 font-black uppercase text-xs tracking-wider cursor-pointer shadow-md transition-all ${
                          appState.isDarkMode 
                            ? "border-2 border-emerald-800 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2" 
                            : "border-2 border-emerald-500 border-b-4 border-b-emerald-800 active:translate-y-[2px] active:border-b-2"
                        }`}
                      >
                        Claim Mastery Badge & Trophy (+100 XP) 🏆
                      </button>
                    ) : (
                      <button
                        onClick={setupArenaStage5Mastery}
                        className="w-full bg-amber-500 hover:bg-amber-450 text-emerald-950 rounded-2xl py-3 px-5 font-black text-xs uppercase cursor-pointer"
                      >
                        Fight Final Battle Again
                      </button>
                    )}
                    <button
                      onClick={() => setArenaActiveStage(null)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3 px-5 text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      Exit to Stages Map
                    </button>
                  </div>
                </div>
              );
            }

            const currentQ = arenaQuizQuestions[arenaQuizIdx];
            if (!currentQ) return null;

            return (
              <div id="screen-arena-stage-5" className="max-w-md mx-auto w-full p-4 flex flex-col gap-4 animate-fade-in text-slate-800">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 border-b border-slate-100 pb-3 w-full">
                  <button
                    onClick={() => {
                      playSoundSynth("click");
                      setArenaActiveStage(null);
                    }}
                    className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 bg-slate-50 border border-slate-200/50 flex items-center gap-1 cursor-pointer hover:bg-slate-100"
                  >
                    <span>Quit Challenge</span>
                  </button>
                  <span className="text-xs font-extrabold text-slate-900 bg-slate-100 rounded-full px-2.5 py-1">
                    Battle <span className="font-mono text-amber-600 font-extrabold">{arenaQuizIdx + 1}</span> of 10
                  </span>
                </div>

                <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden border border-slate-300/40">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${((arenaQuizIdx + 1) / 10) * 100}%` }}
                  />
                </div>

                <div className="bg-slate-50 border border-slate-205 rounded-2xl p-5 text-center shadow-inner mt-2 flex flex-col items-center relative">
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest text-left">
                      Mixed mastery trial:
                    </span>
                    {renderMithuHelpBadge(currentQ.entry.digit)}
                  </div>
                  <div className={`text-4xl font-extrabold leading-none py-2 tracking-tight ${
                    appState.showScript && typeof getDisplayPromptValue(currentQ) === "string" && (getDisplayPromptValue(currentQ) as string).match(/[\u0600-\u06FF]/) ? "font-urdu" : ""
                  } ${appState.isDarkMode ? "text-white" : "text-slate-800"}`}>
                    {formatValueForDisplay(getDisplayPromptValue(currentQ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  {currentQ.choices.map((choice, index) => {
                    const isSelected = arenaQuizSelected === choice;
                    const isCorrectVal = choice === currentQ.correctAnswer;
                    
                    let buttonClass = "w-full py-4 px-3 border-2 text-center text-base sm:text-lg md:text-xl font-black transition-all duration-150 flex flex-col items-center justify-center min-h-[72px] cursor-pointer shadow-xs ";

                    if (arenaQuizAnswered) {
                      if (isCorrectVal) {
                        buttonClass += "bg-emerald-500 border-emerald-600 border-b-[2px] text-white shadow-emerald-250 shadow-md rounded-3xl translate-y-0.5";
                      } else if (isSelected) {
                        buttonClass += "bg-rose-500 border-rose-600 border-b-[2px] text-white shadow-rose-250 shadow-md rounded-3xl translate-y-0.5";
                      } else {
                        buttonClass += "bg-slate-50/50 border-slate-100/50 border-b-[2px] text-slate-400 opacity-50 rounded-xl translate-y-0.5";
                      }
                    } else {
                      buttonClass += "bg-white border-slate-200 text-slate-800 border-b-[5px] border-b-slate-300 hover:border-b-[4px] hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-[2px] active:scale-[0.98] rounded-xl";
                    }

                    return (
                      <button
                        key={index}
                        disabled={arenaQuizAnswered}
                        onClick={() => {
                          const elapsed = Date.now() - arenaQuestionStartTime;
                          const isCorrect = choice === currentQ.correctAnswer;
                          if (isCorrect) {
                            incrementMasteryStreak();
                          } else {
                            resetMasteryStreak();
                          }
                          playSoundSynth(isCorrect ? "correct" : "incorrect");
                          setArenaQuizSelected(choice);
                          setArenaQuizAnswered(true);

                          if (isCorrect) {
                            setArenaQuizScore((s) => s + 1);
                          } else {
                            setArenaQuizMistakes((prev) => [...prev, currentQ]);
                          }

                          recordArenaResponse(currentQ.entry.digit, isCorrect, elapsed);

                          const latestMistakes = isCorrect 
                            ? arenaQuizMistakes 
                            : [...arenaQuizMistakes, currentQ];

                          // Advance state on delay timer
                          setTimeout(() => {
                            setArenaQuizSelected(null);
                            setArenaQuizAnswered(false);
                            const nextIdx = arenaQuizIdx + 1;
                            if (nextIdx >= 10) {
                              if (latestMistakes.length > 0) {
                                startRecoveryRound("arena_stage5", latestMistakes);
                              } else {
                                setArenaQuizIdx(nextIdx);
                              }
                            } else {
                              setArenaQuizIdx(nextIdx);
                              setArenaQuestionStartTime(Date.now());
                            }
                          }, 1200);
                        }}
                        className={buttonClass}
                      >
                        <span className={appState.showScript && typeof choice === 'string' && choice.match(/[\u0600-\u06FF]/) ? 'text-2xl font-urdu select-none' : ''}>
                          {formatValueForDisplay(choice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          }

          return null;
        })()}
          </div>
        )}

        </AnimatePresence>
      </main>

      {/* =============================================================================
          GLOBAL SYSTEM STATUTORY FOOTER
          ============================================================================= */}
      <footer className={`py-4 px-4 md:px-8 mt-12 border-t text-center text-xs transition-all duration-300 ${
        appState.isDarkMode 
          ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-300/70" 
          : "bg-slate-50 border-slate-200 text-slate-500"
      }`}>
        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <button
            onClick={() => setAboutExpanded(!aboutExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-[11px] uppercase tracking-wider cursor-pointer transition-all ${
              appState.isDarkMode 
                ? "bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-800/60" 
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs"
            }`}
          >
            <Info className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10" />
            <span>{aboutExpanded ? "Hide Details" : "About Ginti"}</span>
            <svg 
              className={`w-3 h-3 transition-transform duration-200 ${aboutExpanded ? "rotate-180" : ""}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <AnimatePresence>
            {aboutExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden w-full"
              >
                <div className={`mt-4 pt-4 border-t text-left text-[11px] sm:text-xs space-y-3 leading-relaxed max-w-md mx-auto ${
                  appState.isDarkMode ? "border-emerald-900/40 text-emerald-300/85" : "border-slate-200 text-slate-600"
                }`}>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                    <span>🌿</span>
                    <span>About Ginti</span>
                  </div>
                  <p>
                    Learn Urdu numbers through practice, pattern recognition, and rapid recall challenges.
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10.5px] sm:text-[11px] font-medium pt-1">
                    <div>
                      <span className="text-slate-400 dark:text-emerald-500/75 font-semibold">Version:</span> 1.0
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-500/75 font-semibold">Built with</span> AI-assisted development
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-500/75 font-semibold">GitHub:</span> <a href="https://github.com/5uleman" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-500 transition-colors">5uleman</a>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-emerald-500/75 font-semibold">Intellectual Property:</span> © 2026 Ginti
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`text-[10px] tracking-wide mt-2 ${appState.isDarkMode ? "text-emerald-500/60" : "text-slate-400"}`}>
            © 2026 Ginti. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
