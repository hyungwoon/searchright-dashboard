import { type NextRequest } from "next/server";
import { fetchAllData, type Period, type AllData } from "@/lib/ga4";
import {
  kpis,
  dailyTrend,
  channels,
  topPages,
  events,
  devices,
  countries,
  newVsReturning,
  hostnames,
  sourceMedium,
  dayOfWeek,
  funnel,
} from "@/lib/data";
import {
  periodKpis,
  getDailyTrend,
  periodChannels,
  getEvents,
  periodDevices,
  getFunnel,
  type Period as StaticPeriod,
} from "@/lib/period-data";

export const revalidate = 86400; // 24 hours

const VALID_PERIODS = new Set(["7d", "14d", "30d", "90d"]);

/**
 * Build a static fallback response from the existing data files.
 * Uses period-specific data when available, falls back to 30d defaults.
 */
function buildStaticFallback(period: StaticPeriod): AllData {
  const kpiData = periodKpis[period];
  const channelData = periodChannels[period];
  const eventData = getEvents(period);
  const deviceData = periodDevices[period];
  const trendData = getDailyTrend(period);
  const funnelData = getFunnel(period);

  return {
    kpis: {
      sessions: kpiData.sessions,
      users: kpiData.users,
      pageviews: kpiData.pageviews,
      engRate: kpiData.engRate,
      bounceRate: kpiData.bounceRate,
      newUsers: period === "30d" ? (kpis.newUsers ?? 0) : Math.round(kpiData.users * 0.85),
      prev: kpiData.prev,
    },
    dailyTrend: trendData,
    channels: channelData,
    sourceMedium: period === "30d" ? sourceMedium : channelData.map((c) => ({
      source: c.name.toLowerCase().replace(/\s+/g, "-"),
      medium: "(grouped)",
      sessions: c.sessions,
      users: c.users,
      pageviews: c.pageviews,
      engRate: c.engRate,
    })),
    topPages: topPages,
    events: eventData,
    devices: deviceData,
    countries: countries,
    newVsReturning: newVsReturning,
    hostnames: hostnames,
    dayOfWeek: dayOfWeek,
    inquiryFunnel: {
      stages: funnelData,
      channelAttribution: [],
      dailyTrend: [],
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const periodParam = searchParams.get("period") || "30d";
  const period: Period = VALID_PERIODS.has(periodParam)
    ? (periodParam as Period)
    : "30d";

  try {
    const data = await fetchAllData(period);
    return Response.json({
      ...data,
      source: "live" as const,
      period,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.warn(`[analytics] GA4 API failed, using static fallback: ${message}`);

    const staticData = buildStaticFallback(period as StaticPeriod);
    return Response.json({
      ...staticData,
      source: "static" as const,
      period,
      fetchedAt: null,
    });
  }
}
