'use client'

import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/utils'

type AuditLog = { id: string; action: string; entity_type: string; entity_id: string | null; created_at: string }

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  useEffect(() => { createClient().from('audit_logs').select('id,action,entity_type,entity_id,created_at').order('created_at', { ascending: false }).limit(100).then(({ data }) => setLogs((data || []) as AuditLog[])) }, [])
  return <div className="max-w-4xl space-y-5"><div><h1 className="text-2xl font-bold text-primary flex items-center gap-2"><ClipboardList className="text-indigo-500" /> Audit log</h1><p className="text-sm text-muted mt-1">Recent material and moderation activity.</p></div><div className="bg-card border border-border rounded-xl divide-y divide-border">{logs.length ? logs.map((log) => <div key={log.id} className="p-3 flex justify-between gap-4 text-sm"><span className="text-primary"><strong className="uppercase text-xs">{log.action}</strong> {log.entity_type} {log.entity_id ? `· ${log.entity_id}` : ''}</span><time className="text-muted whitespace-nowrap">{formatDateTime(log.created_at)}</time></div>) : <p className="p-6 text-sm text-muted text-center">No activity recorded yet.</p>}</div></div>
}
