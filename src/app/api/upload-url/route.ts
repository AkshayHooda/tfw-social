import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isR2Configured, createPresignedUploadUrl } from '@/lib/r2';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'Filename and contentType are required' },
        { status: 400 }
      );
    }

    const ext = filename.split('.').pop() || '';
    const key = `media/${Date.now()}-${randomUUID()}.${ext}`;

    // 1. If Cloudflare R2 is configured, use R2
    if (isR2Configured) {
      const { signedUrl, publicUrl } = await createPresignedUploadUrl(key, contentType);
      return NextResponse.json({
        type: 'r2',
        key,
        signedUrl,
        publicUrl,
      });
    }

    // 2. If Vercel Blob is configured (via BLOB_READ_WRITE_TOKEN)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({
        type: 'blob',
        key,
        uploadUrl: '/api/upload',
        message: 'Ready for direct upload to Vercel Blob store',
      });
    }

    // 3. Fallback mock endpoint
    return NextResponse.json({
      type: 'mock',
      mock: true,
      key,
      signedUrl: `/api/upload-url/mock-upload?key=${encodeURIComponent(key)}`,
      publicUrl: `/api/upload-url/mock-file?key=${encodeURIComponent(key)}`,
      message: 'Operating in mock mode.',
    });
  } catch (err: unknown) {
    console.error('Error generating upload target:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
