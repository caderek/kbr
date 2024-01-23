import fs from "node:fs"
import path from "node:path"
import { cleanWordlist } from "./cleanWordlist.js"
import { joinWordlists } from "./joinWordlists.js"
import { readWordlist } from "./readWordlist.js"

const layouts = {
  qwerty: {
    left: "qwertasdfgzxcvb",
    right: "yuiophjklnm",
  },
  dvorak: {
    left: "pyaoeuiqjkx",
    right: "fgcrldhtnsbmwvz",
  },
  colemak: {
    left: "qwfpgarstdzxcvb",
    right: "jluyhneiokm",
  },
  "colemak-dh": {
    left: "qwfpbarstgzxcdv",
    right: "jluymneiokh",
  },
  workman: {
    left: "qdrwbashtgzxmcv",
    right: "jfupyneoikl",
  },
}

const monkeyWordlist = joinWordlists(
  cleanWordlist(readWordlist("monkey-english-200.json")),
  cleanWordlist(readWordlist("monkey-english-1k.json")),
  cleanWordlist(readWordlist("monkey-english-5k.json")),
  cleanWordlist(readWordlist("monkey-english-10k.json")),
)

const OUT_DIR = path.join("ngrams", "one-handed")

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR)
}

for (const [name, letters] of Object.entries(layouts)) {
  const left = monkeyWordlist.filter((word) =>
    new RegExp(`^[${letters.left}]+$`).test(word),
  )

  const right = monkeyWordlist.filter((word) =>
    new RegExp(`^[${letters.right}]+$`).test(word),
  )

  const OUt_DIR_LAYOUT = path.join(OUT_DIR, name)

  if (!fs.existsSync(OUt_DIR_LAYOUT)) {
    fs.mkdirSync(OUt_DIR_LAYOUT)
  }

  fs.writeFileSync(path.join(OUt_DIR_LAYOUT, "left.txt"), left.sort().join(" "))
  fs.writeFileSync(
    path.join(OUt_DIR_LAYOUT, "right.txt"),
    right.sort().join(" "),
  )
}
