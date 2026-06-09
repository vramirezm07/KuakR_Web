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
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float hash1(float n) {
    return fract(sin(n) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;
    float intensity = uIntensity;

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

    vec3 color = vec3(0.0);
    color += vec3(0.7, 0.9, 0.82) * (scanline + rollLine + flash);
    color += vec3(noise);
    color.r += noise * 0.02;
    color.b += noise * 0.06;
    color += vec3(0.25, 0.15, 0.1) * tear * 0.5;
    color *= vig * flicker;

    float alpha = clamp(
      (scanline + noise * 1.4 + tear * 0.8 + rollLine + flash) * flicker,
      0.0,
      0.37
    ) * intensity;

    gl_FragColor = vec4(color, alpha);
  }
`

export class CatalogAnalogTV {
  constructor(canvas) {
    this.canvas = canvas
    this.clock = new THREE.Clock()
    this.running = false
    this.raf = null
    this.intensity = 1.35

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
    window.addEventListener('resize', this.onResize)
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
    this.uniforms.uTime.value = this.clock.getElapsedTime()
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    window.removeEventListener('resize', this.onResize)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.renderer.dispose()
  }
}
