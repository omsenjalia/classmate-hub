'use client'

import { useState, useEffect } from 'react'
import { fetchLiveMaterials } from '@/lib/supabase-data'
import { createClient } from '@/lib/supabase/client'
import { Material } from '@/lib/types'
import { formatBytes } from '@/lib/utils'
import {
  Users,
  FolderKanban,
  MessageSquare,
  HardDrive,
  TrendingUp,
  ArrowUpRight,
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

export default function AdminDashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    fetchLiveMaterials().then(setMaterials)
    const supabase = createClient()
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('messages').select('*', { count: 'exact', head: true }),
    ]).then(([profiles, messages]) => {
      setMemberCount(profiles.count || 0)
      setMessageCount(messages.count || 0)
    })
  }, [])

  const totalMaterials = materials.length
  const totalStorageBytes = materials.reduce((acc, curr) => acc + (curr.file_size_bytes || 0), 0)

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Admin Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mt-0.5">
          Real-time metrics for BVM IT Department (~60-100 students)
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-mono uppercase">Total Class Students</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{memberCount}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12 this week
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-mono uppercase">Published Materials</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMaterials}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> 100% indexed
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-mono uppercase">Chat Messages</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{messageCount}</p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live from Supabase
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-mono uppercase">Storage Used</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(totalStorageBytes)}</p>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">Of 10GB free tier</span>
        </div>
      </div>

      {/* Chart: Uploads & Downloads per Week */}
      <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Weekly Upload & Download Trends</h2>
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">Past 6 Weeks</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_UPLOADS_DATA}>
              <defs>
                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="week" stroke="currentColor" fontSize={11} opacity={0.5} />
              <YAxis stroke="currentColor" fontSize={11} opacity={0.5} />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface-1, #fff)',
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="downloads" stroke="#22C55E" fillOpacity={1} fill="url(#colorDownloads)" name="Downloads" />
              <Area type="monotone" dataKey="uploads" stroke="#4f46e5" fillOpacity={1} fill="url(#colorUploads)" name="Uploads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
