import { S3Client } from '@aws-sdk/client-s3'

if (
    !process.env.CLOUDFLARE_R2_ACCOUNT_ID ||
    !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ||
    !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
) {
    // Warn but don't crash if envs are missing during build time
    console.warn('Cloudflare R2 credentials are missing.')
}

export const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || ''
    }
})

export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || ''
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || ''
