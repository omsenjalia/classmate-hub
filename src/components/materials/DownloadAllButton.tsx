'use client'

import { useState } from 'react'
import { FileArrowDownIcon } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { downloadMaterialsZip } from '@/lib/download'
import type { Material } from '@/lib/types'

/** Zips every stored file in the current view (video links are skipped). */
export default function DownloadAllButton({ materials, fileName }: { materials: Material[]; fileName?: string }) {
  const [busy, setBusy] = useState(false)
  const files = materials.filter((item) => item.file_key).slice(0, 100)

  if (files.length < 2) return null

  const run = async () => {
    setBusy(true)
    try {
      await downloadMaterialsZip(files.map((item) => item.id), fileName)
      toast.success('ZIP download started')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Download failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="secondary" className="w-full sm:w-auto" onClick={run} loading={busy}>
      {!busy && <FileArrowDownIcon className="size-5" />}
      {busy ? 'Preparing ZIP' : `Download ${files.length} files as ZIP`}
    </Button>
  )
}
