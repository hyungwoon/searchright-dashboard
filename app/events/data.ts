export type Marker = { no: number; x: number; y: number; label: string };
export type EventDef = {
  no: number; name: string; type: "visit" | "expose" | "click" | "scroll" | "form" | "download";
  trigger: string; params: string; priority: "P0" | "P1" | "P2"; status: "missing" | "exists" | "new";
  noImpression?: boolean;
};
export type Screen = { page: string; url: string; image: string; desc: string; markers: Marker[]; events: EventDef[] };

// 클릭 이벤트에 대응하는 impression 자동 생성
export function withImpressions(events: EventDef[]): EventDef[] {
  const result: EventDef[] = [];
  for (const ev of events) {
    if ((ev.type === "click" || ev.type === "download") && !ev.noImpression) {
      result.push({
        no: ev.no,
        name: ev.name.replace(/_click$/, "_impression").replace("file_download", "download_btn_impression").replace("cta_click", "cta_impression"),
        type: "expose",
        trigger: `[노출] ${ev.trigger.replace(/클릭$/, "뷰포트 50% 노출")}`,
        params: ev.params + ", viewport_percent: 50",
        priority: ev.priority, status: "new",
      });
    }
    result.push(ev);
  }
  return result;
}

const V = (page: string): EventDef => ({ no: 0, name: "page_view", type: "visit", trigger: `${page} 페이지 로드 (GA4 자동)`, params: "page_location, page_referrer", priority: "P2", status: "exists" });
const S = (page: string): EventDef => ({ no: 99, name: "scroll_depth", type: "scroll", trigger: `25/50/75/100% 스크롤 도달`, params: "depth_percent, page_location", priority: "P1", status: "new" });

export const screens: Screen[] = [
  // ── 공통 GNB + 푸터 ──
  {
    page: "공통 (GNB·푸터)", url: "전 페이지 공통", image: "/screens/home.png",
    desc: "모든 페이지의 GNB 헤더와 푸터에 적용. GNB 7개 요소 + 푸터 10개 요소 노출/클릭 추적.",
    markers: [
      // GNB (1~8)
      { no: 1, x: 9, y: 1, label: "① 로고" },
      { no: 2, x: 40, y: 1, label: "② Home" },
      { no: 3, x: 48, y: 1, label: "③ Service" },
      { no: 4, x: 55, y: 1, label: "④ Pricing" },
      { no: 5, x: 61, y: 1, label: "⑤ Blog" },
      { no: 6, x: 74, y: 1, label: "⑥ JD Creator" },
      { no: 7, x: 84, y: 1, label: "⑦ 서비스 체험" },
      { no: 8, x: 92, y: 1, label: "⑧ 문의하기" },
      // 푸터 (9~17)
      { no: 9, x: 57, y: 94, label: "⑨ 핵심인재/AI메시지" },
      { no: 10, x: 73, y: 94, label: "⑩ 리스트형/구독형/프로세스" },
      { no: 11, x: 90, y: 94, label: "⑪ 블로그" },
      { no: 12, x: 90, y: 95, label: "⑫ 소개서 다운" },
      { no: 13, x: 76, y: 98, label: "⑬ 고객사 로그인" },
      { no: 14, x: 84, y: 98, label: "⑭ 문의하기" },
      { no: 15, x: 92, y: 98, label: "⑮ LinkedIn" },
      { no: 16, x: 9, y: 98, label: "⑯ 개인정보처리방침" },
      { no: 17, x: 20, y: 98, label: "⑰ 서비스이용약관" },
    ],
    events: [
      // GNB (1~8)
      { no: 1, name: "gnb_click", type: "click", trigger: "로고 클릭 (홈 이동)", params: "menu_item: 'logo', page_location", priority: "P2", status: "new" },
      { no: 2, name: "gnb_click", type: "click", trigger: "'Home' 클릭", params: "menu_item: 'home', page_location", priority: "P2", status: "new" },
      { no: 3, name: "gnb_click", type: "click", trigger: "'Service' 클릭", params: "menu_item: 'service', page_location", priority: "P2", status: "new" },
      { no: 4, name: "gnb_click", type: "click", trigger: "'Pricing' 클릭", params: "menu_item: 'pricing', page_location", priority: "P2", status: "new" },
      { no: 5, name: "gnb_click", type: "click", trigger: "'Blog' 클릭", params: "menu_item: 'blog', page_location", priority: "P2", status: "new" },
      { no: 6, name: "gnb_click", type: "click", trigger: "'JD Creator' 클릭", params: "menu_item: 'jd_creator', page_location", priority: "P1", status: "new" },
      { no: 7, name: "cta_click", type: "click", trigger: "'서비스 체험하기' 클릭", params: "cta_type: 'demo', cta_position: 'gnb'", priority: "P0", status: "new" },
      { no: 8, name: "cta_click", type: "click", trigger: "'문의하기' 클릭", params: "cta_type: 'inquiry', cta_position: 'gnb'", priority: "P0", status: "new" },
      // 푸터 (9~17) — 같은 영역 내 개별 링크는 link_text 파라미터로 구분
      { no: 9, name: "footer_click", type: "click", trigger: "'핵심 인재 리스트' 또는 'AI 개인화 메시지' 클릭", params: "link_text: '핵심 인재 리스트' | 'AI 개인화 메시지'", priority: "P2", status: "new" },
      { no: 10, name: "footer_click", type: "click", trigger: "'리스트형 상품' / '구독형 상품' / '서비스 프로세스' 클릭", params: "link_text: '리스트형 상품' | '구독형 상품' | '서비스 프로세스'", priority: "P2", status: "new" },
      { no: 11, name: "footer_click", type: "click", trigger: "'블로그' 클릭", params: "link_text: '블로그'", priority: "P2", status: "new" },
      { no: 12, name: "file_download", type: "download", trigger: "'회사 소개서 다운받기' 클릭", params: "file_name: 'company_deck', cta_position: 'footer'", priority: "P1", status: "new" },
      { no: 13, name: "footer_click", type: "click", trigger: "'고객사 로그인' 클릭", params: "link_text: '고객사 로그인'", priority: "P1", status: "new" },
      { no: 14, name: "footer_click", type: "click", trigger: "'문의하기' 클릭", params: "link_text: '문의하기', cta_type: 'inquiry'", priority: "P1", status: "new" },
      { no: 15, name: "footer_click", type: "click", trigger: "'LinkedIn' 클릭 (외부 이동)", params: "link_text: 'LinkedIn', outbound: true", priority: "P2", status: "new" },
      { no: 16, name: "footer_click", type: "click", trigger: "'개인정보 처리방침' 클릭", params: "link_text: '개인정보 처리방침'", priority: "P2", status: "new" },
      { no: 17, name: "footer_click", type: "click", trigger: "'서비스 이용 약관' 클릭", params: "link_text: '서비스 이용 약관'", priority: "P2", status: "new" },
    ],
  },
  // ── 홈페이지 ──
  {
    page: "홈페이지", url: "searchright.net/", image: "/screens/home.png",
    desc: "메인 랜딩. 히어로에는 '서비스 체험하기'와 '소개서 다운받기'만 존재 (문의하기 CTA 없음).",
    markers: [
      { no: 1, x: 11, y: 11, label: "서비스 체험하기" },
      { no: 2, x: 25, y: 11, label: "소개서 다운받기" },
      { no: 3, x: 50, y: 32, label: "고객사 후기 카드" },
      { no: 4, x: 43, y: 89, label: "하단 문의하기" },
      { no: 5, x: 54, y: 89, label: "하단 소개서 다운" },
      { no: 6, x: 60, y: 10, label: "팝업 CTA" },
      { no: 7, x: 55, y: 12, label: "팝업 다음에" },
      { no: 8, x: 64, y: 12, label: "팝업 오늘 하루" },
    ],
    events: [
      V("홈"),
      { no: 1, name: "cta_click", type: "click", trigger: "히어로 '서비스 체험하기' 클릭", params: "cta_type: 'demo', cta_position: 'hero'", priority: "P0", status: "new" },
      { no: 2, name: "file_download", type: "download", trigger: "히어로 '서비스 소개서 다운받기' 클릭", params: "file_name: 'company_deck', cta_position: 'hero'", priority: "P1", status: "new" },
      { no: 3, name: "testimonial_click", type: "click", trigger: "고객사 후기 카드 클릭 (강남언니/이스트에이드/한백)", params: "company_name, card_position", priority: "P2", status: "new" },
      { no: 4, name: "cta_click", type: "click", trigger: "하단 '문의하기' 클릭", params: "cta_type: 'inquiry', cta_position: 'bottom_cta'", priority: "P0", status: "new" },
      { no: 5, name: "file_download", type: "download", trigger: "하단 '회사 소개서 다운받기' 클릭", params: "file_name: 'company_deck', cta_position: 'bottom_cta'", priority: "P1", status: "new" },
      { no: 6, name: "popup_cta_click", type: "click", trigger: "팝업 'JD Creator 무료로 사용하기' 클릭", params: "popup_name: 'jd_creator'", priority: "P2", status: "new" },
      { no: 6, name: "popup_view", type: "expose", trigger: "JD Creator 팝업 화면 노출", params: "popup_name: 'jd_creator'", priority: "P2", status: "new" },
      { no: 7, name: "popup_dismiss", type: "click", trigger: "팝업 '다음에 할게요' 클릭", params: "dismiss_type: 'later'", priority: "P2", status: "new" },
      { no: 8, name: "popup_dismiss", type: "click", trigger: "팝업 '오늘 하루 보지 않기' 클릭", params: "dismiss_type: 'today'", priority: "P2", status: "new" },
      S("홈"),
    ],
  },
  // ── 문의하기 ──
  {
    page: "문의하기", url: "searchright.net/request/", image: "/screens/request.png",
    desc: "★ 핵심 전환 페이지. 폼(이름/이메일/전화/내용) + 개인정보 동의 + 하단 서비스 프로세스 안내.",
    markers: [
      { no: 1, x: 69, y: 17, label: "문의 폼 영역" },
      { no: 2, x: 69, y: 22, label: "이름/업체명 입력" },
      { no: 3, x: 69, y: 27, label: "이메일 입력" },
      { no: 4, x: 69, y: 32, label: "전화번호 입력" },
      { no: 5, x: 69, y: 39, label: "문의 내용 입력" },
      { no: 6, x: 48, y: 44, label: "개인정보 동의" },
      { no: 7, x: 69, y: 48, label: "문의하기 버튼" },
      { no: 8, x: 50, y: 61, label: "서비스 프로세스" },
    ],
    events: [
      V("문의하기"),
      { no: 1, name: "inquiry_page_view", type: "visit", trigger: "/request/ 페이지 진입 (커스텀 — referrer 추적용)", params: "referrer_page: document.referrer", priority: "P0", status: "new" },
      { no: 2, name: "inquiry_form_start", type: "form", trigger: "폼 첫 번째 필드 포커스 (어떤 필드든 최초 1회만)", params: "first_field: placeholder값", priority: "P0", status: "new" },
      { no: 3, name: "inquiry_form_progress", type: "form", trigger: "이메일 필드 blur 시 값이 있으면 (2번째 필드 완료 추적)", params: "field_name: 'email', fields_completed: 2", priority: "P1", status: "new" },
      { no: 4, name: "inquiry_form_progress", type: "form", trigger: "전화번호 필드 blur 시 값이 있으면", params: "field_name: 'phone', fields_completed: 3", priority: "P1", status: "new" },
      { no: 5, name: "inquiry_form_progress", type: "form", trigger: "문의 내용 textarea blur 시 값이 있으면", params: "field_name: 'message', fields_completed: 4", priority: "P1", status: "new" },
      { no: 6, name: "inquiry_privacy_agree", type: "click", trigger: "개인정보 동의 체크박스 체크", params: "—", priority: "P1", status: "new" },
      { no: 7, name: "generate_lead", type: "form", trigger: "★ '문의하기' 버튼 클릭 & 제출 성공", params: "inquiry_type: 'request'", priority: "P0", status: "missing" },
      { no: 8, name: "process_section_view", type: "expose", trigger: "서비스 프로세스 섹션 뷰포트 50% 노출", params: "section: 'service_process'", priority: "P2", status: "new" },
    ],
  },
  // ── 서비스 소개 ──
  {
    page: "서비스 소개", url: "searchright.net/service/", image: "/screens/service.png",
    desc: "AI 채용 서비스 상세. 기능 소개 + 인재 검색 데모 + CTA.",
    markers: [
      { no: 1, x: 43, y: 4, label: "상단 문의하기" },
      { no: 2, x: 54, y: 4, label: "상단 소개서 다운" },
      { no: 3, x: 50, y: 73, label: "인재 검색 데모" },
      { no: 4, x: 43, y: 91, label: "하단 문의하기" },
      { no: 5, x: 54, y: 91, label: "하단 소개서 다운" },
    ],
    events: [
      V("서비스"),
      { no: 1, name: "cta_click", type: "click", trigger: "상단 '문의하기' CTA 클릭", params: "cta_type: 'inquiry', page_location: '/service/', cta_position: 'top'", priority: "P0", status: "new" },
      { no: 2, name: "file_download", type: "download", trigger: "상단 '소개서 다운받기' 클릭", params: "file_name: 'company_deck', page_location: '/service/', cta_position: 'top'", priority: "P1", status: "new" },
      { no: 3, name: "service_search", type: "click", trigger: "인재 검색 데모 검색어 입력 & 실행", params: "search_query", priority: "P1", status: "new" },
      { no: 4, name: "cta_click", type: "click", trigger: "하단 '문의하기' 클릭", params: "cta_type: 'inquiry', page_location: '/service/', cta_position: 'bottom'", priority: "P0", status: "new" },
      { no: 5, name: "file_download", type: "download", trigger: "하단 '소개서 다운받기' 클릭", params: "file_name: 'company_deck', page_location: '/service/', cta_position: 'bottom'", priority: "P1", status: "new" },
      S("서비스"),
    ],
  },
  // ── 가격 ──
  {
    page: "가격", url: "searchright.net/pricing/", image: "/screens/pricing.png",
    desc: "리스트형/구독형 상품 가격. 고의도 트래픽. CTA 3개 집중 배치.",
    markers: [
      { no: 1, x: 44, y: 19, label: "더 많은 이야기" },
      { no: 2, x: 35, y: 21, label: "지금 바로 요청하기" },
      { no: 3, x: 70, y: 21, label: "도입 문의하기" },
      { no: 4, x: 43, y: 82, label: "하단 문의하기" },
      { no: 5, x: 54, y: 82, label: "하단 소개서 다운" },
    ],
    events: [
      V("가격"),
      { no: 1, name: "cta_click", type: "click", trigger: "'더 많은 이야기 읽어보기' 클릭 (고객사례)", params: "cta_type: 'case_study', page_location: '/pricing/'", priority: "P2", status: "new" },
      { no: 2, name: "cta_click", type: "click", trigger: "'지금 바로 요청하기' 클릭 (리스트형)", params: "cta_type: 'inquiry', cta_text: '지금 바로 요청하기', plan: 'list'", priority: "P0", status: "new" },
      { no: 3, name: "cta_click", type: "click", trigger: "'도입 문의하기' 클릭 (구독형)", params: "cta_type: 'inquiry', cta_text: '도입 문의하기', plan: 'subscription'", priority: "P0", status: "new" },
      { no: 4, name: "cta_click", type: "click", trigger: "하단 '문의하기' 클릭", params: "cta_type: 'inquiry', cta_position: 'bottom'", priority: "P0", status: "new" },
      { no: 5, name: "file_download", type: "download", trigger: "하단 '소개서 다운받기' 클릭", params: "file_name: 'company_deck', cta_position: 'bottom'", priority: "P1", status: "new" },
      S("가격"),
    ],
  },
  // ── 블로그 홈 ──
  {
    page: "블로그 홈", url: "blog.searchright.net/", image: "/screens/blog-home.png",
    desc: "Ghost 블로그 목록. 카테고리 탭 + 피쳐드 글 + 카드 목록.",
    markers: [
      { no: 1, x: 30, y: 2, label: "카테고리 탭" },
      { no: 2, x: 50, y: 8, label: "피쳐드 글" },
      { no: 3, x: 25, y: 35, label: "글 카드" },
    ],
    events: [
      V("블로그 홈"),
      { no: 1, name: "blog_category_click", type: "click", trigger: "카테고리 탭 클릭 (전체/팀스토리/뉴스룸/케이스스터디/HR인사이트)", params: "category_name", priority: "P2", status: "new" },
      { no: 2, name: "blog_featured_click", type: "click", trigger: "피쳐드(상단 대형) 글 클릭", params: "article_title, article_slug", priority: "P1", status: "new" },
      { no: 3, name: "blog_card_click", type: "click", trigger: "글 목록 카드 클릭", params: "article_title, article_slug, card_position", priority: "P1", status: "new" },
      S("블로그 홈"),
    ],
  },
  // ── 블로그 상세 ──
  {
    page: "블로그 상세", url: "blog.searchright.net/{slug}/", image: "/screens/blog-detail.png",
    desc: "개별 블로그 글. SEO 유입 핵심 채널. 하단에 서치라이트 CTA 배너 + 관련 글 추천.",
    markers: [
      { no: 1, x: 50, y: 2, label: "글 제목/카테고리" },
      { no: 2, x: 50, y: 40, label: "본문 영역" },
      { no: 3, x: 32, y: 84, label: "서치라이트 문의 링크" },
      { no: 4, x: 50, y: 89, label: "CTA 배너 (도입 문의하기)" },
      { no: 5, x: 50, y: 94, label: "관련 글 추천" },
    ],
    events: [
      V("블로그 상세"),
      { no: 1, name: "blog_view", type: "visit", trigger: "블로그 글 페이지 진입 (커스텀)", params: "article_title, article_category, article_slug", priority: "P1", status: "new" },
      { no: 2, name: "blog_scroll_depth", type: "scroll", trigger: "본문 25/50/75/100% 스크롤 도달", params: "depth_percent, article_slug", priority: "P1", status: "new" },
      { no: 2, name: "blog_time_on_page", type: "expose", trigger: "30초/60초/120초 체류 도달", params: "time_seconds, article_slug", priority: "P2", status: "new" },
      { no: 3, name: "blog_cta_click", type: "click", trigger: "'지금 서치라이트 문의하기' 텍스트 링크 클릭", params: "cta_text: '지금 서치라이트 문의하기', article_slug", priority: "P0", status: "new", noImpression: true },
      { no: 4, name: "blog_cta_click", type: "click", trigger: "CTA 배너 '도입 문의하기' 버튼 클릭", params: "cta_text: '도입 문의하기', article_slug, cta_position: 'bottom_banner'", priority: "P0", status: "new", noImpression: true },
      { no: 5, name: "blog_related_click", type: "click", trigger: "관련 글 추천 카드 클릭", params: "clicked_article_slug, source_article_slug", priority: "P2", status: "new" },
    ],
  },
  // ── JD Creator ──
  {
    page: "JD Creator", url: "jd-creator.searchright.net/", image: "/screens/jd-creator.png",
    desc: "채용공고 자동 생성 BETA. 이름/전화/이메일 입력 후 시작.",
    markers: [
      { no: 1, x: 50, y: 42, label: "가입 폼 영역" },
      { no: 2, x: 50, y: 51, label: "이름 입력" },
      { no: 3, x: 50, y: 65, label: "연락처/이메일" },
      { no: 4, x: 50, y: 82, label: "시작하기 버튼" },
    ],
    events: [
      V("JD Creator"),
      { no: 1, name: "jd_creator_view", type: "expose", trigger: "가입 폼 영역 뷰포트 노출", params: "referrer", priority: "P1", status: "new" },
      { no: 2, name: "jd_creator_form_start", type: "form", trigger: "첫 입력 필드 포커스", params: "first_field", priority: "P1", status: "new" },
      { no: 3, name: "jd_creator_form_progress", type: "form", trigger: "연락처/이메일 입력 완료", params: "fields_completed", priority: "P2", status: "new" },
      { no: 4, name: "sign_up", type: "form", trigger: "'시작하기' 버튼 클릭 & 성공", params: "method: 'jd_creator'", priority: "P1", status: "new" },
    ],
  },
];

export const typeIcons: Record<string, { icon: string; color: string; label: string }> = {
  visit: { icon: "PV", color: "#10b981", label: "방문" },
  expose: { icon: "V", color: "#8b5cf6", label: "노출" },
  click: { icon: "C", color: "#3b82f6", label: "클릭" },
  scroll: { icon: "S", color: "#f59e0b", label: "스크롤" },
  form: { icon: "F", color: "#ec4899", label: "폼" },
  download: { icon: "D", color: "#14b8a6", label: "다운로드" },
};
export const prioColors: Record<string, string> = { P0: "#f43f5e", P1: "#f59e0b", P2: "#64748b" };
export const statStyles: Record<string, { bg: string; text: string; label: string }> = {
  missing: { bg: "#f43f5e20", text: "#f43f5e", label: "미설치" },
  exists: { bg: "#10b98120", text: "#10b981", label: "설치됨" },
  new: { bg: "#3b82f620", text: "#3b82f6", label: "신규" },
};
