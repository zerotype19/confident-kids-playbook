import { Env } from '../types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { user_id: string };
    const { fileType } = await request.json();

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(fileType)) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate unique filename
    const extension = fileType.split('/')[1];
    const filename = `${randomBytes(16).toString('hex')}.${extension}`;
    const key = `uploads/${decoded.user_id}/${filename}`;

    // Create S3 client
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: env.R2_ENDPOINT,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    // Create put command
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    // Generate signed URL
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return new Response(JSON.stringify({ 
      uploadUrl: signedUrl,
      key: key,
      filename: filename
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create upload URL error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create upload URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 