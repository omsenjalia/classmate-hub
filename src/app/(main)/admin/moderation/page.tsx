'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { ModerationReport } from '@/lib/types'
import { useAppStore } from '@/store/useAppStore'

export default function ModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>([])
  const { user } = useAppStore()
  useEffect(() => { createClient().from('moderation_reports').select('*, messages(*), profiles(*)').order('created_at', { ascending: false }).then(({ data }) => setReports((data || []) as ModerationReport[])) }, [])
  const review = async (id: string, status: 'resolved' | 'dismissed') => {
    const { error } = await createClient().from('moderation_reports').update({ status, reviewed_by: user?.id, reviewed_at: new Date().toISOString() }).eq('id', id)
    if (error) return toast.error(error.message)
    setReports((items) => items.map((report) => report.id === id ? { ...report, status } : report))
  }
  return <div className="space-y-5 max-w-4xl"><div><h1 className="text-2xl font-bold text-primary flex gap-2 items-center"><ShieldAlert className="text-amber-500" /> Moderation queue</h1><p className="text-sm text-muted mt-1">Review reports submitted by classmates.</p></div>{reports.length ? reports.map((report) => <article key={report.id} className="bg-card border border-border rounded-xl p-4"><div className="flex justify-between gap-4"><div><p className="text-sm font-semibold text-primary">{report.reason}</p><p className="text-xs text-muted mt-1">Reported by @{report.profiles?.username || 'student'} · {report.status}</p>{report.messages && <p className="mt-3 p-3 rounded-lg bg-page text-sm text-primary">{report.messages.content}</p>}</div>{report.status === 'open' && <div className="flex gap-2"><button onClick={() => review(report.id, 'resolved')} className="p-2 text-emerald-500"><Check /></button><button onClick={() => review(report.id, 'dismissed')} className="p-2 text-red-500"><X /></button></div>}</div></article>) : <p className="text-muted text-sm">No reports waiting for review.</p>}</div>
}
