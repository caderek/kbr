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

export type Info = {
  title: string | null
  author: string | null
  language: string | null
  description: string | null
  longDescription: string[]
  year: number | null
  genres: Set<string>
  rights: string | null
  publisher: string | null
  source: string | URL | null
}

export type Cover = Blob | null

export type Book = {
  info: Info
  chapters: Chapter[]
  charset: Set<string>
  cover: {
    medium: Cover
    small: Cover
  }
}
