import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile, Subject } from '@/lib/types'

export type ThemeMode = 'system' | 'light' | 'dark'

interface AppState {
  user: Profile | null
  isLoggedIn: boolean
  subjects: Subject[]
  subjectsLoaded: boolean
  theme: ThemeMode

  // Actions
  setUser: (user: Profile | null) => void
  setSubjects: (subjects: Subject[]) => void
  setTheme: (theme: ThemeMode) => void
  logout: () => void
}

/** Mirrors the theme choice onto <html>; "system" defers to prefers-color-scheme in CSS. */
export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.classList.toggle('light', theme === 'light')
  root.style.colorScheme = theme === 'system' ? 'light dark' : theme
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      subjects: [],
      subjectsLoaded: false,
      theme: 'system',

      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setSubjects: (subjects) => set({ subjects, subjectsLoaded: true }),
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'classmatehub-session',
      // Only persist user session and theme, not transient UI state
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme)
      },
    }
  )
)
