'use client'

import { useState } from 'react'
import { FileArrowDownIcon } from '@phosphor-icons/react/dist/ssr'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { downloadMaterialsZip, downloadMaterialsZipNatively, NATIVE_ZIP_THRESHOLD_BYTES } from '@/lib/download'
import { formatBytes } from '@/lib/utils'
import type { Material } from '@/lib/types'

/** Zips every stored file in the current view (video links are skipped). */
export default function DownloadAllButton({ materials, fileName }: { materials: Material[]; fileName?: string }) {
  const [busy, setBusy] = useState(false)
  const files = materials.filter((item) => item.file_key).slice(0, 100)

  if (files.length < 2) return null

  const totalBytes = files.reduce((sum, item) => sum + (item.file_size_bytes || 0), 0)
  const ids = files.map((item) => item.id)

  const run = async () => {
    if (totalBytes > NATIVE_ZIP_THRESHOLD_BYTES) {
      downloadMaterialsZipNatively(ids, fileName)
      toast.success(`Preparing a ${formatBytes(totalBytes)} ZIP. It will appear in your downloads.`, { duration: 5000 })
      return
    }
    setBusy(true)
    try {
      await downloadMaterialsZip(ids, fileName)
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
      {!busy && totalBytes > 0 && <span className="font-normal text-muted">{formatBytes(totalBytes)}</span>}
    </Button>
  )
}
