"use client";
import { useState, useEffect } from "react";

const HASH = "a3f7c2d1e8b94056"; // derived check

function check(pw: string): boolean {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
  }
  return h === -966255137;
}

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("sr_dash_auth");
    if (stored === HASH) setAuthed(true);
    setLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (check(input)) {
      sessionStorage.setItem("sr_dash_auth", HASH);
      setAuthed(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  if (loading) return null;
  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 via-transparent to-purple-600/3" />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-semibold text-2xl shadow-2xl shadow-blue-500/30">S</div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-white/90">SearcHRight Analytics</h1>
            <p className="text-[13px] text-white/30 mt-1">비밀번호를 입력하세요</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-black/20">
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.05] border text-white text-sm outline-none transition-all placeholder:text-white/20 ${
              error ? "border-red-500/50" : "border-white/[0.08] focus:border-blue-500/40 focus:bg-white/[0.07]"
            }`}
          />
          <button
            type="submit"
            className="w-full mt-3 px-4 py-3.5 rounded-xl bg-blue-500/90 hover:bg-blue-500 text-white text-sm font-medium transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-500/20"
          >
            접속
          </button>
          {error && <p className="text-red-400/80 text-xs text-center mt-3">비밀번호가 틀렸습니다</p>}
        </form>
      </div>
    </div>
  );
}
