import { BlobReader, ZipReader, TextWriter, Entry } from "@zip.js/zip.js"
import { getFileType } from "../getFileType"
import { cleanText } from "../cleanText"

type FlatElement = {
  type: string
  id: string
  text: string
}

type Part = {
  path: string
  entries: FlatElement[]
}

type TocElement = {
  label: string
  path: string
  id: string
}

type Chapter = {
  title: string
  paragraphs: string[]
}

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

    const content = await this.#extractContent(rootFile.path, entries)

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

  #readToc(element: Element, parentLabel?: string) {
    const toc: TocElement[][] = [
      ...element.querySelectorAll(":scope > navPoint"),
    ].map((navPoint) => {
      const currentLabel = cleanText(
        navPoint.querySelector("navLabel")?.textContent ?? "",
      )

      const label = parentLabel
        ? `${parentLabel} - ${currentLabel}`
        : currentLabel

      const link = navPoint.querySelector("content")?.getAttribute("src") ?? ""
      const [path, id] = link.split("#")
      const children = this.#readToc(navPoint, label)
      return children.length > 0 ? children : [{ label, path, id }]
    })

    return toc.flat()
  }

  #prepareBookWithoutToc(parts: Part[]) {
    const chapters: Chapter[] = []

    for (const { entries } of parts) {
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
              title: cleanText(title.join(" ")),
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
          title: cleanText(title.join(" ")),
          paragraphs,
        })
      }
    }

    return chapters.filter(
      ({ title }) => !title.toLowerCase().includes("project gutenberg"),
    )
  }

  #prepareBookWithToc(parts: Part[], toc: TocElement[]) {
    console.log("PREPARING WITH TOC")
    const sequence = parts
      .map((part) => {
        part.entries.unshift({
          type: "path",
          id: part.path,
          text: "",
        })
        return part.entries
      })
      .flat()

    console.log({ sequence })

    for (const item of toc) {
      console.log(item)
    }
  }

  async #extractContent(structureFilePath: string, entries: Entry[]) {
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

    console.log({ manifest })

    const tocEntry = (manifestEntries.find((entry) => entry[1].ext === "ncx") ??
      [])[1]

    let toc: TocElement[] | null = null

    if (tocEntry) {
      const tocContent = await this.#readFile(tocEntry.path, entries)
      console.log(tocContent)
      toc = this.#readToc(tocContent.querySelector("navMap"))
    }

    console.log("--- TOC --------------------------")
    console.log(toc)

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

    console.log({ spine })

    console.log("--- INFO -----------------")
    console.log(info)

    const parts = []

    for (const item of spine) {
      const content = await this.#readFile(item.path, entries)

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
          const text = cleanText(node.textContent ?? "")

          if (node.dataset.type.startsWith("h") && text === "") {
            return
          }

          flatElements.push({
            type: node.dataset.type,
            id: node.id,
            text,
          })

          return
        }

        const text = (node.textContent ?? "").trim()

        if (text === "") {
          return
        }

        const p = document.createElement("p")
        p.textContent = text
        p.dataset.type = "paragraph"
        flatElements.push({
          type: "paragraph",
          id: node.id,
          text: cleanText(text),
        })
      })

      if (flatElements.length > 0) {
        parts.push({
          path: item.path,
          entries: flatElements,
        })
      }
    }

    const book =
      toc === null
        ? this.#prepareBookWithoutToc(parts)
        : this.#prepareBookWithToc(parts, toc)

    console.log("--- PARTS -----------------")
    console.log(parts)
    console.log("--- BOOK -----------------")
    console.log(book)

    const all = parts
      .flat()
      .filter((entry) => entry.type === "paragraph")
      .map((entry) => entry.text)
      .join(" ")

    const special = [
      ...new Set(
        [...all].filter((char) => (char.codePointAt(0) ?? Infinity) > 127),
      ),
    ].join(" ")

    console.log("--- SPECIAL -----------------")
    console.log(special)

    return { info, parts }
  }
}
