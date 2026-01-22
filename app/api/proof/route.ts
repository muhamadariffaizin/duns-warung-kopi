import { createHash } from 'crypto';

export async function POST(req: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
  const apiKey = process.env.CLOUDINARY_API_KEY || '';
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json({ error: 'Cloudinary env not set' }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;

  if (!file) {
    return Response.json({ error: 'File missing' }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = 'duns-warung-kopi/proof';
  const signatureBase = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash('sha1').update(signatureBase).digest('hex');

  const uploadForm = new FormData();
  uploadForm.append('file', file);
  uploadForm.append('api_key', apiKey);
  uploadForm.append('timestamp', String(timestamp));
  uploadForm.append('folder', folder);
  uploadForm.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: uploadForm
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json({ error: 'Upload failed', detail: text }, { status: 500 });
  }

  const data = await res.json();
  return Response.json({ url: data.secure_url });
}
