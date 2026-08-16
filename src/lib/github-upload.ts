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
  const resumeKey = `classmatehub-upload:${file.name}:${file.size}:${file.lastModified}`
  const saved = typeof window === 'undefined' ? null : localStorage.getItem(resumeKey)
  let resume: { uploadId: string; nextChunk: number } | null = null
  try { resume = saved ? JSON.parse(saved) : null } catch { /* start a new upload */ }
  const uploadId = resume?.uploadId || crypto.randomUUID()
  const startChunk = resume?.nextChunk && resume.nextChunk < totalChunks ? resume.nextChunk : 0
  let completed: GithubUploadResult | null = null

  for (let index = startChunk; index < totalChunks; index++) {
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

    let payload: Record<string, unknown> = {}
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch('/api/upload/github', { method: 'POST', body: data })
        payload = await response.json().catch(() => ({}))
        if (response.ok) break
        if (attempt === 2) throw new Error((payload.error as string) || 'GitHub upload failed')
      } catch (error) {
        if (attempt === 2) throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)))
    }
    if (payload.completed) completed = payload as GithubUploadResult
    localStorage.setItem(resumeKey, JSON.stringify({ uploadId, nextChunk: index + 1 }))
    onProgress?.(Math.round(((index + 1) / totalChunks) * 90))
  }

  if (!completed) throw new Error('GitHub upload did not complete')
  localStorage.removeItem(resumeKey)
  return completed
}
