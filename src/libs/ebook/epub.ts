import { BlobReader, BlobWriter, ZipReader, TextWriter, Entry } from "@zip.js/zip.js"
import { getFileType } from "../getFileType"
import { cleanText } from "../cleanText"
import { getCharset } from "../charsets"
import { prepareCover } from "./prepareCover"
import type { ManifestEntry, FlatElement, Part, TocElement, Chapter, Info, Book } from "./types"
import { extractGenres } from "./extractGenres"
import { sanitizeDescription } from "./sanitizeDescription"
import { toUrlIfPossible } from "./toUrlIfPossible"
import { getLanguage } from "../getLanguage"

const SKIP_TITLES_BY_LANG = {
  phrases: {
    en: [
      "contents",
      "copyright",
      "about the publisher",
      "title page",
      "license",
      "bibliography",
      "creative commons licensing information",
      "acknowledgements",
      "acknowledgments",
      "project gutenberg",
      "books by",
      "about the author",
      "about this ebook",
      "about this book",
      "other titles by ",
      "biographical note",
      "imprint",
      "colophon",
    ],
    pl: ["spis treści", "strona redakcyjna", "o tej publikacji", "o autorze", "bibliografia"],
  },
  patterns: {
    en: [],
    pl: [],
  },
}

const SKIP_TITLES = {
  phrases: new Set(Object.values(SKIP_TITLES_BY_LANG.phrases).flat()),
  patterns: Object.values(SKIP_TITLES_BY_LANG.patterns).flat() as RegExp[],
}

function shouldSkip(title: string) {
  const titleLow = title.toLowerCase()
  return (
    SKIP_TITLES.phrases.has(titleLow) ||
    [...SKIP_TITLES.phrases].some((phrase) => titleLow.includes(phrase)) ||
    SKIP_TITLES.patterns.some((pattern) => pattern.test(titleLow))
  )
}

function stripSymbols(str: string) {
  return str
    .toLowerCase()
    .replace(/[~!@#$%^&*()_+\-=\[\]\{\};',./:"<>?]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export class Epub {
  #reader
  #charset: Set<string> = new Set()
  #cleanText = (text: string) => text

  constructor(zipBlob: Blob) {
    const blobReader = new BlobReader(zipBlob)
    this.#reader = new ZipReader(blobReader)
  }

  async load(): Promise<Book> {
    const entries = await this.#reader.getEntries()
    await this.#verifyMimeFile(entries)
    const rootFile = await this.#readMetaInfo(entries)

    if (!rootFile.path) {
      throw new Error("Incorrect epub file")
    }

    const book = await this.#extractContent(rootFile.path, entries)

    await this.#reader.close()
    return book
  }

  async #verifyMimeFile(entries: Entry[]) {
    const mimeFile = entries.find((entry) => entry.filename === "mimetype")

    if (mimeFile === undefined || mimeFile.getData == undefined) {
      throw new Error("Incorrect epub file")
    }

    const mimeWriter = new TextWriter()
    const mimeText = (await mimeFile.getData(mimeWriter)).trim()

    if (mimeText !== "application/epub+zip") {
      throw new Error("Incorrect epub file")
    }
  }

  async #readFile(filePath: string, entries: Entry[]) {
    const ext = filePath.split(".").at(-1)
    const file = entries.find((entry) => entry.filename === filePath || entry.filename.endsWith(filePath))

    if (file === undefined || file.getData == undefined) {
      throw new Error("Incorrect epub file")
    }

    const textWriter = new TextWriter()
    const text = (await file.getData(textWriter)).replace(/<script.*\/script>/gs, "").replace(/<script.*>/g, "")

    const parser = new DOMParser()

    switch (ext) {
      case "xml":
      case "opf": // structure data
        return parser.parseFromString(text, "text/xml")
      default:
        return parser.parseFromString(text, "application/xhtml+xml")
    }
  }

  async #readMetaInfo(entries: Entry[]) {
    const content = await this.#readFile("META-INF/container.xml", entries)

    const rootFile = content.querySelector("rootfile")
    const rootFilePath = rootFile?.getAttribute("full-path")
    const rootFileMime = rootFile?.getAttribute("media-type")

    return { path: rootFilePath, mime: rootFileMime }
  }

  #readToc(element: Element, prefix: string, parentLabel?: string) {
    const toc: TocElement[][] = [...element.querySelectorAll(":scope > navPoint")].map((navPoint) => {
      const currentLabel = this.#cleanText(navPoint.querySelector("navLabel")?.textContent ?? "")

      const label = parentLabel ? `${parentLabel} - ${currentLabel}` : currentLabel

      let nextLabel: string | undefined = label

      if (shouldSkip(currentLabel)) {
        nextLabel = parentLabel ? parentLabel : undefined
      }

      const link = navPoint.querySelector("content")?.getAttribute("src") ?? ""
      const [rawPath, id] = link.split("#")
      const path = `${prefix}${rawPath}`
      const children = this.#readToc(navPoint, prefix, nextLabel)
      return children.length > 0 ? children : [{ label, path, id }]
    })

    return toc.flat()
  }

  #prepareBookWithoutToc(parts: Part[]) {
    const chapters: Chapter[] = []

    for (const entries of parts) {
      let title: string[] = []
      let paragraphs: string[] = []

      let prevType: string | null = null

      for (const entry of entries) {
        if (entry.type === "anchor" || !entry.text) {
          continue
        }

        if (entry.type.startsWith("h")) {
          if (prevType === "paragraph") {
            chapters.push({
              title: this.#cleanText(title.join(" ")),
              paragraphs,
            })

            title = []
            paragraphs = []
          }

          title.push(entry.text)
        }

        if (entry.type === "paragraph") {
          if (prevType === null) {
            const fragment = entry.text.slice(0, 50) + (entry.text.length > 50 ? "..." : "")

            title.push(fragment)
          }

          paragraphs.push(entry.text)
        }

        prevType = entry.type
      }

      if (paragraphs.length > 0) {
        chapters.push({
          title: this.#cleanText(title.join(" - ")),
          paragraphs,
        })
      }
    }

    return chapters
  }

  #findChapterStart(chapter: TocElement, sequence: FlatElement[]) {
    return sequence.findIndex((entry) => entry.path === chapter.path && (!chapter.id || entry.id === chapter.id))
  }

  #prepareBookWithToc(parts: Part[], toc: TocElement[]) {
    const sequence = parts.flat()
    const chapters: Chapter[] = []

    for (let i = 0; i < toc.length; i++) {
      const currentChapter = toc[i]
      const nextChapter = toc[i + 1]

      const from = this.#findChapterStart(currentChapter, sequence)

      if (from === -1) {
        continue
      }

      const to = nextChapter ? this.#findChapterStart(nextChapter, sequence) : sequence.length

      let title: string[] = []
      let paragraphs: string[] = []

      for (let j = from; j < to; j++) {
        const entry = sequence[j]

        if (entry.type.startsWith("h")) {
          if (paragraphs.length === 0) {
            title.push(entry.text)
          } else {
            paragraphs.push(entry.text)
          }
        } else if (entry.type === "paragraph") {
          if (
            title.length === 0 &&
            paragraphs.length === 0 &&
            currentChapter.label.toLowerCase().includes(entry.text.toLowerCase())
          ) {
            continue // skip chapter title as normal paragraph
          }

          if (paragraphs.length === 0 && entry.text === "***") {
            continue
          }

          if (paragraphs.at(-1) === "***" && entry.text === "***") {
            continue
          }

          paragraphs.push(entry.text)
        }
      }

      if (paragraphs.length > 0 && !SKIP_TITLES.phrases.has(paragraphs[0].toLowerCase())) {
        const missingTitleParts = title.filter(
          (chunk) => !stripSymbols(currentChapter.label).includes(stripSymbols(chunk)),
        )

        const tempTitle = this.#cleanText(
          [currentChapter.label, ...missingTitleParts].map((chunk) => chunk.trim()).join(" - "),
        )

        const withoutPageNumber = tempTitle.replace(/\.+\s*\d+/, "").trim()
        const finalTitle = withoutPageNumber || tempTitle

        chapters.push({
          title: finalTitle,
          paragraphs,
        })
      }
    }

    if (chapters.length === 0) {
      console.warn("Incorrect epub format, defaulting to reading without ToC")
      return this.#prepareBookWithoutToc(parts)
    }

    return chapters
  }

  async #getCover(manifestEntries: ManifestEntry[], entries: Entry[], info: Info, size: number) {
    const coverEntry = (manifestEntries.find(
      ([key, entry]) => entry.type === "image" && (entry.path.includes("cover") || key.includes("cover")),
    ) ?? [])[1]

    if (!coverEntry) {
      return prepareCover(null, info, size)
    }

    const entry = entries.find(
      (entry) => entry.filename === coverEntry.path || entry.filename.endsWith(coverEntry.path),
    )

    if (entry === undefined || entry.getData == undefined) {
      throw new Error("Incorrect epub file")
    }

    const blob = await entry.getData(new BlobWriter())
    const file = new File([blob], "cover", { type: coverEntry.mime })
    const cover = await prepareCover(file, info, size)

    // const url = URL.createObjectURL(cover as Blob)
    // const img = document.createElement("img")
    // img.src = url
    // document.body.appendChild(img)

    return cover
  }

  #getInfo(content: Document): Info {
    const metadata = content.querySelector("metadata")
    const children = [...(metadata?.children ?? [])]

    const language = getLanguage(children.find((node) => node.tagName === "dc:language")?.textContent ?? undefined)

    this.#charset = getCharset(language ?? "?")
    this.#cleanText = cleanText(this.#charset)

    const subject = children
      .filter((node) => node.tagName === "dc:subject")
      .map((node) => node.textContent)
      .filter((item) => item !== null && item.trim() !== "") as string[]

    const title = children.find((node) => node.tagName === "dc:title")?.textContent ?? null

    const author = children.find((node) => node.tagName === "dc:creator")?.textContent ?? null

    const rights = children.find((node) => node.tagName === "dc:rights")?.textContent ?? null

    const publisher = children.find((node) => node.tagName === "dc:publisher")?.textContent ?? null

    const uid = children.find((node) => node.id === "uid")?.textContent ?? null

    const seSource = uid && uid.startsWith("url:https://standardebooks.org") ? uid.slice(4) : null

    const source = toUrlIfPossible(
      seSource ?? children.find((node) => node.tagName === "dc:source")?.textContent ?? null,
    )

    const subjectSE = children
      .filter((node) => node.getAttribute("property") === "se:subject")
      .map((node) => node.textContent)
      .filter((item) => item !== null && item.trim() !== "") as string[]

    const years = children
      .filter((node) => node.tagName === "dc:date")
      .map((node) => ((node.textContent ?? "").match(/\d{4}/) ?? [])[0])
      .filter((item) => item !== undefined)

    const year = years.length > 0 ? Math.min(...years.map(Number)) : null

    let longDescription = sanitizeDescription(
      children.find((node) => node.getAttribute("property") === "se:long-description")?.textContent ?? null,
      this.#cleanText,
    )

    let rawDescription = sanitizeDescription(
      children.find((node) => node.tagName === "dc:description")?.textContent ?? null,
      this.#cleanText,
    )

    let description: string | null = null

    if (!longDescription && rawDescription) {
      longDescription = rawDescription
    }

    if (!rawDescription && longDescription) {
      description = longDescription[0] ?? null
    } else if (rawDescription) {
      description = rawDescription[0]
    }

    const genres = extractGenres(subject, subjectSE, rawDescription ?? longDescription ?? undefined)

    const info = {
      title,
      author,
      language,
      description,
      longDescription: longDescription ?? [],
      year,
      genres,
      rights,
      publisher,
      source,
    }

    return info
  }

  async #extractContent(structureFilePath: string, entries: Entry[]) {
    const content = await this.#readFile(structureFilePath, entries)
    const prefix = structureFilePath.startsWith("OEBPS/") ? "OEBPS/" : ""
    const info = this.#getInfo(content)

    const manifestEntries: ManifestEntry[] = [...(content.querySelectorAll("manifest > item") ?? [])].map((item) => {
      const mime = item.getAttribute("media-type") ?? ""
      const file = item.getAttribute("href") ?? ""
      const path = `${prefix}${file}`

      return [
        item.id,
        {
          path,
          mime,
          ext: file.split(".").at(-1) ?? "txt",
          type: getFileType(mime),
        },
      ]
    })

    const manifest = Object.fromEntries(manifestEntries)

    const cover = {
      medium: await this.#getCover(manifestEntries, entries, info, 320),
      small: await this.#getCover(manifestEntries, entries, info, 160),
    }

    const tocEntry = (manifestEntries.find((entry) => entry[1].ext === "ncx") ?? [])[1]

    let toc: TocElement[] | null = null

    if (tocEntry) {
      const tocContent = await this.#readFile(tocEntry.path, entries)
      const tocNode = tocContent.querySelector("navMap")

      if (tocNode) {
        toc = this.#readToc(tocNode, prefix)
      }
    }

    const spine = [...(content.querySelectorAll("spine > itemref") ?? [])].map((item) => {
      const id = item.getAttribute("idref")
      if (!id) {
        return null
      }

      return {
        id,
        ...(manifest[id] ?? {}),
        linear: item.getAttribute("linear") === "yes",
      }
    })

    const parts = []

    for (const item of spine) {
      if (item === null) {
        continue
      }

      const content = await this.#readFile(item.path, entries)

      content.body.querySelectorAll("br").forEach((node) => {
        const nl = document.createTextNode("{{BR}}")

        node.parentNode?.replaceChild(nl, node)
      })

      content.body.querySelectorAll("[id]").forEach((node) => {
        if (!["a", "img"].includes(node.tagName)) {
          const p = document.createElement("p")
          p.id = node.id
          p.dataset.type = "anchor"

          node.parentNode?.insertBefore(p, node)
        }
      })

      for (const tag of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
        content.querySelectorAll(tag).forEach((node) => {
          const anchors = [] as HTMLElement[]
          node.querySelectorAll("a[id]").forEach((a) => {
            const p = document.createElement("p")
            p.id = a.id
            p.dataset.type = "anchor"
            anchors.push(p)
          })

          const box = document.createElement("div")

          const text = (node.textContent ?? "")
            .split("{{BR}}")
            .map((chunk) => chunk.trim())
            .filter(Boolean)
            .join(" - ")

          const p = document.createElement("p")

          p.textContent = text
          p.dataset.type = tag

          box.replaceChildren(...anchors, p)
          node.parentNode?.replaceChild(box, node)
        })
      }

      content.querySelectorAll("a[id]").forEach((node) => {
        const p = document.createElement("p")
        p.textContent = node.textContent
        p.id = node.id
        p.dataset.type = "anchor"
        node.parentNode?.replaceChild(p, node)
      })

      const flatElements: FlatElement[] = []

      content.querySelectorAll("p").forEach((node) => {
        if (node.dataset.type) {
          const text = this.#cleanText(node.textContent ?? "")

          if (node.dataset.type.startsWith("h") && text === "") {
            return
          }

          flatElements.push({
            type: node.dataset.type,
            id: node.id,
            path: item.path,
            text,
          })

          return
        }

        const allText = (node.textContent ?? "").trim()

        if (allText === "") {
          return
        }

        for (const text of allText.split("{{BR}}")) {
          const pText = this.#cleanText(text)

          if (pText === "") {
            continue
          }

          flatElements.push({
            type: "paragraph",
            id: node.id,
            path: item.path,
            text: pText,
          })
        }
      })

      if (flatElements.length > 0) {
        parts.push(flatElements)
      }
    }

    const rawChapters = toc === null ? this.#prepareBookWithoutToc(parts) : this.#prepareBookWithToc(parts, toc)

    const chapters = rawChapters.filter(({ title }) => !shouldSkip(title))

    // const all = chapters
    //   .map((chapter) => chapter.paragraphs)
    //   .flat()
    //   .join(" ")
    //
    // const special = [...new Set([...all].filter((char) => !this.#charset.has(char) && !replacements.letters[char]))]
    //
    // console.log("--- SPECIAL -----------------")
    // console.log(special.join())
    // console.log(special.map((char) => char.charCodeAt(0)))

    return { info, chapters, charset: this.#charset, cover }
  }
}
