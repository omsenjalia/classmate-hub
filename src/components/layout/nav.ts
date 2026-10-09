import {
  BooksIcon,
  BookmarkSimpleIcon,
  PlusIcon,
  SquaresFourIcon,
  UserCircleIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import type { Profile } from '@/lib/types'

export interface NavItem {
  label: string
  href: string
  icon: Icon
  match: (pathname: string) => boolean
  primary?: boolean
}

const isMaterialDetail = (pathname: string) => /^\/materials\/(?!upload)[^/]+/.test(pathname)

export function getNavItems(user: Profile | null): NavItem[] {
  const profileHref = user ? `/profile/${user.username}` : '/login'
  return [
    {
      label: 'Library',
      href: '/materials',
      icon: BooksIcon,
      match: (p) => p === '/materials' || isMaterialDetail(p),
    },
    {
      label: 'Subjects',
      href: '/subjects',
      icon: SquaresFourIcon,
      match: (p) => p.startsWith('/subjects'),
    },
    {
      label: 'Upload',
      href: '/materials/upload',
      icon: PlusIcon,
      match: (p) => p.startsWith('/materials/upload'),
      primary: true,
    },
    {
      label: 'Saved',
      href: '/saved',
      icon: BookmarkSimpleIcon,
      match: (p) => p.startsWith('/saved'),
    },
    {
      label: user ? 'You' : 'Sign in',
      href: profileHref,
      icon: UserCircleIcon,
      match: (p) => p.startsWith('/profile') || p.startsWith('/admin'),
    },
  ]
}

/** Routes with their own bottom action bar hide the tab bar. */
export function hidesTabBar(pathname: string) {
  return isMaterialDetail(pathname) || pathname.startsWith('/materials/upload')
}
