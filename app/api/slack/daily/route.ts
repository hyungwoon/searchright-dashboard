import { type NextRequest } from "next/server";
import {
  sendSlackMessage,
  formatNumber,
  formatPct,
  changeIndicator,
  formatKoreanDate,
  headerBlock,
  sectionMrkdwn,
  contextBlock,
  dividerBlock,
} from "@/lib/slack";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SLACK_CHANNEL = "C0AQYUS35T8";
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || "452138811";
const DASHBOARD_URL = "https://searchright-dashboard.vercel.app";

// ---------------------------------------------------------------------------
// GA4 client (reuse pattern from lib/ga4.ts)
// ---------------------------------------------------------------------------

let _client: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (_client) return _client;
  const creds = process.env.GOOGLE_CREDENTIALS;
  if (creds) {
    _client = new BetaAnalyticsDataClient({ credentials: JSON.parse(creds) });
  } else {
    _client = new BetaAnalyticsDataClient();
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Lightweight GA4 runner for daily queries
// ---------------------------------------------------------------------------

interface DateRange {
  startDate: string;
  endDate: string;
}

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

function num(v: unknown): number {
  return typeof v === "number" ? v : parseFloat(String(v || "0")) || 0;
}

function str(v: unknown): string {
  return String(v ?? "");
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

function toGA4Date(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Fetch daily data
// ---------------------------------------------------------------------------

interface DailyKpis {
  sessions: number;
  users: number;
  pageviews: number;
  engRate: number;
}

async function fetchDailyKpis(dateRange: DateRange): Promise<DailyKpis> {
  const rows = await runReport({
    metrics: ["sessions", "totalUsers", "screenPageViews", "engagementRate"],
    dateRange,
  });
  const r = rows[0] ?? {};
  return {
    sessions: num(r.sessions),
    users: num(r.totalUsers),
    pageviews: num(r.screenPageViews),
    engRate: Math.round(num(r.engagementRate) * 1000) / 10,
  };
}

interface DailyFunnel {
  pageView: number;
  formStart: number;
  lead: number;
}

async function fetchDailyFunnel(dateRange: DateRange): Promise<DailyFunnel> {
  const inquiryEvents = [
    "inquiry_page_view",
    "inquiry_form_start",
    "inquiry_generate_lead",
    "generate_lead",
  ];

  const rows = await runReport({
    dimensions: ["eventName"],
    metrics: ["totalUsers"],
    dateRange,
    dimensionFilter: {
      orGroup: {
        expressions: inquiryEvents.map((ev) => ({
          filter: {
            fieldName: "eventName",
            stringFilter: { matchType: "EXACT", value: ev },
          },
        })),
      },
    },
  });

  const map: Record<string, number> = {};
  for (const r of rows) {
    map[str(r.eventName)] = num(r.totalUsers);
  }

  return {
    pageView: map["inquiry_page_view"] ?? 0,
    formStart: map["inquiry_form_start"] ?? 0,
    lead: (map["inquiry_generate_lead"] ?? 0) + (map["generate_lead"] ?? 0),
  };
}

interface DailyHomeFunnel {
  formStart: number;
  formProgress: number;
  lead: number;
}

async function fetchDailyHomeFunnel(dateRange: DateRange): Promise<DailyHomeFunnel> {
  const homeEvents = ["home_form_start", "home_form_progress", "home_generate_lead"];

  const rows = await runReport({
    dimensions: ["eventName"],
    metrics: ["totalUsers"],
    dateRange,
    dimensionFilter: {
      orGroup: {
        expressions: homeEvents.map((ev) => ({
          filter: {
            fieldName: "eventName",
            stringFilter: { matchType: "EXACT", value: ev },
          },
        })),
      },
    },
  });

  const map: Record<string, number> = {};
  for (const r of rows) {
    map[str(r.eventName)] = num(r.totalUsers);
  }

  return {
    formStart: map["home_form_start"] ?? 0,
    formProgress: map["home_form_progress"] ?? 0,
    lead: map["home_generate_lead"] ?? 0,
  };
}

interface DailyChannel {
  name: string;
  sessions: number;
}

async function fetchDailyChannels(dateRange: DateRange): Promise<DailyChannel[]> {
  const rows = await runReport({
    dimensions: ["sessionDefaultChannelGroup"],
    metrics: ["sessions"],
    dateRange,
    orderBys: [{ metric: "sessions", desc: true }],
    limit: 5,
  });

  return rows.map((r) => ({
    name: str(r.sessionDefaultChannelGroup),
    sessions: num(r.sessions),
  }));
}

interface DailyEvent {
  name: string;
  count: number;
}

const EVENT_DISPLAY: Record<string, string> = {
  Request_landing_cta_home: "CTA 클릭",
  home_cta_click: "CTA 클릭 (신규)",
  PRdeck_download: "PR덱 다운로드",
  demo_landing_cta: "데모 CTA",
  blog_cta_click: "블로그 CTA",
  Blog_ebook_download_click: "이북 다운로드",
  inquiry_page_view: "문의 페이지 진입",
  inquiry_form_start: "문의 폼 입력",
  inquiry_generate_lead: "문의 제출 완료",
  home_report_impression: "가이드북 노출",
  home_report_outbound_click: "가이드북 클릭",
  home_blog_section_impression: "Blog 카드 노출",
  home_blog_card_click: "Blog 카드 클릭",
};

async function fetchDailyEvents(dateRange: DateRange): Promise<DailyEvent[]> {
  const keys = Object.keys(EVENT_DISPLAY);

  const rows = await runReport({
    dimensions: ["eventName"],
    metrics: ["eventCount"],
    dateRange,
    dimensionFilter: {
      orGroup: {
        expressions: keys.map((ev) => ({
          filter: {
            fieldName: "eventName",
            stringFilter: { matchType: "EXACT", value: ev },
          },
        })),
      },
    },
    orderBys: [{ metric: "eventCount", desc: true }],
  });

  return rows
    .filter((r) => num(r.eventCount) > 0)
    .map((r) => ({
      name: EVENT_DISPLAY[str(r.eventName)] ?? str(r.eventName),
      count: num(r.eventCount),
    }));
}

// ---------------------------------------------------------------------------
// Build Slack blocks
// ---------------------------------------------------------------------------

function buildDailyBlocks(
  date: Date,
  kpis: DailyKpis,
  prevKpis: DailyKpis,
  funnel: DailyFunnel,
  homeFunnel: DailyHomeFunnel,
  channels: DailyChannel[],
  events: DailyEvent[],
): unknown[] {
  const dateStr = formatKoreanDate(date);

  const blocks: unknown[] = [];

  // Header
  blocks.push(headerBlock(`📊 SearchRight 데일리 리포트 | ${dateStr}`));
  blocks.push(dividerBlock());

  // KPIs
  const sessChange = changeIndicator(kpis.sessions, prevKpis.sessions);
  const userChange = changeIndicator(kpis.users, prevKpis.users);
  const pvChange = changeIndicator(kpis.pageviews, prevKpis.pageviews);

  blocks.push(sectionMrkdwn(
    `*📈 어제 핵심 지표*\n` +
    `세션\t\t${formatNumber(kpis.sessions)}\t\t전일대비 ${sessChange}\n` +
    `사용자\t\t${formatNumber(kpis.users)}\t\t전일대비 ${userChange}\n` +
    `페이지뷰\t${formatNumber(kpis.pageviews)}\t\t전일대비 ${pvChange}\n` +
    `참여율\t\t${formatPct(kpis.engRate)}`,
  ));
  blocks.push(dividerBlock());

  // Lead summary (홈 vs 문의 합산)
  const totalLeads = funnel.lead + homeFunnel.lead;
  blocks.push(sectionMrkdwn(
    `*💎 어제 리드 종합 — 총 ${totalLeads}건*\n` +
    `🏠 홈 인라인 폼\t${homeFunnel.lead}건\n` +
    `📋 문의 페이지\t${funnel.lead}건`,
  ));
  blocks.push(dividerBlock());

  // Home funnel
  const homeLines: string[] = [];
  homeLines.push(`폼 시작\t\t${homeFunnel.formStart}명`);
  homeLines.push(`이메일 진행\t\t${homeFunnel.formProgress}명`);
  if (homeFunnel.lead > 0) {
    homeLines.push(`홈 리드 전환\t${homeFunnel.lead}건 ✅`);
  } else {
    homeLines.push(`홈 리드 전환\t아직 없음 —`);
  }
  blocks.push(sectionMrkdwn(`*🏠 홈 인라인 폼 퍼널*\n${homeLines.join("\n")}`));
  blocks.push(dividerBlock());

  // Inquiry funnel
  const funnelLines: string[] = [];
  funnelLines.push(`문의 페이지 진입\t${funnel.pageView}명`);
  funnelLines.push(`폼 입력 시작\t\t${funnel.formStart}명`);
  if (funnel.lead > 0) {
    funnelLines.push(`문의 제출 완료\t${funnel.lead}건 ✅`);
  } else {
    funnelLines.push(`문의 제출 완료\t아직 없음 —`);
  }

  blocks.push(sectionMrkdwn(`*📋 문의 페이지 퍼널*\n${funnelLines.join("\n")}`));
  blocks.push(dividerBlock());

  // Channels
  if (channels.length > 0) {
    const chLines = channels.map(
      (c, i) => `${i + 1}. ${c.name}\t\t${formatNumber(c.sessions)}`,
    );
    blocks.push(sectionMrkdwn(`*📡 주요 채널 (Top 5)*\n${chLines.join("\n")}`));
    blocks.push(dividerBlock());
  }

  // Events
  if (events.length > 0) {
    const evLines = events.map((e) => `${e.name}\t\t${e.count}회`);
    blocks.push(sectionMrkdwn(`*🎯 주요 이벤트*\n${evLines.join("\n")}`));
    blocks.push(dividerBlock());
  }

  // Footer
  blocks.push(contextBlock(`🔗 <${DASHBOARD_URL}|대시보드 바로가기>`));

  return blocks;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest) {
  try {
    const yesterday = getYesterday();
    const dayBefore = new Date(yesterday);
    dayBefore.setDate(dayBefore.getDate() - 1);

    const yesterdayRange: DateRange = {
      startDate: toGA4Date(yesterday),
      endDate: toGA4Date(yesterday),
    };
    const dayBeforeRange: DateRange = {
      startDate: toGA4Date(dayBefore),
      endDate: toGA4Date(dayBefore),
    };

    // Fetch all data in parallel
    const [kpis, prevKpis, funnel, homeFunnel, channels, events] = await Promise.all([
      fetchDailyKpis(yesterdayRange),
      fetchDailyKpis(dayBeforeRange),
      fetchDailyFunnel(yesterdayRange),
      fetchDailyHomeFunnel(yesterdayRange),
      fetchDailyChannels(yesterdayRange),
      fetchDailyEvents(yesterdayRange),
    ]);

    const blocks = buildDailyBlocks(yesterday, kpis, prevKpis, funnel, homeFunnel, channels, events);
    const fallbackText = `SearchRight 데일리 리포트 | ${formatKoreanDate(yesterday)} — 세션 ${formatNumber(kpis.sessions)}, 사용자 ${formatNumber(kpis.users)}`;

    await sendSlackMessage(SLACK_CHANNEL, blocks, fallbackText);

    return Response.json({
      ok: true,
      type: "daily",
      date: toGA4Date(yesterday),
      kpis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[slack/daily] Error: ${message}`);

    // Try to send error notification to Slack
    try {
      await sendSlackMessage(
        SLACK_CHANNEL,
        [sectionMrkdwn(`⚠️ *데일리 리포트 생성 실패*\n\`${message}\``)],
        `데일리 리포트 생성 실패: ${message}`,
      );
    } catch {
      console.error("[slack/daily] Failed to send error notification to Slack");
    }

    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
