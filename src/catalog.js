import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';


import 'swiper/css';
import 'swiper/css/navigation';


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
});

const botonSiguiente = document.querySelector('.swiper-button-next');
const botonAnterior = document.querySelector('.swiper-button-prev');

if (botonSiguiente && botonAnterior) {
  botonSiguiente.addEventListener('click', () => {
    swiper.slideNext(); // Le ordena a Swiper avanzar
  });

  botonAnterior.addEventListener('click', () => {
    swiper.slidePrev(); // Le ordena a Swiper retroceder
  });
}