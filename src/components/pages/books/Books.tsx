import "./Books.css"
import { Component, For, createResource, createEffect } from "solid-js"
import Book from "../../common/book/Book"
import { randomElement } from "../../../utils/random"
import type { QuickBookInfo } from "../../../types/common"

async function fetchData() {
  const res = await fetch("/books/index.json")
  const data = (await res.json()) as QuickBookInfo[]

  const books = data.map((entry) => ({
    id: entry.id,
    title: entry.title ?? "No Title",
    author: entry.author ?? "Unknown",
    pages: Math.ceil(entry.length / (5 * 300)),
    description: entry.description ?? "No description",
    genres: entry.genres,
    coverUrl: `/books/${entry.id}/cover-${
      devicePixelRatio > 1 ? "medium" : "small"
    }.png`,
    progress: Math.random() > 0.2 ? 0 : Math.random() > 0.5 ? 1 : Math.random(),
    favorite: Math.random() > 0.9,
    dateAdded: Date.now() - 1000 * 60 * 60 * 24 * 8,
  }))

  const randomBooks: typeof books = []

  while (randomBooks.length < Math.min(12 * 5, books.length)) {
    const book = randomElement(books)
    if (!randomBooks.find((b) => b.id === book.id)) {
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
