import "./Books.css"
import { Component, For, createMemo } from "solid-js"
import Book from "../../common/book/Book"
import state from "../../../state/state"
import Pagination from "../../common/pagination/Pagination"
import Filters from "./Filters"

const Books: Component = () => {
  const books = createMemo(() => {
    return state.get.booksIndex.books
      .map((entry) => ({
        id: entry.id,
        title: entry.title ?? "No Title",
        author: entry.author ?? "Unknown",
        pages: Math.ceil(entry.length / (5 * 300)),
        description: entry.description ?? "No description",
        genres: entry.genres,
        coverUrl: `/books/${entry.id}/cover${
          devicePixelRatio > 1 ? "" : "-small"
        }.min.png`,
        progress:
          Math.random() > 0.2 ? 0 : Math.random() > 0.5 ? 1 : Math.random(),
        favorite: Math.random() > 0.9,
        dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
      }))
      .filter((book) => {
        const phrase = state.get.session.search
        if (phrase) {
          return (
            book.author.toLowerCase().includes(phrase) ||
            book.title.toLowerCase().includes(phrase) ||
            book.genres.some((genre) => genre.includes(phrase))
          )
        }

        return true
      })
  })

  const booksOnPage = createMemo(() => {
    const limit = state.get.settings.booksPerPage
    const start = (state.get.session.booksPage - 1) * limit
    const end = start + limit
    console.log({ start, end })
    return books().slice(start, end)
  })

  const totalPages = createMemo(() => {
    return Math.ceil(books().length / state.get.settings.booksPerPage)
  })

  const setPage = (page: number) => {
    state.set("session", "booksPage", page)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <Filters />
      <Pagination
        page={state.get.session.booksPage}
        of={totalPages()}
        change={setPage}
      />
      <p class="results">
        Found <strong>{books().length}</strong> books
      </p>
      <section class="books">
        <For each={booksOnPage()}>
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
      <Pagination
        page={state.get.session.booksPage}
        of={totalPages()}
        change={setPage}
      />
    </>
  )
}

export default Books
