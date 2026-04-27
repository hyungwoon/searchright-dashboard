import { type NextRequest } from "next/server";
import { fetchAllData } from "@/lib/ga4";
import {
  sendSlackMessage,
  formatNumber,
  formatPct,
  changeIndicator,
  changePp,
  progressBar,
  formatDateRange,
  getISOWeek,
  headerBlock,
  sectionMrkdwn,
  contextBlock,
  dividerBlock,
} from "@/lib/slack";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SLACK_CHANNEL = "C0AQYUS35T8";
const DASHBOARD_URL = "https://searchright-dashboard.vercel.app";

// ---------------------------------------------------------------------------
// Insight generation
// ---------------------------------------------------------------------------

interface Insight {
  text: string;
}

function generateInsights(data: Awaited<ReturnType<typeof fetchAllData>>): Insight[] {
  const insights: Insight[] = [];

  // 1. Top channel for inquiry page views
  const topInquiryChannel = data.inquiryFunnel.channelAttribution
    .filter((c) => c.inquiry_page_view > 0)
    .sort((a, b) => b.inquiry_page_view - a.inquiry_page_view)[0];

  if (topInquiryChannel) {
    insights.push({
      text: `${topInquiryChannel.channel}이 문의 진입 ${topInquiryChannel.inquiry_page_view}건으로 최다 기여 채널`,
    });
  }

  // 2. Best converting channel (highest lead-to-page-view ratio)
  const convertingChannels = data.inquiryFunnel.channelAttribution
    .filter((c) => c.inquiry_generate_lead > 0 && c.inquiry_page_view > 0)
    .map((c) => ({
      ...c,
      convRate: c.inquiry_generate_lead / c.inquiry_page_view,
    }))
    .sort((a, b) => b.convRate - a.convRate);

  if (convertingChannels.length > 0) {
    const best = convertingChannels[0];
    insights.push({
      text: `${best.channel}은 전환율 최고 (${best.inquiry_page_view}진입 → ${best.inquiry_generate_lead}전환)`,
    });
  }

  // 3. Engagement rate change
  const engDelta = data.kpis.engRate - data.kpis.prev.engRate;
  if (engDelta < -2) {
    insights.push({
      text: `참여율 전주 대비 ${Math.abs(engDelta).toFixed(1)}pp 하락 — 콘텐츠/UX 점검 권장`,
    });
  } else if (engDelta > 2) {
    insights.push({
      text: `참여율 전주 대비 ${engDelta.toFixed(1)}pp 상승 — 콘텐츠 품질 개선 효과`,
    });
  }

  // 4. Session growth
  const sessGrowth = data.kpis.prev.sessions > 0
    ? ((data.kpis.sessions - data.kpis.prev.sessions) / data.kpis.prev.sessions) * 100
    : 0;
  if (sessGrowth > 20) {
    insights.push({
      text: `세션 ${sessGrowth.toFixed(0)}% 성장 — 트래픽 유입 증가 추세`,
    });
  } else if (sessGrowth < -20) {
    insights.push({
      text: `세션 ${Math.abs(sessGrowth).toFixed(0)}% 감소 — 트래픽 하락 원인 파악 필요`,
    });
  }

  // 5. Check for zero-session days
  const zeroDays = data.dailyTrend.filter((d) => d.sessions === 0);
  if (zeroDays.length > 0) {
    insights.push({
      text: `${zeroDays.map((d) => d.date).join(", ")}에 세션 0건 — 트래킹 이상 점검 필요`,
    });
  }

  return insights.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Build Slack blocks
// ---------------------------------------------------------------------------

function buildWeeklyBlocks(
  data: Awaited<ReturnType<typeof fetchAllData>>,
  weekStart: Date,
  weekEnd: Date,
): unknown[] {
  const dateRange = formatDateRange(weekStart, weekEnd);
  const weekNum = getISOWeek(weekEnd);

  const blocks: unknown[] = [];

  // Header
  blocks.push(headerBlock(`📊 SearchRight 위클리 리포트 | ${dateRange} (W${weekNum})`));
  blocks.push(dividerBlock());

  // KPI table
  const k = data.kpis;
  const p = k.prev;

  blocks.push(sectionMrkdwn(
    `*📈 주간 KPI*\n` +
    "```\n" +
    `             이번주     전주      변화\n` +
    `세션          ${pad(formatNumber(k.sessions), 9)} ${pad(formatNumber(p.sessions), 9)} ${changeIndicator(k.sessions, p.sessions)}\n` +
    `사용자        ${pad(formatNumber(k.users), 9)} ${pad(formatNumber(p.users), 9)} ${changeIndicator(k.users, p.users)}\n` +
    `페이지뷰      ${pad(formatNumber(k.pageviews), 9)} ${pad(formatNumber(p.pageviews), 9)} ${changeIndicator(k.pageviews, p.pageviews)}\n` +
    `참여율        ${pad(formatPct(k.engRate), 9)} ${pad(formatPct(p.engRate), 9)} ${changePp(k.engRate, p.engRate)}\n` +
    "```",
  ));
  blocks.push(dividerBlock());

  // Lead summary — 홈 인라인 폼 vs 문의 페이지
  const ls = data.leadSummary;
  blocks.push(sectionMrkdwn(
    `*💎 리드 인입 종합 — 총 ${ls.total}건 (${changeIndicator(ls.total, ls.prev.total)})*\n` +
    "```\n" +
    `              이번주     전주      변화\n` +
    `🏠 홈 인라인  ${pad(String(ls.home), 9)} ${pad(String(ls.prev.home), 9)} ${changeIndicator(ls.home, ls.prev.home)}\n` +
    `📋 문의 페이지 ${pad(String(ls.request), 8)} ${pad(String(ls.prev.request), 9)} ${changeIndicator(ls.request, ls.prev.request)}\n` +
    "```",
  ));
  blocks.push(dividerBlock());

  // Home funnel summary (간단 라인)
  const hf = data.homeFunnel.stages;
  if (hf.length === 3) {
    blocks.push(sectionMrkdwn(
      `*🏠 홈 인라인 폼 퍼널*\n` +
      `${hf[0].stage} ${hf[0].value}명 → ${hf[1].stage} ${hf[1].value}명 (${hf[1].rate}%) → ${hf[2].stage} ${hf[2].value}건 (${hf[2].rate}%)`,
    ));
    blocks.push(dividerBlock());
  }

  // LeadMagnet + Blog cards (홈 콘텐츠 성과)
  const lm = data.leadMagnet;
  const bc = data.blogCards;
  if (lm.impressions > 0 || bc.impressions > 0) {
    blocks.push(sectionMrkdwn(
      `*📘 홈 콘텐츠 성과*\n` +
      `LeadMagnet (가이드북)  노출 ${formatNumber(lm.impressions)} · 클릭 ${formatNumber(lm.clicks)} · CTR ${formatPct(lm.ctr)}\n` +
      `Blog 3카드 섹션         노출 ${formatNumber(bc.impressions)} · 클릭 ${formatNumber(bc.clicks)} · CTR ${formatPct(bc.ctr)}`,
    ));
    blocks.push(dividerBlock());
  }

  // Funnel
  const stages = data.inquiryFunnel.stages;
  const totalUsers = stages.length > 0 ? stages[0].value : k.users;

  const funnelLines = stages.map((s) => {
    const bar = progressBar(s.value, totalUsers);
    const rateStr = pad(formatPct(s.rate), 6);
    return `${padRight(s.stage, 14)} ${pad(String(s.value) + "명", 6)} ${bar} ${rateStr}`;
  });

  // Calculate overall conversion
  const leadStage = stages.find((s) => s.stage === "문의 제출 완료");
  const overallConv = totalUsers > 0 && leadStage
    ? ((leadStage.value / totalUsers) * 100).toFixed(1)
    : "0.0";

  blocks.push(sectionMrkdwn(
    `*🔄 문의 전환 퍼널*\n` +
    "```\n" +
    funnelLines.join("\n") +
    "\n```\n" +
    `💡 주간 전환: 방문자 → 제출 *${overallConv}%*`,
  ));
  blocks.push(dividerBlock());

  // Channel performance with inquiry attribution
  const channelAttr = data.inquiryFunnel.channelAttribution;
  const channelMap = new Map(channelAttr.map((c) => [c.channel, c]));

  const topChannels = data.channels.slice(0, 5);
  const chLines = topChannels.map((ch) => {
    const attr = channelMap.get(ch.name);
    const inqCount = attr ? attr.inquiry_page_view : 0;
    const inqStr = inqCount > 0 ? `${inqCount}건` : "—";
    const star = attr && attr.inquiry_page_view ===
      Math.max(...channelAttr.map((c) => c.inquiry_page_view)) && inqCount > 0
      ? " ⭐" : "";
    return `${padRight(ch.name, 18)} ${pad(String(ch.sessions), 5)} ${pad(formatPct(ch.engRate), 7)} ${pad(inqStr, 5)}${star}`;
  });

  blocks.push(sectionMrkdwn(
    `*📡 채널별 성과*\n` +
    "```\n" +
    `${padRight("채널", 18)} ${pad("세션", 5)} ${pad("참여율", 7)} ${pad("문의진입", 5)}\n` +
    chLines.join("\n") +
    "\n```",
  ));
  blocks.push(dividerBlock());

  // Top content
  const topPages = data.topPages.slice(0, 5);
  const pageLines = topPages.map((p, i) => {
    const label = p.label.length > 30 ? p.label.slice(0, 27) + "..." : p.label;
    return `${i + 1}. ${label} — ${formatNumber(p.views)} PV`;
  });

  blocks.push(sectionMrkdwn(
    `*📝 Top 콘텐츠 (페이지뷰 기준)*\n${pageLines.join("\n")}`,
  ));
  blocks.push(dividerBlock());

  // Insights
  const insights = generateInsights(data);
  if (insights.length > 0) {
    const insightLines = insights.map((ins) => `• ${ins.text}`);
    blocks.push(sectionMrkdwn(
      `*💡 주간 인사이트*\n${insightLines.join("\n")}`,
    ));
    blocks.push(dividerBlock());
  }

  // Footer
  blocks.push(contextBlock(`🔗 <${DASHBOARD_URL}|대시보드 바로가기>`));

  return blocks;
}

// ---------------------------------------------------------------------------
// Padding helpers for monospace alignment
// ---------------------------------------------------------------------------

function pad(s: string, len: number): string {
  return s.padStart(len);
}

function padRight(s: string, len: number): string {
  return s.padEnd(len);
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest) {
  try {
    // Fetch 7-day data (includes prev comparison)
    const data = await fetchAllData("7d");

    // Calculate date range (last 7 days ending yesterday)
    const end = new Date();
    end.setDate(end.getDate() - 1);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const blocks = buildWeeklyBlocks(data, start, end);
    const fallbackText =
      `SearchRight 위클리 리포트 | ${formatDateRange(start, end)} — ` +
      `세션 ${formatNumber(data.kpis.sessions)}, 사용자 ${formatNumber(data.kpis.users)}`;

    await sendSlackMessage(SLACK_CHANNEL, blocks, fallbackText);

    return Response.json({
      ok: true,
      type: "weekly",
      dateRange: {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      },
      kpis: data.kpis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[slack/weekly] Error: ${message}`);

    // Try to send error notification to Slack
    try {
      await sendSlackMessage(
        SLACK_CHANNEL,
        [sectionMrkdwn(`⚠️ *위클리 리포트 생성 실패*\n\`${message}\``)],
        `위클리 리포트 생성 실패: ${message}`,
      );
    } catch {
      console.error("[slack/weekly] Failed to send error notification to Slack");
    }

    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
