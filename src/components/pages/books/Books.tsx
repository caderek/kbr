import "./Books.css"
import { Component, For, createResource, createEffect } from "solid-js"
import Book from "../../common/book/Book"
import { randomElement } from "../../../utils/random"

const repeated = new Array(22).fill(null).map((_) => ({
  coverUrl: Math.random() > 0.5 ? "https://i.ibb.co/2nvhMFV/download.png" : "https://i.ibb.co/j46ZKZw/download-1.png",
  title: "Dracula",
  author: "Bram Stoker",
  description: "An ancient undead monster terrorizes Victorian London.",
  pages: Math.ceil(Math.random() * 1000),
  progress: 0,
  favorite: false,
  dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
  genres: ["fiction", "horror", "vampires"],
}))

const books = [
  {
    coverUrl: "https://i.ibb.co/j46ZKZw/download-1.png",
    title: "Little Fuzzy",
    author: "H.Beam Piper",
    description:
      "On a planet being exploited for its resources, the discovery of a possibly-sentient native species creates consternation and conflict.",
    pages: 230,
    progress: 0.12,
    favorite: false,
    dateAdded: Date.now(),
    genres: ["fiction", "science-fiction"],
  },
  {
    coverUrl: "https://i.ibb.co/2nvhMFV/download.png",
    title: "Dracula",
    author: "Bram Stoker",
    description: "An ancient undead monster terrorizes Victorian London.",
    pages: 500,
    progress: 1,
    favorite: true,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
    genres: ["fiction", "horror", "vampires"],
  },
  ...repeated,
]

type Entry = {
  dir: string
  title: string | null
  author: string | null
  description: string | null
  genres: string[]
  length: number
  hasCover: boolean
}

async function fetchData() {
  const res = await fetch("/books/index.json")
  const data = await res.json()

  const books = data.map((entry: Entry) => ({
    dir: entry.dir,
    title: entry.title ?? "No Title",
    author: entry.author ?? "Unknown",
    pages: Math.ceil(entry.length / (5 * 300)),
    description: entry.description,
    genres: entry.genres,
    coverUrl: `/books/${entry.dir}/cover-${devicePixelRatio > 1 ? "medium" : "small"}.png`,
    progress: Math.random() > 0.2 ? 0 : Math.random() > 0.5 ? 1 : Math.random(),
    favorite: Math.random() > 0.9,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
  }))

  const randomBooks: typeof books = []

  while (randomBooks.length < 12 * 4) {
    const book = randomElement(books)
    if (!randomBooks.find((b) => b.dir === book.dir)) {
      randomBooks.push(book)
    }
  }

  return randomBooks
}

const Books: Component = () => {
  const [data, { mutate, refetch }] = createResource(fetchData)

  createEffect(() => {
    console.log(data())
  })

  return (
    <>
      <section class="filters"></section>
      <section class="books">
        <For each={data()}>
          {(book) => (
            <Book
              coverUrl={book.coverUrl}
              title={book.title}
              author={book.author}
              description={book.description}
              pages={book.pages}
              progress={book.progress}
              favorite={book.favorite}
              dateAdded={book.dateAdded}
              genres={book.genres}
              dir={book.dir}
            />
          )}
        </For>
      </section>
    </>
  )
}

export default Books
