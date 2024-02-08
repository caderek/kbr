const genreKeywords = {
  // type
  fiction: ["fiction"],
  "non-fiction": ["non-fiction"],
  // main genres
  adventure: ["adventure"],
  horror: ["horror", "terror", "monster"],
  thriller: ["thriller"],
  history: ["history", "historic", "historical"],
  // other
  pirates: ["pirate"],
  revenge: ["revenge"],
}

function hasKeywords(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword))
}

export function extractGenres(
  subject: string[],
  subjectSE: string[],
  description?: string,
): Set<string> {
  const genres = new Set(subjectSE.map((item) => item.trim().toLowerCase()))

  // use description only as a last resort (potential false-positives)
  if (subject.length === 0 && (description === undefined || genres.size > 0)) {
    return genres
  }

  const text = (
    subject.length > 0 ? subject.join(" ") : (description as string)
  ).toLowerCase()

  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (hasKeywords(text, keywords)) {
      genres.add(genre)
    }
  }

  return genres
}
