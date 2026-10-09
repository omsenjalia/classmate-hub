/** Asks the server to zip the given materials and hands the archive to the browser. */
export async function downloadMaterialsZip(materialIds: string[], fileName = 'classmate-materials.zip') {
  const response = await fetch('/api/materials/download-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialIds }),
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error || 'Could not create the archive')
  }
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
