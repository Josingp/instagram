# SNS 촬영용 화면 (웹 · 모바일)

드라마/콘텐츠 촬영에 쓰는 가짜 SNS 화면입니다. 프로필(게시물·팔로워·팔로잉 수, 팔로우·메시지·친구추가 버튼, 프사·피드 사진), 릴스 탭(세로 썸네일 + 조회수, 전체화면 동영상 화면), 게시물·댓글창(댓글 수, 댓글 작성자 아이디·프사·내용·시간·하트, 답글)을 원하는 값으로 꾸밀 수 있고, **사진·동영상과 설정은 Vercel Blob에 저장**되어 어느 기기에서 열어도 같은 화면이 나옵니다.

```
public/            정적 화면 (Vercel이 그대로 서빙)
  index.html       시작 페이지 (웹/모바일 선택)
  mobile.html      모바일 버전 — 배우 폰에서 여는 화면
  web.html         웹(데스크톱) 버전
  shared.js        공통 로직 (상태 · 설정 패널 · 저장 · 업로드)
  shared.css       공통 스타일
  vendor/blob-client.js  @vercel/blob 브라우저용 번들 (동영상 직접 업로드용, Apache-2.0)
api/
  presets.js       프리셋(설정 JSON) 목록/조회/저장/삭제  → Vercel Blob
  upload.js        사진 업로드 → Vercel Blob 공개 URL 반환
  video-token.js   동영상 업로드 토큰 발급 (브라우저 → Blob 직접 업로드, 300MB까지)
lib/server.js      API 공통 유틸 (비밀번호 확인 등)
vercel.json        cleanUrls (…/mobile.html → …/mobile)
```

## 1. GitHub에 올리기

```bash
git init
git add .
git commit -m "촬영용 SNS 화면"
git branch -M main
git remote add origin https://github.com/<계정>/<저장소>.git
git push -u origin main
```

## 2. Vercel 배포

1. vercel.com → **Add New… → Project** → 방금 올린 저장소 Import → 설정은 그대로(Framework Preset: Other) → **Deploy**
2. 배포된 프로젝트 → **Storage** 탭 → **Create Database → Blob**
   - 접근 방식은 **Public** 으로 선택 (사진을 브라우저가 URL로 바로 열어야 하므로)
   - 만든 뒤 **Connect to Project** 로 이 프로젝트에 연결 (Production, Preview 체크)
3. **Settings → Environment Variables** 에 `EDIT_PASSWORD` 추가 (예: `pan2026`)
   - 저장·사진/동영상 업로드·삭제할 때 필요한 편집 비밀번호입니다. 화면 보기는 비밀번호 없이 됩니다.
   - 설정하지 않으면 링크를 아는 누구나 저장/업로드할 수 있으니 꼭 넣어 두세요.
4. **Deployments → 최신 배포 ⋯ → Redeploy** (환경변수·Blob 연결 반영)
5. `https://<프로젝트>.vercel.app/` 접속 → 모바일/웹 선택

Blob 저장소가 연결되지 않았으면 설정 패널 상단에 "Blob 저장소가 연결되지 않았습니다" 라고 표시됩니다. 동영상 업로드는 `BLOB_READ_WRITE_TOKEN` 환경변수를 쓰는데, 대시보드에서 Blob 저장소를 만들면 자동으로 추가됩니다(없으면 Storage → 저장소 → Settings에서 확인).

## 3. 사용법

- **⚙ 설정** 버튼 → 프로필·피드 사진·게시물·댓글 편집. 사진은 선택 즉시 서버에 업로드되고, 설정은 바꿀 때마다 자동으로 클라우드에 저장됩니다(설정 패널 맨 위 '저장' 카드에서 끄고 켤 수 있음).
- **프리셋**: 캐릭터/장면마다 이름을 다르게 저장해 두고 골라서 불러올 수 있습니다. (예: `seoyeon`, `jiho_3화`)
- **촬영용 링크**: 설정 패널의 링크를 복사해 배우 폰으로 보내면, 열자마자 그 프리셋으로 촬영 모드가 됩니다.
  `https://<프로젝트>.vercel.app/mobile?p=프리셋이름&shoot=1`
- **촬영 모드**: 설정 버튼이 사라집니다. 돌아오려면 화면 오른쪽 위 모서리를 빠르게 3번 탭(웹은 `Esc`).
- **릴스 탭**: 설정의 '릴스 · 동영상 탭' 카드에서 릴스를 추가하고 커버 사진, 동영상(파일 업로드 또는 URL), 조회수·좋아요·댓글 수·캡션·오디오 문구를 정합니다. 프로필 두 번째 탭에 세로 썸네일 + ▶ 조회수로 표시되고, 탭하면 전체화면 동영상 화면이 열립니다(위·아래로 넘기기, 탭하면 소리 켜기/끄기, 두 번 탭하면 좋아요 하트).
- **촬영 중 동작**: 팔로우 버튼을 누르면 팔로잉으로 바뀌며 팔로워 +1, 하트를 누르면 튀는 애니메이션과 함께 색·숫자가 바뀌고, 사진/동영상을 **두 번 탭**하면 큰 하트가 뜨며 좋아요가 눌립니다. 댓글 입력창에 글을 쓰면 파란 전송 버튼이 나타나고, 올리면 설정한 내 계정 이름으로 댓글이 애니메이션과 함께 맨 위에 달립니다. '답글 달기'를 누르면 "@아이디님에게 답글 남기는 중" 모드, 댓글을 **길게 누르면**(웹은 더블클릭) "댓글 수정 중" 모드가 되어 체크 버튼으로 수정합니다. 이런 촬영 중 조작은 자동 저장되지 않으며, **테이크 리셋** 버튼으로 마지막 저장 상태로 되돌릴 수 있습니다.
- **댓글 시간 표시**: 댓글마다 '시간 표시' 칸에 `3분`, `2시간`, `1일`, `2주`처럼 적으면 그대로 표시됩니다. 게시물의 '게시 시간 표시'(예: `3시간 전`)와 내가 새로 다는 댓글의 시간 표시(기본 `방금`)도 따로 정할 수 있습니다.
- **폰에서 브라우저 UI 없이 쓰기**: 링크를 연 뒤 '홈 화면에 추가'(iOS Safari 공유 버튼 / Android Chrome 메뉴)로 실행하면 주소창 없이 앱처럼 열립니다.
- 파일로 내보내기/불러오기(JSON)도 그대로 있어서 백업이나 오프라인 사용이 가능합니다.

## 참고

- 사진은 브라우저에서 긴 변 1800px(프사 600px) JPEG로 줄여 올립니다. 한 장 4MB 이하.
- 동영상은 브라우저에서 Blob으로 직접 올립니다(300MB 이하, mp4/mov/webm). 아이폰의 '고효율(HEVC)' 영상은 안드로이드·크롬에서 재생이 안 될 수 있으니 촬영 폰이 아이폰이 아니면 mp4(H.264)로 변환해 올리세요. 브라우저가 소리 자동재생을 막으면 무음으로 시작하고, 화면을 탭하면 소리가 켜집니다.
- Vercel에 배포하지 않고 `public/mobile.html` 을 그냥 열면 "로컬 모드"로 동작합니다(사진·설정이 그 기기 브라우저에만 저장).
- 로컬에서 API까지 돌려보려면 `npm i -g vercel` → `vercel link` → `vercel env pull` → `vercel dev`.
- `public/vendor/blob-client.js`는 `@vercel/blob/client`를 브라우저용으로 번들한 파일입니다. 갱신하려면 `npx esbuild entry.js --bundle --format=esm --platform=browser --minify --outfile=public/vendor/blob-client.js` (entry.js: `export { upload } from '@vercel/blob/client';`).
