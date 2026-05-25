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

    float scan = sin((uv.y + t * 0.15) * uResolution.y * 0.8) * 0.5 + 0.5;
    float scanline = pow(scan, 8.0) * 0.35 * intensity;

    float grain = hash(uv * uResolution * 0.5 + t * 120.0);
    float staticBurst = step(0.92, hash1(floor(t * 14.0))) * intensity;
    float noise = grain * (0.12 + staticBurst * 0.55) * intensity;

    float bandY = floor(uv.y * 12.0 + t * 3.0);
    float bandGlitch = step(0.88, hash(vec2(bandY, floor(t * 8.0)))) * intensity;
    float barShift = (hash(vec2(bandY, t)) - 0.5) * 0.04 * bandGlitch;
    float bar = smoothstep(0.0, 0.008, abs(fract(uv.y * 80.0 - t * 2.5) - 0.5)) * bandGlitch * 0.6;

    float roll = fract(t * 0.12);
    float rollLine = smoothstep(0.002, 0.0, abs(uv.y - roll)) * 0.85 * intensity;

    vec2 vigUv = uv * 2.0 - 1.0;
    float vig = 1.0 - dot(vigUv, vigUv) * 0.35;
    float greenTint = 0.04 * intensity;

    vec3 color = vec3(0.0);
    color.g += greenTint;
    color += vec3(scanline * 0.15);
    color += vec3(noise);
    color += vec3(0.2, 1.0, 0.35) * bar;
    color += vec3(0.9, 0.95, 0.9) * rollLine;
    color *= vig;

    float alpha = clamp(
      scanline * 0.5 + noise * 1.2 + bar * 0.7 + rollLine * 0.9 + greenTint * 2.0,
      0.0, 0.85
    ) * intensity;

    gl_FragColor = vec4(color, alpha);
  }
`

export class CCTVGlitch {
  constructor(canvas) {
    this.canvas = canvas
    this.clock = new THREE.Clock()
    this.running = false
    this.intensity = 1
    this.raf = null

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
      uIntensity: { value: 1 },
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

  setIntensity(value) {
    this.intensity = value
    this.uniforms.uIntensity.value = value
  }

  start() {
    if (this.running) return
    this.running = true
    this.clock.start()
    this.tick()
  }

  stop() {
    this.running = false
    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
  }

  tick = () => {
    if (!this.running) return
    this.uniforms.uTime.value = this.clock.getElapsedTime()
    this.renderer.render(this.scene, this.camera)
    this.raf = requestAnimationFrame(this.tick)
  }

  pulseGlitch(duration = 0.35, peak = 2.2) {
    const base = this.intensity
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1)
      const wave = Math.sin(p * Math.PI)
      this.uniforms.uIntensity.value = base + wave * (peak - base)
      if (p < 1) requestAnimationFrame(step)
      else this.uniforms.uIntensity.value = base
    }
    requestAnimationFrame(step)
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this.onResize)
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.renderer.dispose()
  }
}
