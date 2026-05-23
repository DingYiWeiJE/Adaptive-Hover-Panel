import { describe, it, expect } from 'vitest'
import { calculateLayout } from './calculateLayout'

describe('calculateLayout', () => {
  describe('方向判定', () => {
    it('鼠标在左上 → horizontal: right, vertical: bottom', () => {
      const r = calculateLayout({
        mouseX: 100,
        mouseY: 100,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      expect(r.horizontal).toBe('right')
      expect(r.vertical).toBe('bottom')
    })

    it('鼠标在右上 → horizontal: left, vertical: bottom', () => {
      const r = calculateLayout({
        mouseX: 900,
        mouseY: 100,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      expect(r.horizontal).toBe('left')
      expect(r.vertical).toBe('bottom')
    })

    it('鼠标在左下 → horizontal: right, vertical: top', () => {
      const r = calculateLayout({
        mouseX: 100,
        mouseY: 700,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      expect(r.horizontal).toBe('right')
      expect(r.vertical).toBe('top')
    })

    it('鼠标在右下 → horizontal: left, vertical: top', () => {
      const r = calculateLayout({
        mouseX: 900,
        mouseY: 700,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      expect(r.horizontal).toBe('left')
      expect(r.vertical).toBe('top')
    })
  })

  describe('中线', () => {
    it('mouseX === viewportWidth / 2 时（>，非 >=）→ horizontal: right', () => {
      const r = calculateLayout({
        mouseX: 500,
        mouseY: 100,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      expect(r.horizontal).toBe('right')
    })

    it('mouseY === viewportHeight / 2 时 → vertical: bottom', () => {
      const r = calculateLayout({
        mouseX: 100,
        mouseY: 400,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      expect(r.vertical).toBe('bottom')
    })

    it('正中心 → right + bottom', () => {
      const r = calculateLayout({
        mouseX: 500,
        mouseY: 400,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      expect(r.horizontal).toBe('right')
      expect(r.vertical).toBe('bottom')
    })
  })

  describe('尺寸 clamp', () => {
    it('rawWidth < minWidth：返回 minWidth', () => {
      // viewport 400, mouseX=199 → 'right' 分支
      // rawWidth = 400 - 199 - 12 - 8 = 181 < minWidth(240)
      const r = calculateLayout({
        mouseX: 199,
        mouseY: 100,
        viewportWidth: 400,
        viewportHeight: 800,
      })
      expect(r.horizontal).toBe('right')
      expect(r.width).toBe(240)
    })

    it('rawWidth > maxWidth：返回 maxWidth', () => {
      // 'right' 分支：rawWidth = 1000 - 100 - 12 - 8 = 880 > maxWidth(300)
      const r = calculateLayout({
        mouseX: 100,
        mouseY: 100,
        viewportWidth: 1000,
        viewportHeight: 800,
        maxWidth: 300,
      })
      expect(r.width).toBe(300)
    })

    it('自定义 min/max 生效', () => {
      // height 走 'bottom' 分支：rawHeight = 800 - 100 - 12 - 8 = 680
      // 给定 maxHeight=200 → 截到 200；minHeight=180 不影响
      const r = calculateLayout({
        mouseX: 100,
        mouseY: 100,
        viewportWidth: 1000,
        viewportHeight: 800,
        minWidth: 100,
        maxWidth: 200,
        minHeight: 180,
        maxHeight: 200,
      })
      expect(r.width).toBe(200)
      expect(r.height).toBe(200)
    })
  })

  describe('位置兜底', () => {
    it('极小视口（320×240）下 left >= margin 且 top >= margin', () => {
      // mouseX=200 > 160 → 'left'；mouseY=130 > 120 → 'top'
      // rawWidth  = 200 - 12 - 8 = 180 → clamp 至 minWidth 240
      // rawHeight = 130 - 12 - 8 = 110 → clamp 至 minHeight 160
      // left = max(12, 200 - 8 - 240) = 12
      // top  = max(12, 130 - 8 - 160) = 12
      const r = calculateLayout({
        mouseX: 200,
        mouseY: 130,
        viewportWidth: 320,
        viewportHeight: 240,
      })
      expect(r.horizontal).toBe('left')
      expect(r.vertical).toBe('top')
      expect(r.left).toBeGreaterThanOrEqual(12)
      expect(r.top).toBeGreaterThanOrEqual(12)
      expect(r.left).toBe(12)
      expect(r.top).toBe(12)
    })

    it('鼠标接近左/上边缘时 left/top 不为负', () => {
      const r = calculateLayout({
        mouseX: 0,
        mouseY: 0,
        viewportWidth: 1000,
        viewportHeight: 800,
      })
      // 0 不大于 500/400 → 'right'/'bottom' 分支
      // left = 0 + 8 = 8；top = 0 + 8 = 8
      expect(r.horizontal).toBe('right')
      expect(r.vertical).toBe('bottom')
      expect(r.left).toBeGreaterThanOrEqual(0)
      expect(r.top).toBeGreaterThanOrEqual(0)
    })
  })

  describe('参数', () => {
    it('自定义 offset 影响 left/top 和宽高', () => {
      // 'right'/'bottom' 分支
      // 默认 offset=8：left=108, rawWidth=1000-100-12-8=880
      // offset=20    ：left=120, rawWidth=1000-100-12-20=868
      const r = calculateLayout({
        mouseX: 100,
        mouseY: 100,
        viewportWidth: 1000,
        viewportHeight: 800,
        offset: 20,
      })
      expect(r.left).toBe(120)
      expect(r.top).toBe(120)
      expect(r.width).toBe(868)
      expect(r.height).toBe(800 - 100 - 12 - 20)
    })

    it('自定义 margin 影响 left/top 和宽高', () => {
      // 'left'/'top' 分支可同时观察 margin 在 size 与 fallback 上的作用
      // mouseX=900, mouseY=700, viewport=1000×800, margin=30
      // rawWidth = 900 - 30 - 8 = 862, width = clamp(862, 240, 1000) = 862
      // left = max(30, 900 - 8 - 862) = max(30, 30) = 30
      // rawHeight = 700 - 30 - 8 = 662, height = clamp(662, 160, 800) = 662
      // top = max(30, 700 - 8 - 662) = max(30, 30) = 30
      const r = calculateLayout({
        mouseX: 900,
        mouseY: 700,
        viewportWidth: 1000,
        viewportHeight: 800,
        margin: 30,
      })
      expect(r.horizontal).toBe('left')
      expect(r.vertical).toBe('top')
      expect(r.width).toBe(862)
      expect(r.height).toBe(662)
      expect(r.left).toBe(30)
      expect(r.top).toBe(30)
    })
  })
})
