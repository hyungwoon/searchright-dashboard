"use client";
import { useState, useEffect } from "react";

import * as staticData from "./data";
import {
  periodKpis,
  getDailyTrend,
  periodChannels,
  getEvents,
  periodDevices,
  getFunnel,
  type Period,
} from "./period-data";
import type {
  HomeFunnelData,
  LeadSummaryData,
  LeadMagnetData,
  BlogCardsData,
} from "./ga4";

export type { Period };

export type AnalyticsData = {
  loading: boolean;
  source: "live" | "static";
  fetchedAt: string | null;
  kpis: {
    sessions: number;
    users: number;
    pageviews: number;
    engRate: number;
    bounceRate: number;
    newUsers?: number;
    prev: { sessions: number; users: number; pageviews: number; engRate: number; bounceRate: number };
  };
  dailyTrend: { date: string; sessions: number; users: number; pageviews: number; engRate?: number; bounce?: number }[];
  channels: { name: string; sessions: number; users: number; pageviews: number; engRate: number }[];
  sourceMedium: { source: string; medium: string; sessions: number; users: number; pageviews: number; engRate: number }[];
  topPages: { path: string; label: string; views: number; users: number; engRate: number }[];
  events: { name: string; key: string; count: number; users: number; color: string; desc: string }[];
  devices: { name: string; value: number; users: number; engRate: number; color: string }[];
  countries: { name: string; sessions: number; users: number }[];
  newVsReturning: { name: string; sessions: number; users: number; engRate: number; avgDuration: number; color: string }[];
  hostnames: { name: string; sessions: number; users: number; pageviews: number }[];
  dayOfWeek: { day: string; sessions: number; users: number; pageviews: number }[];
  inquiryFunnel: typeof staticData.inquiryFunnel | null;
  funnel: { stage: string; value: number; rate: number }[];
  dailyFunnel: typeof staticData.dailyFunnel;
  channelConversion: typeof staticData.inquiryFunnel.channelAttribution;
  pageConversion: typeof staticData.pageConversion;
  homeFunnel: HomeFunnelData;
  leadSummary: LeadSummaryData;
  leadMagnet: LeadMagnetData;
  blogCards: BlogCardsData;
};

const EMPTY_HOME_FUNNEL: HomeFunnelData = {
  stages: [],
  channelAttribution: [],
  dailyTrend: [],
};

const EMPTY_LEAD_SUMMARY: LeadSummaryData = {
  home: 0,
  request: 0,
  total: 0,
  prev: { home: 0, request: 0, total: 0 },
  dailyTrend: [],
};

const EMPTY_LEAD_MAGNET: LeadMagnetData = {
  impressions: 0,
  clicks: 0,
  ctr: 0,
  prev: { impressions: 0, clicks: 0, ctr: 0 },
};

const EMPTY_BLOG_CARDS: BlogCardsData = {
  impressions: 0,
  clicks: 0,
  ctr: 0,
  prev: { impressions: 0, clicks: 0, ctr: 0 },
};

function buildStaticResult(period: Period): Omit<AnalyticsData, "loading" | "source" | "fetchedAt"> {
  const kpiData = periodKpis[period];
  return {
    kpis: { ...kpiData, newUsers: staticData.kpis.newUsers },
    dailyTrend: getDailyTrend(period),
    channels: periodChannels[period],
    sourceMedium: staticData.sourceMedium,
    topPages: staticData.topPages,
    events: getEvents(period),
    devices: periodDevices[period],
    countries: staticData.countries,
    newVsReturning: staticData.newVsReturning,
    hostnames: staticData.hostnames,
    dayOfWeek: staticData.dayOfWeek,
    inquiryFunnel: staticData.inquiryFunnel,
    funnel: getFunnel(period),
    dailyFunnel: staticData.dailyFunnel,
    channelConversion: staticData.inquiryFunnel.channelAttribution,
    pageConversion: staticData.pageConversion,
    homeFunnel: EMPTY_HOME_FUNNEL,
    leadSummary: EMPTY_LEAD_SUMMARY,
    leadMagnet: EMPTY_LEAD_MAGNET,
    blogCards: EMPTY_BLOG_CARDS,
  };
}

export function useAnalytics(period: Period): AnalyticsData {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"live" | "static">("static");
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/analytics?period=${period}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setSource(json.source || "live");
        setFetchedAt(json.fetchedAt ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setData(null);
        setSource("static");
        setFetchedAt(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  if (data && source === "live") {
    const d = data as Record<string, unknown>;
    const iq = d.inquiryFunnel as Record<string, unknown> | undefined;
    return {
      loading,
      source,
      fetchedAt,
      kpis: d.kpis as AnalyticsData["kpis"],
      dailyTrend: d.dailyTrend as AnalyticsData["dailyTrend"],
      channels: d.channels as AnalyticsData["channels"],
      sourceMedium: d.sourceMedium as AnalyticsData["sourceMedium"],
      topPages: d.topPages as AnalyticsData["topPages"],
      events: d.events as AnalyticsData["events"],
      devices: d.devices as AnalyticsData["devices"],
      countries: d.countries as AnalyticsData["countries"],
      newVsReturning: d.newVsReturning as AnalyticsData["newVsReturning"],
      hostnames: d.hostnames as AnalyticsData["hostnames"],
      dayOfWeek: d.dayOfWeek as AnalyticsData["dayOfWeek"],
      inquiryFunnel: iq as AnalyticsData["inquiryFunnel"],
      funnel: (iq?.stages as AnalyticsData["funnel"]) ?? [],
      dailyFunnel: (iq?.dailyTrend as AnalyticsData["dailyFunnel"]) ?? [],
      channelConversion: (iq?.channelAttribution as AnalyticsData["channelConversion"]) ?? [],
      pageConversion: staticData.pageConversion,
      homeFunnel: (d.homeFunnel as HomeFunnelData) ?? EMPTY_HOME_FUNNEL,
      leadSummary: (d.leadSummary as LeadSummaryData) ?? EMPTY_LEAD_SUMMARY,
      leadMagnet: (d.leadMagnet as LeadMagnetData) ?? EMPTY_LEAD_MAGNET,
      blogCards: (d.blogCards as BlogCardsData) ?? EMPTY_BLOG_CARDS,
    };
  }

  const s = buildStaticResult(period);
  return { loading, source, fetchedAt, ...s };
}
