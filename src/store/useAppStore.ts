import { create } from 'zustand'
import { Profile, Subject, Channel } from '@/lib/types'
import { MOCK_USER, MOCK_SUBJECTS, MOCK_CHANNELS } from '@/lib/mock-data'

interface AppState {
  user: Profile | null
  isLoggedIn: boolean
  subjects: Subject[]
  channels: Channel[]
  activeChannelId: string | null
  searchQuery: string
  sidebarOpen: boolean
  theme: 'dark' | 'light'

  // Actions
  setUser: (user: Profile | null) => void
  setSubjects: (subjects: Subject[]) => void
  setChannels: (channels: Channel[]) => void
  setActiveChannelId: (channelId: string | null) => void
  setSearchQuery: (query: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'dark' | 'light') => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: MOCK_USER, // Default to demo admin profile for instant usability
  isLoggedIn: true,
  subjects: MOCK_SUBJECTS,
  channels: MOCK_CHANNELS,
  activeChannelId: 'chan-gen',
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
  setTheme: (theme) => set({ theme }),
  logout: () => set({ user: null, isLoggedIn: false }),
}))
