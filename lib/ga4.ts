import { BetaAnalyticsDataClient } from "@google-analytics/data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Period = "7d" | "14d" | "30d" | "90d";

export interface KpiData {
  sessions: number;
  users: number;
  pageviews: number;
  engRate: number;
  bounceRate: number;
  newUsers: number;
  prev: {
    sessions: number;
    users: number;
    pageviews: number;
    engRate: number;
    bounceRate: number;
  };
}

export interface DailyRow {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
  engRate?: number;
  bounce?: number;
}

export interface ChannelRow {
  name: string;
  sessions: number;
  users: number;
  pageviews: number;
  engRate: number;
}

export interface SourceMediumRow {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  pageviews: number;
  engRate: number;
}

export interface PageRow {
  path: string;
  label: string;
  views: number;
  users: number;
  engRate: number;
}

export interface EventRow {
  name: string;
  key: string;
  count: number;
  users: number;
  color: string;
  desc: string;
}

export interface DeviceRow {
  name: string;
  value: number;
  users: number;
  engRate: number;
  color: string;
}

export interface CountryRow {
  name: string;
  sessions: number;
  users: number;
}

export interface NewVsReturningRow {
  name: string;
  sessions: number;
  users: number;
  engRate: number;
  avgDuration: number;
  color: string;
}

export interface HostnameRow {
  name: string;
  sessions: number;
  users: number;
  pageviews: number;
}

export interface DayOfWeekRow {
  day: string;
  sessions: number;
  users: number;
  pageviews: number;
}

export interface FunnelStage {
  stage: string;
  value: number;
  rate: number;
}

export interface InquiryFunnelData {
  stages: FunnelStage[];
  channelAttribution: {
    channel: string;
    inquiry_page_view: number;
    inquiry_form_start: number;
    inquiry_generate_lead: number;
  }[];
  dailyTrend: {
    date: string;
    inquiry_page_view: number;
    inquiry_form_start: number;
    inquiry_generate_lead: number;
  }[];
}

export interface HomeFunnelData {
  stages: FunnelStage[];
  channelAttribution: {
    channel: string;
    home_form_start: number;
    home_form_progress: number;
    home_generate_lead: number;
  }[];
  dailyTrend: {
    date: string;
    home_form_start: number;
    home_form_progress: number;
    home_generate_lead: number;
  }[];
}

export interface LeadSummaryData {
  home: number;
  request: number;
  total: number;
  prev: { home: number; request: number; total: number };
  dailyTrend: { date: string; home: number; request: number }[];
}

export interface LeadMagnetData {
  impressions: number;
  clicks: number;
  ctr: number;
  prev: { impressions: number; clicks: number; ctr: number };
}

export interface BlogCardsData {
  impressions: number;
  clicks: number;
  ctr: number;
  prev: { impressions: number; clicks: number; ctr: number };
}

export interface AllData {
  kpis: KpiData;
  dailyTrend: DailyRow[];
  channels: ChannelRow[];
  sourceMedium: SourceMediumRow[];
  topPages: PageRow[];
  events: EventRow[];
  devices: DeviceRow[];
  countries: CountryRow[];
  newVsReturning: NewVsReturningRow[];
  hostnames: HostnameRow[];
  dayOfWeek: DayOfWeekRow[];
  inquiryFunnel: InquiryFunnelData;
  homeFunnel: HomeFunnelData;
  leadSummary: LeadSummaryData;
  leadMagnet: LeadMagnetData;
  blogCards: BlogCardsData;
}

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

const PROPERTY_ID = process.env.GA4_PROPERTY_ID || "452138811";

let _client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (_client) return _client;

  const creds = process.env.GOOGLE_CREDENTIALS;
  if (creds) {
    const credentials = JSON.parse(creds);
    _client = new BetaAnalyticsDataClient({ credentials });
  } else {
    _client = new BetaAnalyticsDataClient();
  }

  return _client;
}

// ---------------------------------------------------------------------------
// Date range helpers
// ---------------------------------------------------------------------------

interface DateRange {
  startDate: string;
  endDate: string;
}

function periodToDateRanges(period: Period): {
  current: DateRange;
  previous: DateRange;
} {
  const days = period === "7d" ? 7 : period === "14d" ? 14 : period === "30d" ? 30 : 90;
  return {
    current: {
      startDate: `${days}daysAgo`,
      endDate: "today",
    },
    previous: {
      startDate: `${days * 2}daysAgo`,
      endDate: `${days + 1}daysAgo`,
    },
  };
}

// ---------------------------------------------------------------------------
// Generic report runner
// ---------------------------------------------------------------------------

type GA4Row = Record<string, string | number>;

async function runReport(opts: {
  dimensions?: string[];
  metrics?: string[];
  dateRange: DateRange;
  dimensionFilter?: Record<string, unknown>;
  orderBys?: { metric?: string; dimension?: string; desc?: boolean }[];
  limit?: number;
}): Promise<GA4Row[]> {
  const client = getClient();

  const request: Record<string, unknown> = {
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate: opts.dateRange.startDate, endDate: opts.dateRange.endDate }],
  };

  if (opts.dimensions?.length) {
    request.dimensions = opts.dimensions.map((name) => ({ name }));
  }
  if (opts.metrics?.length) {
    request.metrics = opts.metrics.map((name) => ({ name }));
  }
  if (opts.dimensionFilter) {
    request.dimensionFilter = opts.dimensionFilter;
  }
  if (opts.orderBys?.length) {
    request.orderBys = opts.orderBys.map((o) => {
      if (o.metric) return { metric: { metricName: o.metric }, desc: o.desc ?? true };
      return { dimension: { dimensionName: o.dimension }, desc: o.desc ?? false };
    });
  }
  if (opts.limit) {
    request.limit = opts.limit;
  }

  const [response] = await client.runReport(request);

  const dimNames = opts.dimensions ?? [];
  const metNames = opts.metrics ?? [];

  return (response.rows ?? []).map((row) => {
    const record: GA4Row = {};
    row.dimensionValues?.forEach((v, i) => {
      record[dimNames[i]] = v.value ?? "";
    });
    row.metricValues?.forEach((v, i) => {
      record[metNames[i]] = parseFloat(v.value ?? "0");
    });
    return record;
  });
}

// ---------------------------------------------------------------------------
// Metric helpers
// ---------------------------------------------------------------------------

function num(v: unknown): number {
  return typeof v === "number" ? v : parseFloat(String(v || "0")) || 0;
}

function str(v: unknown): string {
  return String(v ?? "");
}

function pct(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// Event metadata (Korean display names, colors, descriptions)
// ---------------------------------------------------------------------------

const EVENT_META: Record<string, { name: string; color: string; desc: string }> = {
  Request_landing_cta_home: { name: "홈 CTA 클릭", color: "#3b82f6", desc: "홈페이지 '문의하기' 버튼 클릭" },
  click: { name: "아웃바운드 클릭", color: "#6366f1", desc: "외부 링크 클릭 (GA4 자동 수집)" },
  blog_post_view: { name: "블로그 포스트 뷰", color: "#a855f7", desc: "블로그 글 진입" },
  form_start: { name: "폼 작성 시작", color: "#8b5cf6", desc: "로그인/문의 폼 첫 입력 시작" },
  demo_landing_cta: { name: "데모 CTA", color: "#c084fc", desc: "홈페이지 '데모 체험' 버튼 클릭" },
  PRdeck_download: { name: "PR 덱 다운로드", color: "#f59e0b", desc: "회사소개서(PR덱) PDF 다운로드" },
  home_cta_click: { name: "홈 CTA 클릭 (신규)", color: "#60a5fa", desc: "홈페이지 CTA 클릭 (page-slug 이벤트)" },
  blog_post_scroll_depth: { name: "블로그 스크롤", color: "#c4b5fd", desc: "블로그 글 스크롤 깊이 추적" },
  blog_post_time_on_page: { name: "블로그 체류", color: "#a78bfa", desc: "블로그 글 체류 시간 추적" },
  home_popup_view: { name: "팝업 노출", color: "#fb923c", desc: "JD Creator 팝업 노출" },
  inquiry_page_view: { name: "문의 페이지 진입", color: "#06b6d4", desc: "문의 페이지(/request/) 진입" },
  form_submit: { name: "폼 제출", color: "#2dd4bf", desc: "폼 제출 완료 (GA4 자동)" },
  inquiry_form_start: { name: "문의 폼 입력", color: "#818cf8", desc: "문의 폼 첫 필드 입력" },
  inquiry_form_progress: { name: "문의 폼 진행", color: "#7c3aed", desc: "문의 폼 필드 입력 진행" },
  blog_cta_click: { name: "블로그 CTA", color: "#f43f5e", desc: "블로그 내 CTA 배너 클릭" },
  inquiry_privacy_agree: { name: "개인정보 동의", color: "#14b8a6", desc: "개인정보 수집 동의 체크" },
  inquiry_generate_lead: { name: "문의 제출 완료", color: "#10b981", desc: "문의 폼 제출 완료" },
  generate_lead: { name: "리드 전환", color: "#22c55e", desc: "문의 폼 제출 완료 (레거시)" },
  Request_landing_cta_demo: { name: "데모 요청 CTA", color: "#f43f5e", desc: "메인페이지 데모 요청 버튼 클릭" },
  Blog_ebook_download_click: { name: "이북 다운로드", color: "#ec4899", desc: "블로그 eBook 다운로드 클릭" },
  // ─── Home 개선 (2026-04 인라인 폼 + LeadMagnet + Blog 카드) ───
  home_form_start: { name: "홈 폼 시작", color: "#38bdf8", desc: "홈 인라인 폼 첫 필드 포커스" },
  home_form_progress: { name: "홈 폼 진행", color: "#0ea5e9", desc: "홈 폼 이메일 입력 + 필드 진행" },
  home_generate_lead: { name: "홈 리드 전환", color: "#16a34a", desc: "홈 인라인 폼 제출 완료" },
  home_report_impression: { name: "가이드북 노출", color: "#fbbf24", desc: "LeadMagnet 섹션 50% 노출" },
  home_report_outbound_click: { name: "가이드북 클릭", color: "#f97316", desc: "LeadMagnet 다운로드 CTA 클릭 (외부 이동)" },
  home_blog_section_impression: { name: "Blog 카드 노출", color: "#d8b4fe", desc: "홈 Blog 카드 50% 노출 (카드별)" },
  home_blog_card_click: { name: "Blog 카드 클릭", color: "#a855f7", desc: "홈 Blog 카드 클릭" },
};

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#3b82f6",
  mobile: "#10b981",
  tablet: "#f59e0b",
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// ---------------------------------------------------------------------------
// Format date from GA4 "YYYYMMDD" to "M/D"
// ---------------------------------------------------------------------------

function fmtDate(yyyymmdd: string): string {
  const m = parseInt(yyyymmdd.slice(4, 6), 10);
  const d = parseInt(yyyymmdd.slice(6, 8), 10);
  return `${m}/${d}`;
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function fetchKpis(period: Period): Promise<KpiData> {
  const { current, previous } = periodToDateRanges(period);

  const metrics = [
    "sessions",
    "totalUsers",
    "screenPageViews",
    "engagementRate",
    "bounceRate",
    "newUsers",
  ];

  const [curRows, prevRows] = await Promise.all([
    runReport({ metrics, dateRange: current }),
    runReport({ metrics, dateRange: previous }),
  ]);

  const cur = curRows[0] ?? {};
  const prev = prevRows[0] ?? {};

  return {
    sessions: num(cur.sessions),
    users: num(cur.totalUsers),
    pageviews: num(cur.screenPageViews),
    engRate: Math.round(num(cur.engagementRate) * 1000) / 10,
    bounceRate: Math.round(num(cur.bounceRate) * 1000) / 10,
    newUsers: num(cur.newUsers),
    prev: {
      sessions: num(prev.sessions),
      users: num(prev.totalUsers),
      pageviews: num(prev.screenPageViews),
      engRate: Math.round(num(prev.engagementRate) * 1000) / 10,
      bounceRate: Math.round(num(prev.bounceRate) * 1000) / 10,
    },
  };
}

export async function fetchDailyTrend(period: Period): Promise<DailyRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["date"],
    metrics: [
      "sessions",
      "totalUsers",
      "screenPageViews",
      "engagementRate",
      "bounceRate",
    ],
    dateRange: current,
    orderBys: [{ dimension: "date", desc: false }],
  });

  return rows.map((r) => ({
    date: fmtDate(str(r.date)),
    sessions: num(r.sessions),
    users: num(r.totalUsers),
    pageviews: num(r.screenPageViews),
    engRate: Math.round(num(r.engagementRate) * 1000) / 10,
    bounce: Math.round(num(r.bounceRate) * 1000) / 10,
  }));
}

export async function fetchChannels(period: Period): Promise<ChannelRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["sessionDefaultChannelGroup"],
    metrics: ["sessions", "totalUsers", "screenPageViews", "engagementRate"],
    dateRange: current,
    orderBys: [{ metric: "sessions", desc: true }],
  });

  return rows.map((r) => ({
    name: str(r.sessionDefaultChannelGroup),
    sessions: num(r.sessions),
    users: num(r.totalUsers),
    pageviews: num(r.screenPageViews),
    engRate: Math.round(num(r.engagementRate) * 1000) / 10,
  }));
}

export async function fetchSourceMedium(period: Period): Promise<SourceMediumRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["sessionSource", "sessionMedium"],
    metrics: ["sessions", "totalUsers", "screenPageViews", "engagementRate"],
    dateRange: current,
    orderBys: [{ metric: "sessions", desc: true }],
    limit: 20,
  });

  return rows.map((r) => ({
    source: str(r.sessionSource),
    medium: str(r.sessionMedium),
    sessions: num(r.sessions),
    users: num(r.totalUsers),
    pageviews: num(r.screenPageViews),
    engRate: Math.round(num(r.engagementRate) * 1000) / 10,
  }));
}

export async function fetchTopPages(period: Period): Promise<PageRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["pagePath", "pageTitle"],
    metrics: ["screenPageViews", "totalUsers", "engagementRate"],
    dateRange: current,
    orderBys: [{ metric: "screenPageViews", desc: true }],
    limit: 15,
  });

  return rows.map((r) => ({
    path: str(r.pagePath),
    label: str(r.pageTitle),
    views: num(r.screenPageViews),
    users: num(r.totalUsers),
    engRate: Math.round(num(r.engagementRate) * 1000) / 10,
  }));
}

export async function fetchEvents(period: Period): Promise<EventRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["eventName"],
    metrics: ["eventCount", "totalUsers"],
    dateRange: current,
    orderBys: [{ metric: "eventCount", desc: true }],
    limit: 30,
  });

  // Filter to only events we have metadata for
  return rows
    .filter((r) => EVENT_META[str(r.eventName)])
    .map((r) => {
      const key = str(r.eventName);
      const meta = EVENT_META[key];
      return {
        name: meta.name,
        key,
        count: num(r.eventCount),
        users: num(r.totalUsers),
        color: meta.color,
        desc: meta.desc,
      };
    });
}

export async function fetchDevices(period: Period): Promise<DeviceRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["deviceCategory"],
    metrics: ["sessions", "totalUsers", "engagementRate"],
    dateRange: current,
    orderBys: [{ metric: "sessions", desc: true }],
  });

  return rows.map((r) => {
    const cat = str(r.deviceCategory).toLowerCase();
    return {
      name: str(r.deviceCategory).charAt(0).toUpperCase() + str(r.deviceCategory).slice(1),
      value: num(r.sessions),
      users: num(r.totalUsers),
      engRate: Math.round(num(r.engagementRate) * 1000) / 10,
      color: DEVICE_COLORS[cat] ?? "#94a3b8",
    };
  });
}

export async function fetchCountries(period: Period): Promise<CountryRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["country"],
    metrics: ["sessions", "totalUsers"],
    dateRange: current,
    orderBys: [{ metric: "sessions", desc: true }],
    limit: 10,
  });

  const COUNTRY_KO: Record<string, string> = {
    "South Korea": "한국",
    "United States": "미국",
    Russia: "러시아",
    Singapore: "싱가포르",
    India: "인도",
    Armenia: "아르메니아",
    China: "중국",
    Australia: "호주",
    Canada: "캐나다",
    Japan: "일본",
    Germany: "독일",
    "United Kingdom": "영국",
    France: "프랑스",
    Vietnam: "베트남",
  };

  return rows.map((r) => {
    const en = str(r.country);
    return {
      name: COUNTRY_KO[en] ?? en,
      sessions: num(r.sessions),
      users: num(r.totalUsers),
    };
  });
}

export async function fetchNewVsReturning(period: Period): Promise<NewVsReturningRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["newVsReturning"],
    metrics: ["sessions", "totalUsers", "engagementRate", "averageSessionDuration"],
    dateRange: current,
    orderBys: [{ metric: "sessions", desc: true }],
  });

  const labelMap: Record<string, { name: string; color: string }> = {
    new: { name: "신규", color: "#3b82f6" },
    returning: { name: "재방문", color: "#8b5cf6" },
  };

  return rows.map((r) => {
    const key = str(r.newVsReturning).toLowerCase();
    const meta = labelMap[key] ?? { name: str(r.newVsReturning), color: "#94a3b8" };
    return {
      name: meta.name,
      sessions: num(r.sessions),
      users: num(r.totalUsers),
      engRate: Math.round(num(r.engagementRate) * 1000) / 10,
      avgDuration: Math.round(num(r.averageSessionDuration)),
      color: meta.color,
    };
  });
}

export async function fetchHostnames(period: Period): Promise<HostnameRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["hostName"],
    metrics: ["sessions", "totalUsers", "screenPageViews"],
    dateRange: current,
    orderBys: [{ metric: "sessions", desc: true }],
    limit: 10,
  });

  return rows.map((r) => ({
    name: str(r.hostName),
    sessions: num(r.sessions),
    users: num(r.totalUsers),
    pageviews: num(r.screenPageViews),
  }));
}

export async function fetchDayOfWeek(period: Period): Promise<DayOfWeekRow[]> {
  const { current } = periodToDateRanges(period);

  const rows = await runReport({
    dimensions: ["dayOfWeek"],
    metrics: ["sessions", "totalUsers", "screenPageViews"],
    dateRange: current,
    orderBys: [{ dimension: "dayOfWeek", desc: false }],
  });

  return rows.map((r) => {
    const idx = num(r.dayOfWeek);
    return {
      day: DAY_NAMES[idx] ?? String(idx),
      sessions: num(r.sessions),
      users: num(r.totalUsers),
      pageviews: num(r.screenPageViews),
    };
  });
}

export async function fetchInquiryFunnel(period: Period): Promise<InquiryFunnelData> {
  const { current } = periodToDateRanges(period);

  const inquiryEvents = [
    "inquiry_page_view",
    "inquiry_form_start",
    "inquiry_privacy_agree",
    "inquiry_generate_lead",
    "generate_lead",
  ];

  const eventFilter = {
    orGroup: {
      expressions: inquiryEvents.map((ev) => ({
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: ev },
        },
      })),
    },
  };

  // Run three reports in parallel:
  // 1) Totals per event
  // 2) Channel attribution
  // 3) Daily trend
  const [totalsRows, channelRows, dailyRows] = await Promise.all([
    runReport({
      dimensions: ["eventName"],
      metrics: ["eventCount", "totalUsers"],
      dateRange: current,
      dimensionFilter: eventFilter,
    }),
    runReport({
      dimensions: ["sessionDefaultChannelGroup", "eventName"],
      metrics: ["eventCount"],
      dateRange: current,
      dimensionFilter: eventFilter,
    }),
    runReport({
      dimensions: ["date", "eventName"],
      metrics: ["eventCount"],
      dateRange: current,
      dimensionFilter: eventFilter,
      orderBys: [{ dimension: "date", desc: false }],
    }),
  ]);

  // --- Build stages ---
  const eventTotals: Record<string, { count: number; users: number }> = {};
  for (const r of totalsRows) {
    const key = str(r.eventName);
    eventTotals[key] = { count: num(r.eventCount), users: num(r.totalUsers) };
  }

  // Combine inquiry_generate_lead + generate_lead
  const leadCount =
    (eventTotals["inquiry_generate_lead"]?.count ?? 0) +
    (eventTotals["generate_lead"]?.count ?? 0);
  const leadUsers =
    (eventTotals["inquiry_generate_lead"]?.users ?? 0) +
    (eventTotals["generate_lead"]?.users ?? 0);

  const pageViewVal = eventTotals["inquiry_page_view"]?.users ?? 0;
  const formStartVal = eventTotals["inquiry_form_start"]?.users ?? 0;
  const privacyVal = eventTotals["inquiry_privacy_agree"]?.users ?? 0;

  const stages: FunnelStage[] = [
    { stage: "문의 페이지 진입", value: pageViewVal, rate: 0 },
    { stage: "폼 입력 시작", value: formStartVal, rate: pageViewVal > 0 ? pct(formStartVal, pageViewVal) : 0 },
    { stage: "개인정보 동의", value: privacyVal, rate: pageViewVal > 0 ? pct(privacyVal, pageViewVal) : 0 },
    { stage: "문의 제출 완료", value: leadUsers, rate: pageViewVal > 0 ? pct(leadUsers, pageViewVal) : 0 },
  ];

  // --- Build channel attribution ---
  const channelMap: Record<string, Record<string, number>> = {};
  for (const r of channelRows) {
    const ch = str(r.sessionDefaultChannelGroup);
    const ev = str(r.eventName);
    if (!channelMap[ch]) channelMap[ch] = {};
    // Merge generate_lead into inquiry_generate_lead
    const normalizedEv = ev === "generate_lead" ? "inquiry_generate_lead" : ev;
    channelMap[ch][normalizedEv] = (channelMap[ch][normalizedEv] ?? 0) + num(r.eventCount);
  }

  const channelAttribution = Object.entries(channelMap)
    .map(([channel, evts]) => ({
      channel,
      inquiry_page_view: evts["inquiry_page_view"] ?? 0,
      inquiry_form_start: evts["inquiry_form_start"] ?? 0,
      inquiry_generate_lead: evts["inquiry_generate_lead"] ?? 0,
    }))
    .sort((a, b) => b.inquiry_page_view - a.inquiry_page_view);

  // --- Build daily trend ---
  const dayMap: Record<string, Record<string, number>> = {};
  for (const r of dailyRows) {
    const d = fmtDate(str(r.date));
    const ev = str(r.eventName);
    if (!dayMap[d]) dayMap[d] = {};
    const normalizedEv = ev === "generate_lead" ? "inquiry_generate_lead" : ev;
    dayMap[d][normalizedEv] = (dayMap[d][normalizedEv] ?? 0) + num(r.eventCount);
  }

  const dailyTrend = Object.entries(dayMap)
    .sort(([a], [b]) => {
      // Sort by M/D format numerically
      const [am, ad] = a.split("/").map(Number);
      const [bm, bd] = b.split("/").map(Number);
      return am !== bm ? am - bm : ad - bd;
    })
    .map(([date, evts]) => ({
      date,
      inquiry_page_view: evts["inquiry_page_view"] ?? 0,
      inquiry_form_start: evts["inquiry_form_start"] ?? 0,
      inquiry_generate_lead: evts["inquiry_generate_lead"] ?? 0,
    }));

  return { stages, channelAttribution, dailyTrend };
}

// ---------------------------------------------------------------------------
// Home funnel — 홈 인라인 폼 3단계 (home_form_start → home_form_progress → home_generate_lead)
// ---------------------------------------------------------------------------

export async function fetchHomeFunnel(period: Period): Promise<HomeFunnelData> {
  const { current } = periodToDateRanges(period);

  const homeEvents = ["home_form_start", "home_form_progress", "home_generate_lead"];

  const eventFilter = {
    orGroup: {
      expressions: homeEvents.map((ev) => ({
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: ev },
        },
      })),
    },
  };

  const [totalsRows, channelRows, dailyRows] = await Promise.all([
    runReport({
      dimensions: ["eventName"],
      metrics: ["eventCount", "totalUsers"],
      dateRange: current,
      dimensionFilter: eventFilter,
    }),
    runReport({
      dimensions: ["sessionDefaultChannelGroup", "eventName"],
      metrics: ["eventCount"],
      dateRange: current,
      dimensionFilter: eventFilter,
    }),
    runReport({
      dimensions: ["date", "eventName"],
      metrics: ["eventCount"],
      dateRange: current,
      dimensionFilter: eventFilter,
      orderBys: [{ dimension: "date", desc: false }],
    }),
  ]);

  const eventTotals: Record<string, { count: number; users: number }> = {};
  for (const r of totalsRows) {
    eventTotals[str(r.eventName)] = {
      count: num(r.eventCount),
      users: num(r.totalUsers),
    };
  }

  const startVal = eventTotals["home_form_start"]?.users ?? 0;
  const progressVal = eventTotals["home_form_progress"]?.users ?? 0;
  const leadVal = eventTotals["home_generate_lead"]?.users ?? 0;

  const stages: FunnelStage[] = [
    { stage: "홈 폼 시작", value: startVal, rate: 100 },
    {
      stage: "이메일 입력 진행",
      value: progressVal,
      rate: startVal > 0 ? pct(progressVal, startVal) : 0,
    },
    {
      stage: "홈 리드 전환",
      value: leadVal,
      rate: startVal > 0 ? pct(leadVal, startVal) : 0,
    },
  ];

  const channelMap: Record<string, Record<string, number>> = {};
  for (const r of channelRows) {
    const ch = str(r.sessionDefaultChannelGroup);
    const ev = str(r.eventName);
    if (!channelMap[ch]) channelMap[ch] = {};
    channelMap[ch][ev] = (channelMap[ch][ev] ?? 0) + num(r.eventCount);
  }

  const channelAttribution = Object.entries(channelMap)
    .map(([channel, evts]) => ({
      channel,
      home_form_start: evts["home_form_start"] ?? 0,
      home_form_progress: evts["home_form_progress"] ?? 0,
      home_generate_lead: evts["home_generate_lead"] ?? 0,
    }))
    .sort((a, b) => b.home_form_start - a.home_form_start);

  const dayMap: Record<string, Record<string, number>> = {};
  for (const r of dailyRows) {
    const d = fmtDate(str(r.date));
    const ev = str(r.eventName);
    if (!dayMap[d]) dayMap[d] = {};
    dayMap[d][ev] = (dayMap[d][ev] ?? 0) + num(r.eventCount);
  }

  const dailyTrend = Object.entries(dayMap)
    .sort(([a], [b]) => {
      const [am, ad] = a.split("/").map(Number);
      const [bm, bd] = b.split("/").map(Number);
      return am !== bm ? am - bm : ad - bd;
    })
    .map(([date, evts]) => ({
      date,
      home_form_start: evts["home_form_start"] ?? 0,
      home_form_progress: evts["home_form_progress"] ?? 0,
      home_generate_lead: evts["home_generate_lead"] ?? 0,
    }));

  return { stages, channelAttribution, dailyTrend };
}

// ---------------------------------------------------------------------------
// Lead summary — 홈 인라인 폼 vs 문의 페이지 리드 합산 비교
// ---------------------------------------------------------------------------

async function fetchLeadCounts(dateRange: DateRange): Promise<{
  home: number;
  request: number;
  daily: { date: string; home: number; request: number }[];
}> {
  const leadEvents = ["home_generate_lead", "inquiry_generate_lead", "generate_lead"];

  const eventFilter = {
    orGroup: {
      expressions: leadEvents.map((ev) => ({
        filter: {
          fieldName: "eventName",
          stringFilter: { matchType: "EXACT", value: ev },
        },
      })),
    },
  };

  const [totalsRows, dailyRows] = await Promise.all([
    runReport({
      dimensions: ["eventName"],
      metrics: ["eventCount"],
      dateRange,
      dimensionFilter: eventFilter,
    }),
    runReport({
      dimensions: ["date", "eventName"],
      metrics: ["eventCount"],
      dateRange,
      dimensionFilter: eventFilter,
      orderBys: [{ dimension: "date", desc: false }],
    }),
  ]);

  const totals: Record<string, number> = {};
  for (const r of totalsRows) {
    totals[str(r.eventName)] = num(r.eventCount);
  }

  const home = totals["home_generate_lead"] ?? 0;
  const request =
    (totals["inquiry_generate_lead"] ?? 0) + (totals["generate_lead"] ?? 0);

  const dayMap: Record<string, { home: number; request: number }> = {};
  for (const r of dailyRows) {
    const d = fmtDate(str(r.date));
    const ev = str(r.eventName);
    const cnt = num(r.eventCount);
    if (!dayMap[d]) dayMap[d] = { home: 0, request: 0 };
    if (ev === "home_generate_lead") dayMap[d].home += cnt;
    else dayMap[d].request += cnt; // inquiry_generate_lead + generate_lead
  }

  const daily = Object.entries(dayMap)
    .sort(([a], [b]) => {
      const [am, ad] = a.split("/").map(Number);
      const [bm, bd] = b.split("/").map(Number);
      return am !== bm ? am - bm : ad - bd;
    })
    .map(([date, v]) => ({ date, home: v.home, request: v.request }));

  return { home, request, daily };
}

export async function fetchLeadSummary(period: Period): Promise<LeadSummaryData> {
  const { current, previous } = periodToDateRanges(period);

  // Serial cur → prev to keep concurrent GA4 inflight low (quota = ~10/property)
  const cur = await fetchLeadCounts(current);
  const prev = await fetchLeadCounts(previous);

  return {
    home: cur.home,
    request: cur.request,
    total: cur.home + cur.request,
    prev: {
      home: prev.home,
      request: prev.request,
      total: prev.home + prev.request,
    },
    dailyTrend: cur.daily,
  };
}

// ---------------------------------------------------------------------------
// LeadMagnet (가이드북) + Blog 3카드 — 임프레션 → 클릭 → CTR
// ---------------------------------------------------------------------------

async function fetchEventCounts(
  dateRange: DateRange,
  eventNames: string[],
): Promise<Record<string, number>> {
  const rows = await runReport({
    dimensions: ["eventName"],
    metrics: ["eventCount"],
    dateRange,
    dimensionFilter: {
      orGroup: {
        expressions: eventNames.map((ev) => ({
          filter: {
            fieldName: "eventName",
            stringFilter: { matchType: "EXACT", value: ev },
          },
        })),
      },
    },
  });
  const map: Record<string, number> = {};
  for (const r of rows) map[str(r.eventName)] = num(r.eventCount);
  return map;
}

export async function fetchLeadMagnet(period: Period): Promise<LeadMagnetData> {
  const { current, previous } = periodToDateRanges(period);
  const events = ["home_report_impression", "home_report_outbound_click"];

  // Serial cur → prev to keep concurrent GA4 inflight low
  const cur = await fetchEventCounts(current, events);
  const prev = await fetchEventCounts(previous, events);

  const curImp = cur["home_report_impression"] ?? 0;
  const curClk = cur["home_report_outbound_click"] ?? 0;
  const prevImp = prev["home_report_impression"] ?? 0;
  const prevClk = prev["home_report_outbound_click"] ?? 0;

  return {
    impressions: curImp,
    clicks: curClk,
    ctr: curImp > 0 ? pct(curClk, curImp) : 0,
    prev: {
      impressions: prevImp,
      clicks: prevClk,
      ctr: prevImp > 0 ? pct(prevClk, prevImp) : 0,
    },
  };
}

export async function fetchBlogCards(period: Period): Promise<BlogCardsData> {
  const { current, previous } = periodToDateRanges(period);
  const events = ["home_blog_section_impression", "home_blog_card_click"];

  const cur = await fetchEventCounts(current, events);
  const prev = await fetchEventCounts(previous, events);

  const curImp = cur["home_blog_section_impression"] ?? 0;
  const curClk = cur["home_blog_card_click"] ?? 0;
  const prevImp = prev["home_blog_section_impression"] ?? 0;
  const prevClk = prev["home_blog_card_click"] ?? 0;

  return {
    impressions: curImp,
    clicks: curClk,
    ctr: curImp > 0 ? pct(curClk, curImp) : 0,
    prev: {
      impressions: prevImp,
      clicks: prevClk,
      ctr: prevImp > 0 ? pct(prevClk, prevImp) : 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Fetch all data in one call
// ---------------------------------------------------------------------------

export async function fetchAllData(period: Period): Promise<AllData> {
  // GA4 Data API has ~10 concurrent requests/property quota.
  // Run in 3 sequential waves so each wave stays well under the limit.

  // Wave 1: simple single-report fetches (≈9 inflight)
  const [
    kpis,
    dailyTrend,
    channels,
    sourceMedium,
    topPages,
    events,
    devices,
    countries,
  ] = await Promise.all([
    fetchKpis(period),
    fetchDailyTrend(period),
    fetchChannels(period),
    fetchSourceMedium(period),
    fetchTopPages(period),
    fetchEvents(period),
    fetchDevices(period),
    fetchCountries(period),
  ]);

  // Wave 2: misc + funnels (≈9 inflight)
  const [
    newVsReturning,
    hostnames,
    dayOfWeek,
    inquiryFunnel,
    homeFunnel,
  ] = await Promise.all([
    fetchNewVsReturning(period),
    fetchHostnames(period),
    fetchDayOfWeek(period),
    fetchInquiryFunnel(period),
    fetchHomeFunnel(period),
  ]);

  // Wave 3: lead aggregations (each function is internally serial, so ≈4 inflight)
  const [leadSummary, leadMagnet, blogCards] = await Promise.all([
    fetchLeadSummary(period),
    fetchLeadMagnet(period),
    fetchBlogCards(period),
  ]);

  // Inject "전체 방문자" as first funnel stage using total users from KPIs
  const totalUsers = kpis.users;
  const enrichedFunnel: InquiryFunnelData = {
    ...inquiryFunnel,
    stages: [
      { stage: "전체 방문자", value: totalUsers, rate: 100 },
      ...inquiryFunnel.stages.map((s) => ({
        ...s,
        rate: pct(s.value, totalUsers),
      })),
    ],
  };

  // Enrich home funnel: prepend [전체 방문자, 홈화면 방문자] so users see the
  // real top-of-funnel drop-off, not just "form_start = 100%".
  const homeVisitorPage = topPages.find((p) => p.path === "/");
  const homeVisitors = homeVisitorPage?.users ?? 0;
  const enrichedHomeFunnel: HomeFunnelData = {
    ...homeFunnel,
    stages: [
      { stage: "전체 방문자", value: totalUsers, rate: 100 },
      { stage: "홈화면 방문자", value: homeVisitors, rate: pct(homeVisitors, totalUsers) },
      ...homeFunnel.stages.map((s) => ({
        ...s,
        rate: pct(s.value, totalUsers),
      })),
    ],
  };

  return {
    kpis,
    dailyTrend,
    channels,
    sourceMedium,
    topPages,
    events,
    devices,
    countries,
    newVsReturning,
    hostnames,
    dayOfWeek,
    inquiryFunnel: enrichedFunnel,
    homeFunnel: enrichedHomeFunnel,
    leadSummary,
    leadMagnet,
    blogCards,
  };
}
