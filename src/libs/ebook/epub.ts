import { BlobReader, ZipReader, TextWriter, Entry } from "@zip.js/zip.js"
import { getFileType } from "../getFileType"
import { cleanText } from "../cleanText"
import { getCharset } from "../charsets"

const SKIP_TITLES_BY_LANG = {
  en: ["contents", "copyright", "about the publisher", "title page"],
  pl: ["spis treści", "strona redakcyjna"],
}
const SKIP_TITLES = new Set(Object.values(SKIP_TITLES_BY_LANG).flat())

type FlatElement = {
  type: string
  path: string
  id: string
  text: string
}

type Part = FlatElement[]

type TocElement = {
  label: string
  path: string
  id: string
}

type Chapter = {
  title: string
  paragraphs: string[]
}

type Info = { [key: string]: string | null }

type Book = {
  info: Info
  chapters: Chapter[]
  charset: Set<string>
}

export class Epub {
  #reader
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
    const file = entries.find(
      (entry) =>
        entry.filename === filePath || entry.filename.endsWith(filePath),
    )

    if (file === undefined || file.getData == undefined) {
      throw new Error("Incorrect epub file")
    }

    const metaWriter = new TextWriter()
    const text = (await file.getData(metaWriter)).replace(/<script.*>/g, "")
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
    const toc: TocElement[][] = [
      ...element.querySelectorAll(":scope > navPoint"),
    ].map((navPoint) => {
      const currentLabel = this.#cleanText(
        navPoint.querySelector("navLabel")?.textContent ?? "",
      )

      const label = parentLabel
        ? `${parentLabel} - ${currentLabel}`
        : currentLabel

      const link = navPoint.querySelector("content")?.getAttribute("src") ?? ""
      const [rawPath, id] = link.split("#")
      const path = `${prefix}${rawPath}`
      const children = this.#readToc(navPoint, prefix, label)
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
            const fragment =
              entry.text.slice(0, 50) + (entry.text.length > 50 ? "..." : "")

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
    return sequence.findIndex(
      (entry) =>
        entry.path === chapter.path && (!chapter.id || entry.id === chapter.id),
    )
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

      const to = nextChapter
        ? this.#findChapterStart(nextChapter, sequence)
        : sequence.length

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
            currentChapter.label
              .toLowerCase()
              .includes(entry.text.toLowerCase())
          ) {
            continue // skip chapter title as normal paragraph
          }
          paragraphs.push(entry.text)
        }
      }

      if (
        paragraphs.length > 0 &&
        !SKIP_TITLES.has(paragraphs[0].toLowerCase())
      ) {
        const missingTitleParts = title.filter(
          (chunk) =>
            !currentChapter.label
              .toLowerCase()
              .includes(chunk.toLowerCase().trim()),
        )

        chapters.push({
          title: this.#cleanText(
            [currentChapter.label, ...missingTitleParts]
              .map((chunk) => chunk.trim())
              .join(" - "),
          ),
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

  async #extractContent(structureFilePath: string, entries: Entry[]) {
    const content = await this.#readFile(structureFilePath, entries)
    const metadata = content.querySelector("metadata")
    const prefix = structureFilePath.startsWith("OEBPS/") ? "OEBPS/" : ""

    const info = Object.fromEntries(
      [...(metadata?.children ?? [])]
        .filter((node) => node.tagName.startsWith("dc:"))
        .map((node) => [node.tagName.slice(3), node.textContent]),
    )
    const charset = getCharset(info.language ?? "?")
    this.#cleanText = cleanText(charset)

    const manifestEntries = [
      ...(content.querySelectorAll("manifest > item") ?? []),
    ].map((item) => {
      const mime = item.getAttribute("media-type") ?? ""
      const file = item.getAttribute("href") ?? ""
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

    const tocEntry = (manifestEntries.find((entry) => entry[1].ext === "ncx") ??
      [])[1]

    let toc: TocElement[] | null = null

    if (tocEntry) {
      const tocContent = await this.#readFile(tocEntry.path, entries)
      toc = this.#readToc(tocContent.querySelector("navMap"), prefix)
    }

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

    const parts = []

    for (const item of spine) {
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

          const p = document.createElement("p")
          p.textContent = node.textContent
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

    const rawChapters =
      toc === null
        ? this.#prepareBookWithoutToc(parts)
        : this.#prepareBookWithToc(parts, toc)

    const chapters = rawChapters.filter(({ title }) => {
      const titleLow = title.toLowerCase()
      return (
        !titleLow.includes("project gutenberg") &&
        !SKIP_TITLES.has(titleLow) &&
        ![...SKIP_TITLES].some((skipTitle) => titleLow.includes(skipTitle))
      )
    })

    const all = chapters
      .map((chapter) => chapter.paragraphs)
      .flat()
      .join(" ")

    const special = [
      ...new Set([...all].filter((char) => !charset.has(char))),
    ].join(" ")

    console.log("--- SPECIAL -----------------")
    console.log(special)

    return { info, chapters, charset }
  }
}
