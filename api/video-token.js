// api/video-token.js — 동영상 클라이언트 업로드용 토큰 발급 (브라우저 → Vercel Blob 직접 업로드, 4.5MB 제한 우회)
import { handleUpload } from '@vercel/blob/client';
import { json, keyMatches } from '../lib/server.js';

const ALLOWED = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
const MAX = 300 * 1024 * 1024;

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'JSON 본문이 필요합니다' }, 400); }
  try {
    const result = await handleUpload({
      body, request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let given = '';
        try { given = JSON.parse(clientPayload || '{}').key || ''; } catch { }
        if (!keyMatches(given)) throw new Error('편집 비밀번호가 틀립니다');
        if (!/^videos\/[^/]{1,120}$/.test(pathname)) throw new Error('잘못된 업로드 경로입니다');
        return {
          allowedContentTypes: ALLOWED, maximumSizeInBytes: MAX, addRandomSuffix: true,
          callbackUrl: new URL(request.url).origin + '/api/video-token', tokenPayload: '',
        };
      },
      onUploadCompleted: async () => { },
    });
    return json(result);
  } catch (e) {
    const msg = String((e && e.message) || e);
    if (/비밀번호/.test(msg)) return json({ error: msg }, 401);
    if (/token|BLOB_READ_WRITE_TOKEN/i.test(msg)) return json({ error: 'BLOB_READ_WRITE_TOKEN 환경변수가 없습니다. Vercel Storage에서 Blob 저장소를 프로젝트에 연결한 뒤 다시 배포하세요.' }, 500);
    return json({ error: msg.slice(0, 300) }, 400);
  }
}
