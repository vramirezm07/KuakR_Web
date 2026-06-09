/** Nombres exactos como en Google Fonts — deben coincidir con el <link> del HTML */
export const GLITCH_FONTS = [
  'Rubik Storm',
  'Coral Pixels',
  'Bitcount Grid Single',
  'Jacquard 12',
  'Bytesized',
  'Jacquarda Bastarda 9',
  'Micro 5 Charted',
  'Pixelify Sans',
]

export const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bytesized&family=Coral+Pixels&family=Jacquard+12&family=Jacquarda+Bastarda+9&family=Micro+5+Charted&family=Montserrat+Alternates:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Pixelify+Sans:wght@400..700&family=Rubik+Storm&family=Sixtyfour+Convergence&display=swap'

export function formatFontFamily(name) {
  return `"${name}", cursive`
}

export async function loadGlitchFonts() {
  if (!document.fonts?.load) return
  await Promise.all(
    GLITCH_FONTS.map((name) => document.fonts.load(`400 16px "${name}"`))
  )
}
