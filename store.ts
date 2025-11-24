import { create } from 'zustand'

import { dataDefault } from './data'
import type { IGlyph, IGlyphsState } from './interfaces'

const GLYPHS_STORAGE_KEY = 'font-animator-data'

// local storage.
const getInitialState = () => {
  try {
    const storedData = localStorage.getItem(GLYPHS_STORAGE_KEY)

    if (storedData) {
      return JSON.parse(storedData)
    }
  } catch (error) {
    console.error('Failed to parse localStorage data:', error)
  }

  return { current: 0, glyphs: [], config: dataDefault.config }
}

export const useGlyphsStore = create<IGlyphsState>((set) => ({
  config: dataDefault?.config ?? {},
  current: 0,
  glyphs: [],
  ...getInitialState(),

  initializeData: (data) => set({ current: 0, glyphs: [], ...data }),

  // add glyph
  addGlyph: (charIndex, x, y, axes) =>
    set((state) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substr(2, 9)

      const defaultProperties = {
        fill: "#fff",
        fontSize: 464,
        stroke: "transparent",
        strokeWidth: 1,
        textBaseline: 'alphabetic',
      }

      const glyph: IGlyph = {
        id,
        axes,
        easing: 'lineal',
        charIndex,
        frames: [
          {
            axes,
            position: [x, y],
            rotation: 0
          },
          {
            axes,
            position: [x, y],
            rotation: 0
          },
        ],
        properties: defaultProperties,
        position: [x, y],
        rotation: 0,
      }

      return { glyphs: [...state.glyphs, glyph] }
    }),

  // remove glyph
  remove: (id) =>
    set((state) => ({
      glyphs: state.glyphs.filter((glyph) => glyph.id !== id),
    })),

  setCurrent: (current) => {
    set({ current })
  },

  updateGlyphs: (newGlyphs) =>
    set((state) => ({
      glyphs: state.glyphs.map((old) =>
        newGlyphs.find((g) => g.id === old.id) || old
      ),
    })),

  updateGlyph: (id, charIndex) =>
    set((state) => ({
      glyphs: state.glyphs.map((g) =>
        g.id === id ? { ...g, charIndex } : g
      ),
    })),

  updateGlyphProperties: (id, properties) =>
    set((state) => ({
      glyphs: state.glyphs.map((g) =>
        g.id === id
          ? { ...g, properties: { ...g.properties, ...properties } }
          : g
      ),
    })),

  updateGlyphAxes: (id, axes, frame) =>
    set((state) => ({
      glyphs: state.glyphs.map((g) => {
        if (g.id !== id) {
          return g
        }

        let frames = g.frames

        if (typeof frame === 'number' && frames[frame]) {
          frames = [...frames]
          frames[frame] = { ...frames[frame], axes }
        }

        return { ...g, axes, frames }
      }),
    })),

  updateGlyphRotation: (id, rotation, frame) =>
    set((state) => ({
      glyphs: state.glyphs.map((g) => {
        if (g.id !== id) {
          return g
        }

        let frames = g.frames

        if (typeof frame === 'number' && frames[frame]) {
          frames = [...frames]
          frames[frame] = { ...frames[frame], rotation }
        }

        return { ...g, rotation, frames }
      }),
    })),

  updateGlyphPosition: (id, position, frame) =>
    set((state) => ({
      glyphs: state.glyphs.map((g) => {
        if (g.id !== id) {
          return g
        }

        let frames = g.frames

        if (typeof frame === 'number' && frames[frame]) {
          frames = [...frames]
          frames[frame] = { ...frames[frame], position }
        }

        return { ...g, position, frames }
      }),
    })),

  // update frames (axes instance)
  updateGlyphFrames: (id, frames) =>
    set((state) => ({
      glyphs: state.glyphs.map((glyph) =>
        glyph.id === id ? { ...glyph, frames } : glyph
      ),
    })),

  // empty
  empty: () => set({ glyphs: [] }),
}))
