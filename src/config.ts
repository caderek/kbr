import isMobile from "is-mobile"

const CHARACTERS_PER_PAGE = 2000 // https://ux.stackexchange.com/questions/133883/is-there-any-specific-maximum-number-of-characters-within-a-single-page-to-be-co
const MAX_PAGES_PER_SCREEN = 3

export default {
  CHARACTERS_PER_PAGE,
  IS_MOBILE: isMobile(),
  AFK_BOUNDRY: 5000, // ms
  AFK_PENALTY: 1000, // ms
  MAX_CHARS_PER_SCREEN: CHARACTERS_PER_PAGE * MAX_PAGES_PER_SCREEN,
  ENTER_SYMBOL: "⏎",
}
