// ---------------------------------------------------------------------------
// Slack messaging utilities — Block Kit formatting + Web API sender
// ---------------------------------------------------------------------------

const SLACK_API_URL = "https://slack.com/api/chat.postMessage";

// ---------------------------------------------------------------------------
// Number / percentage formatting
// ---------------------------------------------------------------------------

export function formatNumber(n: number): string {
  return n.toLocaleString("ko-KR");
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

/**
 * Returns a change string like "+20.9% ▲" or "-3.2% ▼".
 * When previous is 0, returns "NEW" instead of Infinity%.
 */
export function changeIndicator(curr: number, prev: number): string {
  if (prev === 0) return curr > 0 ? "NEW" : "—";
  const delta = ((curr - prev) / prev) * 100;
  const sign = delta >= 0 ? "+" : "";
  const arrow = delta > 0 ? " ▲" : delta < 0 ? " ▼" : "";
  return `${sign}${delta.toFixed(1)}%${arrow}`;
}

/**
 * Returns a change string for percentage-point metrics (engagement rate etc).
 * Shows "+2.4pp ▲" instead of percentage change.
 */
export function changePp(curr: number, prev: number): string {
  const delta = curr - prev;
  const sign = delta >= 0 ? "+" : "";
  const arrow = delta > 0 ? " ▲" : delta < 0 ? " ▼" : "";
  return `${sign}${delta.toFixed(1)}pp${arrow}`;
}

/**
 * Unicode progress bar: "████████░░" style.
 * @param value  current value
 * @param max    maximum value (100% reference)
 * @param length total bar character length (default 20)
 */
export function progressBar(value: number, max: number, length = 20): string {
  if (max <= 0) return "░".repeat(length);
  const filled = Math.round((value / max) * length);
  const clamped = Math.min(filled, length);
  return "█".repeat(clamped) + "░".repeat(length - clamped);
}

// ---------------------------------------------------------------------------
// Korean date helpers
// ---------------------------------------------------------------------------

const KO_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** Format a Date as "4월 6일 (일)" */
export function formatKoreanDate(d: Date): string {
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dow = KO_DAYS[d.getDay()];
  return `${month}월 ${day}일 (${dow})`;
}

/** Format date range as "3/31 ~ 4/6" */
export function formatDateRange(start: Date, end: Date): string {
  const s = `${start.getMonth() + 1}/${start.getDate()}`;
  const e = `${end.getMonth() + 1}/${end.getDate()}`;
  return `${s} ~ ${e}`;
}

/** ISO week number */
export function getISOWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ---------------------------------------------------------------------------
// Slack Block Kit helpers
// ---------------------------------------------------------------------------

export function headerBlock(text: string) {
  return { type: "header", text: { type: "plain_text", text, emoji: true } };
}

export function sectionMrkdwn(text: string) {
  return { type: "section", text: { type: "mrkdwn", text } };
}

export function contextBlock(text: string) {
  return {
    type: "context",
    elements: [{ type: "mrkdwn", text }],
  };
}

export function dividerBlock() {
  return { type: "divider" };
}

// ---------------------------------------------------------------------------
// Send message via Slack Web API
// ---------------------------------------------------------------------------

export async function sendSlackMessage(
  channel: string,
  blocks: unknown[],
  text: string,
): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    throw new Error("SLACK_BOT_TOKEN is not set");
  }

  const res = await fetch(SLACK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, blocks, text }),
  });

  if (!res.ok) {
    throw new Error(`Slack API HTTP error: ${res.status} ${res.statusText}`);
  }

  const body = (await res.json()) as { ok: boolean; error?: string };
  if (!body.ok) {
    throw new Error(`Slack API error: ${body.error ?? "unknown"}`);
  }
}
