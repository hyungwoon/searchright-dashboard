export type Period = "7d" | "14d" | "30d" | "90d";

export const periodLabels: Record<Period, string> = {
  "7d": "최근 7일",
  "14d": "최근 14일",
  "30d": "최근 30일",
  "90d": "최근 90일",
};

export const periodKpis: Record<Period, {
  sessions: number; users: number; pageviews: number; engRate: number; bounceRate: number;
  prev: { sessions: number; users: number; pageviews: number; engRate: number; bounceRate: number };
}> = {
  "7d": {
    sessions: 713, users: 430, pageviews: 2581, engRate: 52.7, bounceRate: 47.3,
    prev: { sessions: 607, users: 394, pageviews: 1727, engRate: 53.5, bounceRate: 46.5 },
  },
  "14d": {
    sessions: 1323, users: 795, pageviews: 4308, engRate: 53.1, bounceRate: 46.9,
    prev: { sessions: 1029, users: 596, pageviews: 3762, engRate: 58.8, bounceRate: 41.2 },
  },
  "30d": {
    sessions: 2405, users: 1461, pageviews: 6266, engRate: 52.8, bounceRate: 47.2,
    prev: { sessions: 1720, users: 1026, pageviews: 5658, engRate: 57.7, bounceRate: 42.3 },
  },
  "90d": {
    sessions: 6452, users: 3730, pageviews: 19420, engRate: 52.2, bounceRate: 47.8,
    prev: { sessions: 5357, users: 3167, pageviews: 11498, engRate: 53.7, bounceRate: 46.3 },
  },
};

type DayRow = { date: string; sessions: number; users: number; pageviews: number };

const raw90d: DayRow[] = [
  {date:"12/23",sessions:64,users:46,pageviews:103},{date:"12/24",sessions:41,users:31,pageviews:83},
  {date:"12/25",sessions:11,users:11,pageviews:26},{date:"12/26",sessions:65,users:32,pageviews:250},
  {date:"12/27",sessions:7,users:6,pageviews:14},{date:"12/28",sessions:19,users:13,pageviews:38},
  {date:"12/29",sessions:57,users:37,pageviews:142},{date:"12/30",sessions:56,users:41,pageviews:149},
  {date:"12/31",sessions:35,users:19,pageviews:107},{date:"1/1",sessions:18,users:14,pageviews:41},
  {date:"1/2",sessions:65,users:41,pageviews:290},{date:"1/3",sessions:23,users:15,pageviews:55},
  {date:"1/4",sessions:19,users:18,pageviews:20},{date:"1/5",sessions:84,users:54,pageviews:506},
  {date:"1/6",sessions:94,users:62,pageviews:376},{date:"1/7",sessions:146,users:112,pageviews:315},
  {date:"1/8",sessions:165,users:105,pageviews:538},{date:"1/9",sessions:230,users:176,pageviews:1050},
  {date:"1/10",sessions:86,users:80,pageviews:113},{date:"1/11",sessions:74,users:70,pageviews:80},
  {date:"1/12",sessions:190,users:152,pageviews:782},{date:"1/13",sessions:129,users:92,pageviews:286},
  {date:"1/14",sessions:138,users:109,pageviews:342},{date:"1/15",sessions:153,users:110,pageviews:604},
  {date:"1/16",sessions:112,users:90,pageviews:191},{date:"1/17",sessions:38,users:32,pageviews:42},
  {date:"1/18",sessions:43,users:43,pageviews:50},{date:"1/19",sessions:116,users:93,pageviews:330},
  {date:"1/20",sessions:98,users:74,pageviews:166},{date:"1/21",sessions:56,users:42,pageviews:99},
  {date:"1/22",sessions:70,users:50,pageviews:146},{date:"1/23",sessions:45,users:32,pageviews:72},
  {date:"1/24",sessions:25,users:21,pageviews:25},{date:"1/25",sessions:19,users:14,pageviews:27},
  {date:"1/26",sessions:62,users:43,pageviews:149},{date:"1/27",sessions:68,users:50,pageviews:203},
  {date:"1/28",sessions:108,users:69,pageviews:330},{date:"1/29",sessions:70,users:38,pageviews:283},
  {date:"1/30",sessions:77,users:49,pageviews:256},{date:"1/31",sessions:12,users:11,pageviews:18},
  {date:"2/1",sessions:13,users:11,pageviews:14},{date:"2/2",sessions:58,users:49,pageviews:178},
  {date:"2/3",sessions:77,users:53,pageviews:308},{date:"2/4",sessions:81,users:63,pageviews:188},
  {date:"2/5",sessions:88,users:62,pageviews:175},{date:"2/6",sessions:48,users:41,pageviews:94},
  {date:"2/7",sessions:28,users:25,pageviews:35},{date:"2/8",sessions:48,users:44,pageviews:56},
  {date:"2/9",sessions:98,users:85,pageviews:199},{date:"2/10",sessions:39,users:34,pageviews:100},
  {date:"2/11",sessions:56,users:36,pageviews:154},{date:"2/12",sessions:68,users:44,pageviews:221},
  {date:"2/13",sessions:36,users:27,pageviews:165},{date:"2/14",sessions:12,users:8,pageviews:33},
  {date:"2/15",sessions:10,users:10,pageviews:24},{date:"2/16",sessions:11,users:11,pageviews:22},
  {date:"2/17",sessions:8,users:5,pageviews:9},{date:"2/18",sessions:15,users:9,pageviews:26},
  {date:"2/19",sessions:82,users:49,pageviews:316},{date:"2/20",sessions:71,users:49,pageviews:261},
  {date:"2/21",sessions:8,users:6,pageviews:14},{date:"2/22",sessions:23,users:21,pageviews:61},
  {date:"2/23",sessions:78,users:44,pageviews:302},{date:"2/24",sessions:116,users:69,pageviews:463},
  {date:"2/25",sessions:86,users:47,pageviews:534},{date:"2/26",sessions:69,users:37,pageviews:556},
  {date:"2/27",sessions:96,users:58,pageviews:514},{date:"2/28",sessions:16,users:13,pageviews:25},
  {date:"3/1",sessions:30,users:27,pageviews:57},{date:"3/2",sessions:25,users:23,pageviews:46},
  {date:"3/3",sessions:83,users:63,pageviews:284},{date:"3/4",sessions:100,users:71,pageviews:427},
  {date:"3/5",sessions:145,users:106,pageviews:258},{date:"3/6",sessions:131,users:104,pageviews:227},
  {date:"3/7",sessions:41,users:31,pageviews:52},{date:"3/8",sessions:16,users:10,pageviews:17},
  {date:"3/9",sessions:157,users:102,pageviews:459},{date:"3/10",sessions:126,users:86,pageviews:216},
  {date:"3/11",sessions:85,users:66,pageviews:308},{date:"3/12",sessions:108,users:74,pageviews:407},
  {date:"3/13",sessions:76,users:63,pageviews:274},{date:"3/14",sessions:23,users:19,pageviews:24},
  {date:"3/15",sessions:32,users:24,pageviews:39},{date:"3/16",sessions:131,users:102,pageviews:402},
  {date:"3/17",sessions:131,users:89,pageviews:501},{date:"3/18",sessions:123,users:73,pageviews:644},
  {date:"3/19",sessions:110,users:75,pageviews:396},{date:"3/20",sessions:135,users:87,pageviews:529},
  {date:"3/21",sessions:37,users:28,pageviews:49},{date:"3/22",sessions:47,users:38,pageviews:60},
  {date:"3/23",sessions:94,users:76,pageviews:170},{date:"3/24",sessions:96,users:68,pageviews:226},
  {date:"3/25",sessions:87,users:68,pageviews:182},{date:"3/26",sessions:82,users:67,pageviews:109},
  {date:"3/27",sessions:67,users:52,pageviews:125},{date:"3/28",sessions:19,users:18,pageviews:24},
  {date:"3/29",sessions:22,users:18,pageviews:30},{date:"3/30",sessions:91,users:72,pageviews:233},
  {date:"3/31",sessions:119,users:101,pageviews:193},{date:"4/1",sessions:108,users:90,pageviews:172},
  {date:"4/2",sessions:89,users:73,pageviews:136},{date:"4/3",sessions:79,users:64,pageviews:186},
  {date:"4/4",sessions:42,users:35,pageviews:56},{date:"4/5",sessions:31,users:28,pageviews:43},
  {date:"4/6",sessions:5,users:5,pageviews:4},
];

export function getDailyTrend(period: Period): DayRow[] {
  const len = raw90d.length;
  const days = period === "7d" ? 7 : period === "14d" ? 14 : period === "30d" ? 30 : len;
  return raw90d.slice(Math.max(0, len - days));
}

export type ChannelRow = { name: string; sessions: number; users: number; pageviews: number; engRate: number };
export const periodChannels: Record<Period, ChannelRow[]> = {
  "7d": [
    { name: "Organic Search", sessions: 242, users: 123, pageviews: 1184, engRate: 62.0 },
    { name: "Direct", sessions: 194, users: 156, pageviews: 516, engRate: 48.5 },
    { name: "Organic Social", sessions: 146, users: 69, pageviews: 420, engRate: 51.4 },
    { name: "Paid Social", sessions: 63, users: 61, pageviews: 106, engRate: 22.2 },
    { name: "Referral", sessions: 33, users: 17, pageviews: 168, engRate: 72.7 },
    { name: "Unassigned", sessions: 23, users: 11, pageviews: 168, engRate: 60.9 },
    { name: "Paid Search", sessions: 10, users: 9, pageviews: 13, engRate: 40.0 },
  ],
  "14d": [
    { name: "Organic Search", sessions: 408, users: 221, pageviews: 1682, engRate: 64.2 },
    { name: "Organic Social", sessions: 348, users: 195, pageviews: 766, engRate: 49.4 },
    { name: "Direct", sessions: 321, users: 261, pageviews: 884, engRate: 47.7 },
    { name: "Paid Social", sessions: 95, users: 91, pageviews: 184, engRate: 24.2 },
    { name: "Referral", sessions: 71, users: 30, pageviews: 394, engRate: 67.6 },
    { name: "Unassigned", sessions: 57, users: 19, pageviews: 278, engRate: 57.9 },
    { name: "Paid Search", sessions: 15, users: 13, pageviews: 108, engRate: 46.7 },
  ],
  "30d": [
    { name: "Organic Search", sessions: 766, users: 437, pageviews: 2317, engRate: 60.3 },
    { name: "Organic Social", sessions: 656, users: 399, pageviews: 1268, engRate: 51.8 },
    { name: "Direct", sessions: 576, users: 443, pageviews: 1365, engRate: 47.4 },
    { name: "Referral", sessions: 129, users: 56, pageviews: 539, engRate: 63.6 },
    { name: "Paid Social", sessions: 116, users: 105, pageviews: 209, engRate: 28.4 },
    { name: "Unassigned", sessions: 82, users: 28, pageviews: 353, engRate: 54.9 },
    { name: "Paid Search", sessions: 40, users: 37, pageviews: 140, engRate: 47.5 },
    { name: "Email", sessions: 32, users: 28, pageviews: 67, engRate: 43.8 },
  ],
  "90d": [
    { name: "Organic Search", sessions: 1903, users: 1019, pageviews: 5919, engRate: 64.0 },
    { name: "Direct", sessions: 1776, users: 1273, pageviews: 5286, engRate: 54.1 },
    { name: "Organic Social", sessions: 1001, users: 674, pageviews: 1996, engRate: 44.2 },
    { name: "Paid Social", sessions: 765, users: 658, pageviews: 1101, engRate: 28.6 },
    { name: "Unassigned", sessions: 410, users: 66, pageviews: 2967, engRate: 66.6 },
    { name: "Referral", sessions: 379, users: 143, pageviews: 1817, engRate: 57.3 },
    { name: "Email", sessions: 49, users: 23, pageviews: 140, engRate: 63.3 },
  ],
};

export type EventRow = { name: string; key: string; count: number; users: number; color: string; desc: string };
const eventMeta: Record<string, { name: string; color: string; desc: string }> = {
  Request_landing_cta_home: { name: "홈 CTA 클릭", color: "#3b82f6", desc: "홈페이지 '문의하기' 버튼 클릭" },
  click: { name: "아웃바운드 클릭", color: "#6366f1", desc: "외부 링크 클릭 (GA4 자동 수집)" },
  blog_post_view: { name: "블로그 포스트 뷰", color: "#a855f7", desc: "블로그 글 진입" },
  form_start: { name: "폼 작성 시작", color: "#8b5cf6", desc: "로그인/문의 폼 첫 입력 시작" },
  demo_landing_cta: { name: "데모 CTA", color: "#c084fc", desc: "홈페이지 '데모 체험' 버튼 클릭" },
  PRdeck_download: { name: "PR 덱 다운로드", color: "#f59e0b", desc: "회사소개서(PR덱) PDF 다운로드" },
  inquiry_page_view: { name: "문의 페이지 진입", color: "#10b981", desc: "/request/ 페이지 로드" },
  inquiry_form_start: { name: "문의 폼 입력", color: "#14b8a6", desc: "문의 폼 첫 입력" },
  inquiry_generate_lead: { name: "리드 전환", color: "#22c55e", desc: "문의 폼 제출 완료" },
  blog_cta_click: { name: "블로그 CTA", color: "#f43f5e", desc: "블로그 내 CTA 배너 클릭" },
  generate_lead: { name: "리드 전환(구)", color: "#10b981", desc: "/contact/ 문의 폼 제출 완료 (레거시)" },
  Request_landing_cta_demo: { name: "데모 요청 CTA", color: "#f43f5e", desc: "메인페이지 데모 요청 버튼 클릭" },
  Blog_ebook_download_click: { name: "이북 다운로드", color: "#ec4899", desc: "블로그 eBook 다운로드 클릭" },
};
const rawEvents: Record<Period, [string, number, number][]> = {
  "7d": [["Request_landing_cta_home",171,28],["click",103,32],["form_start",99,45],["demo_landing_cta",50,20],["PRdeck_download",34,18],["Request_landing_cta_demo",6,4]],
  "14d": [["Request_landing_cta_home",354,67],["click",171,51],["form_start",156,62],["demo_landing_cta",108,36],["PRdeck_download",71,34],["blog_cta_click",11,1],["Request_landing_cta_demo",9,7]],
  "30d": [["Request_landing_cta_home",494,93],["click",309,81],["blog_post_view",205,108],["form_start",192,77],["demo_landing_cta",117,42],["PRdeck_download",99,49],["inquiry_page_view",30,19],["blog_cta_click",14,3],["inquiry_form_start",5,5],["inquiry_generate_lead",4,4]],
  "90d": [["click",1338,260],["Request_landing_cta_home",1175,166],["form_start",689,243],["PRdeck_download",659,185],["demo_landing_cta",240,75],["generate_lead",39,10],["Request_landing_cta_demo",29,16],["blog_cta_click",11,1],["Blog_ebook_download_click",10,6]],
};
export function getEvents(period: Period): EventRow[] {
  return rawEvents[period].map(([key, count, users]) => ({
    key, count, users, ...eventMeta[key],
  }));
}

export type DeviceRow = { name: string; value: number; users: number; engRate: number; color: string };
export const periodDevices: Record<Period, DeviceRow[]> = {
  "7d": [
    { name: "Desktop", value: 544, users: 286, engRate: 58.8, color: "#3b82f6" },
    { name: "Mobile", value: 179, users: 148, engRate: 37.4, color: "#10b981" },
    { name: "Tablet", value: 3, users: 3, engRate: 0, color: "#f59e0b" },
  ],
  "14d": [
    { name: "Desktop", value: 997, users: 508, engRate: 59.9, color: "#3b82f6" },
    { name: "Mobile", value: 336, users: 289, engRate: 35.4, color: "#10b981" },
    { name: "Tablet", value: 5, users: 5, engRate: 0, color: "#f59e0b" },
  ],
  "30d": [
    { name: "Desktop", value: 1822, users: 964, engRate: 57.7, color: "#3b82f6" },
    { name: "Mobile", value: 590, users: 498, engRate: 39.5, color: "#10b981" },
    { name: "Tablet", value: 7, users: 7, engRate: 14.3, color: "#f59e0b" },
  ],
  "90d": [
    { name: "Desktop", value: 4699, users: 2236, engRate: 60.0, color: "#3b82f6" },
    { name: "Mobile", value: 1710, users: 1484, engRate: 32.2, color: "#10b981" },
    { name: "Tablet", value: 30, users: 26, engRate: 23.3, color: "#f59e0b" },
  ],
};

export type FunnelStep = { stage: string; value: number; rate: number };
export function getFunnel(period: Period): FunnelStep[] {
  const total = periodKpis[period].users;
  // New inquiry event-based funnel
  const inquiryFunnelData: Record<Period, { pageView: number; formStart: number; lead: number }> = {
    "7d": { pageView: 8, formStart: 3, lead: 2 },
    "14d": { pageView: 15, formStart: 4, lead: 3 },
    "30d": { pageView: 19, formStart: 5, lead: 4 },
    "90d": { pageView: 19, formStart: 5, lead: 4 },
  };
  const d = inquiryFunnelData[period];
  const r = (v: number) => Math.round(v / total * 1000) / 10;
  return [
    { stage: "전체 방문자", value: total, rate: 100 },
    { stage: "문의 페이지 진입", value: d.pageView, rate: r(d.pageView) },
    { stage: "폼 입력 시작", value: d.formStart, rate: r(d.formStart) },
    { stage: "문의 제출 완료", value: d.lead, rate: r(d.lead) },
  ];
}
