import './style.css'
import './catalog.css'
import Swiper from 'swiper'
import { Navigation } from 'swiper/modules'
import { CatalogVirus } from './catalogVirus.js'
import { CatalogAnalogTV } from './catalogAnalogTV.js'

import 'swiper/css'
import 'swiper/css/navigation'

const swiper = new Swiper('.swiper', {
  loop: true,
  touchReleaseOnEdges: true,
  mousewheel: {
    releaseOnEdges: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
})

const botonSiguiente = document.querySelector('.swiper-button-next')
const botonAnterior = document.querySelector('.swiper-button-prev')

if (botonSiguiente && botonAnterior) {
  botonSiguiente.addEventListener('click', () => {
    swiper.slideNext()
  })

  botonAnterior.addEventListener('click', () => {
    swiper.slidePrev()
  })
}

const virusOverlay = document.getElementById('virus-overlay')
if (virusOverlay) {
  const catalogVirus = new CatalogVirus(virusOverlay, swiper)
  catalogVirus.bind()
}

// Esto se queda idéntico en tu archivo principal, no tienes que cambiarle nada:
const tvCanvas = document.getElementById('catalog-tv-canvas')
if (tvCanvas) {
  const catalogTV = new CatalogAnalogTV(tvCanvas)
  catalogTV.start() // <- La inactividad se empieza a calcular automáticamente aquí dentro
}
