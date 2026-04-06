import { type NextRequest } from "next/server";
import { GET as dailyHandler } from "@/app/api/slack/daily/route";
import { GET as weeklyHandler } from "@/app/api/slack/weekly/route";
import { fetchAllData } from "@/lib/ga4";

export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {};
  const now = new Date();
  const kstDay = new Date(now.getTime() + 9 * 60 * 60 * 1000).getDay();
  const isMonday = kstDay === 1;

  // 1. Warm analytics cache
  try {
    await fetchAllData("30d");
    results.analytics = { ok: true };
  } catch (e) {
    results.analytics = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // 2. Daily report (every day)
  try {
    const res = await dailyHandler(request);
    const json = await res.json();
    results.daily = { ok: json.ok };
  } catch (e) {
    results.daily = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // 3. Weekly report (Monday only)
  if (isMonday) {
    try {
      const res = await weeklyHandler(request);
      const json = await res.json();
      results.weekly = { ok: json.ok };
    } catch (e) {
      results.weekly = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    results.weekly = { skipped: true, reason: "not Monday" };
  }

  return Response.json({ ok: true, isMonday, results });
}
