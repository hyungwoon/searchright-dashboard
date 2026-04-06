"use client";

export function InsightBox({ comments }: { comments: string[] }) {
  return (
    <div className="mt-3 space-y-2">
      {comments.map((c, i) => (
        <div key={i} className="flex gap-2.5 text-xs leading-relaxed text-white/60 backdrop-blur-xl bg-white/[0.025] border border-white/[0.05] border-l-2 border-l-blue-500/40 rounded-xl px-4 py-3 transition-all hover:bg-white/[0.04] hover:border-l-blue-500/60">
          <span className="text-blue-400/70 font-semibold shrink-0 text-[11px]">i</span>
          <span>{c}</span>
        </div>
      ))}
    </div>
  );
}

export function SummaryBanner({ headline, body, grade, gradeReason, analyzedAt }: {
  headline: string; body: string; grade: string; gradeReason: string; analyzedAt: string;
}) {
  const gradeColor = grade.startsWith("A") ? "#10b981" : grade.startsWith("B") ? "#f59e0b" : grade.startsWith("C") ? "#f97316" : "#f43f5e";
  return (
    <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/[0.06] to-purple-500/[0.03] border border-blue-500/15 rounded-[20px] p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-md bg-blue-500/15 flex items-center justify-center text-blue-400 text-[10px] font-bold">A</div>
            <span className="text-[11px] text-white/30 tracking-wide">분석 리포트 · {analyzedAt}</span>
          </div>
          <h3 className="text-sm font-semibold text-white/85 mb-2">{headline}</h3>
          <p className="text-xs text-white/40 leading-relaxed">{body}</p>
        </div>
        <div className="flex flex-col items-center justify-center px-6 py-4 backdrop-blur-md bg-white/[0.03] border border-white/[0.06] rounded-2xl min-w-[110px]">
          <div className="text-[11px] text-white/30 mb-1.5">종합 등급</div>
          <div className="text-3xl font-bold tracking-tight" style={{ color: gradeColor }}>{grade}</div>
          <div className="text-[11px] text-white/20 mt-1.5 text-center">{gradeReason}</div>
        </div>
      </div>
    </div>
  );
}
