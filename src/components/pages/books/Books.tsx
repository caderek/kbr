import "./Books.css"
import { Component, For, createMemo, createSignal } from "solid-js"
import Book from "../../common/book/Book"
import state from "../../../state/state"

const Books: Component = () => {
  const [page, setPage] = createSignal(0)

  const books = createMemo(() => {
    return state.get.booksIndex.books.map((entry) => ({
      id: entry.id,
      title: entry.title ?? "No Title",
      author: entry.author ?? "Unknown",
      pages: Math.ceil(entry.length / (5 * 300)),
      description: entry.description ?? "No description",
      genres: entry.genres,
      coverUrl: `/books/${entry.id}/cover-${
        devicePixelRatio > 1 ? "medium" : "small"
      }.min.png`,
      progress:
        Math.random() > 0.2 ? 0 : Math.random() > 0.5 ? 1 : Math.random(),
      favorite: Math.random() > 0.9,
      dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
    }))
  })

  return (
    <>
      <section class="filters"></section>
      <section class="books">
        <For each={books().slice(0, state.get.settings.booksPerPage)}>
          {(book) => (
            <Book
              id={book.id}
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
