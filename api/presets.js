// api/presets.js — 프리셋(화면 설정 JSON) 목록 · 조회 · 저장 · 삭제  (Vercel Blob)
import { put, get, list, del } from '@vercel/blob';
import { json, requireKey, presetName, blobError } from '../lib/server.js';

const PREFIX = 'presets/';
const path = name => `${PREFIX}${name}.json`;

export async function GET(request) {
  try {
    const url = new URL(request.url);
    if (!url.searchParams.get('name')) {
      const { blobs } = await list({ prefix: PREFIX, limit: 500 });
      const presets = blobs
        .filter(b => b.pathname.endsWith('.json'))
        .map(b => ({ name: b.pathname.slice(PREFIX.length, -5), updatedAt: b.uploadedAt, size: b.size }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return json({ ok: true, presets });
    }
    const name = presetName(request);
    if (!name) return json({ error: '프리셋 이름이 올바르지 않습니다' }, 400);
    const r = await get(path(name), { access: 'public', useCache: false });
    if (!r || !r.stream) return json({ error: '프리셋이 없습니다' }, 404);
    const text = await new Response(r.stream).text();
    let data;
    try { data = JSON.parse(text); } catch { return json({ error: '프리셋 파일이 손상되었습니다' }, 500); }
    return json({ ok: true, name, ...data });
  } catch (e) {
    if (e && e.name === 'BlobNotFoundError') return json({ error: '프리셋이 없습니다' }, 404);
    return blobError(e);
  }
}

export async function PUT(request) {
  const denied = requireKey(request); if (denied) return denied;
  const name = presetName(request);
  if (!name) return json({ error: '프리셋 이름은 영문·숫자·한글·._- 조합 40자 이내여야 합니다' }, 400);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'JSON 본문이 필요합니다' }, 400); }
  if (!body || typeof body !== 'object' || !body.state || typeof body.state !== 'object') return json({ error: 'state가 없습니다' }, 400);
  const payload = JSON.stringify({ app: 'sns-shoot', v: 1, savedAt: new Date().toISOString(), state: body.state });
  if (payload.length > 3_500_000) return json({ error: '프리셋이 너무 큽니다. 사진은 업로드 기능으로 넣어 주세요.' }, 413);
  try {
    await put(path(name), payload, { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
    return json({ ok: true, name });
  } catch (e) { return blobError(e); }
}

export async function DELETE(request) {
  const denied = requireKey(request); if (denied) return denied;
  const name = presetName(request);
  if (!name) return json({ error: '프리셋 이름이 올바르지 않습니다' }, 400);
  try { await del(path(name)); return json({ ok: true, name }); }
  catch (e) { return blobError(e); }
}
