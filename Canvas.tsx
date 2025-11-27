import { useEffect, useMemo, useRef, useState } from 'react'
import { Layer, Stage } from 'react-konva'

import { UseFontSettingsContext } from '../contexts/FontSettings'
import { useGlyphsStore } from '../contexts/Glyphs/store'
import { UseGridContext } from '../contexts/Grid'
import { UseMainContext } from '../contexts/Main'
import Grid from '../components/Grid'
import Glyph from '../components/Glyph'
import Touch from '../components/Touch'
import type { KonvaEventObject } from 'konva/lib/Node'

const Canvas = () => {
  const { isMobile, stageRef } = UseMainContext()
  const { axes } = UseFontSettingsContext()
  const { addGlyph, current, glyphs } = useGlyphsStore()
  const { offset, points, removeTouch, setPoints, updateTouches, zoom, setOffset } = UseGridContext()

  const { innerHeight, innerWidth } = useMemo(() => ({
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth
  }), [])

  const [isHolding, setIsHolding] = useState(false)
  const holdPoint = useRef<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleTouchStart = ({ evt: event }: KonvaEventObject<TouchEvent>) => {
    if (!isMobile || !stageRef.current) {
      return
    }

    const stage = stageRef.current
    const pointer = stage?.getPointerPosition()

    if (!pointer) {
      return
    }

    if (event?.touches.length === 1) {
      const transform = stage.getAbsoluteTransform().copy()
      transform.invert()

      const { x, y } = transform.point(pointer)

      holdPoint.current = { x, y }
      setIsHolding(true)
    }
  }

  const handleTouchEnd = () => {
    setIsHolding(false)
    setPoints([])
  }

  // prevent pinch to zoom
  useEffect(() => {
    const preventPinch = (e: TouchEvent) => {
      if (e.touches.length > 1 && isMobile) {
        e.preventDefault()
      }
    }

    document.addEventListener("touchstart", preventPinch, { passive: false })
    document.addEventListener("touchmove", preventPinch, { passive: false })

    return () => {
      document.removeEventListener("touchstart", preventPinch)
      document.removeEventListener("touchmove", preventPinch)
    }
  }, [isMobile])

  // render
  return (
    <Stage
      {...offset}
      draggable={!isMobile}
      height={innerHeight}
      onDragMove={(event) => {
        if (!isMobile) {
          setOffset(event.currentTarget.position())
        }
      }}
      onTouchStart={(event) => isMobile ? handleTouchStart(event) : null}
      onTouchEnd={() => isMobile ? handleTouchEnd() : null}
      onPointerDown={updateTouches}
      onPointerMove={updateTouches}
      onPointerUp={removeTouch}
      onPointerCancel={removeTouch}
      ref={stageRef}
      scale={{ x: zoom, y: zoom }}
      width={innerWidth}
    >
      <Layer>
        <Grid height={innerHeight} width={innerWidth} />

        {Array.isArray(glyphs) && glyphs.map((glyph, index) =>
          <Glyph.Letter
            current={index === current}
            data={glyph}
            index={index}
            key={index}
          />
        )}
      </Layer>

      {isMobile && (
        <>
          <Touch.Main points={points} />

          {current === null && (
            <Touch.Hold
              {...holdPoint.current}
              isActive={isHolding}
              onComplete={() => {
                const { x, y } = holdPoint.current

                const values = Object.keys(axes ?? []).map((e) => {
                  if (axes) {
                    return {
                      [e]: axes[e]?.default
                    }
                  }
                })

                addGlyph(70, x, y, Object.assign({}, ...values))
              }}
            />
          )}
        </>
      )}
    </Stage>
  )
}

Canvas.displayName = 'Layout.Canvas'
export default Canvas