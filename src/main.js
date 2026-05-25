import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

console.log('Hello Three.js!')
console.log('Hello GSAP!')



const fonts = [ "Rubik Storm", "Coral Pixels", 
    "Bitcount Grid Single", "Jacquard 12", "Bytesized", 
    "Jacquarda Bastarda 9", "Micro 5 Charted" ];

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

let lastFont = null;

function getRandomFont(){
  let newFont;
  do {
    newFont = rand(fonts);
  } while (newFont === lastFont && fonts.length > 1);
  lastFont = newFont;
  return newFont;
}

function applyGlitch(){
  const heads = document.querySelectorAll('#startScreen .glitch-target');
  
  // Quitar .active de todos
  heads.forEach(h => h.classList.remove('active'));
  
  // Escoger uno aleatorio y activarlo
  const randomHead = heads[Math.floor(Math.random() * heads.length)];
  randomHead.classList.add('active');
  randomHead.style.fontFamily = getRandomFont();
  
  // Activar glitch
  randomHead.classList.add('glitch');
  setTimeout(() => randomHead.classList.remove('glitch'), 200 + Math.random()*300);
}

// Ejecutar cada segundo
applyGlitch();
setInterval(applyGlitch, 1000);


const container = document.getElementById('rain-container')

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

function createRainObject(){

  const img = document.createElement('img')

  img.src = images[Math.floor(Math.random() * images.length)]

  img.classList.add('rain-object')

  img.style.left = Math.random() * window.innerWidth + 'px'

  img.style.animationDuration =
    3 + Math.random() * 5 + 's'

  img.style.width =
    40 + Math.random() * 80 + 'px'

  container.appendChild(img)

  setTimeout(() => {
    img.remove()
  }, 8000)
}

setInterval(createRainObject, 200)