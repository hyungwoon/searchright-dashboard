"use client";
import { useState, useRef, useCallback } from "react";
import PasswordGate from "@/components/password-gate";
import { screens, withImpressions, typeIcons, prioColors, statStyles } from "./data";

export default function EventDesignPage() {
  const [sel, setSel] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const sc = screens[sel];
  const scEvents = withImpressions(sc.events);
  const all = screens.flatMap(s => withImpressions(s.events));

  const scrollToMarker = useCallback((no: number) => {
    setHover(no);
    const marker = sc.markers.find(m => m.no === no);
    if (!marker || !imgRef.current) return;
    const container = imgRef.current;
    const scrollTarget = (marker.y / 100) * container.scrollHeight - container.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, scrollTarget), behavior: "smooth" });
  }, [sc.markers]);

  return (
    <PasswordGate>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <header className="mb-6">
          <a href="/" className="text-[#64748b] hover:text-white text-sm cursor-pointer">&larr; 대시보드</a>
          <h1 className="text-2xl font-bold tracking-tight mt-2">GA4 이벤트 설계서</h1>
          <p className="text-sm text-[#64748b]">번호 마커 = 스크린샷 위치 · 호버 시 연동 · 2026-03-23</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
          {Object.entries(typeIcons).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 px-3 py-2 bg-[#111827] rounded-lg text-xs">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: v.color }}>{v.icon}</span>
              <span className="text-[#94a3b8]">{v.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="kpi-card"><div className="text-xs text-[#64748b] uppercase mb-1">미설치 (즉시)</div><div className="text-2xl font-bold text-[#f43f5e]">{all.filter(e => e.status === "missing").length}</div></div>
          <div className="kpi-card"><div className="text-xs text-[#64748b] uppercase mb-1">신규 추가</div><div className="text-2xl font-bold text-[#3b82f6]">{all.filter(e => e.status === "new").length}</div></div>
          <div className="kpi-card"><div className="text-xs text-[#64748b] uppercase mb-1">설치됨</div><div className="text-2xl font-bold text-[#10b981]">{all.filter(e => e.status === "exists").length}</div></div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-6 bg-[#0a0f1a] rounded-lg p-1">
          {screens.map((s, i) => (
            <button key={s.page} onClick={() => { setSel(i); setHover(null); }}
              className={`px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${sel === i ? "bg-[#3b82f6] text-white shadow-lg" : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"}`}>
              {s.page}
              {s.events.some(e => e.status === "missing") && <span className="ml-1 w-2 h-2 rounded-full bg-[#f43f5e] inline-block" />}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card" style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h2 className="text-lg font-semibold">{sc.page}</h2>
              <span className="text-xs text-[#64748b] font-mono">{sc.url}</span>
            </div>
            <p className="text-xs text-[#94a3b8] mb-4 shrink-0">{sc.desc}</p>
            <div ref={imgRef} className="relative rounded-xl overflow-y-auto overflow-x-hidden border border-[#1f2937] flex-1" style={{ scrollBehavior: "smooth" }}>
              <div className="relative">
                <img src={sc.image} alt={sc.page} className="w-full" />
                {sc.markers.map((m, mi) => (
                  <div key={mi} className="absolute flex items-center gap-1 cursor-pointer transition-all"
                    style={{ left: `${m.x}%`, top: `${m.y}%`, transform: "translate(-50%, -50%)", zIndex: hover === m.no ? 20 : 10 }}
                    onMouseEnter={() => setHover(m.no)} onMouseLeave={() => setHover(null)}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform ${hover === m.no ? "scale-125" : ""}`}
                      style={{ background: hover === m.no ? "#f43f5e" : "#3b82f6", boxShadow: "0 0 0 3px rgba(0,0,0,0.5)" }}>
                      {m.no}
                    </span>
                    {hover === m.no && (
                      <span className="bg-[#0f172a] text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-[#334155]">{m.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card overflow-y-auto" style={{ maxHeight: "85vh" }}>
            <h2 className="text-lg font-semibold mb-1">이벤트 ({scEvents.length}건)</h2>
            <p className="text-xs text-[#64748b] mb-4">E(노출) = 클릭 CTR 산출용 impression 자동 페어링</p>
            <div className="space-y-2.5">
              {scEvents.map((ev, i) => {
                const ti = typeIcons[ev.type];
                const st = statStyles[ev.status];
                return (
                  <div key={i} className={`rounded-xl p-3.5 transition-all ${hover === ev.no ? "bg-[#1e293b] ring-1 ring-[#3b82f6]" : "bg-[#0f172a]"}`}
                    style={{ borderLeft: `3px solid ${st.text}` }}
                    onMouseEnter={() => scrollToMarker(ev.no)} onMouseLeave={() => setHover(null)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#3b82f6" }}>{ev.no === 0 ? "—" : ev.no === 99 ? "↕" : ev.no}</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: ti.color }}>{ti.icon}</span>
                      <code className="text-sm font-semibold text-[#e2e8f0] font-mono">{ev.name}</code>
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium ml-auto" style={{ background: prioColors[ev.priority] + "20", color: prioColors[ev.priority] }}>{ev.priority}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: st.bg, color: st.text }}>{st.label}</span>
                    </div>
                    <div className="text-xs text-[#94a3b8] ml-[3.25rem]">{ev.trigger}</div>
                    <div className="text-xs text-[#475569] font-mono ml-[3.25rem] mt-0.5">{ev.params}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-[#475569] pb-8">
          GA4 이벤트 설계서 · SearcHRight AI · 2026-03-23
        </footer>
      </main>
    </PasswordGate>
  );
}
