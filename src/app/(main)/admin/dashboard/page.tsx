'use client'

import { useAppStore } from '@/store/useAppStore'
import { MOCK_MATERIALS, MOCK_USER } from '@/lib/mock-data'
import { formatBytes, formatDate } from '@/lib/utils'
import {
  Users,
  FolderKanban,
  MessageSquare,
  HardDrive,
  TrendingUp,
  ArrowUpRight,
  UserCheck,
  ShieldCheck,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

const WEEKLY_UPLOADS_DATA = [
  { week: 'Week 1', uploads: 4, downloads: 42 },
  { week: 'Week 2', uploads: 9, downloads: 88 },
  { week: 'Week 3', uploads: 15, downloads: 140 },
  { week: 'Week 4', uploads: 22, downloads: 210 },
  { week: 'Week 5', uploads: 18, downloads: 195 },
  { week: 'Week 6', uploads: 28, downloads: 340 },
]

const MOCK_REGISTERED_USERS = [
  { id: '1', username: 'alex_dev', name: 'Alex Rivera', role: 'admin', email: 'alex@bvm.ac.in', joined: 'Aug 1, 2026' },
  { id: '2', username: 'priya_m', name: 'Priya Mehta', role: 'student', email: 'priya@bvm.ac.in', joined: 'Aug 3, 2026' },
  { id: '3', username: 'rohan_s', name: 'Rohan Sharma', role: 'student', email: 'rohan@bvm.ac.in', joined: 'Aug 5, 2026' },
  { id: '4', username: 'ananya_k', name: 'Ananya Kumar', role: 'student', email: 'ananya@bvm.ac.in', joined: 'Aug 8, 2026' },
]

export default function AdminDashboardPage() {
  const { user } = useAppStore()

  const totalMaterials = MOCK_MATERIALS.length
  const totalStorageBytes = MOCK_MATERIALS.reduce((acc, curr) => acc + (curr.file_size_bytes || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold font-display text-white">System Admin Analytics</h1>
        <p className="text-sm text-[#8B91A8] font-mono mt-0.5">
          Real-time metrics for BVM IT Department (~60-100 students)
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8B91A8]">
            <span className="text-xs font-mono uppercase">Total Class Students</span>
            <div className="w-8 h-8 rounded-lg bg-[#4F6EF7]/15 text-[#4F6EF7] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-white">64</p>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12 this week
          </span>
        </div>

        <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8B91A8]">
            <span className="text-xs font-mono uppercase">Published Materials</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-white">{totalMaterials}</p>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> 100% indexed
          </span>
        </div>

        <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8B91A8]">
            <span className="text-xs font-mono uppercase">Chat Messages</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-white">1,482</p>
          <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Active discussions
          </span>
        </div>

        <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-[#8B91A8]">
            <span className="text-xs font-mono uppercase">Cloudflare R2 Used</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-white">{formatBytes(totalStorageBytes)}</p>
          <span className="text-[10px] text-[#8B91A8] font-mono">Of 10GB free tier</span>
        </div>
      </div>

      {/* Chart: Uploads & Downloads per Week */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-display text-white">Weekly Upload & Download Trends</h2>
          <span className="text-xs font-mono text-[#8B91A8]">Past 6 Weeks</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_UPLOADS_DATA}>
              <defs>
                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F6EF7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F6EF7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3148" opacity={0.5} />
              <XAxis dataKey="week" stroke="#8B91A8" fontSize={11} />
              <YAxis stroke="#8B91A8" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#1A1D27', border: '1px solid #2D3148', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="downloads" stroke="#22C55E" fillOpacity={1} fill="url(#colorDownloads)" name="Downloads" />
              <Area type="monotone" dataKey="uploads" stroke="#4F6EF7" fillOpacity={1} fill="url(#colorUploads)" name="Uploads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-[#1A1D27] border border-[#2D3148] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold font-display text-white">Recent Student Registrations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#2D3148] text-[#8B91A8]">
                <th className="pb-3 uppercase">User</th>
                <th className="pb-3 uppercase">Email</th>
                <th className="pb-3 uppercase">Role</th>
                <th className="pb-3 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3148]/60 text-white">
              {MOCK_REGISTERED_USERS.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-semibold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#4F6EF7]" />
                    <span>{u.name} (@{u.username})</span>
                  </td>
                  <td className="py-3 text-[#8B91A8]">{u.email}</td>
                  <td className="py-3">
                    {u.role === 'admin' ? (
                      <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                        ADMIN
                      </span>
                    ) : (
                      <span className="bg-[#242736] text-[#8B91A8] px-2 py-0.5 rounded">
                        STUDENT
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-[#8B91A8]">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
