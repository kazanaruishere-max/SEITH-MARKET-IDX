"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuickSearch() {
  const [ticker, setTicker] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = ticker.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (clean) {
      router.push(`/dossier/${clean}?market=id`);
      setTicker("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <div className="flex items-center rounded-[4px] border border-[#1E2638] bg-[#07090E] px-2 py-1 text-xs transition-colors focus-within:border-amber-400/80">
        <span className="font-mono text-[10px] font-bold text-amber-400 mr-1.5">&gt;</span>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="TICKER <GO> (e.g. BBCA)"
          aria-label="Quick Ticker Search"
          className="w-28 sm:w-36 bg-transparent font-mono text-[11px] uppercase tracking-wider text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <kbd className="hidden rounded-[2px] bg-[#131824] px-1 py-0.5 font-mono text-[9px] text-zinc-400 sm:inline">↵</kbd>
      </div>
    </form>
  );
}
