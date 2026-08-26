// lib/server.js — API 공통 유틸 (응답 · 비밀번호 확인 · 이름 검증 · Blob 오류 메시지)
import { timingSafeEqual } from 'node:crypto';

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

// EDIT_PASSWORD 환경변수가 설정된 경우에만 쓰기(저장·업로드·삭제)에 비밀번호를 요구합니다.
export function keyMatches(given) {
  const key = process.env.EDIT_PASSWORD || '';
  if (!key) return true;
  const a = Buffer.from(String(given || '')), b = Buffer.from(key);
  return a.length === b.length && timingSafeEqual(a, b);
}
export function requireKey(request) {
  if (keyMatches(request.headers.get('x-edit-key') || '')) return null;
  return json({ error: '편집 비밀번호가 틀립니다' }, 401);
}

export const NAME_RE = /^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ._-]{1,40}$/;
export function presetName(request) {
  const n = new URL(request.url).searchParams.get('name') || '';
  return NAME_RE.test(n) ? n : null;
}

export function blobError(e) {
  const msg = String((e && e.message) || e);
  if (/token|BLOB_READ_WRITE_TOKEN|store.*not found|BlobStoreNotFound/i.test(msg)) {
    return json({ error: 'Blob 저장소가 연결되지 않았습니다. Vercel 프로젝트 → Storage → Blob 저장소(Public)를 만들어 연결한 뒤 다시 배포하세요.' }, 500);
  }
  return json({ error: msg.slice(0, 300) }, 500);
}
