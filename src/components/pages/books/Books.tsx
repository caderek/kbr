import "./Books.css"
import { Component, For } from "solid-js"
import Book from "../../common/book/Book"

const repeated = new Array(22).fill(null).map((_) => ({
  coverUrl: Math.random() > 0.5 ? "https://i.ibb.co/2nvhMFV/download.png" : "https://i.ibb.co/j46ZKZw/download-1.png",
  title: "Dracula",
  author: "Bram Stoker",
  description: "An ancient undead monster terrorizes Victorian London.",
  pages: Math.ceil(Math.random() * 800),
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
    pages: 260,
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

const Books: Component = () => {
  return (
    <>
      <section class="filters"></section>
      <section class="books">
        <For each={books}>
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
            />
          )}
        </For>
      </section>
    </>
  )
}

export default Books
