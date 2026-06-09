
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec2 uResolution;
  uniform float uBloodAmount; // cantidad de sangre (0.0 a 1.0)
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float hash1(float n) {
    return fract(sin(n) * 43758.5453);
  }

  // Ruido para crear las formas de las manchas planas
  float noise2d(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
               mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
  }

  // Ruido Fractal (FBM) para dar bordes orgánicos a la mancha 2D
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    for (int i = 0; i < 4; ++i) {
      v += a * noise2d(p);
      p = p * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;
    float intensity = uIntensity;

    // --- EFECTOS ORIGINALES DEL GLITCH ---
    float flicker = 0.88 + 0.12 * sin(t * 28.0) * sin(t * 10.3);
    float scan = sin((uv.y + t * 10.22) * uResolution.y * 1.0) * 0.5 + 0.5;
    float scanline = pow(scan, 6.0) * 0.55 * intensity;

    float grain = hash(uv * uResolution * 0.65 + t * 180.0);
    float staticBurst = step(0.9, hash1(floor(t * 5.0))) * intensity;
    float noise = grain * (0.18 + staticBurst * 0.75) * intensity;

    float bandY = floor(uv.y * 9.0 + t * 0.008);
    float bandGlitch = step(0.82, hash(vec2(bandY, floor(t * 3.0)))) * intensity;
    float tear = smoothstep(0.0, 0.012, abs(fract(uv.y * 55.0 - t * 3.2) - 0.5)) * bandGlitch;

    float roll = fract(t * 0.1);
    float rollLine = smoothstep(0.003, 0.0, abs(uv.y - roll)) * 1.1 * intensity;

    float flash = step(0.97, hash1(floor(t * 5.0))) * intensity * 0.35;

    vec2 vigUv = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(vigUv, vigUv) * 0.55;

    // --- COLOR DE LA TV ---
    vec3 tvColor = vec3(0.0);
    tvColor += vec3(0.7, 0.9, 0.82) * (scanline + rollLine + flash);
    tvColor += vec3(noise);
    tvColor.r += noise * 0.02;
    tvColor.b += noise * 0.06;
    tvColor += vec3(0.25, 0.15, 0.1) * tear * 0.5;
    tvColor *= vig * flicker;

    // --- CAPA DE MANCHAS DE SANGRE (2D PROCEDIMENTAL) ---
    // Ajustamos las coordenadas con la resolución para que no se deformen las manchas
    vec2 bloodUv = uv * vec2(uResolution.x / uResolution.y, 1.0) * 3.2;
    
    // Un goteo descendente muy sutil a lo largo del tiempo
    bloodUv.y += t * 0.04 * uBloodAmount; 
    
    float bloodNoise = fbm(bloodUv);

    // La sangre crece desde los bordes oscuros de la pantalla hacia el centro
    float bloodThreshold = 1.0 - uBloodAmount;
    float bloodMask = smoothstep(bloodThreshold - 0.15, bloodThreshold + 0.15, bloodNoise + (1.0 - vig) * 0.4);

    // Color rojo vino oscuro para la sangre
    vec3 bloodColor = vec3(0.37, 0.01, 0.01);
    // Añadimos variaciones de tono (coágulos internos planos)
    bloodColor *= mix(1.0, 0.35, fbm(bloodUv * 2.5)); 

    // Mezclamos el glitch y la sangre usando la máscara plana
    vec3 finalColor = mix(tvColor, bloodColor, bloodMask);

    // --- OPACIDAD DE LA PANTALLA ---
    float tvAlpha = clamp((scanline + noise * 1.4 + tear * 0.8 + rollLine + flash) * flicker, 0.0, 0.37) * intensity;
    // Si hay sangre, la zona se vuelve más sólida (opaca)
    float finalAlpha = mix(tvAlpha, uBloodAmount * 0.98, bloodMask);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`

export class CatalogAnalogTV {
  constructor(canvas) {
    this.canvas = canvas
    this.clock = new THREE.Clock()
    this.running = false
    this.raf = null
    this.intensity = 1.35

    // --- Lógica de inactividad ---
    this.bloodAmount = 0.0
    this.lastActivityTime = Date.now()
    this.INACTIVITY_LIMIT = 2.5 * 60 * 1000 // <- CAMBIADO: Ahora son 10 segundos para pruebas

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor(0x000000, 0)

    this.scene = new THREE.Scene()
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this.uniforms = {
      uTime: { value: 0 },
      uIntensity: { value: this.intensity },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uBloodAmount: { value: 0.0 }
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
    })

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    this.scene.add(this.mesh)

    this.onResize = () => this.resize()
    
    // Función para reiniciar el contador si el usuario interactúa
    this.resetActivity = () => {
      this.lastActivityTime = Date.now()
    }

    window.addEventListener('resize', this.onResize)
    window.addEventListener('mousemove', this.resetActivity)
    window.addEventListener('keydown', this.resetActivity)
    window.addEventListener('touchstart', this.resetActivity)

    this.resize()
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    this.renderer.setSize(w, h, false)
    this.uniforms.uResolution.value.set(w, h)
  }

  start() {
    if (this.running) return
    this.running = true
    this.clock.start()
    this.tick()
  }

  tick = () => {
    if (!this.running) return
    
    const delta = this.clock.getDelta()
    this.uniforms.uTime.value = this.clock.getElapsedTime()

    // Calculamos cuánto tiempo ha pasado quieto el usuario
    const timeSinceLastActivity = Date.now() - this.lastActivityTime

    if (timeSinceLastActivity > this.INACTIVITY_LIMIT) {
      // Si pasa de los 10 segundos, la sangre aparece gradualmente (tarda unos 4-5 segundos en cubrir lo máximo)
      this.bloodAmount = Math.min(1.0, this.bloodAmount + delta * 0.2)
    } else {
      // Si el usuario vuelve a moverse, la sangre se desvanece de golpe
      this.bloodAmount = Math.max(0.0, this.bloodAmount - delta * 1.5)
    }

    this.uniforms.uBloodAmount.value = this.bloodAmount

    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('mousemove', this.resetActivity)
    window.removeEventListener('keydown', this.resetActivity)
    window.removeEventListener('touchstart', this.resetActivity)

    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.renderer.dispose()
  }
}