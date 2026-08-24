'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Eye, EyeOff, Palette } from 'lucide-react'

const DESIGN_KEY = 'classmatehub-design'
const HIDDEN_KEY = 'classmatehub-design-preview-hidden'

const DESIGNS = [
  { id: '', name: 'Classmate', file: '—', desc: 'Original design' },
  { id: 'vercel', name: 'Vercel', file: '1.md', desc: 'Ink on near-white · mesh gradients · pill CTAs' },
  { id: 'notion', name: 'Notion', file: '2.md', desc: 'Warm whites · purple CTA · pastel tints' },
  { id: 'aime', name: 'Aime', file: '3.md', desc: 'Cool gray islands · green restraint' },
  { id: 'vclg', name: 'Vercel Guidelines', file: '4.md', desc: 'Shadow-as-border · workflow accents' },
  { id: 'nova', name: 'NovaSpark', file: '5.md', desc: 'Nova Blue SaaS · slate & orange' },
  { id: 'aether', name: 'Aether', file: '6.md', desc: 'Near-black brutalist · white accent' },
  { id: 'nomad', name: 'NomadKit', file: '7.md', desc: 'Warm sand · ocean & forest' },
] as const

export function applyDesign(id: string) {
  const html = document.documentElement
  if (id) html.dataset.design = id
  else delete html.dataset.design
}

export default function DesignPreviewSwitcher() {
  const [index, setIndex] = useState(0)
  const [hidden, setHidden] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration of persisted prefs */
    const stored = localStorage.getItem(DESIGN_KEY) ?? ''
    const idx = DESIGNS.findIndex((d) => d.id === stored)
    setIndex(idx >= 0 ? idx : 0)
    setHidden(localStorage.getItem(HIDDEN_KEY) === '1')
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    applyDesign(DESIGNS[index].id)
    if (DESIGNS[index].id) localStorage.setItem(DESIGN_KEY, DESIGNS[index].id)
    else localStorage.removeItem(DESIGN_KEY)
  }, [index, ready])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          (el as HTMLElement).isContentEditable)
      )
        return
      if (e.key === '[') setIndex((i) => (i - 1 + DESIGNS.length) % DESIGNS.length)
      if (e.key === ']') setIndex((i) => (i + 1) % DESIGNS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hide = () => {
    setHidden(true)
    localStorage.setItem(HIDDEN_KEY, '1')
  }

  const current = DESIGNS[index]

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 print:hidden">
      {hidden ? (
        <button
          onClick={() => {
            setHidden(false)
            localStorage.removeItem(HIDDEN_KEY)
          }}
          aria-label="Show design preview switcher"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-default bg-card text-muted shadow-elevated transition-colors hover:text-accent"
        >
          <Eye size={16} />
        </button>
      ) : (
        <div className="glass-panel flex items-center gap-1.5 rounded-full px-2 py-1.5 shadow-modal">
          <div
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(135deg, #007cf0, #7928ca 45%, #ff0080 75%, #f9cb28)`,
            }}
          >
            <Palette size={15} className="text-white" />
          </div>
          <button
            onClick={() => setIndex((i) => (i - 1 + DESIGNS.length) % DESIGNS.length)}
            aria-label="Previous design"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-secondary transition-colors hover:bg-inset hover:text-primary"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="min-w-44 text-center">
            <select
              value={current.id}
              onChange={(e) =>
                setIndex(DESIGNS.findIndex((d) => d.id === e.target.value))
              }
              aria-label="Pick design"
              className="focus-ring w-full cursor-pointer rounded-lg border border-subtle bg-card px-2 py-0.5 text-center text-xs font-medium text-primary"
            >
              {DESIGNS.map((d, i) => (
                <option key={d.id || 'default'} value={d.id}>
                  {i}/{DESIGNS.length - 1} · {d.name}
                </option>
              ))}
            </select>
            <p className="mt-0.5 truncate px-2 text-[10px] leading-tight text-muted">
              designs/{current.file} — {current.desc}
            </p>
          </div>

          <button
            onClick={() => setIndex((i) => (i + 1) % DESIGNS.length)}
            aria-label="Next design"
            className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-secondary transition-colors hover:bg-inset hover:text-primary"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={hide}
            aria-label="Hide switcher"
            className="focus-ring ml-1 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-inset hover:text-primary"
          >
            <EyeOff size={14} />
          </button>
        </div>
      )}
      <p className="pointer-events-none mt-1 select-none text-center text-[10px] text-muted opacity-60">
        press [ / ] to flip designs
      </p>
    </div>
  )
}
