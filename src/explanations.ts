// Structured Urdu Ginti numbers explanation dataset and decoder helper.
// This is designed to be future-proof and easy to maintain.

export interface NumberExplanation {
  digit: number;
  word: string;
  prefix: string;         // e.g. "Ba"
  prefixMeaning: string;  // e.g. "2 ki nishani"
  prefixMeaningEn: string; // e.g. "Hint of 2"
  suffix: string;         // e.g. "Nawey"
  suffixMeaning: string;  // e.g. "90s family"
  suffixMeaningEn: string; // e.g. "90s family"
  familyId: string;       // e.g. "nawey", "tees", etc.
  simpleExplanation: string;
  simpleExplanationEn: string;
  mithuHeader: string;
  mithuHeaderEn: string;
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
    prefixMeaning: "3 ki nishani",
    prefixMeaningEn: "Hint of 3",
    suffix: "Tees",
    suffixMeaning: "30s family",
    suffixMeaningEn: "30s family",
    familyId: "tees",
    simpleExplanation: `"Tees" sunte hi 30s yaad aane chahiye. "Tain" wala hissa 3 ki nishani hai.`,
    simpleExplanationEn: `"Tees" should make you think of the 30s family. The "Tain" part hints at 3.`,
    mithuHeader: "Taintees ka raaz! 💡",
    mithuHeaderEn: "The secret of Taintees! 💡",
  },
  46: {
    word: "Chhiyalees",
    prefix: "Chhiya",
    prefixMeaning: "6 ki nishani",
    prefixMeaningEn: "Hint of 6",
    suffix: "Lees",
    suffixMeaning: "40s family",
    suffixMeaningEn: "40s family",
    familyId: "chalees",
    simpleExplanation: `"Lees" sunte hi 40s yaad aane chahiye. "Chhiya" wala hissa 6 ki nishani hai.`,
    simpleExplanationEn: `"Lees" should make you think of the 40s family. The "Chhiya" part hints at 6.`,
    mithuHeader: "Chhiyalees ki nishani! 🔎",
    mithuHeaderEn: "The sign of Chhiyalees! 🔎",
  },
  51: {
    word: "Ikawan",
    prefix: "Ik",
    prefixMeaning: "1 ki nishani",
    prefixMeaningEn: "Hint of 1",
    suffix: "Awan",
    suffixMeaning: "50s family",
    suffixMeaningEn: "50s family",
    familyId: "awan",
    simpleExplanation: `"Awan" sunte hi 50s yaad aane chahiye. "Ik" wala hissa 1 ki nishani hai.`,
    simpleExplanationEn: `"Awan" should make you think of the 50s family. The "Ik" part hints at 1.`,
    mithuHeader: "Ikawan ka trick! ⚡",
    mithuHeaderEn: "The trick to Ikawan! ⚡",
  },
  68: {
    word: "Arsath",
    prefix: "Ar",
    prefixMeaning: "8 ki nishani",
    prefixMeaningEn: "Hint of 8",
    suffix: "Sath",
    suffixMeaning: "60s family",
    suffixMeaningEn: "60s family",
    familyId: "sath",
    simpleExplanation: `"Sath" sunte hi 60s yaad aane chahiye. "Ar" wala hissa 8 ki nishani hai.`,
    simpleExplanationEn: `"Sath" should make you think of the 60s family. The "Ar" part hints at 8.`,
    mithuHeader: "Arsath ki kahani! ✨",
    mithuHeaderEn: "The story of Arsath! ✨",
  },
  69: {
    word: "Unhattar",
    prefix: "Un",
    prefixMeaning: "1 kam",
    prefixMeaningEn: "1 less",
    suffix: "Hattar",
    suffixMeaning: "70s family",
    suffixMeaningEn: "70s family",
    familyId: "hattar",
    simpleExplanation: `"Hattar" sunte hi 70s yaad aane chahiye. "Un" bata raha hai ke 70 se ek pehle hain.`,
    simpleExplanationEn: `"Hattar" should make you think of the 70s family. "Un" indicates it's one less than 70.`,
    mithuHeader: "Unhattar ko samjhein! 🤔",
    mithuHeaderEn: "Understanding Unhattar! 🤔",
  },
  92: {
    word: "Banawey",
    prefix: "Ba",
    prefixMeaning: "2 ki nishani",
    prefixMeaningEn: "Hint of 2",
    suffix: "Nawey",
    suffixMeaning: "90s family",
    suffixMeaningEn: "90s family",
    familyId: "nawey",
    simpleExplanation: `"Nawey" sunte hi 90s yaad aane chahiye. "Ba" wala hissa 2 ki nishani hai.`,
    simpleExplanationEn: `"Nawey" should make you think of the 90s family. The "Ba" part hints at 2.`,
    mithuHeader: "Banawey ka raaz! 💡",
    mithuHeaderEn: "The secret of Banawey! 💡",
  },
};

function getMithuHeaderUr(word: string, digit: number): string {
  if ([19, 29, 39, 49, 59, 69, 79].includes(digit)) {
    return `${word} ko samjhein! 🤔`;
  }
  const index = digit % 4;
  if (index === 0) return `${word} ka raaz! 💡`;
  if (index === 1) return `${word} ki nishani! 🔎`;
  if (index === 2) return `${word} ka trick! ⚡`;
  return `${word} ki kahani! ✨`;
}

function getMithuHeaderEn(word: string, digit: number): string {
  if ([19, 29, 39, 49, 59, 69, 79].includes(digit)) {
    return `Understanding ${word}! 🤔`;
  }
  const index = digit % 4;
  if (index === 0) return `The secret of ${word}! 💡`;
  if (index === 1) return `The sign of ${word}! 🔎`;
  if (index === 2) return `The trick to ${word}! ⚡`;
  return `The story of ${word}! ✨`;
}

// Algorithmic generator for any number 1-100 to make the feature 100% complete and future-proof!
export function getNumberExplanation(digit: number, wordFromData?: string): NumberExplanation {
  if (digit === 0) {
    return {
      digit: 0,
      word: "Sifr",
      prefix: "Sifr",
      prefixMeaning: "Zero",
      prefixMeaningEn: "Zero",
      suffix: "Ginti",
      suffixMeaning: "No family",
      suffixMeaningEn: "No family",
      familyId: "single",
      simpleExplanation: "Sab kuch isi se shuru hota hai.",
      simpleExplanationEn: "Everything begins from here.",
      mithuHeader: "Sifr ka aghaaz! 🌱",
      mithuHeaderEn: "The origin of Sifr! 🌱",
    };
  }

  const word = wordFromData || "Number";
  
  // Default base object
  const base: NumberExplanation = {
    digit,
    word,
    prefix: "Word",
    prefixMeaning: "Single digit",
    prefixMeaningEn: "Single digit",
    suffix: "Ginti",
    suffixMeaning: "No family",
    suffixMeaningEn: "No family",
    familyId: "single",
    simpleExplanation: `${word} Urdu ginti ka aik bunyadi single digit ${digit} hai.`,
    simpleExplanationEn: `${word} represents the primary Urdu digit ${digit}.`,
    mithuHeader: `${word} ki kahani! ✨`,
    mithuHeaderEn: `The story of ${word}! ✨`,
  };

  // If static override exists, return it merged with defaults
  if (STATIC_EXPLANATIONS[digit]) {
    return { ...base, ...STATIC_EXPLANATIONS[digit] } as NumberExplanation;
  }

  // Base multiples (10, 20, 30, 40, 50, 60, 70, 80, 90, 100)
  if (digit % 10 === 0) {
    let simpleExplanation = "";
    let simpleExplanationEn = "";
    let familyId = "single";
    let suffix = "Ginti";
    
    if (digit === 10) {
      simpleExplanation = "Das (10) Urdu ginti ka aik bunyadi number hai.";
      simpleExplanationEn = "Das (10) is a core base number in Urdu counting.";
      familyId = "dahae";
      suffix = "Das";
    } else if (digit === 20) {
      simpleExplanation = "Bees 20s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Bees is the starting number of the 20s family.";
      familyId = "ees";
      suffix = "Bees";
    } else if (digit === 30) {
      simpleExplanation = "Tees 30s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Tees is the starting number of the 30s family.";
      familyId = "tees";
      suffix = "Tees";
    } else if (digit === 40) {
      simpleExplanation = "Chalees 40s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Chalees is the starting number of the 40s family.";
      familyId = "chalees";
      suffix = "Chalees";
    } else if (digit === 50) {
      simpleExplanation = "Pachaas 50s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Pachaas is the starting number of the 50s family.";
      familyId = "awan";
      suffix = "Pachaas";
    } else if (digit === 60) {
      simpleExplanation = "Sath 60s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Sath is the starting number of the 60s family.";
      familyId = "sath";
      suffix = "Sath";
    } else if (digit === 70) {
      simpleExplanation = "Sattar 70s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Sattar is the starting number of the 70s family.";
      familyId = "hattar";
      suffix = "Sattar";
    } else if (digit === 80) {
      simpleExplanation = "Asi 80s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Asi is the starting number of the 80s family.";
      familyId = "asi";
      suffix = "Asi";
    } else if (digit === 90) {
      simpleExplanation = "Naway 90s family ka pehla aur mukammal number hai.";
      simpleExplanationEn = "Naway is the starting number of the 90s family.";
      familyId = "nawey";
      suffix = "Naway";
    } else if (digit === 100) {
      simpleExplanation = "Sau (100) Urdu ginti ka sabsay bada aur aakhri number hai.";
      simpleExplanationEn = "Sau (100) is the grand milestone and final number.";
      familyId = "single";
      suffix = "Sau";
    }

    return {
      ...base,
      prefix: word,
      prefixMeaning: `${digit} core`,
      prefixMeaningEn: `${digit} core`,
      suffix,
      suffixMeaning: `${digit} family`,
      suffixMeaningEn: `${digit} family`,
      familyId,
      simpleExplanation,
      simpleExplanationEn,
      mithuHeader: getMithuHeaderUr(word, digit),
      mithuHeaderEn: getMithuHeaderEn(word, digit),
    };
  }

  // Check for "Un" numbers: 19, 29, 39, 49, 59, 69, 79
  if ([19, 29, 39, 49, 59, 69, 79].includes(digit)) {
    let suffix = "";
    let suffixMeaning = "";
    let suffixMeaningEn = "";
    let familyId = "";
    let targetFam = 0;
    
    if (digit === 19) {
      suffix = "Nees";
      suffixMeaning = "20s family";
      suffixMeaningEn = "20s family";
      familyId = "ees";
      targetFam = 20;
    } else if (digit === 29) {
      suffix = "Tees";
      suffixMeaning = "30s family";
      suffixMeaningEn = "30s family";
      familyId = "tees";
      targetFam = 30;
    } else if (digit === 39) {
      suffix = "Talees";
      suffixMeaning = "40s family";
      suffixMeaningEn = "40s family";
      familyId = "chalees";
      targetFam = 40;
    } else if (digit === 49) {
      suffix = "Chaas";
      suffixMeaning = "50s family";
      suffixMeaningEn = "50s family";
      familyId = "awan";
      targetFam = 50;
    } else if (digit === 59) {
      const exactWord = word.toLowerCase();
      suffix = exactWord.endsWith("saat") ? "Saat" : "Sath";
      suffixMeaning = "60s family";
      suffixMeaningEn = "60s family";
      familyId = "sath";
      targetFam = 60;
    } else if (digit === 69) {
      suffix = "Hattar";
      suffixMeaning = "70s family";
      suffixMeaningEn = "70s family";
      familyId = "hattar";
      targetFam = 70;
    } else if (digit === 79) {
      suffix = "Asi";
      suffixMeaning = "80s family";
      suffixMeaningEn = "80s family";
      familyId = "asi";
      targetFam = 80;
    }

    const simpleExplanation = `"${suffix}" sunte hi ${targetFam}s yaad aane chahiye. "Un" bata raha hai ke ${targetFam} se ek pehle hain.`;
    const simpleExplanationEn = `"${suffix}" should make you think of the ${targetFam}s family. "Un" indicates it's one less than ${targetFam}.`;

    return {
      digit,
      word,
      prefix: "Un",
      prefixMeaning: "1 kam",
      prefixMeaningEn: "1 less",
      suffix,
      suffixMeaning,
      suffixMeaningEn,
      familyId,
      simpleExplanation,
      simpleExplanationEn,
      mithuHeader: getMithuHeaderUr(word, digit),
      mithuHeaderEn: getMithuHeaderEn(word, digit),
    };
  }

  // 1 to 9
  if (digit < 10) {
    return {
      ...base,
      mithuHeader: getMithuHeaderUr(word, digit),
      mithuHeaderEn: getMithuHeaderEn(word, digit),
    };
  }

  // General double digits
  const unitsDigit = digit % 10;
  const familyBase = Math.floor(digit / 10) * 10;

  let prefix = "";
  let suffix = "";
  let familyId = "";
  let familyNameUr = "";
  let familyNameEn = "";

  if (familyBase === 90) {
    const prefixes: Record<number, string> = {
      91: "Ikya", 92: "Ba", 93: "Tirya", 94: "Chaura", 95: "Pacha", 96: "Chhiya", 97: "Satta", 98: "Attha", 99: "Ninya"
    };
    prefix = prefixes[digit] || "Ba";
    suffix = "Nawey";
    familyId = "nawey";
    familyNameUr = "90s";
    familyNameEn = "90s";
  } else if (familyBase === 80) {
    const prefixes: Record<number, string> = {
      81: "Iky", 82: "By", 83: "Tir", 84: "Chaur", 85: "Pach", 86: "Chhiy", 87: "Satt", 88: "Atth", 89: "Naw"
    };
    prefix = prefixes[digit] || "Asi";
    suffix = "Asi";
    familyId = "asi";
    familyNameUr = "80s";
    familyNameEn = "80s";
  } else if (familyBase === 70) {
    const prefixes: Record<number, string> = {
      71: "Iky", 72: "Bah", 73: "Tir", 74: "Chauh", 75: "Pach", 76: "Chhih", 77: "Sath", 78: "Atth"
    };
    prefix = prefixes[digit] || "Hattar";
    suffix = "Hattar";
    familyId = "hattar";
    familyNameUr = "70s";
    familyNameEn = "70s";
  } else if (familyBase === 60) {
    const prefixes: Record<number, string> = {
      61: "Iks", 62: "Bas", 63: "Tirs", 64: "Chaus", 65: "Pans", 66: "Chhias", 67: "Sats", 68: "Ar"
    };
    prefix = prefixes[digit] || "Sa";
    suffix = "Sath";
    familyId = "sath";
    familyNameUr = "60s";
    familyNameEn = "60s";
  } else if (familyBase === 50) {
    const prefixes: Record<number, string> = {
      51: "Ik", 52: "Baw", 53: "Tirp", 54: "Chauw", 55: "Pachp", 56: "Chhapp", 57: "Satt", 58: "Atth"
    };
    prefix = prefixes[digit] || "Baw";
    suffix = "Awan";
    familyId = "awan";
    familyNameUr = "50s";
    familyNameEn = "50s";
  } else if (familyBase === 40) {
    const prefixes: Record<number, string> = {
      41: "Ikta", 42: "Beta", 43: "Tainta", 44: "Chawa", 45: "Painta", 46: "Chhiya", 47: "Sainta", 48: "Atthta"
    };
    prefix = prefixes[digit] || "Cha";
    suffix = "Lees";
    familyId = "chalees";
    familyNameUr = "40s";
    familyNameEn = "40s";
  } else if (familyBase === 30) {
    const prefixes: Record<number, string> = {
      31: "Ik", 32: "Bat", 33: "Tain", 34: "Chau", 35: "Pain", 36: "Chhat", 37: "Sain", 38: "Atth"
    };
    prefix = prefixes[digit] || "Tee";
    suffix = "Tees";
    familyId = "tees";
    familyNameUr = "30s";
    familyNameEn = "30s";
  } else if (familyBase === 20) {
    const prefixes: Record<number, string> = {
      21: "Ikk", 22: "Ba", 23: "Te", 24: "Chou", 25: "Pach", 26: "Chhab", 27: "Sata", 28: "Atha"
    };
    prefix = prefixes[digit] || "Be";
    suffix = (digit === 23) ? "Is" : (digit === 24) ? "Bees" : "Ees";
    familyId = "ees";
    familyNameUr = "20s";
    familyNameEn = "20s";
  } else if (familyBase === 10) {
    const prefixes: Record<number, string> = {
      11: "Gya", 12: "Ba", 13: "Te", 14: "Chau", 15: "Pan", 16: "So", 17: "Sata", 18: "Atha"
    };
    prefix = prefixes[digit] || "Das";
    suffix = "Rah";
    familyId = "dahae";
    familyNameUr = "10s";
    familyNameEn = "10s";
  }

  const prefixMeaning = `${unitsDigit} ki nishani`;
  const prefixMeaningEn = `Hint of ${unitsDigit}`;
  const suffixMeaning = `${familyNameUr} family`;
  const suffixMeaningEn = `${familyNameEn} family`;

  let simpleExplanation = "";
  let simpleExplanationEn = "";

  if (familyBase === 50) {
    simpleExplanation = `"Awan" ya "Pan" sunte hi 50s yaad aane chahiye. "${prefix}" wala hissa ${unitsDigit} ki nishani hai.`;
    simpleExplanationEn = `"Awan" or "Pan" should make you think of the 50s family. The "${prefix}" part hints at ${unitsDigit}.`;
  } else {
    simpleExplanation = `"${suffix}" sunte hi ${familyNameUr} yaad aane chahiye. "${prefix}" wala hissa ${unitsDigit} ki nishani hai.`;
    simpleExplanationEn = `"${suffix}" should make you think of the ${familyNameEn} family. The "${prefix}" part hints at ${unitsDigit}.`;
  }

  return {
    digit,
    word,
    prefix,
    prefixMeaning,
    prefixMeaningEn,
    suffix,
    suffixMeaning,
    suffixMeaningEn,
    familyId,
    simpleExplanation,
    simpleExplanationEn,
    mithuHeader: getMithuHeaderUr(word, digit),
    mithuHeaderEn: getMithuHeaderEn(word, digit),
  };
}
