import state from "../state/state"
import storage from "../storage/storage"

export async function toggleFavorite(bookId: string) {
  const index = state.get.booksIndex.findIndex((book) => book.id === bookId)

  if (index !== -1) {
    state.set("booksIndex", index, "favorite", (prev) => !prev)
    const isFavorite = state.get.booksIndex[index].favorite

    const favorites = new Set(await storage.general.get("favorites"))

    if (isFavorite) {
      favorites.add(bookId)
    } else {
      favorites.delete(bookId)
    }

    await storage.general.set("favorites", [...favorites])
  }
}
