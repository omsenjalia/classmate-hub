import { v4 as uuidv4 } from 'uuid'

const CHUNK_SIZE_BYTES = 90 * 1024 * 1024 // 90MB chunk size limit for GitHub API safety

export interface UploadResult {
  key: string
  fileName: string
  fileSize: number
  isChunked: boolean
  chunkKeys: string[]
  downloadUrl: string
  publicUrl: string
}

export function getGithubStorageConfig() {
  const owner = process.env.STORAGE_GITHUB_OWNER || 'omsenjalia'
  const repo = process.env.STORAGE_GITHUB_REPO || 'classmate-hub-storage'
  const branch = process.env.STORAGE_GITHUB_BRANCH || 'main'
  const token = process.env.STORAGE_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''

  return { owner, repo, branch, token }
}

/**
 * Uploads a file buffer to private GitHub repository.
 * If file size > 99MB, splits into 90MB chunk parts.
 */
export async function uploadFileToGithub(
  userId: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  const { owner, repo, branch, token } = getGithubStorageConfig()
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const baseKey = `${userId}/${uuidv4()}-${sanitized}`

  const fileSize = fileBuffer.length
  const isChunked = fileSize > 99 * 1024 * 1024 // > 99MB limit trigger

  const chunkKeys: string[] = []

  if (!isChunked) {
    // Single File Commit via GitHub REST API
    await commitFileToGithubRepo(owner, repo, branch, token, baseKey, fileBuffer, `Upload ${fileName}`)
    chunkKeys.push(baseKey)
  } else {
    // Split into 90MB chunks
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE_BYTES)
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE_BYTES
      const end = Math.min(start + CHUNK_SIZE_BYTES, fileSize)
      const chunkBuffer = fileBuffer.subarray(start, end)
      const partKey = `${baseKey}.part${i + 1}`

      await commitFileToGithubRepo(
        owner,
        repo,
        branch,
        token,
        partKey,
        chunkBuffer,
        `Upload ${fileName} (Part ${i + 1}/${totalChunks})`
      )
      chunkKeys.push(partKey)
    }
  }

  const downloadUrl = `/api/materials/download/${baseKey}`

  return {
    key: baseKey,
    fileName,
    fileSize,
    isChunked,
    chunkKeys,
    downloadUrl,
    publicUrl: downloadUrl,
  }
}

/**
 * Commits a single Buffer to GitHub Contents API
 */
async function commitFileToGithubRepo(
  owner: string,
  repo: string,
  branch: string,
  token: string,
  path: string,
  contentBuffer: Buffer,
  commitMessage: string
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const base64Content = contentBuffer.toString('base64')

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'ClassmateHub-StorageEngine',
  }

  if (token) {
    headers['Authorization'] = `token ${token}`
  }

  const body = {
    message: commitMessage,
    content: base64Content,
    branch,
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`GitHub API commit failed (${res.status}): ${errorText}`)
  }

  return await res.json()
}

/**
 * Downloads single or multi-part chunks from private GitHub repo and returns combined Buffer.
 */
export async function downloadFileFromGithub(
  baseKey: string,
  chunkKeys?: string[]
): Promise<Buffer> {
  const { owner, repo, branch, token } = getGithubStorageConfig()

  const keysToFetch = chunkKeys && chunkKeys.length > 0 ? chunkKeys : [baseKey]
  const buffers: Buffer[] = []

  for (const path of keysToFetch) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3.raw',
      'User-Agent': 'ClassmateHub-StorageEngine',
    }

    if (token) {
      headers['Authorization'] = `token ${token}`
    }

    const res = await fetch(url, { headers })
    if (!res.ok) {
      throw new Error(`Failed to fetch file chunk from GitHub storage (${res.status})`)
    }

    const arrayBuf = await res.arrayBuffer()
    buffers.push(Buffer.from(arrayBuf))
  }

  return Buffer.concat(buffers)
}

/**
 * Deletes file or chunks from private GitHub repository
 */
export async function deleteFileFromGithub(baseKey: string, chunkKeys?: string[]) {
  const { owner, repo, branch, token } = getGithubStorageConfig()
  const keysToDelete = chunkKeys && chunkKeys.length > 0 ? chunkKeys : [baseKey]

  for (const path of keysToDelete) {
    try {
      // Get SHA
      const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ClassmateHub-StorageEngine',
      }
      if (token) headers['Authorization'] = `token ${token}`

      const getRes = await fetch(getUrl, { headers })
      if (getRes.ok) {
        const fileData = await getRes.json()
        const sha = fileData.sha

        // Delete commit
        const deleteUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
        await fetch(deleteUrl, {
          method: 'DELETE',
          headers,
          body: JSON.stringify({
            message: `Delete ${path}`,
            sha,
            branch,
          }),
        })
      }
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
