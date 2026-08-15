'use client'

import { useState } from 'react'
import { Profile, UserRole } from '@/lib/types'
import { Users, ShieldCheck, User, Search, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-demo-admin-1',
    username: 'alex_dev',
    display_name: 'Alex Rivera',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'IT Class Representative',
    role: 'admin',
    created_at: '2026-08-01T10:00:00Z',
  },
  {
    id: 'user-2',
    username: 'priya_m',
    display_name: 'Priya Mehta',
    avatar_url: null,
    bio: 'Software enthusiast',
    role: 'student',
    created_at: '2026-08-03T12:30:00Z',
  },
  {
    id: 'user-3',
    username: 'rohan_s',
    display_name: 'Rohan Sharma',
    avatar_url: null,
    bio: null,
    role: 'student',
    created_at: '2026-08-05T15:45:00Z',
  },
  {
    id: 'user-4',
    username: 'ananya_k',
    display_name: 'Ananya Kumar',
    avatar_url: null,
    bio: null,
    role: 'student',
    created_at: '2026-08-08T09:15:00Z',
  },
]

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES)
  const [search, setSearch] = useState('')

  const filteredProfiles = profiles.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.username.toLowerCase().includes(q) ||
      p.display_name?.toLowerCase().includes(q)
    )
  })

  const toggleRole = (userId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === userId) {
          const newRole: UserRole = p.role === 'admin' ? 'student' : 'admin'
          toast.success(`Updated role for @${p.username} to ${newRole.toUpperCase()}`)
          return { ...p, role: newRole }
        }
        return p
      })
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-amber-400" /> Student & Role Directory
        </h1>
        <p className="text-sm text-[#8B91A8] mt-1">
          Manage registered class accounts and grant or revoke administrator capabilities.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#8B91A8] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter students by username or name..."
          className="w-full bg-[#1A1D27] border border-[#2D3148] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#8B91A8]/60 focus:outline-none focus:border-[#4F6EF7]"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2D3148] bg-[#0F1117] text-[#8B91A8]">
                <th className="p-4 uppercase">Student</th>
                <th className="p-4 uppercase">Username</th>
                <th className="p-4 uppercase">Current Role</th>
                <th className="p-4 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3148]/60 text-white">
              {filteredProfiles.map((p) => (
                <tr key={p.id} className="hover:bg-[#242736]/40 transition-colors">
                  <td className="p-4 font-semibold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4F6EF7]/20 border border-[#4F6EF7]/40 flex items-center justify-center font-bold text-[#4F6EF7] overflow-hidden">
                      {p.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatar_url} alt={p.username} className="w-full h-full object-cover" />
                      ) : (
                        p.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white font-display text-sm">{p.display_name || p.username}</p>
                      <p className="text-[10px] text-[#8B91A8] font-mono">{p.bio || 'Class Member'}</p>
                    </div>
                  </td>

                  <td className="p-4 text-[#8B91A8]">@{p.username}</td>

                  <td className="p-4">
                    {p.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
                        <ShieldCheck className="w-3 h-3" /> ADMIN
                      </span>
                    ) : (
                      <span className="bg-[#0F1117] text-[#8B91A8] px-2 py-0.5 rounded border border-[#2D3148]">
                        STUDENT
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleRole(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                        p.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                          : 'bg-[#4F6EF7]/15 text-[#4F6EF7] border-[#4F6EF7]/40 hover:bg-[#4F6EF7] hover:text-white'
                      }`}
                    >
                      {p.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
