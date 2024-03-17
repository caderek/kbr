import isMobile from "is-mobile"

export default {
  IS_MOBILE: isMobile(),
  CHARACTERS_PER_PAGE: 2000, // https://ux.stackexchange.com/questions/133883/is-there-any-specific-maximum-number-of-characters-within-a-single-page-to-be-co
  AFK_BOUNDRY: 5000, // ms
  AFK_PENALTY: 1000, // ms
}
