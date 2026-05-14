# MirJournal Media

미르저널의 영상 콘텐츠 갤러리. 깃허브 페이지로 정적 호스팅하고
mirjournal.com/media 경로에서 워드프레스로 임베드해서 보여줍니다.

```
mirjournal.com/media  ──(iframe)──▶  ocusun.github.io/mirjournal-media
                                                │
                                                ▼
                            data/videos.json (영상 메타)
                                                │
                                                ▼
                                YouTube · Instagram (실제 영상)
                                                │
                                                ▼
                              mirjournal.com (본문 기사)
```

---

## 1. 깃허브에 올리기 (최초 1회)

1. github.com에서 새 저장소 만들기 (이름: `mirjournal-media`, public)
2. 로컬 또는 깃허브 웹에서 이 폴더의 모든 파일을 그 저장소에 업로드
3. 저장소 **Settings → Pages**에서:
   - Source: `Deploy from a branch`
   - Branch: `main` / `/ (root)`
4. 1~2분 후 `https://ocusun.github.io/mirjournal-media/` 로 접속 → 페이지 확인

`.nojekyll` 파일이 포함되어 있어 깃허브의 Jekyll 처리를 건너뛰고
정적 파일 그대로 서빙됩니다.

---

## 2. WordPress에 임베드해서 mirjournal.com/media 만들기

### 방법 A — 워드프레스 새 페이지 + iframe (가장 간단)

1. WP 관리자 → **페이지 → 새로 추가**
2. 제목: `Media`
3. 슬러그(URL): `media` → 결과 URL: `mirjournal.com/media`
4. 본문 에디터를 **코드 편집기(HTML 모드)** 로 전환
5. 아래 코드 붙여넣기:

```html
<style>
  .mirjournal-media-frame {
    width: 100%;
    height: calc(100vh - 80px);
    min-height: 900px;
    border: 0;
    display: block;
  }
</style>
<iframe class="mirjournal-media-frame"
        src="https://ocusun.github.io/mirjournal-media/"
        loading="lazy"
        title="MirJournal Media Gallery"></iframe>
```

6. 페이지의 **사이드바 옵션**:
   - 템플릿: `전체 너비 (Full Width)` 또는 헤더/푸터만 있는 템플릿
   - 댓글 비활성화
   - SEO 메타: title `미르저널 미디어 — AI 영상 분석`, description 직접 작성

> 단점: iframe 안의 콘텐츠는 구글 색인이 안 됩니다.
> 미디어 페이지 자체를 검색 노출 자산으로 쓰려면 **방법 B**를 권장합니다.

### 방법 B — 깃허브 페이지 코드를 워드프레스 페이지에 직접 박기 (권장, SEO 유리)

1. WP 관리자 → 페이지 → Media 페이지 → **코드 편집기**
2. 이 저장소의 `index.html` 내용을 그대로 복사
3. 단, `<head>` 안 내용은 모두 제거 (워드프레스가 자체 처리)
4. CSS/JS 경로를 깃허브 페이지 절대경로로 수정:
   ```html
   <link rel="stylesheet"
         href="https://ocusun.github.io/mirjournal-media/css/style.css">
   <script src="https://ocusun.github.io/mirjournal-media/js/script.js"></script>
   ```
5. `script.js` 안 `DATA_URL` 도 절대경로로 바꿔야 함 →
   `const DATA_URL = 'https://ocusun.github.io/mirjournal-media/data/videos.json';`
   (그리고 깃허브 페이지에 push)

> 장점: `mirjournal.com/media` 자체가 검색 색인 대상.
> 영상 카드 텍스트가 모두 구글에 노출됨 → 백링크가 본문 기사로 흘러감.

### 방법 C — 서브도메인 (`media.mirjournal.com`)으로 가는 길

mirjournal.com/media 가 아닌 media.mirjournal.com 으로 바꾸려면:
1. 도메인 DNS에 CNAME 추가: `media` → `ocusun.github.io`
2. 저장소 루트에 `CNAME` 파일 생성, 내용: `media.mirjournal.com`
3. 저장소 Settings → Pages → Custom domain: `media.mirjournal.com`

---

## 3. 새 영상 추가하기 (5분)

영상 1편당 작업 순서:

1. **유튜브와 인스타에 영상 업로드** (각 플랫폼에서 평소대로)
2. **유튜브 영상 ID 복사** — URL의 `youtube.com/shorts/`**ABC123XYZ** 또는 `youtu.be/`**ABC123XYZ** 부분
3. **인스타 릴 URL 복사** — `instagram.com/reel/ABC.../`
4. **썸네일 이미지 준비** — 1080×1920 (9:16), `.jpg`로 `assets/` 폴더에 저장
5. **`data/videos.json` 열어서 객체 1개 추가:**

```json
{
  "id": "kospi-7000-shadow",
  "title": "코스피 7,000 시대의 명암",
  "subtitle": "사상 최고치가 던지는 두 가지 질문",
  "category": "economy",
  "date": "2026-05-15",
  "duration": "0:48",
  "thumbnail": "assets/thumb-kospi-7000.jpg",
  "youtube_url": "https://www.youtube.com/shorts/ABC123XYZ",
  "youtube_embed_id": "ABC123XYZ",
  "instagram_url": "https://www.instagram.com/reel/ABC/",
  "naver_clip_url": "",
  "article_url": "https://mirjournal.com/코스피-7000-시대의-명암/",
  "article_title": "코스피 7,000 시대의 명암",
  "summary": "2~3 문장 요약."
}
```

6. git에 commit & push → 1분 후 페이지 자동 반영

### 카테고리 ID

| ID | 라벨 | 컬러 |
|---|---|---|
| `economy` | 경제 | #E63946 |
| `realestate` | 부동산 | #4ECDC4 |
| `ai` | AI | #A78BFA |
| `world` | 국제 | #FFB627 |
| `trend` | 트렌드 | #90BE6D |

새 카테고리가 필요하면 `videos.json`의 `categories` 배열에 추가.

---

## 4. 폴더 구조

```
mirjournal-media/
├── index.html          ← 메인 페이지
├── css/
│   └── style.css       ← 디자인 (editorial dark)
├── js/
│   └── script.js       ← 카드 렌더 + 모달 로직
├── data/
│   └── videos.json     ← 영상 메타데이터 (여기만 수정하면 됨)
├── assets/
│   ├── thumb-*.svg     ← placeholder 썸네일들
│   └── thumb-*.jpg     ← 실제 영상 썸네일 추가
├── .nojekyll
└── README.md
```

---

## 5. 디자인 토큰

`css/style.css` 상단의 `:root` 변수만 바꾸면 전체 톤이 일관되게 변합니다.

- `--bg-deep` : 메인 배경 (검정)
- `--text-primary` : 본문 텍스트 (오프화이트)
- `--accent-*` : 카테고리별 액센트 컬러
- `--font-display` : 제목 (EB Garamond)
- `--font-body` : 본문 (Pretendard)

---

## 6. 한 줄 점검 체크리스트

- [ ] 깃허브 저장소 생성 + 파일 push
- [ ] GitHub Pages 활성화 → 페이지 URL 확인
- [ ] WordPress에 `media` 페이지 생성 + 임베드 코드 삽입
- [ ] mirjournal.com/media 접속해서 정상 렌더링 확인
- [ ] Google Search Console에 `mirjournal.com/media` URL 검사 → 색인 요청
- [ ] 첫 영상 업로드 후 `videos.json` 수정 → push → 자동 반영 확인

---

## 7. 트러블슈팅

**Q. 페이지가 빈 화면이다.**
A. 브라우저 콘솔(F12) 확인. `videos.json` 로드 실패면 경로 문제.

**Q. 영상이 모달에서 안 뜬다.**
A. `youtube_embed_id`가 정확한지 확인. `REPLACE_*` 같은 placeholder가 남아있으면
   "VIDEO COMING SOON"으로 표시됨.

**Q. 인스타 게시물도 모달에서 재생되게 하고 싶다.**
A. 인스타는 oEmbed 정책상 외부 임베드가 제한적. 현재 구조는 인스타 버튼 클릭 시
   인스타로 이동하는 방식. 만약 필요하면 `script.js`의 `openModal()`에
   `blockquote` 임베드 로직을 추가하면 됨 (단, 인스타 스크립트 추가 필요).

**Q. 워드프레스 보안 플러그인이 iframe을 막는다.**
A. Wordfence 등에서 mirjournal.com 자신과 ocusun.github.io를 화이트리스트에 추가.
