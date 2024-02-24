export type IconsId =
  | "annotations"
  | "back"
  | "bookmark-off"
  | "bookmark-on"
  | "books"
  | "close"
  | "dark-mode"
  | "download"
  | "favorite-off"
  | "favorite"
  | "fullscreen-off"
  | "fullscreen"
  | "heart-off"
  | "heart"
  | "home"
  | "info"
  | "light-mode"
  | "loading"
  | "more"
  | "profile"
  | "reload"
  | "repeat"
  | "settings"
  | "stats"
  | "toggle-off"
  | "toggle-on"
  | "warning"
  | "watch";

export type IconsKey =
  | "Annotations"
  | "Back"
  | "BookmarkOff"
  | "BookmarkOn"
  | "Books"
  | "Close"
  | "DarkMode"
  | "Download"
  | "FavoriteOff"
  | "Favorite"
  | "FullscreenOff"
  | "Fullscreen"
  | "HeartOff"
  | "Heart"
  | "Home"
  | "Info"
  | "LightMode"
  | "Loading"
  | "More"
  | "Profile"
  | "Reload"
  | "Repeat"
  | "Settings"
  | "Stats"
  | "ToggleOff"
  | "ToggleOn"
  | "Warning"
  | "Watch";

export enum Icons {
  Annotations = "annotations",
  Back = "back",
  BookmarkOff = "bookmark-off",
  BookmarkOn = "bookmark-on",
  Books = "books",
  Close = "close",
  DarkMode = "dark-mode",
  Download = "download",
  FavoriteOff = "favorite-off",
  Favorite = "favorite",
  FullscreenOff = "fullscreen-off",
  Fullscreen = "fullscreen",
  HeartOff = "heart-off",
  Heart = "heart",
  Home = "home",
  Info = "info",
  LightMode = "light-mode",
  Loading = "loading",
  More = "more",
  Profile = "profile",
  Reload = "reload",
  Repeat = "repeat",
  Settings = "settings",
  Stats = "stats",
  ToggleOff = "toggle-off",
  ToggleOn = "toggle-on",
  Warning = "warning",
  Watch = "watch",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.Annotations]: "61697",
  [Icons.Back]: "61698",
  [Icons.BookmarkOff]: "61699",
  [Icons.BookmarkOn]: "61700",
  [Icons.Books]: "61701",
  [Icons.Close]: "61702",
  [Icons.DarkMode]: "61703",
  [Icons.Download]: "61704",
  [Icons.FavoriteOff]: "61705",
  [Icons.Favorite]: "61706",
  [Icons.FullscreenOff]: "61707",
  [Icons.Fullscreen]: "61708",
  [Icons.HeartOff]: "61709",
  [Icons.Heart]: "61710",
  [Icons.Home]: "61711",
  [Icons.Info]: "61712",
  [Icons.LightMode]: "61713",
  [Icons.Loading]: "61714",
  [Icons.More]: "61715",
  [Icons.Profile]: "61716",
  [Icons.Reload]: "61717",
  [Icons.Repeat]: "61718",
  [Icons.Settings]: "61719",
  [Icons.Stats]: "61720",
  [Icons.ToggleOff]: "61721",
  [Icons.ToggleOn]: "61722",
  [Icons.Warning]: "61723",
  [Icons.Watch]: "61724",
};