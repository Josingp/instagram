// api/upload.js — 사진 업로드 (브라우저에서 리사이즈된 이미지를 Vercel Blob에 저장하고 공개 URL 반환)
import { put } from '@vercel/blob';
import { json, requireKey, blobError } from '../lib/server.js';

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX = 4.4 * 1024 * 1024; // Vercel 함수 요청 본문 한도(4.5MB) 안쪽

export async function POST(request) {
  const denied = requireKey(request); if (denied) return denied;
  const url = new URL(request.url);
  const raw = (url.searchParams.get('name') || 'image').normalize('NFC');
  const base = raw.replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9가-힣._-]/g, '_').slice(0, 60) || 'image';
  const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const ext = EXT[type];
  if (!ext) return json({ error: '이미지 파일만 업로드할 수 있습니다 (jpg / png / webp / gif)' }, 400);
  const buf = await request.arrayBuffer();
  if (!buf.byteLength) return json({ error: '빈 파일입니다' }, 400);
  if (buf.byteLength > MAX) return json({ error: '파일이 너무 큽니다 (4MB 이하)' }, 413);
  try {
    const blob = await put(`uploads/${base}.${ext}`, buf, { access: 'public', contentType: type, addRandomSuffix: true });
    return json({ ok: true, url: blob.url });
  } catch (e) { return blobError(e); }
}
