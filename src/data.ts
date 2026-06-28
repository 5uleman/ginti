export interface NumberEntry {
  digit: number;
  romanUrdu: string;
  nativeScript: string;
  unitId: string;
  searchKeys: string[];
  context?: string; // Optional context like "Price of general chai", etc. for Unit 5
}

export const NUMBERS: NumberEntry[] = [
  // --- Unit 1: Numbers 1 to 20 ---
  {
    digit: 1,
    romanUrdu: "Ek",
    nativeScript: "ایک",
    unitId: "unit1",
    searchKeys: ["ek", "1", "yak", "aek", "ایک"]
  },
  {
    digit: 2,
    romanUrdu: "Do",
    nativeScript: "دو",
    unitId: "unit1",
    searchKeys: ["do", "2", "doo", "dow", "دو"]
  },
  {
    digit: 3,
    romanUrdu: "Teen",
    nativeScript: "تین",
    unitId: "unit1",
    searchKeys: ["teen", "3", "tin", "tean", "تین"]
  },
  {
    digit: 4,
    romanUrdu: "Chaar",
    nativeScript: "چار",
    unitId: "unit1",
    searchKeys: ["chaar", "4", "char", "chahr", "چار"]
  },
  {
    digit: 5,
    romanUrdu: "Paanch",
    nativeScript: "پانچ",
    unitId: "unit1",
    searchKeys: ["paanch", "5", "panch", "paunch", "پانچ"]
  },
  {
    digit: 6,
    romanUrdu: "Chey",
    nativeScript: "چھ",
    unitId: "unit1",
    searchKeys: ["chey", "6", "che", "chhay", "chh", "چھ"]
  },
  {
    digit: 7,
    romanUrdu: "Saat",
    nativeScript: "سات",
    unitId: "unit1",
    searchKeys: ["saat", "7", "sat", "saht", "سات"]
  },
  {
    digit: 8,
    romanUrdu: "Aath",
    nativeScript: "آٹھ",
    unitId: "unit1",
    searchKeys: ["aath", "8", "ath", "aaht", "آٹھ"]
  },
  {
    digit: 9,
    romanUrdu: "Nau",
    nativeScript: "نو",
    unitId: "unit1",
    searchKeys: ["nau", "9", "no", "now", "نو"]
  },
  {
    digit: 10,
    romanUrdu: "Das",
    nativeScript: "دس",
    unitId: "unit1",
    searchKeys: ["das", "10", "dus", "dass", "دس"]
  },
  {
    digit: 11,
    romanUrdu: "Gyarah",
    nativeScript: "گیارہ",
    unitId: "unit1",
    searchKeys: ["gyarah", "11", "giarah", "gyara", "gearah", "گیارہ"]
  },
  {
    digit: 12,
    romanUrdu: "Baarah",
    nativeScript: "بارہ",
    unitId: "unit1",
    searchKeys: ["baarah", "12", "barah", "baara", "bara", "بارہ"]
  },
  {
    digit: 13,
    romanUrdu: "Teerah",
    nativeScript: "تیرہ",
    unitId: "unit1",
    searchKeys: ["teerah", "13", "terah", "teera", "tera", "تیرہ"]
  },
  {
    digit: 14,
    romanUrdu: "Chaudah",
    nativeScript: "چودہ",
    unitId: "unit1",
    searchKeys: ["chaudah", "14", "choudah", "chauda", "chouda", "چودہ"]
  },
  {
    digit: 15,
    romanUrdu: "Pandrah",
    nativeScript: "پندرہ",
    unitId: "unit1",
    searchKeys: ["pandrah", "15", "pandra", "pundrah", "پندرہ"]
  },
  {
    digit: 16,
    romanUrdu: "Solah",
    nativeScript: "سولہ",
    unitId: "unit1",
    searchKeys: ["solah", "16", "sola", "soolah", "سولہ"]
  },
  {
    digit: 17,
    romanUrdu: "Satrah",
    nativeScript: "سترہ",
    unitId: "unit1",
    searchKeys: ["satrah", "17", "satra", "sutrah", "سترہ"]
  },
  {
    digit: 18,
    romanUrdu: "Atharah",
    nativeScript: "اٹھارہ",
    unitId: "unit1",
    searchKeys: ["atharah", "18", "athtahrah", "athara", "atahara", "اٹھارہ"]
  },
  {
    digit: 19,
    romanUrdu: "Unnees",
    nativeScript: "انیس",
    unitId: "unit1",
    searchKeys: ["unnees", "19", "unnis", "unees", "unise", "انیس"]
  },
  {
    digit: 20,
    romanUrdu: "Bees",
    nativeScript: "بیس",
    unitId: "unit1",
    searchKeys: ["bees", "20", "bis", "beas", "بیس"]
  },

  // --- Unit 2: Numbers 21 to 50 ---
  {
    digit: 21,
    romanUrdu: "Ikkees",
    nativeScript: "اکیس",
    unitId: "unit2",
    searchKeys: ["ikkees", "21", "ikkis", "ikees", "ikis", "اکیس"]
  },
  {
    digit: 22,
    romanUrdu: "Baees",
    nativeScript: "بائیس",
    unitId: "unit2",
    searchKeys: ["baees", "22", "bais", "baayeis", "baies", "بائیس"]
  },
  {
    digit: 23,
    romanUrdu: "Teis",
    nativeScript: "تیئس",
    unitId: "unit2",
    searchKeys: ["teis", "23", "teees", "tayis", "taees", "تیئس"]
  },
  {
    digit: 24,
    romanUrdu: "Choubees",
    nativeScript: "چوبیس",
    unitId: "unit2",
    searchKeys: ["choubees", "24", "chaubees", "chobis", "chaubis", "چوبیس"]
  },
  {
    digit: 25,
    romanUrdu: "Pachees",
    nativeScript: "پچیس",
    unitId: "unit2",
    searchKeys: ["pachees", "25", "pachis", "pachies", "پچیس"]
  },
  {
    digit: 26,
    romanUrdu: "Chhabees",
    nativeScript: "چھبیس",
    unitId: "unit2",
    searchKeys: ["chhabees", "26", "chhabis", "chhabies", "chabis", "چھبیس"]
  },
  {
    digit: 27,
    romanUrdu: "Sataees",
    nativeScript: "ستائیس",
    unitId: "unit2",
    searchKeys: ["sataees", "27", "satais", "sattayeis", "saties", "ستائیس"]
  },
  {
    digit: 28,
    romanUrdu: "Athaees",
    nativeScript: "اٹھائیس",
    unitId: "unit2",
    searchKeys: ["athaees", "28", "athais", "athayeis", "ataees", "اٹھائیس"]
  },
  {
    digit: 29,
    romanUrdu: "Untees",
    nativeScript: "انتیس",
    unitId: "unit2",
    searchKeys: ["untees", "29", "untis", "unties", "unthees", "انتیس"]
  },
  {
    digit: 30,
    romanUrdu: "Tees",
    nativeScript: "تیس",
    unitId: "unit2",
    searchKeys: ["tees", "30", "tis", "thees", "تیس"]
  },
  {
    digit: 31,
    romanUrdu: "Iktees",
    nativeScript: "اکتیس",
    unitId: "unit2",
    searchKeys: ["iktees", "31", "iktis", "icktees", "ikthees", "اکتیس"]
  },
  {
    digit: 32,
    romanUrdu: "Battees",
    nativeScript: "بتیس",
    unitId: "unit2",
    searchKeys: ["battees", "32", "battis", "batees", "batis", "بتیس"]
  },
  {
    digit: 33,
    romanUrdu: "Taintees",
    nativeScript: "تینتیس",
    unitId: "unit2",
    searchKeys: ["taintees", "33", "taintis", "tentees", "teentees", "تینتیس"]
  },
  {
    digit: 34,
    romanUrdu: "Chountees",
    nativeScript: "چونتیس",
    unitId: "unit2",
    searchKeys: ["chountees", "34", "chautis", "chontees", "chauntees", "چونتیس"]
  },
  {
    digit: 35,
    romanUrdu: "Paintees",
    nativeScript: "پینتیس",
    unitId: "unit2",
    searchKeys: ["paintees", "35", "paintis", "pentees", "paintees", "پینتیس"]
  },
  {
    digit: 36,
    romanUrdu: "Chhattees",
    nativeScript: "چھتیس",
    unitId: "unit2",
    searchKeys: ["chhattees", "36", "chhattis", "chatees", "chatis", "چھتیس"]
  },
  {
    digit: 37,
    romanUrdu: "Saintees",
    nativeScript: "سینتیس",
    unitId: "unit2",
    searchKeys: ["saintees", "37", "saintis", "santees", "sayintees", "سینتیس"]
  },
  {
    digit: 38,
    romanUrdu: "Artees",
    nativeScript: "اڑتیس",
    unitId: "unit2",
    searchKeys: ["artees", "38", "artis", "ardees", "ardis", "urthees", "اڑتیس"]
  },
  {
    digit: 39,
    romanUrdu: "Untalees",
    nativeScript: "انتالیس",
    unitId: "unit2",
    searchKeys: ["untalees", "39", "untalis", "untalies", "unthalees", "انتالیس"]
  },
  {
    digit: 40,
    romanUrdu: "Chalees",
    nativeScript: "چالیس",
    unitId: "unit2",
    searchKeys: ["chalees", "40", "chalis", "chalies", "چالیس"]
  },
  {
    digit: 41,
    romanUrdu: "Iktalees",
    nativeScript: "اکتالیس",
    unitId: "unit2",
    searchKeys: ["iktalees", "41", "iktalis", "icktalees", "اکتالیس"]
  },
  {
    digit: 42,
    romanUrdu: "Bayalees",
    nativeScript: "بیالیس",
    unitId: "unit2",
    searchKeys: ["bayalees", "42", "bayalis", "biyalees", "biyalis", "بیالیس"]
  },
  {
    digit: 43,
    romanUrdu: "Taintalees",
    nativeScript: "تینتالیس",
    unitId: "unit2",
    searchKeys: ["taintalees", "43", "taintalis", "teentalees", "tentalis", "تینتالیس"]
  },
  {
    digit: 44,
    romanUrdu: "Chawalees",
    nativeScript: "چوالیس",
    unitId: "unit2",
    searchKeys: ["chawalees", "44", "chawalis", "chaunalees", "chowalis", "چوالیس"]
  },
  {
    digit: 45,
    romanUrdu: "Paintalees",
    nativeScript: "پینتالیس",
    unitId: "unit2",
    searchKeys: ["paintalees", "45", "paintalis", "pentalees", "پینتالیس"]
  },
  {
    digit: 46,
    romanUrdu: "Chhiyalees",
    nativeScript: "چھیالیس",
    unitId: "unit2",
    searchKeys: ["chhiyalees", "46", "chhiyalis", "cheyalees", "chiyalis", "چھیالیس"]
  },
  {
    digit: 47,
    romanUrdu: "Santalees",
    nativeScript: "سنتالیس",
    unitId: "unit2",
    searchKeys: ["santalees", "47", "santalis", "suntalees", "سنتالیس"]
  },
  {
    digit: 48,
    romanUrdu: "Artalees",
    nativeScript: "اڑتالیس",
    unitId: "unit2",
    searchKeys: ["artalees", "48", "artalis", "ardtalis", "urtalis", "اڑتالیس"]
  },
  {
    digit: 49,
    romanUrdu: "Unchaas",
    nativeScript: "انچاس",
    unitId: "unit2",
    searchKeys: ["unchaas", "49", "unchas", "unchahs", "aranmchas", "انچاس"]
  },
  {
    digit: 50,
    romanUrdu: "Pachaas",
    nativeScript: "پچاس",
    unitId: "unit2",
    searchKeys: ["pachaas", "50", "pachas", "pachahs", "پچاس"]
  },

  // --- Unit 3: Numbers 51 to 75 ---
  {
    digit: 51,
    romanUrdu: "Ikawan",
    nativeScript: "اکاون",
    unitId: "unit3",
    searchKeys: ["ikawan", "51", "ikaun", "ikawwan", "ikyawan", "اکاون"]
  },
  {
    digit: 52,
    romanUrdu: "Baawan",
    nativeScript: "باون",
    unitId: "unit3",
    searchKeys: ["baawan", "52", "bawan", "baawwan", "باون"]
  },
  {
    digit: 53,
    romanUrdu: "Tirpan",
    nativeScript: "ترپن",
    unitId: "unit3",
    searchKeys: ["tirpan", "53", "terpan", "trepan", "ترپن"]
  },
  {
    digit: 54,
    romanUrdu: "Chauwan",
    nativeScript: "چون",
    unitId: "unit3",
    searchKeys: ["chauwan", "54", "chowan", "chawan", "chaun", "چون"]
  },
  {
    digit: 55,
    romanUrdu: "Pachpan",
    nativeScript: "پچپن",
    unitId: "unit3",
    searchKeys: ["pachpan", "55", "puchpun", "pachpun", "پچپن"]
  },
  {
    digit: 56,
    romanUrdu: "Chhappan",
    nativeScript: "چھپن",
    unitId: "unit3",
    searchKeys: ["chhappan", "56", "chapan", "chapun", "چھپن"]
  },
  {
    digit: 57,
    romanUrdu: "Satawan",
    nativeScript: "ستاون",
    unitId: "unit3",
    searchKeys: ["satawan", "57", "sattawan", "sataun", "ستاون"]
  },
  {
    digit: 58,
    romanUrdu: "Athawan",
    nativeScript: "اٹھاون",
    unitId: "unit3",
    searchKeys: ["athawan", "58", "atthawan", "athaun", "اٹھاون"]
  },
  {
    digit: 59,
    romanUrdu: "Unsaat",
    nativeScript: "انسٹھ",
    unitId: "unit3",
    searchKeys: ["unsaat", "59", "unsat", "unsaht", "انسٹھ"]
  },
  {
    digit: 60,
    romanUrdu: "Saath",
    nativeScript: "ساٹھ",
    unitId: "unit3",
    searchKeys: ["saath", "60", "sath", "saaht", "ساٹھ"]
  },
  {
    digit: 61,
    romanUrdu: "Iksath",
    nativeScript: "اکسٹھ",
    unitId: "unit3",
    searchKeys: ["iksath", "61", "iksat", "ikeysath", "اکسٹھ"]
  },
  {
    digit: 62,
    romanUrdu: "Basath",
    nativeScript: "باسٹھ",
    unitId: "unit3",
    searchKeys: ["basath", "62", "basat", "baasath", "باسٹھ"]
  },
  {
    digit: 63,
    romanUrdu: "Tirsath",
    nativeScript: "ترسٹھ",
    unitId: "unit3",
    searchKeys: ["tirsath", "63", "tirsat", "tresath", "ترسٹھ"]
  },
  {
    digit: 64,
    romanUrdu: "Chausath",
    nativeScript: "چوسٹھ",
    unitId: "unit3",
    searchKeys: ["chausath", "64", "chausat", "chosath", "chowsath", "چوسٹھ"]
  },
  {
    digit: 65,
    romanUrdu: "Painsath",
    nativeScript: "پینسٹھ",
    unitId: "unit3",
    searchKeys: ["painsath", "65", "painsat", "pensath", "پینسٹھ"]
  },
  {
    digit: 66,
    romanUrdu: "Chhiyasath",
    nativeScript: "چھیاسٹھ",
    unitId: "unit3",
    searchKeys: ["chhiyasath", "66", "chhiyasat", "cheyasath", "چھیاسٹھ"]
  },
  {
    digit: 67,
    romanUrdu: "Sarsath",
    nativeScript: "سڑسٹھ",
    unitId: "unit3",
    searchKeys: ["sarsath", "67", "sarsat", "sadasath", "سڑسٹھ"]
  },
  {
    digit: 68,
    romanUrdu: "Arsath",
    nativeScript: "اڑسٹھ",
    unitId: "unit3",
    searchKeys: ["arsath", "68", "arsat", "arasath", "اڑسٹھ"]
  },
  {
    digit: 69,
    romanUrdu: "Unhattar",
    nativeScript: "انہتر",
    unitId: "unit3",
    searchKeys: ["unhattar", "69", "unhatar", "unhatur", "انہتر"]
  },
  {
    digit: 70,
    romanUrdu: "Sattar",
    nativeScript: "ستر",
    unitId: "unit3",
    searchKeys: ["sattar", "70", "satar", "sattur", "ستر"]
  },
  {
    digit: 71,
    romanUrdu: "Ikhattar",
    nativeScript: "اکھتر",
    unitId: "unit3",
    searchKeys: ["ikhattar", "71", "ikhatar", "ikatar", "ikhataar", "ikattar", "اکھتر"]
  },
  {
    digit: 72,
    romanUrdu: "Bahattar",
    nativeScript: "بہتر",
    unitId: "unit3",
    searchKeys: ["bahattar", "72", "bahatar", "behattar", "بہتر"]
  },
  {
    digit: 73,
    romanUrdu: "Tehattar",
    nativeScript: "تہتر",
    unitId: "unit3",
    searchKeys: ["tehattar", "73", "tehatar", "tihattar", "تہتر"]
  },
  {
    digit: 74,
    romanUrdu: "Chauhattar",
    nativeScript: "چوہتر",
    unitId: "unit3",
    searchKeys: ["chauhattar", "74", "chauhatar", "chohattar", "chouhatar", "چوہتر"]
  },
  {
    digit: 75,
    romanUrdu: "Pachhattar",
    nativeScript: "پچھتر",
    unitId: "unit3",
    searchKeys: ["pachhattar", "75", "pachhatar", "pachatar", "puchhatar", "پچھتر"]
  },

  // --- Unit 4: Numbers 76 to 100 ---
  {
    digit: 76,
    romanUrdu: "Chhihattar",
    nativeScript: "چھیہتر",
    unitId: "unit4",
    searchKeys: ["chhihattar", "76", "chhihatar", "chehattar", "چھیہتر"]
  },
  {
    digit: 77,
    romanUrdu: "Sathattar",
    nativeScript: "ستھتر",
    unitId: "unit4",
    searchKeys: ["sathattar", "77", "sathatar", "satattar", "sattatar", "ستھتر"]
  },
  {
    digit: 78,
    romanUrdu: "Athhattar",
    nativeScript: "اٹھہتر",
    unitId: "unit4",
    searchKeys: ["athhattar", "78", "athhatar", "atatar", "athattar", "اٹھہتر"]
  },
  {
    digit: 79,
    romanUrdu: "Unasi",
    nativeScript: "اناسی",
    unitId: "unit4",
    searchKeys: ["unasi", "79", "unaasi", "unassi", "اناسی"]
  },
  {
    digit: 80,
    romanUrdu: "Assee",
    nativeScript: "اسی",
    unitId: "unit4",
    searchKeys: ["assee", "80", "assi", "asi", "assy", "اسی"]
  },
  {
    digit: 81,
    romanUrdu: "Ikasi",
    nativeScript: "اکاسی",
    unitId: "unit4",
    searchKeys: ["ikasi", "81", "ikaasi", "ikassi", "اکاسی"]
  },
  {
    digit: 82,
    romanUrdu: "Byasi",
    nativeScript: "بیاسی",
    unitId: "unit4",
    searchKeys: ["byasi", "82", "biyaasi", "byaasi", "biasi", "بیاسی"]
  },
  {
    digit: 83,
    romanUrdu: "Tyasi",
    nativeScript: "تیاسی",
    unitId: "unit4",
    searchKeys: ["tyasi", "83", "tiyaasi", "tyaasi", "tiasi", "تیاسی"]
  },
  {
    digit: 84,
    romanUrdu: "Churasi",
    nativeScript: "چوراسی",
    unitId: "unit4",
    searchKeys: ["churasi", "84", "churaasi", "churassi", "چوراسی"]
  },
  {
    digit: 85,
    romanUrdu: "Pachasi",
    nativeScript: "پچاسی",
    unitId: "unit4",
    searchKeys: ["pachasi", "85", "pachaasi", "pachassi", "پچاسی"]
  },
  {
    digit: 86,
    romanUrdu: "Chhyasi",
    nativeScript: "چھیاسی",
    unitId: "unit4",
    searchKeys: ["chhyasi", "86", "chhiyaasi", "chyasi", "chiasi", "چھیاسی"]
  },
  {
    digit: 87,
    romanUrdu: "Satasi",
    nativeScript: "ستاسی",
    unitId: "unit4",
    searchKeys: ["satasi", "87", "sataasi", "satassi", "ستاسی"]
  },
  {
    digit: 88,
    romanUrdu: "Athasi",
    nativeScript: "اٹھاسی",
    unitId: "unit4",
    searchKeys: ["athasi", "88", "ataasi", "atasi", "athaasi", "athassi", "اٹھاسی"]
  },
  {
    digit: 89,
    romanUrdu: "Nawasi",
    nativeScript: "نواسی",
    unitId: "unit4",
    searchKeys: ["nawasi", "89", "nawaasi", "navasi", "نواسی"]
  },
  {
    digit: 90,
    romanUrdu: "Nawway",
    nativeScript: "نوے",
    unitId: "unit4",
    searchKeys: ["nawway", "90", "nave", "navvay", "naway", "nabbe", "نوے"]
  },
  {
    digit: 91,
    romanUrdu: "Ikanawey",
    nativeScript: "اکانوے",
    unitId: "unit4",
    searchKeys: ["ikanawey", "91", "ikanway", "ikaanwe", "ikanwe", "اکانوے"]
  },
  {
    digit: 92,
    romanUrdu: "Banawey",
    nativeScript: "بانوے",
    unitId: "unit4",
    searchKeys: ["banawey", "92", "banway", "bayaanwe", "banwe", "بانوے"]
  },
  {
    digit: 93,
    romanUrdu: "Tranawey",
    nativeScript: "ترانوے",
    unitId: "unit4",
    searchKeys: ["tranawey", "93", "tranway", "tiraanwe", "tranwe", "ترانوے"]
  },
  {
    digit: 94,
    romanUrdu: "Churanawey",
    nativeScript: "چورانوے",
    unitId: "unit4",
    searchKeys: ["churanawey", "94", "churanway", "churaanwe", "churanwe", "چورانوے"]
  },
  {
    digit: 95,
    romanUrdu: "Pachanawey",
    nativeScript: "پچانوے",
    unitId: "unit4",
    searchKeys: ["pachanawey", "95", "pachanway", "pachaanwe", "pachanwe", "پچانوے"]
  },
  {
    digit: 96,
    romanUrdu: "Chhianawey",
    nativeScript: "چھیانوے",
    unitId: "unit4",
    searchKeys: ["chhianawey", "96", "chfianway", "chhiyaanwe", "chianwe", "چھیانوے"]
  },
  {
    digit: 97,
    romanUrdu: "Satanawey",
    nativeScript: "ستانوے",
    unitId: "unit4",
    searchKeys: ["satanawey", "97", "satanway", "sataanwe", "satanwe", "ستانوے"]
  },
  {
    digit: 98,
    romanUrdu: "Athanawey",
    nativeScript: "اٹھانوے",
    unitId: "unit4",
    searchKeys: ["athanawey", "98", "athanway", "athaanwe", "athanwe", "اٹھانوے"]
  },
  {
    digit: 99,
    romanUrdu: "Ninanawey",
    nativeScript: "ننانوے",
    unitId: "unit4",
    searchKeys: ["ninanawey", "99", "ninanway", "ninaanwe", "ninanwe", "ninaanway", "ننانوے"]
  },
  {
    digit: 100,
    romanUrdu: "Sau",
    nativeScript: "سو",
    unitId: "unit4",
    searchKeys: ["sau", "100", "so", "soo", "سو"]
  },

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

export interface Unit {
  id: string;
  title: string;
  description: string;
  emoji: string;
  numbersRange: string;
}

export const UNITS: Unit[] = [
  {
    id: "unit1",
    title: "Unit 1 — Numbers 1 to 20",
    description: "The foundational scale. Essential for basic shopping, counting small items, and simple conversations.",
    emoji: "🥚",
    numbersRange: "1–20"
  },
  {
    id: "unit2",
    title: "Unit 2 — Numbers 21 to 50",
    description: "Stepping up. Great for calling transaction prices, ages, and timing schedules.",
    emoji: "🐣",
    numbersRange: "21–50"
  },
  {
    id: "unit3",
    title: "Unit 3 — Numbers 51 to 75",
    description: "Intermediate challenges. Vital for intermediate street negotiations, weights, and measures.",
    emoji: "🐥",
    numbersRange: "51–75"
  },
  {
    id: "unit4",
    title: "Unit 4 — Numbers 76 to 100",
    description: "Mastery scale. Includes tricky phonetics like 'Ninanwe' (99) and 'Satasi' (87).",
    emoji: "🐦",
    numbersRange: "76–100"
  },
  {
    id: "unit5",
    title: "Unit 5 — Practical Market Numbers",
    description: "Real-world bulk indices. Hundreds, thousands, and market slang like 'Derh Sau' (150).",
    emoji: "🦜",
    numbersRange: "100–5000"
  }
];
