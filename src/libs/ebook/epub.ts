import { BlobReader, ZipReader, TextWriter, Entry } from "@zip.js/zip.js"
import { getFileType } from "../getFileType"
import { cleanText } from "../cleanText"

export class Epub {
  #reader
  constructor(zipBlob: Blob) {
    const blobReader = new BlobReader(zipBlob)
    this.#reader = new ZipReader(blobReader)
  }

  async load() {
    const entries = await this.#reader.getEntries()

    await this.#verifyMimeFile(entries)
    const rootFile = await this.#readMetaInfo(entries)

    if (!rootFile.path) {
      throw new Error("Incorrect epub file")
    }

    const content = await this.#readStuctureFile(rootFile.path, entries)

    await this.#reader.close()
    return content
  }

  async #verifyMimeFile(entries: Entry[]) {
    const mimeFile = entries[0]

    if (
      mimeFile === undefined ||
      mimeFile.getData == undefined ||
      mimeFile.filename !== "mimetype"
    ) {
      throw new Error("Incorrect epub file")
    }

    const mimeWriter = new TextWriter()
    const mimeText = await mimeFile.getData(mimeWriter)

    if (mimeText !== "application/epub+zip") {
      throw new Error("Incorrect epub file")
    }
  }

  async #readFile(filePath: string, entries: Entry[]) {
    const ext = filePath.split(".").at(-1)
    const metaFile = entries.find((entry) => entry.filename === filePath)

    if (metaFile === undefined || metaFile.getData == undefined) {
      throw new Error("Incorrect epub file")
    }

    const metaWriter = new TextWriter()
    const metaText = await metaFile.getData(metaWriter)
    const parser = new DOMParser()

    switch (ext) {
      case "xml":
      case "opf": // structure data
      case "ncx": // deprecated tablle of contents
        return parser.parseFromString(metaText, "text/xml")
      default:
        return parser.parseFromString(metaText, "text/html")
    }
  }

  async #readMetaInfo(entries: Entry[]) {
    const content = await this.#readFile("META-INF/container.xml", entries)

    const rootFile = content.querySelector("rootfile")
    const rootFilePath = rootFile?.getAttribute("full-path")
    const rootFileMime = rootFile?.getAttribute("media-type")

    return { path: rootFilePath, mime: rootFileMime }
  }

  async #readStuctureFile(structureFilePath: string, entries: Entry[]) {
    const content = await this.#readFile(structureFilePath, entries)
    const metadata = content.querySelector("metadata")

    const info = Object.fromEntries(
      [...(metadata?.children ?? [])]
        .filter((node) => node.tagName.startsWith("dc:"))
        .map((node) => [node.tagName.slice(3), node.textContent]),
    )

    const manifestEntries = [
      ...(content.querySelectorAll("manifest > item") ?? []),
    ].map((item) => {
      const mime = item.getAttribute("media-type") ?? ""
      const file = item.getAttribute("href") ?? ""
      const prefix = structureFilePath.startsWith("OEBPS/") ? "OEBPS/" : ""
      const path = `${prefix}${file}`

      return [
        item.id,
        {
          path,
          mime,
          ext: file.split(".").at(-1),
          type: getFileType(mime),
        },
      ]
    })

    const manifest = Object.fromEntries(manifestEntries)

    const spine = [...(content.querySelectorAll("spine > itemref") ?? [])].map(
      (item) => {
        const id = item.getAttribute("idref")
        if (!id) {
          return null
        }

        return {
          id,
          ...(manifest[id] ?? {}),
          linear: item.getAttribute("linear") === "yes",
        }
      },
    )

    console.log("--- INFO -----------------")
    console.log(info)

    const parts = []

    for (const item of spine) {
      const content = await this.#readFile(item.path, entries)

      const h1 =
        [...content.querySelectorAll("h1")]
          .map((node) => cleanText(node.textContent ?? ""))
          .filter((text) => text !== "")
          .at(-1) ?? ""

      const h2 =
        [...content.querySelectorAll("h2")]
          .map((node) => cleanText(node.textContent ?? ""))
          .filter((text) => text !== "")
          .at(-1) ?? ""

      const paragraphs = [...content.querySelectorAll("p")]
        .map((node) => cleanText(node.textContent ?? ""))
        .filter((text) => text !== "")

      if (h1.length > 0 || h2.length > 0 || paragraphs.length > 0) {
        let title = [h1, h2].filter((x) => x !== "").join(" - ")

        if (title === "") {
          const beginning = paragraphs[0].slice(0, 50).trim()
          title += beginning

          if (beginning.length > 50) {
            title += "..."
          }
        }

        if (title.toLowerCase() !== "contents") {
          parts.push({ title, paragraphs })
        }
      }
    }

    console.log("--- PARTS -----------------")
    for (const part of parts) {
      console.log(part)
    }

    return { info, parts }

    // const all = parts
    //   .map((part) => part.paragraphs)
    //   .flat(Infinity)
    //   .join(" ")

    // console.log("--- SPECIAL -----------------")
    //
    // const special = [
    //   ...new Set(
    //     [...all].filter((char) => (char.codePointAt(0) ?? Infinity) > 255),
    //   ),
    // ].join(" ")
    //
    // console.log(special)
  }
}
