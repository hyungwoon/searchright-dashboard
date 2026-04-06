# SearchRight GA4 이벤트 설계서

> 작성일: 2026-03-23 | 작성: CEO Staff AI
> 대상: searchright.net, blog.searchright.net, jd-creator.searchright.net, demo.searchright.net
> GA4 Measurement ID: `G-KKBJRXNVPG`

---

## 현재 상태 진단

### 기존 이벤트 현황

| 이벤트 | 발화 위치 | 문제 |
|--------|----------|------|
| `Request_landing_cta_home` | 홈/서비스/가격 등 CTA 클릭 | 어떤 페이지에서 클릭했는지 구분 안 됨 |
| `demo_landing_cta` | 홈페이지 데모 CTA | 정상 |
| `form_start` | /login/, /project/, / 등 | **문의 폼과 로그인 폼이 구분 안 됨** |
| `generate_lead` | /contact/ 에서만 발화 | **/request/ 폼에는 미설정 — 3월 리드 0건의 원인** |
| `PRdeck_download` | 소개서 다운로드 | 정상, 다만 어떤 페이지에서 클릭했는지 미추적 |
| `blog_cta_click` | 블로그 CTA | 발화 빈도 낮음 (1명 11회) |
| `Request_landing_cta_demo` | 메인 데모 요청 | `demo_landing_cta`와 중복 가능성 |

### 핵심 문제 3가지

1. **`/request/` 폼 제출 시 `generate_lead` 미발화** — 현재 문의 폼 페이지인데 전환 이벤트가 없음
2. **`form_start`가 로그인/문의/프로젝트 폼을 구분 안 함** — 분석 불가
3. **CTA 클릭 이벤트에 출처 페이지 정보 없음** — 어떤 페이지에서 전환이 발생하는지 추적 불가

---

## 사이트 구조 & 사용자 동선

```
searchright.net (메인)
├── / (홈페이지)
│   ├── [CTA] 서비스 체험하기 → demo.searchright.net
│   ├── [CTA] 문의하기 → /request
│   ├── [CTA] 서비스 소개서 다운받기 → Google Drive PDF
│   └── [CTA] 고객사 사례 → 각 사례 페이지
├── /service/ (서비스 소개)
│   ├── [CTA] 문의하기 → /request
│   ├── [CTA] 회사 소개서 다운받기 → Google Drive PDF
│   └── [검색] 검색어 입력 (인재 검색 데모?)
├── /pricing/ (가격)
│   ├── [CTA] 지금 바로 요청하기 → /request
│   ├── [CTA] 도입 문의하기 → /request
│   └── [CTA] 더 많은 이야기 읽어보기 → 사례
├── /request/ (★ 문의하기 — 핵심 전환 페이지)
│   ├── [INPUT] 이름/업체명
│   ├── [INPUT] 이메일
│   ├── [INPUT] 전화번호
│   ├── [INPUT] 문의 내용
│   ├── [CHECKBOX] 개인정보 동의
│   └── [BUTTON] 문의하기 (disabled until 동의)
├── /login/ (고객사 로그인 → 현재 홈으로 리다이렉트)
└── /contact/ (레거시 — 더 이상 사용 안 함)

blog.searchright.net (Ghost 블로그)
├── / (목록)
├── /tag/{hr-insight|team-story|newsroom|case-study}/ (카테고리)
└── /{slug}/ (개별 글)

jd-creator.searchright.net (JD Creator BETA)
├── / (가입 폼: 이름, 전화, 이메일)
└── [BUTTON] 시작하기

demo.searchright.net (서비스 체험)
└── (별도 앱)
```

---

## 신규 이벤트 설계

### 원칙
1. **GA4 추천 이벤트명** 우선 사용 (generate_lead, sign_up 등)
2. **모든 이벤트에 `page_location` 파라미터** 포함 (출처 페이지 구분)
3. **기존 이벤트 하위호환 유지** — 기존 이벤트 제거하지 않고 신규 추가
4. **네이밍 컨벤션**: `{동사}_{대상}` (snake_case)

---

### 1. 문의 퍼널 이벤트 (최우선)

| 이벤트명 | 발화 시점 | 페이지 | 파라미터 | 우선순위 |
|---------|----------|--------|---------|---------|
| `inquiry_page_view` | /request/ 페이지 로드 | /request/ | `referrer_page` (이전 페이지 경로) | **P0** |
| `inquiry_form_start` | 첫 번째 입력 필드에 포커스/입력 | /request/ | `first_field` (어떤 필드부터 입력했는지) | **P0** |
| `inquiry_form_progress` | 각 필드 입력 완료 | /request/ | `field_name`, `fields_completed` (완료 필드 수) | P1 |
| `inquiry_privacy_agree` | 개인정보 동의 체크 | /request/ | — | P1 |
| `generate_lead` | 문의하기 버튼 클릭 & 제출 성공 | /request/ | `inquiry_type: "request"`, `company_name` (선택) | **P0** |

**구현 코드 (/request/ 페이지):**

```javascript
// 1. 페이지 진입 시
gtag('event', 'inquiry_page_view', {
  referrer_page: document.referrer || 'direct'
});

// 2. 폼 첫 입력 시 (한 번만 발화)
let formStarted = false;
document.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('focus', () => {
    if (!formStarted) {
      formStarted = true;
      gtag('event', 'inquiry_form_start', {
        first_field: el.placeholder || el.name
      });
    }
  }, { once: false });
});

// 3. 개인정보 동의 체크 시
document.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
  if (e.target.checked) {
    gtag('event', 'inquiry_privacy_agree');
  }
});

// 4. 폼 제출 성공 시 (★ 가장 중요)
// 기존 폼 submit 핸들러 안에 추가
function onFormSubmitSuccess() {
  gtag('event', 'generate_lead', {
    inquiry_type: 'request',
    event_category: 'engagement',
    event_label: 'request_form_submit'
  });
}
```

---

### 2. CTA 클릭 이벤트 (통합)

기존 `Request_landing_cta_home` 등 여러 이벤트를 **하나로 통합**하되 파라미터로 구분.

| 이벤트명 | 발화 시점 | 파라미터 | 우선순위 |
|---------|----------|---------|---------|
| `cta_click` | 모든 CTA 버튼/링크 클릭 | `cta_text`, `cta_destination`, `page_location` | **P0** |

**구현 코드 (전역):**

```javascript
// 모든 CTA 링크에 data-cta 속성 추가하거나, href 패턴으로 자동 감지
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="/request"], a[href*="demo.searchright"], a[href*="drive.google"]');
  if (link) {
    const ctaText = link.textContent.trim();
    const destination = link.href;

    let ctaType = 'other';
    if (destination.includes('/request')) ctaType = 'inquiry';
    else if (destination.includes('demo.searchright')) ctaType = 'demo';
    else if (destination.includes('drive.google')) ctaType = 'download_deck';

    gtag('event', 'cta_click', {
      cta_text: ctaText,
      cta_type: ctaType,
      cta_destination: destination,
      page_location: window.location.pathname
    });
  }
});
```

**이렇게 하면 얻는 것:**
- "가격 페이지에서 문의하기 클릭 → 얼마나 전환?" 분석 가능
- "소개서 다운로드가 어떤 페이지에서 가장 많이 발생?" 추적 가능

---

### 3. 소개서 다운로드 이벤트

| 이벤트명 | 발화 시점 | 파라미터 | 우선순위 |
|---------|----------|---------|---------|
| `file_download` | 소개서 PDF 링크 클릭 | `file_name: "company_deck"`, `page_location` | P1 |

> GA4 추천 이벤트 `file_download` 사용. 기존 `PRdeck_download`는 하위호환용으로 유지.

---

### 4. 블로그 이벤트 (blog.searchright.net)

| 이벤트명 | 발화 시점 | 파라미터 | 우선순위 |
|---------|----------|---------|---------|
| `blog_view` | 블로그 글 페이지 진입 | `article_title`, `article_category`, `article_slug` | P1 |
| `blog_scroll_depth` | 25%, 50%, 75%, 100% 스크롤 | `depth_percent`, `article_slug` | P2 |
| `blog_cta_click` | 블로그 내 CTA 클릭 | `cta_text`, `article_slug`, `cta_destination` | P1 |
| `blog_time_on_page` | 30초, 60초, 120초 체류 | `time_seconds`, `article_slug` | P2 |

**구현 코드 (블로그 전역):**

```javascript
// 블로그 글 페이지에서만 발화
if (window.location.pathname.length > 1 && !window.location.pathname.startsWith('/tag/')) {
  const slug = window.location.pathname.replace(/\//g, '');
  const title = document.querySelector('h1')?.textContent || '';
  const category = document.querySelector('.tag-name, [class*="tag"]')?.textContent || '';

  gtag('event', 'blog_view', {
    article_title: title,
    article_category: category,
    article_slug: slug
  });

  // 스크롤 깊이 추적
  const depths = [25, 50, 75, 100];
  const fired = new Set();
  window.addEventListener('scroll', () => {
    const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    depths.forEach(d => {
      if (pct >= d && !fired.has(d)) {
        fired.add(d);
        gtag('event', 'blog_scroll_depth', { depth_percent: d, article_slug: slug });
      }
    });
  });

  // 체류 시간 추적
  [30, 60, 120].forEach(sec => {
    setTimeout(() => {
      gtag('event', 'blog_time_on_page', { time_seconds: sec, article_slug: slug });
    }, sec * 1000);
  });
}
```

---

### 5. JD Creator 이벤트 (jd-creator.searchright.net)

| 이벤트명 | 발화 시점 | 파라미터 | 우선순위 |
|---------|----------|---------|---------|
| `jd_creator_view` | 페이지 진입 | `referrer` | P1 |
| `jd_creator_form_start` | 첫 입력 | `first_field` | P1 |
| `sign_up` | 시작하기 버튼 클릭 & 성공 | `method: "jd_creator"` | P1 |

---

### 6. 데모 이벤트 (demo.searchright.net)

| 이벤트명 | 발화 시점 | 파라미터 | 우선순위 |
|---------|----------|---------|---------|
| `demo_start` | 데모 페이지 진입 | `utm_source` | P1 |
| `demo_search` | 인재 검색 실행 | `search_query`, `result_count` | P1 |
| `demo_result_click` | 검색 결과 클릭 | `result_position`, `candidate_type` | P2 |

---

### 7. 글로벌 이벤트 (전체 사이트 공통)

| 이벤트명 | 발화 시점 | 파라미터 | 우선순위 |
|---------|----------|---------|---------|
| `nav_click` | GNB 메뉴 클릭 | `menu_item`, `page_location` | P2 |
| `footer_click` | 푸터 링크 클릭 | `link_text`, `link_url` | P2 |
| `popup_view` | JD Creator 팝업 노출 | — | P2 |
| `popup_click` | JD Creator 팝업 CTA 클릭 | — | P2 |
| `popup_dismiss` | 팝업 닫기/다음에 | `dismiss_type: "close" \| "later" \| "today"` | P2 |

---

## 기존 이벤트 정리 (마이그레이션)

| 기존 이벤트 | 처리 | 사유 |
|------------|------|------|
| `Request_landing_cta_home` | **유지** + `cta_click`으로 이중 발화 | 기존 데이터 연속성 |
| `demo_landing_cta` | **유지** + `cta_click`으로 이중 발화 | 기존 데이터 연속성 |
| `Request_landing_cta_demo` | **제거 검토** | `demo_landing_cta`와 중복 |
| `form_start` | **유지** (GA4 자동 수집) | `inquiry_form_start`로 문의 폼만 별도 추적 |
| `generate_lead` | **유지** + `/request/`에 추가 설치 | ★ 가장 시급 |
| `PRdeck_download` | **유지** + `file_download`로 이중 발화 | 기존 데이터 연속성 |
| `blog_cta_click` | **유지** + 파라미터 보강 | 출처 글 정보 추가 |

---

## 구현 우선순위 (개발팀 액션)

### P0 — 즉시 (이번 주)

1. **`/request/` 페이지에 `generate_lead` 이벤트 추가**
   - 폼 제출 성공 콜백에 `gtag('event', 'generate_lead', ...)` 삽입
   - 예상 공수: 30분

2. **`/request/` 페이지에 `inquiry_form_start` 이벤트 추가**
   - 폼 첫 입력 시 발화
   - 예상 공수: 30분

3. **전역 `cta_click` 이벤트 추가**
   - 위 구현 코드를 공통 스크립트에 삽입
   - 예상 공수: 1시간

### P1 — 이번 스프린트

4. 블로그 `blog_view` + `blog_cta_click` 이벤트
5. `inquiry_page_view` (문의 페이지 진입 추적)
6. JD Creator `sign_up` 이벤트
7. `file_download` 이벤트 통합

### P2 — 다음 스프린트

8. 블로그 스크롤/체류 추적
9. 데모 사이트 이벤트
10. GNB/푸터/팝업 이벤트

---

## GA4 커스텀 디멘션 등록 (Admin 설정)

이벤트 파라미터를 리포트에서 사용하려면 GA4 Admin에서 커스텀 디멘션으로 등록해야 합니다:

| 디멘션 이름 | 이벤트 파라미터 | 범위 |
|------------|---------------|------|
| CTA 텍스트 | `cta_text` | Event |
| CTA 유형 | `cta_type` | Event |
| CTA 목적지 | `cta_destination` | Event |
| 문의 유형 | `inquiry_type` | Event |
| 블로그 제목 | `article_title` | Event |
| 블로그 카테고리 | `article_category` | Event |
| 블로그 슬러그 | `article_slug` | Event |
| 스크롤 깊이 | `depth_percent` | Event |
| 유입 페이지 | `referrer_page` | Event |

**설정 경로**: GA4 Admin → 속성 → 커스텀 정의 → 커스텀 디멘션 → 만들기

---

## 구현 후 검증 체크리스트

- [ ] /request/ 에서 문의 제출 → GA4 실시간에 `generate_lead` 표시 확인
- [ ] /request/ 에서 폼 입력 시작 → `inquiry_form_start` 표시 확인
- [ ] 홈 → 문의하기 CTA 클릭 → `cta_click` with `page_location: "/"` 확인
- [ ] /pricing/ → 도입 문의하기 클릭 → `cta_click` with `page_location: "/pricing/"` 확인
- [ ] 소개서 다운로드 → `file_download` 확인
- [ ] 블로그 글 진입 → `blog_view` with 제목/카테고리 확인
- [ ] GA4 커스텀 디멘션에 파라미터 등록 확인 (24시간 후 리포트 반영)
