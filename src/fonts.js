/** Nombres exactos como en Google Fonts — deben coincidir con el <link> del HTML */
export const GLITCH_FONTS = [
  'Rubik Storm',
  'Coral Pixels',
  'Bitcount Grid Single',
  'Jacquard 12',
  'Bytesized',
  'Jacquarda Bastarda 9',
  'Micro 5 Charted',
]

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&family=Bytesized&family=Coral+Pixels&family=Jacquard+12&family=Jacquarda+Bastarda+9&family=Micro+5+Charted&family=Montserrat+Alternates:ital,wght@0,100..900;1,100..900&family=Rubik+Storm&display=swap'

export function formatFontFamily(name) {
  return `"${name}", cursive`
}

export async function loadGlitchFonts() {
  if (!document.fonts?.load) return
  await Promise.all(
    GLITCH_FONTS.map((name) => document.fonts.load(`400 16px "${name}"`))
  )
}
