export const GITHUB_UPLOAD_CHUNK_SIZE = 3 * 1024 * 1024

export type GithubUploadResult = {
  key: string
  fileName: string
  fileSize: number
  isChunked: boolean
  chunkKeys: string[]
  downloadUrl: string
  publicUrl: string
}

/**
 * Sends a file to the GitHub-backed API in small requests, staying below
 * Vercel's function payload limit while preserving the original file exactly.
 */
export async function uploadFileInGithubChunks(
  file: File,
  onProgress?: (percent: number) => void
): Promise<GithubUploadResult> {
  const totalChunks = Math.ceil(file.size / GITHUB_UPLOAD_CHUNK_SIZE)
  const uploadId = crypto.randomUUID()
  let completed: GithubUploadResult | null = null

  for (let index = 0; index < totalChunks; index++) {
    const start = index * GITHUB_UPLOAD_CHUNK_SIZE
    const chunk = file.slice(start, Math.min(start + GITHUB_UPLOAD_CHUNK_SIZE, file.size), file.type)
    const data = new FormData()
    data.append('file', chunk, file.name)
    data.append('uploadId', uploadId)
    data.append('fileName', file.name)
    data.append('fileSize', String(file.size))
    data.append('contentType', file.type || 'application/octet-stream')
    data.append('chunkIndex', String(index))
    data.append('totalChunks', String(totalChunks))

    const response = await fetch('/api/upload/github', { method: 'POST', body: data })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(payload.error || 'GitHub upload failed')
    if (payload.completed) completed = payload as GithubUploadResult
    onProgress?.(Math.round(((index + 1) / totalChunks) * 90))
  }

  if (!completed) throw new Error('GitHub upload did not complete')
  return completed
}
