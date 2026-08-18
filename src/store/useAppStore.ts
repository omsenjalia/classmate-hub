import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Profile, Subject } from '@/lib/types'

type ThemeMode = 'dark' | 'light'

interface AppState {
  user: Profile | null
  isLoggedIn: boolean
  subjects: Subject[]
  searchQuery: string
  sidebarOpen: boolean
  theme: ThemeMode

  // Actions
  setUser: (user: Profile | null) => void
  setSubjects: (subjects: Subject[]) => void
  setSearchQuery: (query: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  logout: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      subjects: [],
      searchQuery: '',
      sidebarOpen: false,
      theme: 'dark',

      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setSubjects: (subjects) => set({ subjects }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('classmatehub-theme', theme)
          document.documentElement.classList.toggle('dark', theme === 'dark')
          document.documentElement.style.colorScheme = theme
        }
        set({ theme })
      },
      toggleTheme: () => {
        // The document is authoritative until Zustand has completed hydration.
        // This keeps the first click correct when the pre-paint script restored
        // a theme different from the store's server-rendered default.
        const isDark =
          typeof document !== 'undefined'
            ? document.documentElement.classList.contains('dark')
            : get().theme === 'dark'
        const next = isDark ? 'light' : 'dark'
        get().setTheme(next)
      },
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'classmatehub-session',
      // Only persist user session and theme — not transient UI state
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        theme: state.theme,
      }),
    }
  )
)
