const symbols = `\`1234567890-=~!@#$%^&*()_+[]\\{}|;':",./<>? `
const en = symbols + `qwertyuiopQWERTYUIOPasdfghjklASDFGHJKLzxcvbnmZXCVBNM`
const pl = en + "ąĄćĆęĘłŁńŃóÓśŚźŹżŻ"
const ua =
  symbols + "аАбБвВгГґҐдДеЕєЄжЖзЗиИіІїЇйЙкКлЛмМнНоОпПрРсСтТуУфФхХцЦчЧшШщЩьЬюЮяЯ"

export function getCharset(language: string) {
  const low = language.toLowerCase()

  switch (low) {
    case "pl":
      return new Set(pl)
    case "uk":
      return new Set(ua)
    default:
      return new Set(en)
  }
}

type Replacements = { [char: string]: string }

export function shouldIgnore(char: string) {
  const code = char.charCodeAt(0)
  return (
    code === 0x2060 || // Word Joiner
    code <= 0x1f || // Control characters
    (code >= 0x7f && code <= 0x9f) || // Control characters
    (code >= 0xe000 && code <= 0xf8ff) || // Private Use Area
    (code >= 0xf0000 && code <= 0xffffd) || // Supplementary Private Use Area-A
    (code >= 0x100000 && code <= 0x10fffd) // Supplementary Private Use Area-B
  )
}

export const notDisplayableUnicodeRanges = [[0, 31], []]

export const replacements: { symbols: Replacements; letters: Replacements } = {
  symbols: {
    "’": "'",
    "‘": "'",
    "»": ">>",
    "«": "<<",
    "—": " - ",
    "–": " - ",
    "…": "...",
    "“": '"',
    "”": '"',
    "„": '"',
    "©": "(c)",
    "£": "GBP",
    "∞": "infinity",
    "°": "deg",
    "¿": "?",
    "¡": "!",
  },
  letters: {
    // Latin
    ằ: "a",
    Ằ: "A",
    å: "a",
    Å: "A",
    â: "a",
    Â: "A",
    á: "a",
    Á: "A",
    à: "a",
    À: "A",
    ä: "a",
    Ä: "A",
    ą: "a",
    Ą: "A",
    æ: "ae",
    Æ: "AE",
    č: "c",
    Č: "C",
    ç: "c",
    Ç: "C",
    ć: "c",
    Ć: "C",
    ê: "e",
    Ê: "E",
    ë: "e",
    Ë: "E",
    é: "e",
    É: "E",
    è: "e",
    È: "E",
    ę: "e",
    Ę: "E",
    ꟾ: "i",
    í: "i",
    Í: "I",
    ï: "i",
    Ï: "I",
    ł: "l",
    Ł: "L",
    ń: "n",
    Ń: "N",
    ñ: "n",
    Ñ: "N",
    ô: "o",
    Ô: "O",
    ö: "o",
    Ö: "O",
    ó: "o",
    Ó: "O",
    ø: "o",
    Ø: "O",
    œ: "oe",
    ɶ: "oe",
    Œ: "OE",
    ß: "s",
    ẞ: "S",
    ş: "s",
    Ş: "S",
    ś: "s",
    Ś: "S",
    ü: "u",
    Ü: "U",
    ź: "z",
    Ź: "Z",
    ż: "z",
    Ż: "Z",

    // Cyrillic
    а: "a",
    А: "A",
    б: "b",
    Б: "B",
    в: "v",
    В: "V",
    г: "h",
    Г: "H",
    ґ: "g",
    Ґ: "G",
    д: "d",
    Д: "D",
    е: "e",
    Е: "E",
    є: "ie",
    Є: "Ie",
    ж: "zh",
    Ж: "Zh",
    з: "z",
    З: "Z",
    и: "y",
    И: "Y",
    і: "i",
    І: "I",
    ї: "i",
    Ї: "I",
    й: "y",
    Й: "Y",
    к: "k",
    К: "K",
    л: "l",
    Л: "L",
    м: "m",
    М: "M",
    н: "n",
    Н: "N",
    о: "o",
    О: "O",
    п: "p",
    П: "P",
    р: "r",
    Р: "R",
    с: "s",
    С: "S",
    т: "t",
    Т: "T",
    у: "u",
    У: "U",
    ф: "f",
    Ф: "F",
    х: "kh",
    Х: "Kh",
    ц: "c",
    Ц: "C",
    ч: "ch",
    Ч: "Ch",
    ш: "sh",
    Ш: "Sh",
    щ: "shch",
    Щ: "Shch",
    ь: "",
    Ь: "",
    ю: "iu",
    Ю: "Iu",
    я: "",
    Я: "",
  },
}
