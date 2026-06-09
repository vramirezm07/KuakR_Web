import gsap from 'gsap'

const MAX_CLONES = 200
const SPAWN_MIN_MS = 120
const SPAWN_MAX_MS = 380
/** Tiempo de lectura tranquila antes del virus (2.5 min por objeto) */
const VIRUS_DELAY_MS = 1.30* 60 * 1000

export class CatalogVirus {
  constructor(overlayEl, swiper) {
    this.overlay = overlayEl
    this.swiper = swiper
    this.activeSrc = null
    this.spawnTimer = null
    this.idleTimer = null
    this.delayTimer = null
    this.isActive = false
    this.virusUnlocked = false
    this.boundOnScroll = this.onStoryScroll.bind(this)
  }

  getActiveImageSrc() {
    const slide = this.swiper.slides[this.swiper.activeIndex]
    const img = slide?.querySelector('.object-layout img')
    return img?.getAttribute('src') || img?.src || null
  }

  isNodeInActiveSlide(node) {
    const slide = this.swiper.slides[this.swiper.activeIndex]
    return slide?.contains(node) ?? false
  }

  clear() {
    this.stopSpawning()
    clearTimeout(this.delayTimer)
    gsap.killTweensOf(this.overlay.querySelectorAll('.virus-clone'))
    this.overlay.replaceChildren()
  }

  /** Espera antes de permitir el virus en el slide actual */
  armReadingDelay() {
    clearTimeout(this.delayTimer)
    this.virusUnlocked = false
    this.isActive = false
    this.stopSpawning()

    this.delayTimer = setTimeout(() => {
      this.virusUnlocked = true
      this.activate()
    }, VIRUS_DELAY_MS)
  }

  canActivate() {
    return this.virusUnlocked && !!this.activeSrc
  }

  setSource(src) {
    this.activeSrc = src
  }

  onSlideChange() {
    this.clear()
    this.setSource(this.getActiveImageSrc())
    this.armReadingDelay()
  }

  onStoryScroll(e) {
    if (!this.isNodeInActiveSlide(e.currentTarget)) return
    if (!this.canActivate()) return
    this.activate()
  }

  onInfoEnter(e) {
    if (!this.isNodeInActiveSlide(e.currentTarget)) return
    if (!this.canActivate()) return
    this.activate()
  }

  onInfoLeave() {
    this.scheduleIdleStop()
  }

  activate() {
    if (!this.canActivate()) return
    this.isActive = true
    clearTimeout(this.idleTimer)
    if (!this.spawnTimer) this.startSpawning()
  }

  scheduleIdleStop() {
    clearTimeout(this.idleTimer)
    this.idleTimer = setTimeout(() => {
      this.isActive = false
      this.stopSpawning()
    }, 2500)
  }

  startSpawning() {
    const tick = () => {
      if (!this.isActive || !this.activeSrc) return
      this.spawn()
      const delay = gsap.utils.random(SPAWN_MIN_MS, SPAWN_MAX_MS)
      this.spawnTimer = setTimeout(tick, delay)
    }
    tick()
  }

  stopSpawning() {
    clearTimeout(this.spawnTimer)
    this.spawnTimer = null
  }

  spawn() {
    if (!this.activeSrc) return
    if (this.overlay.children.length >= MAX_CLONES) return

    const el = document.createElement('img')
    el.className = 'virus-clone'
    el.src = this.activeSrc
    el.alt = ''
    el.draggable = false

    const size = gsap.utils.random(45, 130)
    el.style.width = `${size}px`

    const x = gsap.utils.random(0, window.innerWidth - size)
    const y = gsap.utils.random(0, window.innerHeight - size)
    const rot = gsap.utils.random(-45, 45)

    el.style.left = `${x}px`
    el.style.top = `${y}px`

    this.overlay.appendChild(el)

    gsap.fromTo(
      el,
      {
        scale: 0,
        opacity: 0,
        rotation: rot - 20,
      },
      {
        scale: gsap.utils.random(0.7, 1.35),
        opacity: gsap.utils.random(0.65, 1),
        rotation: rot,
        duration: gsap.utils.random(0.08, 0.22),
        ease: 'steps(3)',
      }
    )

    if (Math.random() < 0.2) {
      gsap.to(el, {
        x: `+=${gsap.utils.random(-10, 10)}`,
        y: `+=${gsap.utils.random(-8, 8)}`,
        duration: 0.05,
        repeat: 3,
        yoyo: true,
        ease: 'none',
      })
    }
  }

  bind() {
    document.querySelectorAll('.object-story').forEach((story) => {
      story.addEventListener('scroll', this.boundOnScroll, { passive: true })
    })

    document.querySelectorAll('.object-info').forEach((info) => {
      info.addEventListener('mouseenter', (e) => this.onInfoEnter(e))
      info.addEventListener('mouseleave', () => this.onInfoLeave())
      info.addEventListener('touchstart', (e) => this.onInfoEnter(e), { passive: true })
    })

    this.swiper.on('slideChangeTransitionEnd', () => this.onSlideChange())
    this.setSource(this.getActiveImageSrc())
    this.armReadingDelay()
  }
}
