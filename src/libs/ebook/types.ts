export type ManifestEntry = [
  string,
  {
    path: string
    mime: string
    ext: string
    type: string
  },
]

export type FlatElement = {
  type: string
  path: string
  id: string
  text: string
}

export type Part = FlatElement[]

export type TocElement = {
  label: string
  path: string
  id: string
}

export type Chapter = {
  title: string
  paragraphs: string[]
}

export type Info = { [key: string]: string | null }

export type Book = {
  info: Info
  chapters: Chapter[]
  charset: Set<string>
}
