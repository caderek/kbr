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
  id: string
  title: string | null
  author: string | null
  language: string | null
  description: string | null
  longDescription: string[]
  year: number | null
  genres: string[]
  rights: string | null
  publisher: string | null
  source: {
    isUrl: boolean
    value: string
  } | null
}

export type CoverEntry = Blob | null

export type Cover = {
  medium: CoverEntry
  small: CoverEntry
}

export type Book = {
  info: Info
  chapters: Chapter[]
  cover: Cover
}
