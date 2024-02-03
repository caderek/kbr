const en = `\`1234567890-=~!@#$%^&*()_+qwertyuiop[]\\QWERTYUIOP{}|asdfghjkl;'ASDFGHJKL:"zxcvbnm,./ZXCVBNM<>? `
const pl = en + "ąĄćĆęĘłŁńŃóÓśŚźŹżŻ"

export function getCharset(language: string) {
  const low = language.toLowerCase()

  switch (low) {
    case "pl":
    case "pl-pl":
    case "polish":
      return new Set(pl)
    default:
      return new Set(en)
  }
}

export const replacements: { [char: string]: string } = {
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
  // á ë â £ ô ï
  // "": "",
}
