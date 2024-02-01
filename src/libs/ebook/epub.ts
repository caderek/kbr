import { BlobReader, ZipReader, TextWriter, Entry } from "@zip.js/zip.js"
import { getFileType } from "../getFileType"
import { cleanText } from "../cleanText"

type FlatElement = {
  type: string
  id: string
  text: string
}

type TocElement = {
  label: string
  path: string
  id: string
  children: TocElement[]
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

  #readToc(element: Element) {
    const toc: TocElement[] = [
      ...element.querySelectorAll(":scope > navPoint"),
    ].map((navPoint) => {
      const label = cleanText(
        navPoint.querySelector("navLabel")?.textContent ?? "",
      )
      const link = navPoint.querySelector("content")?.getAttribute("src") ?? ""
      const [path, id] = link.split("#")
      const children = this.#readToc(navPoint)
      return { label, path, id, children }
    })

    return toc
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

    console.log("--- PARTS -----------------")
    console.log(parts)

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
