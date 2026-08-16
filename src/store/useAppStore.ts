import { create } from 'zustand'
import { Profile, Subject, Channel } from '@/lib/types'

type ThemeMode = 'dark' | 'light'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('classmatehub-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

interface AppState {
  user: Profile | null
  isLoggedIn: boolean
  subjects: Subject[]
  channels: Channel[]
  activeChannelId: string | null
  searchQuery: string
  sidebarOpen: boolean
  theme: ThemeMode

  // Actions
  setUser: (user: Profile | null) => void
  setSubjects: (subjects: Subject[]) => void
  setChannels: (channels: Channel[]) => void
  setActiveChannelId: (channelId: string | null) => void
  setSearchQuery: (query: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  logout: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  subjects: [],
  channels: [],
  activeChannelId: null,
  searchQuery: '',
  sidebarOpen: false,
  theme: 'dark',

  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setSubjects: (subjects) => set({ subjects }),
  setChannels: (channels) => set({ channels }),
  setActiveChannelId: (channelId) => set({ activeChannelId: channelId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('classmatehub-theme', theme)
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
    set({ theme })
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
  logout: () => set({ user: null, isLoggedIn: false }),
}))
