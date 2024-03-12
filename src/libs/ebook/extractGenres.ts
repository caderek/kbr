// use # for exact words
const genreKeywords: { [key: string]: (string | RegExp)[] } = {
  action: ["action"],
  adventure: ["adventure"],
  autobiography: ["autobiograph"],
  biography: [/^biograph/],
  children: ["juvenile fiction", "children", "children's"],
  comedy: ["humor", "humour", "comedy", "comedic", "funny", "hilarious"],
  "coming-of-age": ["bildungsroman", "coming of age", "coming-of-age"],
  crime: ["crime", "criminal"],
  dragons: ["dragon"],
  drama: ["drama"],
  erotic: ["erotic", "sex"],
  fantasy: ["fantasy"],
  fiction: ["fiction"],
  friendship: ["friendship"],
  gothic: ["gothic"],
  history: ["history", "historic", "historical"],
  horror: ["horror", "terror", "monster"],
  magic: ["magic"],
  mystery: ["mystery"],
  memoir: ["memoir"],
  murder: ["murder"],
  nonfiction: ["non-fiction", "nonfiction"],
  philosophy: ["philosophy"],
  pirates: ["pirate"],
  poetry: ["poetry"],
  psychological: ["psychological"],
  revenge: ["revenge"],
  romance: ["romance", "love"],
  satire: ["satire"],
  "science-fiction": ["science-fiction", "science fiction", "scifi", "sci-fi"],
  shorts: ["short"],
  spirituality: ["spirituality"],
  survival: ["survival"],
  thriller: ["thriller"],
  travel: ["travel"],
  vampires: ["vampire"],
  "young-adult": ["young adult", "highschool"],
}

const hasKeywords = (text: string) => (keywords: (string | RegExp)[]) => {
  const words = text.split(" ").map((word) => word.replace(/[^a-z]+$/, ""))

  return keywords.some((keyword) =>
    keyword instanceof RegExp
      ? words.some((word) => keyword.test(word))
      : text.includes(keyword),
  )
}

export function extractGenres(
  subject: string[],
  subjectSE: string[],
  description?: string[],
): string[] {
  const genres: Set<string> = new Set()

  let text = ""

  if (subject.length > 0 || subjectSE.length > 0) {
    text = [...subjectSE, ...subject].join(" ").toLowerCase()
  } else if (description && description.length > 0) {
    text = description.join(" ").toLowerCase()
  }

  if (!text) {
    return [...genres]
  }

  const hasKeywordsInText = hasKeywords(text)

  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (hasKeywordsInText(keywords)) {
      genres.add(genre)
    }
  }

  return [...genres]
}
