/** Asks the server to zip the given materials and hands the archive to the browser. */
export async function downloadMaterialsZip(materialIds: string[], fileName = 'classmate-materials.zip') {
  const response = await fetch(`/api/materials/download-all?name=${encodeURIComponent(fileName)}`, {
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

/** Above this, buffering the ZIP in a phone's memory is risky, so let the browser save it directly. */
export const NATIVE_ZIP_THRESHOLD_BYTES = 150 * 1024 * 1024

/**
 * Posts a plain form into a hidden iframe. The browser's own download manager
 * receives the streamed archive and writes it to disk as it arrives.
 */
export function downloadMaterialsZipNatively(materialIds: string[], fileName = 'classmate-materials.zip') {
  const frameName = 'zip-download-frame'
  let frame = document.querySelector<HTMLIFrameElement>(`iframe[name="${frameName}"]`)
  if (!frame) {
    frame = document.createElement('iframe')
    frame.name = frameName
    frame.hidden = true
    document.body.appendChild(frame)
  }
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `/api/materials/download-all?name=${encodeURIComponent(fileName)}`
  form.target = frameName
  for (const id of materialIds) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = 'materialIds'
    input.value = id
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
  form.remove()
}
