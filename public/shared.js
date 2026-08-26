/* shared.js — 촬영용 SNS 화면 공통 로직 (상태 · 에디터 · 로컬/클라우드 저장 · 사진/동영상 업로드)
   mobile.html / web.html 이 함께 사용합니다. */
window.SNS = (function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const linkify = t => esc(t).replace(/(^|[\s(])([#@][^\s#@()]+)/g, (m, a, b) => `${a}<span class="tagc">${b}</span>`);
  const isImg = s => typeof s === 'string' && (/^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/i.test(s) || /^https:\/\/[^\s"'<>\\]+$/i.test(s));
  const isUrl = s => typeof s === 'string' && /^https:\/\/[^\s"'<>\\]+$/i.test(s);
  let uidN = 1; const nid = () => 'c' + (uidN++) + '_' + Date.now().toString(36);

  /* ---------- 아이콘 ---------- */
  const I = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>',
    moreV: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16v-5a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 004 0"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    personAdd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="8" r="3.6"/><path d="M3 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M19 8v6M16 11h6"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>',
    playSolid: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="2.6"/><path d="M6.8 18.5c.9-2.7 2.8-4.1 5.2-4.1s4.3 1.4 5.2 4.1"/></svg>',
    heart: f => `<svg viewBox="0 0 24 24" fill="${f ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>`,
    comment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.5c-4.8 0-8.5 3.4-8.5 7.6 0 2.4 1.2 4.5 3 5.9L5.4 21l4.7-2.2c.6.1 1.2.2 1.9.2 4.8 0 8.5-3.4 8.5-7.7S16.8 3.5 12 3.5z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M21 3L3.5 10.3l7.2 3 3 7.2z"/><path d="M21 3l-10.3 10.3"/></svg>',
    bookmark: f => `<svg viewBox="0 0 24 24" fill="${f ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3.5h12V21l-6-4.6L6 21z"/></svg>`,
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3.5 11L12 3.5l8.5 7.5V21h-6v-6h-5v6h-6z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.8-3.8"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2.2 5.3-4.8 1.7 2.2-5.3z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
    smile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8"/><circle cx="9" cy="10" r=".9" fill="currentColor"/><circle cx="15" cy="10" r=".9" fill="currentColor"/></svg>',
    verified: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1b7ff5"/><path d="M7.5 12.4l3 3 6-6.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 005.7 0l2.8-2.8a4 4 0 00-5.7-5.7l-1.3 1.3"/><path d="M14 10a4 4 0 00-5.7 0l-2.8 2.8a4 4 0 005.7 5.7l1.3-1.3"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 12l6-6 6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.2"/></svg>',
    mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>',
    sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
    person: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#dbdbdb"/><circle cx="20" cy="15.5" r="6.5" fill="#fff"/><path d="M6.5 35c1.6-7 7.2-10.8 13.5-10.8S31.9 28 33.5 35a20 20 0 01-27 0z" fill="#fff"/></svg>'
  };
  const ic = (svg, cls = '') => `<i class="ic ${cls}">${svg}</i>`;
  const vb = ic(I.verified, 'vb');
  const av = (src, size, cls = '') => `<div class="av ${cls}" style="width:${size}px;height:${size}px">${src ? `<img src="${src}" alt="">` : I.person}</div>`;
  const PH = ['#f3d6d0,#e9c3d9', '#d3e4f5,#c8d8ee', '#f7e6c5,#f2d9b0', '#d9efe2,#c3e4d3', '#ece1f5,#d9c9ee', '#f5e1e1,#ecd0d0', '#dbe9f7,#e6f0fb', '#fbeed7,#f4dcc0', '#e2f0e6,#cfe6d8', '#f0e4f0,#e2d0e6', '#dfe6f2,#cfd9ea', '#f6e7d8,#efd6c2'];
  const phGrad = i => `linear-gradient(135deg,${PH[Math.abs(i) % PH.length]})`;
  const PHD = ['#3b3f5c,#1e2140', '#5c3b4b,#2b1a24', '#3b5c4d,#16261f', '#5c533b,#2a2418', '#3b4a5c,#171f29', '#4d3b5c,#20172b'];
  const phGradDark = i => `linear-gradient(160deg,${PHD[Math.abs(i) % PHD.length]})`;

  /* ---------- 상태 ---------- */
  const blankComment = () => ({ id: nid(), username: '', verified: false, avatar: null, text: '', time: '방금', likes: '', liked: false, replies: '', parentId: null });
  const blankReel = () => ({ id: nid(), cover: null, video: null, views: '', likes: '', comments: '', caption: '', audio: '', liked: false });
  const defaults = () => {
    const c1 = { ...blankComment(), username: 'jiho_0412', text: '언니 오늘 촬영 너무 고생했어요 🥹 파이팅!', time: '2시간', likes: '24', liked: true };
    return {
      app: { name: 'Lumin', reelsLabel: '릴스' },
      profile: { kind: 'other', username: 'seoyeon_k', name: '김서연', verified: true, bio: '배우 Actor\n📍 Seoul\n출연 문의는 DM 주세요', link: 'linkin.bio/seoyeon', avatar: null, posts: '128', followers: '24.3만', following: '512', follow: 'follow', fillGrid: true, gridRatio: '1:1', showReelViews: false },
      feed: [],
      reels: [
        { ...blankReel(), views: '128만', likes: '4.2만', comments: '312', caption: '촬영장 비하인드 🎬 #드라마 #비하인드', audio: '원본 오디오 · seoyeon_k' },
        { ...blankReel(), views: '52.4만', likes: '1.8만', comments: '96', caption: '오늘의 OOTD ✨', audio: '원본 오디오 · seoyeon_k' },
        { ...blankReel(), views: '9,812', likes: '1,204', comments: '41', caption: '대본 리딩 하는 날 📖', audio: '원본 오디오 · seoyeon_k' }
      ],
      post: { image: null, likes: '2,431', caption: '촬영 마지막 날 🎬 함께해준 모든 분들께 감사드려요\n#드라마 #촬영일기', time: '3시간 전', commentCount: '128', liked: false, saved: false },
      viewer: { username: 'yj_daily', avatar: null, newTime: '방금' },
      comments: [
        c1,
        { ...blankComment(), username: 'seoyeon_k', verified: true, text: '@jiho_0412 고마워요 🥰', time: '1시간', likes: '8', parentId: c1.id },
        { ...blankComment(), username: 'hanbyul.official', verified: true, text: '다음 작품도 기대할게요 🔥', time: '1시간', likes: '152' },
        { ...blankComment(), username: 'mina_daily', text: '사진 너무 잘 나왔다 ㅠㅠ 어디서 찍은 거예요?', time: '43분', likes: '3' },
        { ...blankComment(), username: 'kdrama_lover99', text: '팬이에요!! 꼭 답글 봐주세요 ❤️', time: '12분', likes: '' }
      ]
    };
  };
  const S = {};
  function replaceState(n) { for (const k of Object.keys(S)) delete S[k]; Object.assign(S, n); }
  replaceState(defaults());
  const deepClone = o => JSON.parse(JSON.stringify(o));
  const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  const setPath = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); const t = ks.reduce((a, k) => a[k], o); t[last] = v; };
  function bump(v, d) {
    const s = String(v ?? '').trim();
    if (s !== '' && !/^(\d{1,3}(,\d{3})+|\d+)$/.test(s)) return s;
    const n = s === '' ? 0 : parseInt(s.replace(/,/g, ''), 10);
    const m = Math.max(0, n + d);
    if (m === 0 && s === '') return '';
    return s.includes(',') ? m.toLocaleString('en-US') : String(m);
  }
  const cnt = v => { const s = String(v ?? '').trim(); return (s === '' || s === '0') ? '' : esc(s); };
  function mergeState(st) {
    const d = defaults(), o = st && typeof st === 'object' ? st : {};
    const str = (v, fb) => typeof v === 'string' ? v : fb, bool = (v, fb) => typeof v === 'boolean' ? v : fb, img = v => isImg(v) ? v : null;
    const out = { app: { ...d.app }, profile: { ...d.profile }, feed: [], reels: [], post: { ...d.post }, viewer: { ...d.viewer }, comments: [] };
    const A = o.app || {}, P = o.profile || {}, Q = o.post || {}, V = o.viewer || {};
    out.app.name = str(A.name, d.app.name); out.app.reelsLabel = str(A.reelsLabel, d.app.reelsLabel);
    for (const k of ['username', 'name', 'bio', 'link', 'posts', 'followers', 'following']) out.profile[k] = str(P[k], d.profile[k]);
    out.profile.kind = P.kind === 'self' ? 'self' : 'other'; out.profile.follow = P.follow === 'following' ? 'following' : 'follow';
    out.profile.verified = bool(P.verified, d.profile.verified); out.profile.fillGrid = bool(P.fillGrid, true); out.profile.avatar = img(P.avatar);
    out.profile.gridRatio = P.gridRatio === '3:4' ? '3:4' : '1:1'; out.profile.showReelViews = bool(P.showReelViews, false);
    out.feed = Array.isArray(o.feed) ? o.feed.filter(isImg) : [];
    out.reels = (Array.isArray(o.reels) ? o.reels : d.reels).map(r => { const b = blankReel(); if (!r || typeof r !== 'object') return b; for (const k of ['views', 'likes', 'comments', 'caption', 'audio']) b[k] = str(r[k], ''); b.cover = img(r.cover); b.video = isUrl(r.video) ? r.video : null; b.liked = bool(r.liked, false); return b; });
    for (const k of ['likes', 'caption', 'time', 'commentCount']) out.post[k] = str(Q[k], d.post[k]);
    out.post.liked = bool(Q.liked, false); out.post.saved = bool(Q.saved, false); out.post.image = img(Q.image);
    out.viewer.username = str(V.username, d.viewer.username); out.viewer.avatar = img(V.avatar); out.viewer.newTime = str(V.newTime, '방금');
    const src = Array.isArray(o.comments) ? o.comments : [];
    const idMap = new Map();
    out.comments = src.map(c => { const b = blankComment(); if (!c || typeof c !== 'object') return b; for (const k of ['username', 'text', 'time', 'likes', 'replies']) b[k] = str(c[k], ''); b.verified = bool(c.verified, false); b.liked = bool(c.liked, false); b.avatar = img(c.avatar); if (typeof c.id === 'string') idMap.set(c.id, b.id); b._parent = typeof c.parentId === 'string' ? c.parentId : null; return b; });
    for (const b of out.comments) { b.parentId = b._parent && idMap.has(b._parent) ? idMap.get(b._parent) : null; delete b._parent; }
    return out;
  }

  const ui = { postIndex: -1, shoot: false, tab: 'posts', reelIndex: 0, reelMuted: false, commentsFor: 'post', cmode: null, expanded: new Set(), animLike: false, animCid: null, animNew: null, animFlash: null, suppressClick: 0 };
  let hooks = {}; let platform = 'web';
  let lastSaved = null;

  /* ---------- 토스트 ---------- */
  let toastT = null;
  function toast(m) { const t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

  /* ---------- 댓글 트리 ---------- */
  function commentTree() {
    const ids = new Set(S.comments.map(c => c.id));
    const isReply = c => !!(c.parentId && ids.has(c.parentId) && c.parentId !== c.id);
    const kids = new Map();
    for (const c of S.comments) if (isReply(c)) { if (!kids.has(c.parentId)) kids.set(c.parentId, []); kids.get(c.parentId).push(c); }
    return S.comments.filter(c => !isReply(c)).map(c => ({ c, children: kids.get(c.id) || [] }));
  }
  const findComment = id => S.comments.find(x => x.id === id);
  const currentReel = () => S.reels[ui.reelIndex] || null;

  /* ---------- 촬영 중 동작 ---------- */
  const actions = {
    commentTree, findComment, currentReel,
    currentPostImage() { if (ui.postIndex >= 0 && S.feed[ui.postIndex]) return S.feed[ui.postIndex]; return S.post.image || S.feed[0] || null; },
    setTab(t) { ui.tab = t; hooks.renderProfile(); },
    toggleFollow() {
      const p = S.profile, f = p.follow !== 'following';
      p.follow = f ? 'following' : 'follow'; p.followers = bump(p.followers, f ? 1 : -1);
      hooks.renderProfile(); hooks.renderReel && hooks.renderReel(); syncField('profile.follow'); syncField('profile.followers');
    },
    togglePostLike(opts = {}) {
      if (opts.onlyLike && S.post.liked) { hooks.renderPost({ bigHeart: true }); return; }
      S.post.liked = !S.post.liked; S.post.likes = bump(S.post.likes, S.post.liked ? 1 : -1);
      ui.animLike = S.post.liked;
      hooks.renderPost({ bigHeart: !!opts.onlyLike }); syncField('post.liked'); syncField('post.likes');
    },
    togglePostSave() { S.post.saved = !S.post.saved; hooks.renderPost(); syncField('post.saved'); },
    toggleReelLike(opts = {}) {
      const r = currentReel(); if (!r) return;
      if (opts.onlyLike && r.liked) { hooks.renderReel && hooks.renderReel({ bigHeart: true }); return; }
      r.liked = !r.liked; r.likes = bump(r.likes, r.liked ? 1 : -1); ui.animLike = r.liked;
      hooks.renderReel && hooks.renderReel({ bigHeart: !!opts.onlyLike }); renderReelsEditor();
    },
    toggleCommentLike(id) { const c = findComment(id); if (!c) return; c.liked = !c.liked; c.likes = bump(c.likes, c.liked ? 1 : -1); ui.animCid = c.liked ? id : null; hooks.renderComments(); renderCommentsEditor(); ui.animCid = null; },
    toggleReplies(id) { if (ui.expanded.has(id)) ui.expanded.delete(id); else ui.expanded.add(id); hooks.renderComments(); },
    beginEdit(id) { const c = findComment(id); if (!c) return; ui.cmode = { type: 'edit', id }; hooks.renderComposer && hooks.renderComposer({ text: c.text, focus: true }); },
    beginReply(id) { const c = findComment(id); if (!c) return; const root = c.parentId && findComment(c.parentId) ? c.parentId : c.id; ui.cmode = { type: 'reply', id: root, username: c.username }; hooks.renderComposer && hooks.renderComposer({ text: '@' + c.username + ' ', focus: true }); },
    cancelMode() { ui.cmode = null; hooks.renderComposer && hooks.renderComposer({ text: '', focus: false }); },
    postComment(text) {
      const t = String(text || '').trim(); if (!t) return null;
      const mode = ui.cmode; ui.cmode = null;
      let target;
      if (mode && mode.type === 'edit' && findComment(mode.id)) {
        target = findComment(mode.id); target.text = t; ui.animFlash = target.id;
      } else {
        target = { ...blankComment(), username: S.viewer.username || 'user', avatar: S.viewer.avatar, text: t, time: S.viewer.newTime || '방금' };
        if (mode && mode.type === 'reply' && findComment(mode.id)) {
          target.parentId = mode.id; ui.expanded.add(mode.id);
          const parent = findComment(mode.id); let at = S.comments.indexOf(parent) + 1;
          while (at < S.comments.length && S.comments[at].parentId === mode.id) at++;
          S.comments.splice(at, 0, target);
        } else S.comments.unshift(target);
        ui.animNew = target.id;
        if (ui.commentsFor === 'reel' && currentReel()) { currentReel().comments = bump(currentReel().comments, 1); renderReelsEditor(); }
        else { S.post.commentCount = bump(S.post.commentCount, 1); syncField('post.commentCount'); }
      }
      hooks.renderComments(); hooks.renderPost && hooks.renderPost(); hooks.renderReel && hooks.renderReel(); renderCommentsEditor();
      ui.animNew = null; ui.animFlash = null;
      hooks.renderComposer && hooks.renderComposer({ text: '', focus: false });
      return target;
    }
  };

  /* 길게 누르기 감지 (댓글 수정 모드 진입용) */
  function longPress(container, selector, cb, ms = 480) {
    let timer = null, x0 = 0, y0 = 0, target = null;
    const clear = () => { clearTimeout(timer); timer = null; target = null; };
    container.addEventListener('pointerdown', e => {
      const el = e.target.closest(selector); if (!el || e.target.closest('button')) return;
      target = el; x0 = e.clientX; y0 = e.clientY;
      timer = setTimeout(() => { const t = target; clear(); ui.suppressClick = Date.now(); cb(t); }, ms);
    });
    container.addEventListener('pointermove', e => { if (timer && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) clear(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => container.addEventListener(t, clear));
    container.addEventListener('contextmenu', e => { if (e.target.closest(selector)) e.preventDefault(); });
  }
  /* 두 번 탭 감지 (한 번 탭 동작은 선택) */
  function doubleTap(el, onDouble, onSingle, ms = 300) {
    let last = 0, t = null;
    el.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      const now = Date.now();
      if (now - last < ms) { last = 0; clearTimeout(t); t = null; onDouble(e); }
      else { last = now; if (onSingle) { clearTimeout(t); t = setTimeout(() => { t = null; onSingle(e); }, ms); } }
    });
  }

  /* ---------- 로컬 저장 ---------- */
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  let quotaWarned = false;
  function localSave() {
    const ok = LS.set('sns_state_v1', JSON.stringify(S));
    if (!ok && !cloud.enabled && !quotaWarned) { quotaWarned = true; toast('브라우저 저장 용량을 넘었습니다 — 파일로 내보내기를 이용하세요'); }
  }
  function localLoad() { try { const s = LS.get('sns_state_v1'); return s ? JSON.parse(s) : null; } catch (e) { return null; } }

  /* ---------- 클라우드 저장 (Vercel Blob) ---------- */
  const cloud = { checked: false, enabled: false, error: '', list: [], key: LS.get('sns_key') || '', preset: LS.get('sns_preset') || 'default', autosave: LS.get('sns_autosave') !== '0', ready: false, lastSavedAt: null, locked: false, saving: false, pendingSave: false };
  const cleanName = n => String(n || '').trim().replace(/\s+/g, '-').replace(/[^A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ._-]/g, '').slice(0, 40);
  const fmtTime = d => d ? d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
  async function api(path, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (cloud.key) headers['x-edit-key'] = cloud.key;
    const r = await fetch(path, { ...opts, headers, cache: 'no-store' });
    let d = null; try { d = await r.json(); } catch (e) { }
    if (!r.ok) { const err = new Error((d && d.error) || ('HTTP ' + r.status)); err.status = r.status; throw err; }
    return d;
  }
  async function cloudDetect() {
    cloud.enabled = false; cloud.error = '';
    if (location.protocol === 'file:' || typeof fetch !== 'function') { cloud.checked = true; return; }
    try {
      const d = await api('/api/presets');
      if (d && Array.isArray(d.presets)) { cloud.enabled = true; cloud.list = d.presets; }
    } catch (e) {
      cloud.error = (e.status && e.status !== 404) ? e.message : '';
    }
    cloud.checked = true;
  }
  async function listPresets() { try { const d = await api('/api/presets'); cloud.list = d.presets || []; } catch (e) { } renderCloud(); }
  async function loadPreset(name, { silent } = {}) {
    try {
      const d = await api('/api/presets?name=' + encodeURIComponent(name));
      replaceState(mergeState(d.state || d));
      lastSaved = deepClone(S); cloud.preset = name; LS.set('sns_preset', name); localSave();
      ui.postIndex = -1; ui.reelIndex = 0; ui.expanded.clear(); ui.cmode = null;
      hooks.renderAll(); syncEditor(); renderCloud();
      if (!silent) toast(`'${name}' 불러옴`);
      return true;
    } catch (e) {
      if (e.status === 404) { if (!silent) toast(`'${name}' 프리셋이 없습니다`); }
      else toast('불러오기 실패: ' + e.message);
      return false;
    }
  }
  async function savePreset(name, { silent } = {}) {
    if (!cloud.enabled) return false;
    name = cleanName(name); if (!name) { toast('프리셋 이름을 입력하세요'); return false; }
    if (cloud.saving) { cloud.pendingSave = true; return false; }
    cloud.saving = true; setLive('저장 중...');
    try {
      await api('/api/presets?name=' + encodeURIComponent(name), { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ state: S }) });
      const isNew = !cloud.list.some(p => p.name === name);
      cloud.preset = name; LS.set('sns_preset', name); lastSaved = deepClone(S); cloud.lastSavedAt = new Date(); cloud.locked = false;
      setLive('저장됨 ' + fmtTime(cloud.lastSavedAt));
      if (!silent) toast(`'${name}' 클라우드에 저장됨`);
      if (isNew) await listPresets(); else renderCloud();
      return true;
    } catch (e) {
      setLive('저장 실패');
      if (e.status === 401) { cloud.locked = true; renderCloud(); toast('편집 비밀번호가 틀립니다'); const k = $('#cl-key'); k && k.focus(); }
      else toast('저장 실패: ' + e.message);
      return false;
    } finally {
      cloud.saving = false;
      if (cloud.pendingSave) { cloud.pendingSave = false; scheduleAutosave(); }
    }
  }
  async function deletePreset(name) {
    try { await api('/api/presets?name=' + encodeURIComponent(name), { method: 'DELETE' }); toast(`'${name}' 삭제됨`); await listPresets(); }
    catch (e) { if (e.status === 401) { cloud.locked = true; renderCloud(); toast('편집 비밀번호가 틀립니다'); } else toast('삭제 실패: ' + e.message); }
  }
  let autosaveT = null;
  function scheduleAutosave() {
    if (!(cloud.enabled && cloud.autosave && cloud.ready)) return;
    clearTimeout(autosaveT); setLive('변경됨 · 곧 저장');
    autosaveT = setTimeout(() => savePreset(cloud.preset || 'default', { silent: true }), 1500);
  }
  function markDirty() { localSave(); scheduleAutosave(); }
  function setLive(t) { const el = $('#cl-live'); if (el) el.textContent = t || ''; }

  /* ---------- 이미지 · 동영상 ---------- */
  function resizeToCanvas(file, max) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file); const img = new Image();
      img.onload = () => {
        try {
          const w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, max / Math.max(w, h));
          const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s));
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c);
        } catch (err) { rej(err); } finally { URL.revokeObjectURL(url); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('이미지를 읽을 수 없습니다')); };
      img.src = url;
    });
  }
  const canvasToBlob = c => new Promise((res, rej) => { if (!c.toBlob) return rej(new Error('toBlob')); c.toBlob(b => b ? res(b) : rej(new Error('blob')), 'image/jpeg', 0.9); });
  const baseName = n => String(n || 'image').replace(/\.[^.]+$/, '').replace(/[^A-Za-z0-9가-힣._-]/g, '_').slice(0, 60) || 'image';
  async function imageSrc(file, max) {
    const canvas = await resizeToCanvas(file, max);
    if (cloud.enabled) {
      try {
        const blob = await canvasToBlob(canvas);
        const d = await api('/api/upload?name=' + encodeURIComponent(baseName(file.name)), { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: blob });
        if (d && isImg(d.url)) return d.url;
        throw new Error('업로드 응답 오류');
      } catch (e) {
        if (e.status === 401) { cloud.locked = true; renderCloud(); toast('편집 비밀번호가 틀려 사진을 이 기기에만 저장합니다'); }
        else toast('서버 업로드 실패 — 이 기기에만 저장: ' + e.message);
      }
    }
    return canvas.toDataURL('image/jpeg', 0.9);
  }
  async function videoSrc(file, onProgress) {
    if (!cloud.enabled) { toast('로컬 모드: 동영상은 이번 세션에서만 재생되고 저장되지 않습니다'); return URL.createObjectURL(file); }
    const mod = await import('./vendor/blob-client.js');
    const ext = ((file.name || '').match(/\.(mp4|mov|webm|m4v)$/i) || [, 'mp4'])[1].toLowerCase();
    const type = file.type || ({ mp4: 'video/mp4', mov: 'video/quicktime', webm: 'video/webm', m4v: 'video/x-m4v' }[ext]);
    const res = await mod.upload(`videos/${baseName(file.name)}.${ext}`, file, {
      access: 'public', handleUploadUrl: '/api/video-token', contentType: type, multipart: file.size > 8 * 1024 * 1024,
      clientPayload: JSON.stringify({ key: cloud.key }),
      onUploadProgress: p => onProgress && onProgress(Math.round(p.percentage))
    });
    if (!res || !isUrl(res.url)) throw new Error('업로드 응답 오류');
    return res.url;
  }

  /* ---------- 에디터 ---------- */
  function editorHTML() {
    const mobile = platform === 'mobile';
    const tap = mobile ? '탭' : '클릭';
    return `
    <div class="ed-hd">
      <h1>촬영용 SNS 화면 설정</h1>
      <button type="button" class="ebtn sm" id="ed-close">닫기</button>
      <button type="button" class="ebtn sm pri" id="ed-shoot">촬영 모드 ▶</button>
    </div>
    <div class="ed-body">
      <p class="hint" style="margin:0 2px 12px">촬영 모드에서는 설정 버튼이 사라집니다. ${mobile ? '화면 <b>오른쪽 위 모서리를 빠르게 3번 탭</b>' : '<kbd>Esc</kbd> 키를 누르거나 화면 <b>오른쪽 위 모서리를 빠르게 3번 클릭</b>'}하면 설정으로 돌아옵니다.</p>

      <div class="card" id="cloud-card">
        <h2>저장 <span id="cl-live" class="live"></span></h2>
        <div class="cl-status" id="cl-status"></div>
        <div class="row2">
          <div class="f"><label>프리셋 이름 (캐릭터/장면별로 여러 개 저장 가능)</label><input type="text" id="cl-name" placeholder="예: seoyeon" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
          <div class="f"><label>저장된 프리셋</label><select id="cl-list"></select></div>
        </div>
        <div class="btnrow">
          <button type="button" class="ebtn sm blue" id="cl-save">클라우드에 저장</button>
          <button type="button" class="ebtn sm" id="cl-load">선택한 프리셋 불러오기</button>
          <button type="button" class="ebtn sm danger" id="cl-del">선택한 프리셋 삭제</button>
        </div>
        <label class="chk" style="margin-top:10px"><input type="checkbox" id="cl-auto"> 설정을 바꾸면 자동으로 클라우드에 저장</label>
        <div class="f"><label>편집 비밀번호 (Vercel에 EDIT_PASSWORD를 설정한 경우)</label><input type="password" id="cl-key" autocomplete="off" placeholder="설정하지 않았으면 비워두세요"></div>
        <div class="f"><label>촬영용 링크 — 폰에서 열면 바로 촬영 모드</label><div class="linkrow"><input type="text" id="cl-link" readonly><button type="button" class="ebtn sm" id="cl-copy">복사</button></div></div>
        <div class="btnrow">
          <button type="button" class="ebtn sm" id="take-reset">테이크 리셋 (마지막 저장 상태로)</button>
          <button type="button" class="ebtn sm" id="preset-save">파일로 내보내기</button>
          <button type="button" class="ebtn sm" id="preset-load">파일 불러오기</button>
          <button type="button" class="ebtn sm" id="fullscreen">전체화면</button>
          <button type="button" class="ebtn sm danger" id="reset">초기화</button>
        </div>
      </div>

      <div class="card">
        <h2>프로필</h2>
        <div class="f"><label>화면 유형</label>
          <select data-bind="profile.kind">
            <option value="other">타인 프로필 (팔로우 · 메시지 · 친구추가)</option>
            <option value="self">내 프로필 (프로필 편집 · ${mobile ? '프로필 공유' : '보관된 스토리'})</option>
          </select></div>
        <div class="f"><label>프로필 사진</label>
          <div class="imgpick"><div class="thumb" id="th-avatar"></div>
            <button type="button" class="ebtn sm" data-pick="avatar">사진 선택</button>
            <button type="button" class="ebtn sm danger" data-clear="avatar">지우기</button></div></div>
        <div class="row2">
          <div class="f"><label>아이디</label><input type="text" data-bind="profile.username" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
          <div class="f"><label>이름</label><input type="text" data-bind="profile.name"></div>
        </div>
        <label class="chk"><input type="checkbox" data-bind="profile.verified"> 인증 배지 표시</label>
        <div class="f"><label>소개</label><textarea data-bind="profile.bio"></textarea></div>
        <div class="f"><label>링크 (비우면 숨김)</label><input type="text" data-bind="profile.link" autocapitalize="none" autocorrect="off"></div>
        <div class="row3">
          <div class="f"><label>게시물</label><input type="text" data-bind="profile.posts"></div>
          <div class="f"><label>팔로워</label><input type="text" data-bind="profile.followers"></div>
          <div class="f"><label>팔로잉</label><input type="text" data-bind="profile.following"></div>
        </div>
        <div class="row2">
          <div class="f"><label>팔로우 버튼 상태 (타인 프로필)</label>
            <select data-bind="profile.follow">
              <option value="follow">팔로우 (파란색)</option>
              <option value="following">팔로잉 (회색)</option>
            </select></div>
          <div class="f"><label>게시물 그리드 비율</label>
            <select data-bind="profile.gridRatio"><option value="1:1">정사각형 1:1</option><option value="3:4">세로형 3:4</option></select></div>
        </div>
        ${mobile ? '' : '<div class="f"><label>좌측 메뉴 상단 서비스 이름</label><input type="text" data-bind="app.name"></div>'}
        <p class="hint">숫자는 입력한 그대로 표시됩니다. 예: 1,234 / 2.4만 / 153만. 촬영 중 팔로우 버튼이나 하트를 ${tap}하면 상태와 숫자가 실제처럼 바뀝니다.</p>
      </div>

      <div class="card">
        <h2>피드 사진</h2>
        <div class="btnrow">
          <button type="button" class="ebtn sm blue" data-pick="feed">사진 추가 (여러 장 선택 가능)</button>
          <button type="button" class="ebtn sm danger" id="feed-clear">전체 삭제</button>
        </div>
        <label class="chk" style="margin-top:10px"><input type="checkbox" data-bind="profile.fillGrid"> 사진이 적으면 반복해서 그리드 채우기</label>
        <div class="thumbs" id="feed-thumbs"></div>
      </div>

      <div class="card">
        <h2>릴스 · 동영상 탭 <span id="rl-count" style="color:#888;font-weight:500"></span></h2>
        <p class="hint" style="margin-bottom:8px">프로필 두 번째 탭에 세로 썸네일과 조회수가 표시됩니다. 썸네일을 ${tap}하면 전체화면 동영상 화면이 열리고, 두 번 ${tap}하면 좋아요 애니메이션이 나옵니다.</p>
        <div class="row2">
          <div class="f"><label>탭/화면 이름</label><input type="text" data-bind="app.reelsLabel" placeholder="릴스"></div>
          <div class="f" style="justify-content:flex-end"><label class="chk" style="margin:0"><input type="checkbox" data-bind="profile.showReelViews"> 동영상 화면에도 '조회 N회' 표시</label></div>
        </div>
        <div id="rl-list"></div>
        <button type="button" class="ebtn sm blue" id="rl-add">+ 릴스 추가</button>
      </div>

      <div class="card">
        <h2>게시물 · 댓글창</h2>
        <div class="f"><label>게시물 화면 사진 (선택 — 없으면 ${tap}한 피드 사진 사용)</label>
          <div class="imgpick"><div class="thumb sq" id="th-post"></div>
            <button type="button" class="ebtn sm" data-pick="post">사진 선택</button>
            <button type="button" class="ebtn sm danger" data-clear="post">지우기</button></div></div>
        <div class="row2">
          <div class="f"><label>좋아요 수</label><input type="text" data-bind="post.likes"></div>
          <div class="f"><label>댓글 수</label><input type="text" data-bind="post.commentCount"></div>
        </div>
        <div class="f"><label>캡션</label><textarea data-bind="post.caption"></textarea></div>
        <div class="f"><label>게시 시간 표시 (예: 3시간 전 · 2일 전 · 1주 전)</label><input type="text" data-bind="post.time" placeholder="예: 3시간 전"></div>
        <div class="btnrow" style="margin-bottom:10px">
          <label class="chk" style="margin:0"><input type="checkbox" data-bind="post.liked"> 좋아요 눌림</label>
          <label class="chk" style="margin:0"><input type="checkbox" data-bind="post.saved"> 저장됨</label>
        </div>
        <div class="btnrow">
          ${mobile ? '<button type="button" class="ebtn sm" id="open-post">게시물 화면 열기</button>' : ''}
          <button type="button" class="ebtn sm" id="open-comments">${mobile ? '댓글창 열기' : '게시물 · 댓글창 열기'}</button>
        </div>
        <p class="hint" style="margin-top:8px">촬영 중: 사진을 두 번 ${tap}하면 큰 하트가 뜨며 좋아요가 눌립니다. 댓글을 <b>길게 누르면</b> '댓글 수정 중' 모드, '답글 달기'를 ${tap}하면 답글 모드가 됩니다.</p>
      </div>

      <div class="card">
        <h2>댓글 <span id="cm-count" style="color:#888;font-weight:500"></span></h2>
        <div id="cm-list"></div>
        <button type="button" class="ebtn sm blue" id="cm-add">+ 댓글 추가</button>
      </div>

      <div class="card">
        <h2>내 계정 (댓글 입력창 · ${mobile ? '하단 탭' : '좌측 메뉴'})</h2>
        <p class="hint" style="margin-bottom:8px">촬영 중 댓글을 직접 입력해 올리면 이 계정 이름으로 댓글이 달립니다.</p>
        <div class="f"><label>프로필 사진</label>
          <div class="imgpick"><div class="thumb" id="th-viewer"></div>
            <button type="button" class="ebtn sm" data-pick="viewer">사진 선택</button>
            <button type="button" class="ebtn sm danger" data-clear="viewer">지우기</button></div></div>
        <div class="row2">
          <div class="f"><label>아이디</label><input type="text" data-bind="viewer.username" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
          <div class="f"><label>내가 단 댓글의 시간 표시</label><input type="text" data-bind="viewer.newTime" placeholder="방금"></div>
        </div>
      </div>
    </div>
    <input type="file" id="file-avatar" accept="image/*" hidden>
    <input type="file" id="file-feed" accept="image/*" multiple hidden>
    <input type="file" id="file-post" accept="image/*" hidden>
    <input type="file" id="file-viewer" accept="image/*" hidden>
    <input type="file" id="file-cavatar" accept="image/*" hidden>
    <input type="file" id="file-rcover" accept="image/*" hidden>
    <input type="file" id="file-rvideo" accept="video/*" hidden>
    <input type="file" id="file-preset" accept=".json,application/json" hidden>`;
  }

  function syncField(path) { const el = $(`[data-bind="${path}"]`); if (!el) return; const v = getPath(S, path); if (el.type === 'checkbox') el.checked = !!v; else el.value = v ?? ''; }
  function renderThumb(sel, src, round) { const el = $(sel); if (!el) return; el.innerHTML = src ? `<img src="${src}" alt="">` : (round === false ? '' : I.person); }
  function syncEditor() {
    $$('[data-bind]').forEach(el => syncField(el.dataset.bind));
    renderThumb('#th-avatar', S.profile.avatar);
    renderThumb('#th-viewer', S.viewer.avatar);
    renderThumb('#th-post', S.post.image, false);
    renderFeedEditor(); renderReelsEditor(); renderCommentsEditor();
  }
  function renderFeedEditor() {
    const el = $('#feed-thumbs'); if (!el) return;
    el.innerHTML = S.feed.map((src, i) => `<div class="th"><img src="${src}" alt=""><div class="ops"><button type="button" data-fop="up" data-i="${i}" title="앞으로">◀</button><button type="button" data-fop="del" data-i="${i}" title="삭제">✕</button><button type="button" data-fop="down" data-i="${i}" title="뒤로">▶</button></div></div>`).join('');
  }
  function renderReelsEditor() {
    const list = $('#rl-list'); if (!list) return;
    $('#rl-count').textContent = S.reels.length ? `(${S.reels.length})` : '';
    list.innerHTML = S.reels.map((r, i) => `
      <div class="ccard" data-rid="${r.id}">
        <div class="ct">
          <div class="thumb rt">${r.cover ? `<img src="${r.cover}" alt="">` : `<div class="phr" style="background:${phGradDark(i)}"></div>`}</div>
          <span class="n">#${i + 1}${r.video ? ' · 동영상 있음' : ''}</span>
          <button type="button" class="ebtn sm" data-ract="cover">커버</button>
          <button type="button" class="ebtn sm" data-ract="video">동영상</button>
          <button type="button" class="ebtn sm" data-ract="up" ${i === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="ebtn sm" data-ract="down" ${i === S.reels.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="ebtn sm danger" data-ract="del">삭제</button>
        </div>
        <div class="row3">
          <div class="f"><label>조회수</label><input type="text" data-rf="views" value="${esc(r.views)}" placeholder="예: 12.3만"></div>
          <div class="f"><label>좋아요</label><input type="text" data-rf="likes" value="${esc(r.likes)}"></div>
          <div class="f"><label>댓글 수</label><input type="text" data-rf="comments" value="${esc(r.comments)}"></div>
        </div>
        <div class="f"><label>캡션</label><textarea data-rf="caption" style="min-height:44px">${esc(r.caption)}</textarea></div>
        <div class="row2">
          <div class="f"><label>오디오 표시</label><input type="text" data-rf="audio" value="${esc(r.audio)}" placeholder="원본 오디오 · 아이디"></div>
          <div class="f"><label>동영상 URL (업로드하면 자동 입력)</label><input type="text" data-rf="video" value="${esc(r.video || '')}" placeholder="https://…mp4" autocapitalize="none" autocorrect="off"></div>
        </div>
      </div>`).join('');
  }
  function renderCommentsEditor() {
    const list = $('#cm-list'); if (!list) return;
    $('#cm-count').textContent = S.comments.length ? `(${S.comments.length})` : '';
    const tops = S.comments.filter(c => !c.parentId);
    list.innerHTML = S.comments.map((c, i) => `
      <div class="ccard" data-cid="${c.id}">
        <div class="ct">
          <div class="thumb">${c.avatar ? `<img src="${c.avatar}" alt="">` : I.person}</div>
          <span class="n">#${i + 1}${c.parentId ? ' · 답글' : ''}</span>
          <button type="button" class="ebtn sm" data-cact="cav">프사</button>
          ${c.avatar ? '<button type="button" class="ebtn sm danger" data-cact="cavclear">✕</button>' : ''}
          <button type="button" class="ebtn sm" data-cact="up" ${i === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="ebtn sm" data-cact="down" ${i === S.comments.length - 1 ? 'disabled' : ''}>▼</button>
          <button type="button" class="ebtn sm danger" data-cact="del">삭제</button>
        </div>
        <div class="row2">
          <div class="f"><label>아이디</label><input type="text" data-cf="username" value="${esc(c.username)}" autocapitalize="none" autocorrect="off" spellcheck="false"></div>
          <div class="f"><label>시간 표시 (예: 3분 · 2시간 · 1일 · 2주)</label><input type="text" data-cf="time" value="${esc(c.time)}" placeholder="예: 2시간"></div>
        </div>
        <div class="f"><label>댓글 내용</label><textarea data-cf="text">${esc(c.text)}</textarea></div>
        <div class="row3">
          <div class="f"><label>하트 수</label><input type="text" data-cf="likes" value="${esc(c.likes)}"></div>
          <div class="f"><label>답글 대상</label><select data-cf="parentId"><option value="">없음 (일반 댓글)</option>${tops.filter(t => t.id !== c.id).map(t => `<option value="${t.id}" ${c.parentId === t.id ? 'selected' : ''}>${esc(t.username || '(아이디 없음)')}의 답글</option>`).join('')}</select></div>
          <div class="f" style="justify-content:flex-end;gap:2px"><label class="chk" style="margin:0"><input type="checkbox" data-cf="liked" ${c.liked ? 'checked' : ''}> 하트 눌림</label><label class="chk" style="margin:0"><input type="checkbox" data-cf="verified" ${c.verified ? 'checked' : ''}> 인증</label></div>
        </div>
        ${c.parentId ? '' : `<div class="f" style="margin:0"><label>답글 수 표시 (선택 — 실제 답글이 없을 때 '답글 N개 보기' 문구용)</label><input type="text" data-cf="replies" value="${esc(c.replies)}"></div>`}
      </div>`).join('');
  }
  function renderCloud() {
    const st = $('#cl-status'); if (!st) return;
    let cls = '', msg = '';
    if (!cloud.checked) msg = '서버 연결 확인 중...';
    else if (cloud.enabled) {
      cls = 'on';
      msg = `● 클라우드 저장 사용 중 · 현재 프리셋 <b>${esc(cloud.preset || 'default')}</b>` + (cloud.lastSavedAt ? ` · 마지막 저장 ${fmtTime(cloud.lastSavedAt)}` : '') + '<br>사진·동영상은 서버에 업로드되고 설정은 프리셋으로 저장되어 다른 기기에서도 그대로 열립니다.' + (cloud.locked ? '<br><b>편집 비밀번호를 입력해야 저장·업로드할 수 있습니다.</b>' : '');
    } else if (cloud.error) { cls = 'err'; msg = '⚠ 서버 오류: ' + esc(cloud.error); }
    else msg = '○ 로컬 모드 — 이 기기 브라우저에만 저장됩니다. Vercel에 배포하고 Blob 저장소를 연결하면 사진·동영상과 설정이 클라우드에 저장됩니다.';
    st.className = 'cl-status ' + cls; st.innerHTML = msg;
    const sel = $('#cl-list'); const list = cloud.list || [];
    sel.innerHTML = list.length ? list.map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('') : '<option value="">(저장된 프리셋 없음)</option>';
    if (list.some(p => p.name === cloud.preset)) sel.value = cloud.preset;
    ['#cl-save', '#cl-load', '#cl-del', '#cl-auto', '#cl-list'].forEach(s => { const el = $(s); if (el) el.disabled = !cloud.enabled; });
    renderCloudLink();
    const nm = $('#cl-name'); if (nm && document.activeElement !== nm) nm.value = cloud.preset || '';
    const key = $('#cl-key'); if (key && document.activeElement !== key) key.value = cloud.key || '';
    const auto = $('#cl-auto'); if (auto) auto.checked = !!cloud.autosave;
  }
  function renderCloudLink() { const link = $('#cl-link'); if (!link) return; if (location.protocol === 'file:') { link.value = '(배포 후 표시됩니다)'; return; } const base = location.origin + location.pathname.replace(/\.html$/, ''); link.value = `${base}?p=${encodeURIComponent(cloud.preset || 'default')}&shoot=1`; }

  const openEditor = () => { $('#editor').classList.remove('hidden'); document.body.classList.add('edit-on'); renderCloud(); };
  function closeEditor(shoot, { silent } = {}) {
    $('#editor').classList.add('hidden'); document.body.classList.remove('edit-on');
    ui.shoot = !!shoot; const fab = $('#fab'); if (fab) fab.classList.toggle('hidden', ui.shoot);
    if (shoot && !silent) toast(platform === 'mobile' ? '촬영 모드 · 오른쪽 위 모서리 3번 탭하면 설정으로 돌아옵니다' : '촬영 모드 · Esc 키 또는 오른쪽 위 모서리 3번 클릭으로 설정 복귀');
  }

  let pendingCid = null, pendingRid = null;
  function wireEditor() {
    const ed = $('#editor'); ed.innerHTML = editorHTML();
    const fab = $('#fab'); fab && fab.addEventListener('click', openEditor);
    $('#ed-close').addEventListener('click', () => closeEditor(false));
    $('#ed-shoot').addEventListener('click', () => closeEditor(true));
    const op = $('#open-post'); op && op.addEventListener('click', () => { hooks.openPost && hooks.openPost(); closeEditor(ui.shoot, { silent: true }); });
    $('#open-comments').addEventListener('click', () => { hooks.openComments && hooks.openComments(); closeEditor(ui.shoot, { silent: true }); });

    /* 일반 필드 바인딩 */
    const onBind = e => { const el = e.target; if (!el.dataset || !el.dataset.bind) return; setPath(S, el.dataset.bind, el.type === 'checkbox' ? el.checked : el.value); hooks.renderAll(); markDirty(); };
    ed.addEventListener('input', onBind); ed.addEventListener('change', onBind);

    /* 피드 */
    $('#feed-thumbs').addEventListener('click', e => {
      const b = e.target.closest('[data-fop]'); if (!b) return; const i = +b.dataset.i, o = b.dataset.fop;
      if (o === 'del') S.feed.splice(i, 1);
      else if (o === 'up' && i > 0) [S.feed[i - 1], S.feed[i]] = [S.feed[i], S.feed[i - 1]];
      else if (o === 'down' && i < S.feed.length - 1) [S.feed[i + 1], S.feed[i]] = [S.feed[i], S.feed[i + 1]];
      renderFeedEditor(); hooks.renderAll(); markDirty();
    });
    $('#feed-clear').addEventListener('click', () => { if (!S.feed.length) return; if (!confirm('피드 사진을 모두 삭제할까요?')) return; S.feed = []; renderFeedEditor(); hooks.renderAll(); markDirty(); });

    /* 릴스 */
    $('#rl-list').addEventListener('click', e => {
      const b = e.target.closest('[data-ract]'); if (!b) return;
      const id = b.closest('[data-rid]').dataset.rid, i = S.reels.findIndex(r => r.id === id); if (i < 0) return;
      const a = b.dataset.ract;
      if (a === 'cover') { pendingRid = id; $('#file-rcover').click(); return; }
      if (a === 'video') { pendingRid = id; $('#file-rvideo').click(); return; }
      if (a === 'up' && i > 0) [S.reels[i - 1], S.reels[i]] = [S.reels[i], S.reels[i - 1]];
      else if (a === 'down' && i < S.reels.length - 1) [S.reels[i + 1], S.reels[i]] = [S.reels[i], S.reels[i + 1]];
      else if (a === 'del') { if (!confirm('이 릴스를 삭제할까요?')) return; S.reels.splice(i, 1); }
      ui.reelIndex = Math.min(ui.reelIndex, Math.max(0, S.reels.length - 1));
      renderReelsEditor(); hooks.renderAll(); markDirty();
    });
    const onRf = e => { const el = e.target; if (!el.dataset || !el.dataset.rf) return; const r = S.reels.find(x => x.id === el.closest('[data-rid]').dataset.rid); if (!r) return; const f = el.dataset.rf; r[f] = f === 'video' ? (isUrl(el.value.trim()) ? el.value.trim() : null) : el.value; hooks.renderAll(); markDirty(); };
    $('#rl-list').addEventListener('input', onRf); $('#rl-list').addEventListener('change', onRf);
    $('#rl-add').addEventListener('click', () => { S.reels.push({ ...blankReel(), views: '1.2만', likes: '532', comments: '18', audio: '원본 오디오 · ' + (S.profile.username || '') }); renderReelsEditor(); hooks.renderAll(); markDirty(); const cards = $$('#rl-list [data-rid]'); const last = cards[cards.length - 1]; last && last.scrollIntoView && last.scrollIntoView({ block: 'nearest' }); });
    $('#file-rcover').addEventListener('change', async e => {
      const f = e.target.files[0]; e.target.value = ''; const r = S.reels.find(x => x.id === pendingRid); pendingRid = null; if (!f || !r) return;
      toast('커버 처리 중...');
      try { r.cover = await imageSrc(f, 1200); renderReelsEditor(); hooks.renderAll(); markDirty(); toast('커버 적용됨'); } catch (err) { toast('이미지를 불러오지 못했습니다'); }
    });
    $('#file-rvideo').addEventListener('change', async e => {
      const f = e.target.files[0]; e.target.value = ''; const r = S.reels.find(x => x.id === pendingRid); pendingRid = null; if (!f || !r) return;
      if (f.size > 300 * 1024 * 1024) { toast('동영상은 300MB 이하만 올릴 수 있습니다'); return; }
      setLive('동영상 업로드 중 0%'); toast('동영상 업로드 중...');
      try {
        r.video = await videoSrc(f, p => setLive(`동영상 업로드 중 ${p}%`));
        renderReelsEditor(); hooks.renderAll(); markDirty(); setLive(''); toast('동영상 적용됨');
      } catch (err) {
        setLive('업로드 실패');
        const m = String(err && err.message || err);
        if (/비밀번호|401|Unauthorized/i.test(m)) { cloud.locked = true; renderCloud(); toast('편집 비밀번호가 틀립니다'); }
        else toast('동영상 업로드 실패: ' + m.slice(0, 120));
      }
    });

    /* 댓글 */
    $('#cm-list').addEventListener('click', e => {
      const b = e.target.closest('[data-cact]'); if (!b) return;
      const id = b.closest('.ccard').dataset.cid, i = S.comments.findIndex(c => c.id === id); if (i < 0) return;
      const a = b.dataset.cact;
      if (a === 'cav') { pendingCid = id; $('#file-cavatar').click(); return; }
      if (a === 'cavclear') S.comments[i].avatar = null;
      else if (a === 'up' && i > 0) [S.comments[i - 1], S.comments[i]] = [S.comments[i], S.comments[i - 1]];
      else if (a === 'down' && i < S.comments.length - 1) [S.comments[i + 1], S.comments[i]] = [S.comments[i], S.comments[i + 1]];
      else if (a === 'del') { S.comments.splice(i, 1); S.comments.forEach(c => { if (c.parentId === id) c.parentId = null; }); }
      renderCommentsEditor(); hooks.renderComments(); markDirty();
    });
    const onCf = e => {
      const el = e.target; if (!el.dataset || !el.dataset.cf) return;
      const card = el.closest('.ccard'); const c = findComment(card.dataset.cid); if (!c) return;
      const f = el.dataset.cf;
      if (f === 'parentId') { c.parentId = el.value || null; if (c.parentId) ui.expanded.add(c.parentId); renderCommentsEditor(); }
      else c[f] = el.type === 'checkbox' ? el.checked : el.value;
      hooks.renderComments(); markDirty();
    };
    $('#cm-list').addEventListener('input', onCf); $('#cm-list').addEventListener('change', onCf);
    $('#cm-add').addEventListener('click', () => {
      S.comments.push({ ...blankComment(), username: 'user_' + Math.floor(100 + Math.random() * 900), time: '1분' });
      renderCommentsEditor(); hooks.renderComments(); markDirty();
      const cards = $$('#cm-list .ccard'); const last = cards[cards.length - 1];
      if (last) { last.scrollIntoView && last.scrollIntoView({ block: 'nearest' }); const inp = last.querySelector('[data-cf="username"]'); inp && inp.focus(); }
    });

    /* 사진 */
    ed.addEventListener('click', e => {
      const p = e.target.closest('[data-pick]'); if (p) { $('#file-' + p.dataset.pick).click(); return; }
      const c = e.target.closest('[data-clear]'); if (c) clearImage(c.dataset.clear);
    });
    const single = (sel, max, apply) => $(sel).addEventListener('change', async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      toast('사진 처리 중...');
      try { apply(await imageSrc(f, max)); hooks.renderAll(); markDirty(); toast('사진 적용됨'); } catch (err) { toast('이미지를 불러오지 못했습니다'); }
    });
    single('#file-avatar', 600, src => { S.profile.avatar = src; renderThumb('#th-avatar', src); });
    single('#file-viewer', 600, src => { S.viewer.avatar = src; renderThumb('#th-viewer', src); });
    single('#file-post', 1800, src => { S.post.image = src; renderThumb('#th-post', src, false); });
    $('#file-cavatar').addEventListener('change', async e => {
      const f = e.target.files[0]; e.target.value = ''; const c = findComment(pendingCid); pendingCid = null; if (!f || !c) return;
      try { c.avatar = await imageSrc(f, 300); renderCommentsEditor(); hooks.renderComments(); markDirty(); } catch (err) { toast('이미지를 불러오지 못했습니다'); }
    });
    $('#file-feed').addEventListener('change', async e => {
      const fs = [...e.target.files]; e.target.value = ''; if (!fs.length) return;
      let n = 0;
      for (const f of fs) { toast(`사진 ${n + 1}/${fs.length} 처리 중...`); try { S.feed.push(await imageSrc(f, 1800)); n++; renderFeedEditor(); hooks.renderAll(); } catch (err) { } }
      markDirty(); toast(`사진 ${n}장 추가됨`);
    });

    /* 클라우드 */
    $('#cl-name').addEventListener('input', e => { cloud.preset = cleanName(e.target.value) || ''; renderCloudLink(); });
    $('#cl-name').addEventListener('blur', () => { if (!cloud.preset) cloud.preset = 'default'; renderCloud(); });
    $('#cl-key').addEventListener('input', e => { cloud.key = e.target.value; LS.set('sns_key', cloud.key); cloud.locked = false; });
    $('#cl-auto').addEventListener('change', e => { cloud.autosave = e.target.checked; LS.set('sns_autosave', cloud.autosave ? '1' : '0'); if (cloud.autosave) scheduleAutosave(); });
    $('#cl-save').addEventListener('click', () => savePreset(cloud.preset || $('#cl-name').value));
    $('#cl-load').addEventListener('click', () => { const n = $('#cl-list').value; if (!n) { toast('불러올 프리셋이 없습니다'); return; } loadPreset(n); });
    $('#cl-del').addEventListener('click', () => { const n = $('#cl-list').value; if (!n) return; if (!confirm(`'${n}' 프리셋을 클라우드에서 삭제할까요?`)) return; deletePreset(n); });
    $('#cl-copy').addEventListener('click', () => {
      const v = $('#cl-link').value;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(() => toast('링크 복사됨'), () => toast(v));
      else { $('#cl-link').select(); toast(v); }
    });
    $('#take-reset').addEventListener('click', () => {
      if (!lastSaved) return;
      replaceState(deepClone(lastSaved)); ui.postIndex = -1; ui.cmode = null; ui.expanded.clear(); localSave();
      hooks.renderAll(); syncEditor(); hooks.resetView && hooks.resetView(); toast('마지막 저장 상태로 되돌렸습니다');
    });

    /* 파일 · 기타 */
    $('#preset-save').addEventListener('click', () => {
      try {
        const blob = new Blob([JSON.stringify({ app: 'sns-shoot', v: 2, state: S })], { type: 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sns-preset-${(cloud.preset || S.profile.username || 'profile').replace(/[^\w.가-힣-]/g, '_')}.json`;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); toast('프리셋 파일 저장됨');
      } catch (err) { toast('저장에 실패했습니다'); }
    });
    $('#preset-load').addEventListener('click', () => $('#file-preset').click());
    $('#file-preset').addEventListener('change', e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { const d = JSON.parse(r.result); replaceState(mergeState(d.state || d)); ui.postIndex = -1; ui.reelIndex = 0; syncEditor(); hooks.renderAll(); markDirty(); toast('프리셋 파일 불러오기 완료'); } catch (err) { toast('프리셋 파일을 읽을 수 없습니다'); } };
      r.onerror = () => toast('파일을 읽을 수 없습니다');
      r.readAsText(f);
    });
    $('#reset').addEventListener('click', () => {
      if (!confirm('모든 설정과 사진을 초기화할까요? (클라우드 프리셋은 다시 저장하기 전까지 그대로 남습니다)')) return;
      clearTimeout(autosaveT); replaceState(defaults()); ui.postIndex = -1; ui.reelIndex = 0; ui.cmode = null; ui.expanded.clear(); localSave();
      syncEditor(); hooks.renderAll(); hooks.resetView && hooks.resetView(); setLive('초기화됨 · 저장하려면 클라우드에 저장'); toast('초기화됨');
    });
    $('#fullscreen').addEventListener('click', () => {
      const el = document.documentElement; const fn = el.requestFullscreen || el.webkitRequestFullscreen;
      if (fn) { try { const r = fn.call(el); if (r && r.catch) r.catch(() => toast('전체화면을 열 수 없습니다')); } catch (err) { toast('전체화면을 열 수 없습니다'); } }
      else toast('이 브라우저는 전체화면을 지원하지 않습니다. 홈 화면에 추가해서 사용하세요.');
    });

    /* 촬영 모드 복귀: 오른쪽 위 모서리 3번 탭/클릭 */
    const hot = $('#hotspot'); let taps = [];
    hot && hot.addEventListener('click', e => {
      const now = Date.now(); taps = taps.filter(t => now - t < 900); taps.push(now);
      if (taps.length >= 3) { taps = []; openEditor(); return; }
      hot.style.pointerEvents = 'none';
      const el = document.elementFromPoint ? document.elementFromPoint(e.clientX, e.clientY) : null;
      hot.style.pointerEvents = '';
      if (el && el !== hot && typeof el.click === 'function') el.click();
    });
  }
  function clearImage(k) {
    if (k === 'avatar') { S.profile.avatar = null; renderThumb('#th-avatar', null); }
    else if (k === 'viewer') { S.viewer.avatar = null; renderThumb('#th-viewer', null); }
    else if (k === 'post') { S.post.image = null; renderThumb('#th-post', null, false); }
    hooks.renderAll(); markDirty();
  }

  /* ---------- 시작 ---------- */
  async function boot() {
    const q = new URLSearchParams(location.search);
    const pParam = cleanName(q.get('p')); const shoot = q.get('shoot') === '1';
    const local = localLoad(); if (local) { try { replaceState(mergeState(local)); } catch (e) { } }
    lastSaved = deepClone(S);
    hooks.renderAll(); syncEditor(); renderCloud();
    if (shoot) closeEditor(true, { silent: true });
    await cloudDetect();
    if (cloud.enabled) {
      const name = pParam || cloud.preset || 'default';
      cloud.preset = name;
      const ok = await loadPreset(name, { silent: true });
      if (!ok && pParam) toast(`'${name}' 프리셋이 아직 없습니다 — 설정 후 저장하세요`);
    }
    cloud.ready = true; renderCloud();
  }
  function init(opts) {
    hooks = opts.hooks || {}; platform = opts.platform || 'web';
    document.body.classList.add(platform);
    wireEditor();
    boot();
  }

  return { init, S, ui, cloud, actions, toast, openEditor, closeEditor, syncField, longPress, doubleTap, I, ic, vb, av, esc, linkify, cnt, bump, phGrad, phGradDark, $, $$ };
})();
