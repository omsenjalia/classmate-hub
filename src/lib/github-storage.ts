import { v4 as uuidv4 } from 'uuid'

const GITHUB_CONTENTS_SAFE_CHUNK_SIZE = 3 * 1024 * 1024

export interface UploadResult {
  key: string
  fileName: string
  fileSize: number
  isChunked: boolean
  chunkKeys: string[]
  downloadUrl: string
  publicUrl: string
}

type UploadManifest = Pick<UploadResult, 'fileName' | 'fileSize' | 'chunkKeys'> & {
  version: 1
  contentType: string
}

export function getGithubStorageConfig() {
  return {
    owner: process.env.STORAGE_GITHUB_OWNER || '',
    repo: process.env.STORAGE_GITHUB_REPO || '',
    branch: process.env.STORAGE_GITHUB_BRANCH || 'main',
    token: process.env.STORAGE_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '',
  }
}

export function isGithubStorageConfigured() {
  const { owner, repo, token } = getGithubStorageConfig()
  return Boolean(owner && repo && token)
}

function makeBaseKey(userId: string, uploadId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${uploadId}-${safeName}`
}

function makeResult(baseKey: string, fileName: string, fileSize: number, chunkKeys: string[]): UploadResult {
  const downloadUrl = `/api/materials/download/${baseKey}`
  return {
    key: baseKey,
    fileName,
    fileSize,
    isChunked: chunkKeys.length > 1,
    chunkKeys,
    downloadUrl,
    publicUrl: downloadUrl,
  }
}

/** Upload one browser-split part without ever accepting a Vercel-sized file body. */
export async function uploadGithubChunk({
  userId,
  uploadId,
  fileName,
  fileSize,
  contentType,
  chunkIndex,
  totalChunks,
  chunk,
}: {
  userId: string
  uploadId: string
  fileName: string
  fileSize: number
  contentType: string
  chunkIndex: number
  totalChunks: number
  chunk: Buffer
}): Promise<UploadResult | null> {
  const { owner, repo, branch, token } = getGithubStorageConfig()
  if (!isGithubStorageConfigured()) {
    throw new Error('GitHub storage is not configured')
  }
  if (chunk.length === 0 || chunk.length > GITHUB_CONTENTS_SAFE_CHUNK_SIZE) {
    throw new Error('Invalid upload chunk size')
  }

  const baseKey = makeBaseKey(userId, uploadId, fileName)
  const partKey = `${baseKey}.part${chunkIndex + 1}`
  await commitFileToGithubRepo(owner, repo, branch, token, partKey, chunk, `Upload ${fileName} (part ${chunkIndex + 1}/${totalChunks})`)

  if (chunkIndex !== totalChunks - 1) return null

  const chunkKeys = Array.from({ length: totalChunks }, (_, index) => `${baseKey}.part${index + 1}`)
  const manifest: UploadManifest = {
    version: 1,
    fileName,
    fileSize,
    contentType,
    chunkKeys,
  }
  await commitFileToGithubRepo(
    owner,
    repo,
    branch,
    token,
    `${baseKey}.manifest.json`,
    Buffer.from(JSON.stringify(manifest)),
    `Complete upload ${fileName}`
  )
  return makeResult(baseKey, fileName, fileSize, chunkKeys)
}

/** Compatibility helper for server-side callers; browser uploads use chunks. */
export async function uploadFileToGithub(
  userId: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<UploadResult> {
  const uploadId = uuidv4()
  const totalChunks = Math.ceil(fileBuffer.length / GITHUB_CONTENTS_SAFE_CHUNK_SIZE)
  let result: UploadResult | null = null
  for (let index = 0; index < totalChunks; index++) {
    result = await uploadGithubChunk({
      userId,
      uploadId,
      fileName,
      fileSize: fileBuffer.length,
      contentType,
      chunkIndex: index,
      totalChunks,
      chunk: fileBuffer.subarray(index * GITHUB_CONTENTS_SAFE_CHUNK_SIZE, (index + 1) * GITHUB_CONTENTS_SAFE_CHUNK_SIZE),
    })
  }
  if (!result) throw new Error('GitHub upload did not complete')
  return result
}

async function commitFileToGithubRepo(
  owner: string,
  repo: string,
  branch: string,
  token: string,
  path: string,
  contentBuffer: Buffer,
  commitMessage: string
) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ClassmateHub-StorageEngine',
    },
    body: JSON.stringify({ message: commitMessage, content: contentBuffer.toString('base64'), branch }),
  })
  if (!response.ok) throw new Error(`GitHub upload failed (${response.status}): ${await response.text()}`)
}

async function getGithubManifest(baseKey: string): Promise<UploadManifest | null> {
  const { owner, repo, branch, token } = getGithubStorageConfig()
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${baseKey}.manifest.json?ref=${branch}`, {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'User-Agent': 'ClassmateHub-StorageEngine' },
  })
  if (response.status === 404) return null
  if (!response.ok) throw new Error(`Failed to read upload manifest (${response.status})`)
  const payload = (await response.json()) as { content?: string }
  if (!payload.content) throw new Error('GitHub upload manifest is invalid')
  return JSON.parse(Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8')) as UploadManifest
}

async function downloadGithubPath(path: string): Promise<Buffer> {
  const { owner, repo, branch, token } = getGithubStorageConfig()
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
    headers: { Accept: 'application/vnd.github.raw', Authorization: `Bearer ${token}`, 'User-Agent': 'ClassmateHub-StorageEngine' },
  })
  if (!response.ok) throw new Error(`Failed to download file from GitHub (${response.status})`)
  return Buffer.from(await response.arrayBuffer())
}

export async function downloadFileFromGithub(baseKey: string): Promise<Buffer> {
  const manifest = await getGithubManifest(baseKey)
  const paths = manifest?.chunkKeys || [baseKey]
  const parts: Buffer[] = []
  for (const path of paths) parts.push(await downloadGithubPath(path))
  return Buffer.concat(parts)
}

async function deleteGithubPath(path: string) {
  const { owner, repo, branch, token } = getGithubStorageConfig()
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'User-Agent': 'ClassmateHub-StorageEngine' }
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers })
  if (response.status === 404) return
  if (!response.ok) throw new Error(`Failed to find GitHub file for deletion (${response.status})`)
  const { sha } = (await response.json()) as { sha: string }
  const deletion = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'DELETE',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `Delete ${path}`, sha, branch }),
  })
  if (!deletion.ok) throw new Error(`Failed to delete GitHub file (${deletion.status})`)
}

export async function deleteFileFromGithub(baseKey: string) {
  const manifest = await getGithubManifest(baseKey)
  if (manifest) {
    for (const path of manifest.chunkKeys) await deleteGithubPath(path)
    await deleteGithubPath(`${baseKey}.manifest.json`)
    return
  }
  await deleteGithubPath(baseKey)
}
