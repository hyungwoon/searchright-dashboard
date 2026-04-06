"use client";
import { Period, periodLabels } from "@/lib/period-data";

export default function DatePicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  const periods: Period[] = ["7d", "14d", "30d", "90d"];
  return (
    <div className="flex gap-0.5 backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
            value === p
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              : "text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          {periodLabels[p]}
        </button>
      ))}
    </div>
  );
}
