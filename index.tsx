import type { Context } from 'konva/lib/Context'
import type { Shape as IShape, ShapeConfig } from 'konva/lib/Shape'
import { Layer, Shape } from 'react-konva'
import { useEffect } from 'react'

import { UseGridContext } from '../../contexts/Grid'
import { sortPointsByAngle } from '../../contexts/Grid/helpers'
import { useGlyphsStore } from '../../contexts/Glyphs/store'
import type { ITouchProps } from './interfaces'
import type { IGlyphProps } from '../Glyph/interfaces'
import Glyph from '../Glyph'


interface Point {
  x: number
  y: number
}

const CIRCLE_RADIUS_DIVISOR = 40
const LINE_WIDTH_DIVISOR = 2

const Touch = ({ points }: ITouchProps) => {
  const { current, glyphs, updateGlyphProperties, updateGlyphRotation } = useGlyphsStore()
  const { offset, zoom } = UseGridContext()

  const screenToWorld = (p: Point) => ({
    x: (p.x - offset.x) / zoom,
    y: (p.y - offset.y) / zoom,
  })

  const drawPoints = (ctx: Context, _shape: IShape) => {
    const size = 9 / zoom
    const letterSpacing = -0.6 / zoom
    const radius = CIRCLE_RADIUS_DIVISOR / zoom
    const lineWidth = LINE_WIDTH_DIVISOR / zoom

    ctx.fillStyle = 'transparent'

    const orderedPoints = sortPointsByAngle(points)
    const numPoints = orderedPoints.length

    if (numPoints >= 2) {
      ctx.beginPath()
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = 'rgba(255, 0, 0, 1)'

      for (let i = 0; i < numPoints - 1; i++) {
        const p1 = screenToWorld(orderedPoints[i])
        const p2 = screenToWorld(orderedPoints[(i + 1) % numPoints])

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= 2 * radius) {
          continue
        }

        const startX = p1.x + (dx / distance) * radius
        const startY = p1.y + (dy / distance) * radius

        const endX = p2.x - (dx / distance) * radius
        const endY = p2.y - (dy / distance) * radius

        ctx.moveTo(startX, startY)
        ctx.lineTo(endX, endY)
      }

      ctx.stroke()
    }

    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      const worldP = screenToWorld(p)

      ctx.beginPath()
      ctx.arc(worldP.x, worldP.y, radius, 0, Math.PI * 2)
      ctx.lineWidth = 2 / zoom
      ctx.strokeStyle = 'red'
      ctx.stroke()

      ctx.font = `${size}px Roboto Mono`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'white'
      ctx.letterSpacing = `${letterSpacing}px`
      ctx.fillText(`x: ${p.x}, y: ${p.y}`, worldP.x, worldP.y - 54 / zoom)
    }
  }

  useEffect(() => {
    if (points.length === 2) {
      const [p1, p2] = points

      const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const nextFontSize = Math.min(3000, Math.max(0, distance * 3))

      const nextAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI)

      if (current === null || !glyphs[current]) {
        return
      }

      const { id, properties, rotation } = glyphs[current]

      // evitar movimientos bruscos
      const fontDiff = Math.abs(nextFontSize - properties.fontSize)
      const angleDiff = Math.abs(nextAngle - rotation)

      // thresholds
      const FONT_THRESHOLD = 5
      const ANGLE_THRESHOLD = 2

      const payload: Partial<IGlyphProps['data']> = { properties: {}, rotation }

      if (fontDiff > FONT_THRESHOLD) {
        payload.properties = { ...properties, fontSize: nextFontSize }
      }

      if (angleDiff > ANGLE_THRESHOLD) {
        payload.rotation = rotation + (nextAngle * 2 - rotation) * 0.15
      }

      if (Object.keys(payload).length > 0) {
        updateGlyphProperties(id, payload.properties as ShapeConfig)
        updateGlyphRotation(id, payload.rotation ?? rotation, 0)
      }
    }
  }, [points, updateGlyphProperties, updateGlyphRotation])

  // render
  return (
    <Layer listening={false}>
      <Shape
        hitFunc={() => null}
        sceneFunc={drawPoints}
      />

      <Glyph.Rotation x={points[0].x} y={points[0].y} />
    </Layer>
  )
}

Touch.displayName = 'Touch'
export default Touch