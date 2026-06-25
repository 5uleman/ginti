// Structured Urdu Ginti numbers explanation dataset and decoder helper.
// This is designed to be future-proof and easy to maintain.

export interface NumberExplanation {
  digit: number;
  word: string;
  prefix: string;         // e.g. "Ba"
  prefixMeaning: string;  // e.g. "2 clue"
  suffix: string;         // e.g. "Nawey"
  suffixMeaning: string;  // e.g. "90 family"
  familyId: string;       // e.g. "nawey", "tees", etc.
  simpleExplanation: string;
  mithuHeader: string;
}

// Colors associated with each family for the Color-Coded Learning Requirement
export interface FamilyStyle {
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  colorName: string; // Tailwind class description
}

export const FAMILY_STYLES: Record<string, FamilyStyle> = {
  dahae: {
    name: "10s Family",
    badgeBg: "bg-yellow-50/95",
    badgeText: "text-yellow-800",
    badgeBorder: "border-yellow-200",
    colorName: "yellow",
  },
  ees: {
    name: "20s Family",
    badgeBg: "bg-purple-50/95",
    badgeText: "text-purple-800",
    badgeBorder: "border-purple-200",
    colorName: "purple",
  },
  tees: {
    name: "30s Family",
    badgeBg: "bg-violet-50/95",
    badgeText: "text-violet-800",
    badgeBorder: "border-violet-200",
    colorName: "violet",
  },
  chalees: {
    name: "40s Family",
    badgeBg: "bg-emerald-50/95",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-200",
    colorName: "emerald",
  },
  awan: {
    name: "50s Family",
    badgeBg: "bg-orange-50/95",
    badgeText: "text-orange-850",
    badgeBorder: "border-orange-200",
    colorName: "orange",
  },
  sath: {
    name: "60s Family",
    badgeBg: "bg-teal-50/95",
    badgeText: "text-teal-800",
    badgeBorder: "border-teal-200",
    colorName: "teal",
  },
  hattar: {
    name: "70s Family",
    badgeBg: "bg-fuchsia-50/95",
    badgeText: "text-fuchsia-800",
    badgeBorder: "border-fuchsia-200",
    colorName: "fuchsia",
  },
  asi: {
    name: "80s Family",
    badgeBg: "bg-rose-50/95",
    badgeText: "text-rose-800",
    badgeBorder: "border-rose-200",
    colorName: "rose",
  },
  nawey: {
    name: "90s Family",
    badgeBg: "bg-amber-50/95",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-200",
    colorName: "amber",
  },
  single: {
    name: "Basic Digit",
    badgeBg: "bg-slate-50/95",
    badgeText: "text-slate-800",
    badgeBorder: "border-slate-200",
    colorName: "slate",
  },
};

// Static override dataset for typical tricky/example numbers
const STATIC_EXPLANATIONS: Record<number, Partial<NumberExplanation>> = {
  33: {
    word: "Taintees",
    prefix: "Tain",
    prefixMeaning: "3 clue",
    suffix: "Tees",
    suffixMeaning: "30 family",
    familyId: "tees",
    simpleExplanation: "Tees 30 family hai. Tan 3 ka clue hai.",
    mithuHeader: "Taintees ko dekho 👀",
  },
  46: {
    word: "Chhiyalees",
    prefix: "Chhiya",
    prefixMeaning: "6 clue",
    suffix: "Lees",
    suffixMeaning: "40 family",
    familyId: "chalees",
    simpleExplanation: "Lees (Chalees) 40 family hai. Chhiya 6 ka clue hai.",
    mithuHeader: "Chhiyalees ko dekho 👀",
  },
  51: {
    word: "Ikawan",
    prefix: "Ik",
    prefixMeaning: "1 clue",
    suffix: "Awan",
    suffixMeaning: "50 family",
    familyId: "awan",
    simpleExplanation: "Ik 1 ka clue hai. Awan 50 family hai.",
    mithuHeader: "Iska clue pakro 👀",
  },
  68: {
    word: "Arsath",
    prefix: "Ar",
    prefixMeaning: "8 clue",
    suffix: "Sath",
    suffixMeaning: "60 family",
    familyId: "sath",
    simpleExplanation: "Ar 8 ka clue hai. Sath 60 family hai.",
    mithuHeader: "End pe dhyan do 👀",
  },
  69: {
    word: "Unhattar",
    prefix: "Un",
    prefixMeaning: "1 less",
    suffix: "Hattar",
    suffixMeaning: "70 family",
    familyId: "hattar",
    simpleExplanation: "Hattar 70 family hai. Un ka matlab hai 1 kam.",
    mithuHeader: "Unhattar ko samjho 👀",
  },
  92: {
    word: "Banawey",
    prefix: "Ba",
    prefixMeaning: "2 clue",
    suffix: "Nawey",
    suffixMeaning: "90 family",
    familyId: "nawey",
    simpleExplanation: "Ba 2 ka clue hai. Nawey 90 family hai.",
    mithuHeader: "Word ko tod ke dekho 👀",
  },
};

// Algorithmic generator for any number 1-100 to make the feature 100% complete and future-proof!
export function getNumberExplanation(digit: number, wordFromData?: string): NumberExplanation {
  // If static override exists, return it merged with defaults
  const word = wordFromData || "Number";
  const base: NumberExplanation = {
    digit,
    word,
    prefix: "Word",
    prefixMeaning: "Digit",
    suffix: "Ginti",
    suffixMeaning: "Number",
    familyId: "single",
    simpleExplanation: "Ginti seekhein aur apna flame roshan karein!",
    mithuHeader: `${word} ko dekho 👀`,
  };

  if (STATIC_EXPLANATIONS[digit]) {
    return { ...base, ...STATIC_EXPLANATIONS[digit] } as NumberExplanation;
  }

  // Check for "Un" numbers: 19, 29, 39, 49, 59, 69, 79
  if ([19, 29, 39, 49, 59, 69, 79].includes(digit)) {
    let suffix = "";
    let suffixMeaning = "";
    let familyId = "";
    let simpleExplanation = "";
    
    if (digit === 19) {
      suffix = "Nees";
      suffixMeaning = "20 family suffix (Ees)";
      familyId = "ees";
      simpleExplanation = "Un ka matlab hai 1 kam. Nees 20 family (Ees) ka suffix pattern hai, jo 20 (Bees) se 1 kam yaani 19 ko show karta hai.";
    } else if (digit === 29) {
      suffix = "Tees";
      suffixMeaning = "30 family suffix (Tees)";
      familyId = "tees";
      simpleExplanation = "Un ka matlab hai 1 kam. Tees 30 family (Tees) ka suffix pattern hai, jo 30 se 1 kam yaani 29 ko show karta hai.";
    } else if (digit === 39) {
      suffix = "Talees";
      suffixMeaning = "40 family suffix (Lees)";
      familyId = "chalees";
      simpleExplanation = "Un ka matlab hai 1 kam. Talees 40 family (Chalees) ka suffix pattern hai, jo 40 se 1 kam yaani 39 ko show karta hai.";
    } else if (digit === 49) {
      suffix = "Chaas";
      suffixMeaning = "50 family suffix (Awan)";
      familyId = "awan";
      simpleExplanation = "Un ka matlab hai 1 kam. Chaas 50 family (Awan) ka suffix pattern hai, jo 50 se 1 kam yaani 49 ko show karta hai.";
    } else if (digit === 59) {
      const exactWord = word.toLowerCase();
      suffix = exactWord.endsWith("saat") ? "Saat" : "Sath";
      suffixMeaning = "60 family suffix (Sath)";
      familyId = "sath";
      simpleExplanation = `Un ka matlab hai 1 kam. ${suffix} 60 family (Sath) ka suffix pattern hai, jo 60 se 1 kam yaani 59 ko show karta hai.`;
    } else if (digit === 69) {
      suffix = "Hattar";
      suffixMeaning = "70 family suffix (Hattar)";
      familyId = "hattar";
      simpleExplanation = "Un ka matlab hai 1 kam. Hattar 70 family (Hattar) ka suffix pattern hai, jo 70 se 1 kam yaani 69 ko show karta hai.";
    } else if (digit === 79) {
      suffix = "Asi";
      suffixMeaning = "80 family suffix (Asi)";
      familyId = "asi";
      simpleExplanation = "Un ka matlab hai 1 kam. Asi 80 family (Asi) ka suffix pattern hai, jo 80 se 1 kam yaani 79 ko show karta hai.";
    }

    return {
      digit,
      word,
      prefix: "Un",
      prefixMeaning: "1 less",
      suffix,
      suffixMeaning,
      familyId,
      simpleExplanation,
      mithuHeader: `${word} ko samjho 👀`,
    };
  }

  // Generate dynamic analysis based on numeric properties
  if (digit >= 90 && digit <= 99) {
    const prefixes: Record<number, string> = {
      90: "Naw", 91: "Ikya", 92: "Ba", 93: "Tirya", 94: "Chaura", 95: "Pacha", 96: "Chhiya", 97: "Satta", 98: "Attha", 99: "Ninya"
    };
    const prefixClues: Record<number, string> = {
      90: "90 core", 91: "1 clue", 92: "2 clue", 93: "3 clue", 94: "4 clue", 95: "5 clue", 96: "6 clue", 97: "7 clue", 98: "8 clue", 99: "9 clue"
    };
    const pref = prefixes[digit] || "Ba";
    const clu = prefixClues[digit] || "Digit clue";
    const isNinety = digit === 90;
    
    const suffix = isNinety ? "ey" : "nawey";
    const capSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: capSuffix,
      suffixMeaning: "90 family suffix (Nawey)",
      familyId: "nawey",
      simpleExplanation: `${pref} ${clu} hai. ${capSuffix} 90 family (Nawey) ka suffix pattern hai.`,
      mithuHeader: "Word ko tod ke dekho 👀",
    };
  }

  if (digit >= 80 && digit <= 89) {
    const prefixes: Record<number, string> = {
      80: "As", 81: "Iky", 82: "By", 83: "Tir", 84: "Chaur", 85: "Pach", 86: "Chhiy", 87: "Satt", 88: "Atth", 89: "Naw"
    };
    const prefixClues: Record<number, string> = {
      80: "80 core", 81: "1 clue", 82: "2 clue", 83: "3 clue", 84: "4 clue", 85: "5 clue", 86: "6 clue", 87: "7 clue", 88: "8 clue", 89: "9 clue"
    };
    const pref = prefixes[digit] || "Asi";
    const clu = prefixClues[digit] || "Digit clue";
    const isEighty = digit === 80;
    
    const suffix = isEighty ? "i" : "asi";
    const capSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: capSuffix,
      suffixMeaning: "80 family suffix (Asi)",
      familyId: "asi",
      simpleExplanation: `${pref} ${clu} hai. ${capSuffix} 80 family (Asi) ka suffix pattern hai.`,
      mithuHeader: "Word ko tod ke dekho 👀",
    };
  }

  if (digit >= 70 && digit <= 79) {
    const prefixes: Record<number, string> = {
      70: "Sat", 71: "Iky", 72: "Bah", 73: "Tir", 74: "Chauh", 75: "Pach", 76: "Chhih", 77: "Sath", 78: "Atth"
    };
    const prefixClues: Record<number, string> = {
      70: "70 core", 71: "1 clue", 72: "2 clue", 73: "3 clue", 74: "4 clue", 75: "5 clue", 76: "6 clue", 77: "7 clue", 78: "8 clue"
    };
    const pref = prefixes[digit] || "Tar";
    const clu = prefixClues[digit] || "Digit clue";
    const isSeventy = digit === 70;
    
    const suffix = isSeventy ? "tar" : "hattar";
    const capSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: capSuffix,
      suffixMeaning: "70 family suffix (Hattar)",
      familyId: "hattar",
      simpleExplanation: `${pref} ${clu} hai. ${capSuffix} 70 family (Hattar) ka suffix pattern hai.`,
      mithuHeader: "Word ko tod ke dekho 👀",
    };
  }

  if (digit >= 60 && digit <= 69) {
    const prefixes: Record<number, string> = {
      60: "Sa", 61: "Iks", 62: "Bas", 63: "Tirs", 64: "Chaus", 65: "Pans", 66: "Chhias", 67: "Sats", 68: "Ar"
    };
    const prefixClues: Record<number, string> = {
      60: "60 core", 61: "1 clue", 62: "2 clue", 63: "3 clue", 64: "4 clue", 65: "5 clue", 66: "6 clue", 67: "7 clue", 68: "8 clue"
    };
    const pref = prefixes[digit] || "Sa";
    const clu = prefixClues[digit] || "Digit clue";
    const isSixty = digit === 60;
    
    const suffix = isSixty ? "th" : "ath";
    const capSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: capSuffix,
      suffixMeaning: "60 family suffix (Sath)",
      familyId: "sath",
      simpleExplanation: `${pref} ${clu} hai. ${capSuffix} 60 family (Sath) ka suffix pattern hai.`,
      mithuHeader: "End pe dhyan do 👀",
    };
  }

  if (digit >= 50 && digit <= 59) {
    const prefixes: Record<number, string> = {
      50: "Pach", 51: "Ik", 52: "Baw", 53: "Tirp", 54: "Chauw", 55: "Pachp", 56: "Chhapp", 57: "Satt", 58: "Atth"
    };
    const prefixClues: Record<number, string> = {
      50: "50 core", 51: "1 clue", 52: "2 clue", 53: "3 clue", 54: "4 clue", 55: "5 clue", 56: "6 clue", 57: "7 clue", 58: "8 clue"
    };
    const pref = prefixes[digit] || "Baw";
    const clu = prefixClues[digit] || "Digit clue";
    const isFifty = digit === 50;
    
    const suffix = isFifty ? "as" : "awan";
    const capSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: capSuffix,
      suffixMeaning: "50 family suffix (Awan)",
      familyId: "awan",
      simpleExplanation: `${pref} ${clu} hai. ${capSuffix} 50 family (Awan) ka suffix pattern hai.`,
      mithuHeader: "Iska clue pakro 👀",
    };
  }

  if (digit >= 40 && digit <= 49) {
    const prefixes: Record<number, string> = {
      40: "Cha", 41: "Ikta", 42: "Beta", 43: "Tainta", 44: "Chawa", 45: "Painta", 46: "Chhiya", 47: "Sainta", 48: "Atthta"
    };
    const prefixClues: Record<number, string> = {
      40: "40 core", 41: "1 clue", 42: "2 clue", 43: "3 clue", 44: "4 clue", 45: "5 clue", 46: "6 clue", 47: "7 clue", 48: "8 clue"
    };
    const pref = prefixes[digit] || "Cha";
    const clu = prefixClues[digit] || "Digit clue";

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: "Lees",
      suffixMeaning: "40 family suffix (Lees)",
      familyId: "chalees",
      simpleExplanation: `${pref} ${clu} hai. Lees 40 family (Chalees) ka suffix pattern hai.`,
      mithuHeader: "Chalees family dekho 👀",
    };
  }

  if (digit >= 30 && digit <= 39) {
    const prefixes: Record<number, string> = {
      30: "Tee", 31: "Ik", 32: "Bat", 33: "Tain", 34: "Chau", 35: "Pain", 36: "Chhat", 37: "Sain", 38: "Atth"
    };
    const prefixClues: Record<number, string> = {
      30: "30 core", 31: "1 clue", 32: "2 clue", 33: "3 clue", 34: "4 clue", 35: "5 clue", 36: "6 clue", 37: "7 clue", 38: "8 clue"
    };
    const pref = prefixes[digit] || "Tee";
    const clu = prefixClues[digit] || "Digit clue";
    const isThirty = digit === 30;
    
    const suffix = isThirty ? "s" : "tees";
    const capSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: capSuffix,
      suffixMeaning: "30 family suffix (Tees)",
      familyId: "tees",
      simpleExplanation: `${pref} ${clu} hai. ${capSuffix} 30 family (Tees) ka suffix pattern hai.`,
      mithuHeader: "Tees family dekho 👀",
    };
  }

  if (digit >= 20 && digit <= 29) {
    const prefixes: Record<number, string> = {
      20: "Be", 21: "Ikk", 22: "Ba", 23: "Te", 24: "Chou", 25: "Pach", 26: "Chhab", 27: "Sata", 28: "Atha"
    };
    const prefixClues: Record<number, string> = {
      20: "20 core", 21: "1 clue", 22: "2 clue", 23: "3 clue", 24: "4 clue", 25: "5 clue", 26: "6 clue", 27: "7 clue", 28: "8 clue"
    };
    const pref = prefixes[digit] || "Be";
    const clu = prefixClues[digit] || "Digit clue";
    
    const isTwentyThree = digit === 23;
    const isTwentyFour = digit === 24;
    
    let suffix = "ees";
    if (isTwentyThree) suffix = "is";
    else if (isTwentyFour) suffix = "bees";

    const capSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1);

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: capSuffix,
      suffixMeaning: "20 family suffix (Ees)",
      familyId: "ees",
      simpleExplanation: `${pref} ${clu} hai. ${capSuffix} 20 family (Ees) ka suffix pattern hai.`,
      mithuHeader: "Bees family dekho 👀",
    };
  }

  if (digit >= 10 && digit <= 19) {
    const prefixes: Record<number, string> = {
      10: "Das", 11: "Gya", 12: "Ba", 13: "Te", 14: "Chau", 15: "Pan", 16: "So", 17: "Sata", 18: "Atha"
    };
    const prefixClues: Record<number, string> = {
      10: "10 core", 11: "1 clue", 12: "2 clue", 13: "3 clue", 14: "4 clue", 15: "5 clue", 16: "6 clue", 17: "7 clue", 18: "8 clue"
    };
    const pref = prefixes[digit] || "Das";
    const clu = prefixClues[digit] || "Digit clue";

    return {
      digit,
      word,
      prefix: pref,
      prefixMeaning: clu,
      suffix: "Rah",
      suffixMeaning: "10 family suffix (Rah)",
      familyId: "dahae",
      simpleExplanation: `${pref} ${clu} hai. Rah (Das) 10 family ka suffix pattern hai.`,
      mithuHeader: "Aasan clue dekho 👀",
    };
  }

  // 1-9 are single digits
  return {
    digit,
    word,
    prefix: word,
    prefixMeaning: "Single digit",
    suffix: "Digit",
    suffixMeaning: "No family",
    familyId: "single",
    simpleExplanation: `${word} represents the primary Urdu digit ${digit}.`,
    mithuHeader: `${word} dekho 👀`,
  };
}

