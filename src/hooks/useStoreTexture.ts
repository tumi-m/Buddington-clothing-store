import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

const TEX_W = 1024
const TEX_H = 768

// Draws the Buddington store UI directly to a canvas using the 2D API.
// This is fast (~0ms), dependency-free, and looks great as a cloth texture.
// The experimental chrome://flags/#canvas-draw-element path would use
// drawElementImage / texElementImage2D instead — see toggle in UI.tsx.

function drawStore(ctx: CanvasRenderingContext2D, time: number) {
  const W = TEX_W, H = TEX_H

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, W, H)

  // Subtle grid texture
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Gold accent bar at top
  ctx.fillStyle = '#C9A96E'
  ctx.fillRect(0, 0, W, 3)

  // ── Navigation ──────────────────────────────────────────────────────────
  ctx.fillStyle = '#C9A96E'
  ctx.font = 'bold 22px "Bebas Neue", Impact, sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText('BUDDINGTON', 40, 52)
  ctx.letterSpacing = '0px'

  const navItems = ['COLLECTION', 'LOOKBOOK', 'ABOUT', 'STORES']
  ctx.font = '600 11px Inter, Arial, sans-serif'
  ctx.fillStyle = '#888'
  navItems.forEach((item, i) => {
    ctx.fillText(item, W - 360 + i * 88, 52)
  })

  // Shop CTA pill
  ctx.fillStyle = '#C9A96E'
  roundRect(ctx, W - 100, 36, 76, 26, 4)
  ctx.fillStyle = '#050505'
  ctx.font = 'bold 10px Inter, Arial, sans-serif'
  ctx.fillText('SHOP NOW', W - 95, 54)

  // Nav separator
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(40, 72); ctx.lineTo(W - 40, 72); ctx.stroke()

  // ── Collection label ────────────────────────────────────────────────────
  ctx.fillStyle = '#C9A96E'
  ctx.font = '600 10px Inter, Arial, sans-serif'
  ctx.fillText('— A/W 41 COLLECTION', 40, 108)

  // ── Hero Headline ────────────────────────────────────────────────────────
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 78px "Bebas Neue", Impact, sans-serif'
  ctx.fillText('THE WEIGHT', 40, 200)
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.fillText('OF SILENCE', 40, 285)

  // Thin gold rule beside headline
  ctx.fillStyle = '#C9A96E'
  ctx.fillRect(W - 60, 108, 2, 180)

  // ── Body copy ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#666'
  ctx.font = '300 13px Inter, Arial, sans-serif'
  ctx.fillText('Garments that speak in textures. A collection', 40, 320)
  ctx.fillText('born from the quiet weight of urban existence.', 40, 340)
  ctx.fillText('Crafted in London · Autumn / Winter 2041', 40, 364)

  // ── CTA Buttons ──────────────────────────────────────────────────────────
  // Primary outline button
  ctx.strokeStyle = '#C9A96E'
  ctx.lineWidth = 1
  ctx.strokeRect(40, 384, 186, 40)
  ctx.fillStyle = '#C9A96E'
  ctx.font = '600 11px Inter, Arial, sans-serif'
  ctx.fillText('EXPLORE COLLECTION', 62, 410)

  // Secondary button
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 1
  ctx.strokeRect(238, 384, 120, 40)
  ctx.fillStyle = '#555'
  ctx.font = '600 11px Inter, Arial, sans-serif'
  ctx.fillText('VIEW LOOKBOOK', 252, 410)

  // ── Product Cards ─────────────────────────────────────────────────────────
  drawProductCard(ctx, 40,  450, 'Obsidian Coat',   '£ 890', 'NEW',        '#1a1a2e', '#2d2d4a')
  drawProductCard(ctx, 360, 450, 'Void Jacket',     '£ 650', '',           '#1a120a', '#3d2d1a')
  drawProductCard(ctx, 680, 450, 'Dusk Trousers',   '£ 390', 'LAST PIECE', '#0a1a0a', '#1a3d1a')

  // ── Footer ───────────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, H - 36); ctx.lineTo(W, H - 36); ctx.stroke()

  ctx.fillStyle = '#2a2a2a'
  ctx.font = '300 9px Inter, Arial, sans-serif'
  ctx.fillText('© 2041 BUDDINGTON ALL RIGHTS RESERVED  ·  LONDON  ·  TERMS  ·  PRIVACY', 40, H - 14)

  // Animated gold pulse dot (shows life in the texture)
  const pulse = 0.5 + Math.sin(time * 2) * 0.5
  ctx.fillStyle = `rgba(201,169,110,${pulse})`
  ctx.beginPath()
  ctx.arc(W - 30, H - 20, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#C9A96E'
  ctx.font = '600 9px Inter, Arial, sans-serif'
  ctx.fillText('LIVE', W - 52, H - 16)
}

function drawProductCard(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  name: string, price: string,
  badge: string,
  gradStart: string, gradEnd: string
) {
  const CW = 300, CH = 200

  // Card bg
  ctx.fillStyle = '#0d0d0d'
  ctx.fillRect(x, y, CW, CH)
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, CW, CH)

  // Product image area (gradient simulation)
  const g = ctx.createLinearGradient(x, y, x + CW, y + 140)
  g.addColorStop(0, gradStart)
  g.addColorStop(1, gradEnd)
  ctx.fillStyle = g
  ctx.fillRect(x, y, CW, 138)

  // Fabric texture lines over image
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (let i = 0; i < 20; i++) {
    ctx.beginPath()
    ctx.moveTo(x + i * 16, y)
    ctx.lineTo(x + i * 16, y + 138)
    ctx.stroke()
  }

  // Badge
  if (badge) {
    ctx.fillStyle = badge === 'LAST PIECE' ? '#8B3A3A' : '#C9A96E'
    const bw = badge.length * 6.5 + 14
    ctx.fillRect(x + 10, y + 10, bw, 18)
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 8px Inter, Arial, sans-serif'
    ctx.fillText(badge, x + 17, y + 22)
  }

  // Product name
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '500 14px Inter, Arial, sans-serif'
  ctx.fillText(name, x + 12, y + 157)

  // Price
  ctx.fillStyle = '#C9A96E'
  ctx.font = '300 12px Inter, Arial, sans-serif'
  ctx.fillText(price, x + 12, y + 174)

  // "Add to cart" line
  ctx.strokeStyle = 'rgba(201,169,110,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(x + 12, y + 182, CW - 24, 14)
  ctx.fillStyle = 'rgba(201,169,110,0.6)'
  ctx.font = '600 8px Inter, Arial, sans-serif'
  ctx.fillText('ADD TO CART', x + CW/2 - 28, y + 192)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}

export function useStoreTexture() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const timeRef = useRef(0)
  const rafRef = useRef<number>(0)

  const getTexture = useCallback(() => {
    if (textureRef.current) return textureRef.current

    const canvas = document.createElement('canvas')
    canvas.width = TEX_W
    canvas.height = TEX_H
    canvasRef.current = canvas

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    textureRef.current = tex

    // Initial draw
    const ctx = canvas.getContext('2d')!
    drawStore(ctx, 0)
    tex.needsUpdate = true

    // Animate the "live" dot only — minimal per-frame cost
    const animate = () => {
      timeRef.current += 0.016
      const ctx2 = canvas.getContext('2d')!
      drawStore(ctx2, timeRef.current)
      tex.needsUpdate = true
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return tex
  }, [])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current)
      textureRef.current?.dispose()
    }
  }, [])

  return getTexture
}
