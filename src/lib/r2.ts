import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

export const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ACCOUNT_ID
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : 'https://placeholder.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder',
  },
})

export async function createPresignedUploadUrl(
  userId: string,
  fileName: string,
  contentType: string
) {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${userId}/${uuidv4()}-${sanitized}`

  const bucketName = process.env.R2_BUCKET_NAME || 'classmate-hub-materials'
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  })

  // 5 minutes expiry
  const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 })
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-classmatehub.r2.dev'
  const publicUrl = `${publicBase}/${key}`

  return { presignedUrl, key, publicUrl }
}

export async function deleteFromR2(key: string) {
  const bucketName = process.env.R2_BUCKET_NAME || 'classmate-hub-materials'
  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )
}
