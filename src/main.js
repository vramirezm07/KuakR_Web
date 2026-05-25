import './style.css'
import gsap from 'gsap'
import SplitType from 'split-type'
import { CCTVGlitch } from './cctvGlitch.js'
import { GLITCH_FONTS, formatFontFamily, loadGlitchFonts } from './fonts.js'

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

let lastFont = null

function getRandomFont() {
  let newFont
  do {
    newFont = rand(GLITCH_FONTS)
  } while (newFont === lastFont && GLITCH_FONTS.length > 1)
  lastFont = newFont
  return newFont
}

function setGlitchFont(el, fontName) {
  el.style.fontFamily = formatFontFamily(fontName)
  el.style.fontWeight = '400'
  el.style.fontStyle = 'normal'
}

function updateCctvClock(el) {
  if (!el) return
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  el.textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const cctvTimeStart = document.getElementById('cctvTime')
const cctvTimeRain = document.getElementById('cctvTimeRain')
updateCctvClock(cctvTimeStart)
updateCctvClock(cctvTimeRain)
setInterval(() => {
  updateCctvClock(cctvTimeStart)
  updateCctvClock(cctvTimeRain)
}, 1000)

const glitchStart = new CCTVGlitch(document.getElementById('glitch-canvas'))
const glitchRain = new CCTVGlitch(document.getElementById('glitch-canvas-rain'))
glitchStart.setIntensity(0.85)
glitchRain.setIntensity(1.1)
glitchStart.start()
glitchRain.start()

function applyGlitch() {
  const heads = document.querySelectorAll('#startScreen .glitch-target')

  heads.forEach((h) => h.classList.remove('active'))

  const randomHead = heads[Math.floor(Math.random() * heads.length)]
  randomHead.classList.add('active')
  setGlitchFont(randomHead, getRandomFont())

  randomHead.classList.add('glitch')
  document.getElementById('startScreen')?.classList.add('cctv-surge')
  glitchStart.pulseGlitch(0.25, 2.4)

  setTimeout(() => {
    randomHead.classList.remove('glitch')
    document.getElementById('startScreen')?.classList.remove('cctv-surge')
  }, 200 + Math.random() * 300)
}

loadGlitchFonts().then(() => {
  applyGlitch()
  setInterval(applyGlitch, 1000)
})

setInterval(() => {
  if (document.getElementById('rainScreen')?.style.display === 'block') {
    glitchRain.pulseGlitch(0.2, 2.6)
    document.getElementById('rainScreen')?.classList.add('cctv-surge')
    setTimeout(() => document.getElementById('rainScreen')?.classList.remove('cctv-surge'), 180)
  }
}, 2200)

const rainContainer = document.getElementById('rain-container')
const rainScreen = document.getElementById('rainScreen')
const startScreen = document.getElementById('startScreen')

const images = [
  './src/assets/album_foto.png',
  './src/assets/bts_dope.png',
  './src/assets/comics.png',
  './src/assets/ipad.png',
  './src/assets/la_bruja.png',
  './src/assets/maiz.png',
  './src/assets/Monster_high.png',
  './src/assets/rojo.png',
]

let rainInterval = null

function createRainObject() {
  const randomImage = images[Math.floor(Math.random() * images.length)]

  const img = document.createElement('img')
  img.src = randomImage
  img.classList.add('rain-object')
  img.style.left = Math.random() * window.innerWidth + 'px'

  if (Math.random() < 0.08) {
    img.classList.add('rain-glitch-snap')
  }

  if (randomImage.includes('maiz')) {
    img.style.cursor = 'pointer'
    img.addEventListener('click', () => {
      window.location.href = './catalog.html'
    })
  }

  rainContainer.appendChild(img)

  const duration = 6
  setTimeout(() => img.remove(), duration * 1000)
}

startScreen.addEventListener('click', () => {
  startScreen.style.display = 'none'
  rainScreen.style.display = 'block'

  if (!rainInterval) {
    createRainObject()
    rainInterval = setInterval(createRainObject, 200)
  }
})


function initHackTextShake() {
  const el = document.querySelector('#hack_text')
  if (!el) return

  const split = new SplitType(el, {
    types: 'chars'
  })

  const chars = split.chars

  chars.forEach((char) => {
    char.classList.add('hack-char')

    gsap.to(char, {
      x: () => gsap.utils.random(-2, 2),
      y: () => gsap.utils.random(-1.5, 1.5),
      rotation: () => gsap.utils.random(-2, 2),

      duration: () => gsap.utils.random(0.04, 0.09),

      repeat: -1,
      yoyo: true,

      ease: 'sine.inOut',

      delay: Math.random() * 0.2
    })
  })

  // flickers ocasionales
  gsap.to(chars, {
    opacity: () => gsap.utils.random(0.7, 1),
    duration: 0.03,

    stagger: {
      each: 0.02,
      from: 'random'
    },

    repeat: -1,
    repeatDelay: 2.5,

    ease: 'none'
  })
}

initHackTextShake()