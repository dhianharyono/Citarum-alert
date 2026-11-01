import { put, del } from '@vercel/blob';

/**
 * Uploads a base64 or data image to Vercel Blob Storage.
 * If BLOB_READ_WRITE_TOKEN is not configured (e.g. in local development without Vercel link),
 * returns the original image payload as fallback.
 */
export async function uploadToVercelBlob(
  imageBase64OrData: string,
  prefix = 'laporan-banjir'
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  // If token is missing, keep original base64 for local dev
  if (!token) {
    return imageBase64OrData;
  }

  try {
    let buffer: Buffer;
    let contentType = 'image/jpeg';
    let ext = 'jpg';

    if (imageBase64OrData.startsWith('data:')) {
      const match = imageBase64OrData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        contentType = match[1];
        ext = contentType.split('/')[1] || 'jpg';
        buffer = Buffer.from(match[2], 'base64');
      } else {
        buffer = Buffer.from(imageBase64OrData, 'base64');
      }
    } else {
      buffer = Buffer.from(imageBase64OrData, 'base64');
    }

    const filename = `${prefix}-${Date.now()}.${ext}`;

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      token,
    });

    return blob.url;
  } catch (error) {
    console.warn('[Vercel Blob] Upload failed, falling back to original image data:', error);
    return imageBase64OrData;
  }
}

/**
 * Deletes a file from Vercel Blob Storage by URL.
 */
export async function deleteFromVercelBlob(imageUrl?: string | null): Promise<boolean> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token || !imageUrl || !imageUrl.includes('blob.vercel-storage.com')) {
    return false;
  }
  try {
    await del(imageUrl, { token });
    return true;
  } catch (err) {
    console.warn('[Vercel Blob] Failed to delete blob:', err);
    return false;
  }
}

