"use client";

import { useEffect, useState } from "react";

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary text-primary-foreground w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono">
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function CountdownTimer({
  targetSecs,
  targetDate,
}: {
  targetSecs?: number;
  targetDate?: string | Date;
}) {
  const computeRemaining = () => {
    if (targetDate) {
      const diff = Math.floor((new Date(targetDate).getTime() - Date.now()) / 1000);
      return Math.max(0, diff);
    }
    return targetSecs ?? 4 * 3600 + 23 * 60;
  };

  const [secs, setSecs] = useState<number>(computeRemaining);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSecs(computeRemaining());
    const timer = setInterval(() => {
      setSecs((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, targetSecs]);

  const currentSecs = mounted ? secs : (targetSecs ?? 4 * 3600 + 23 * 60);
  const d = Math.floor(currentSecs / 86400);
  const h = Math.floor((currentSecs % 86400) / 3600);
  const m = Math.floor((currentSecs % 3600) / 60);
  const s = currentSecs % 60;

  return (
    <div className="flex items-end gap-1.5 sm:gap-2" suppressHydrationWarning>
      {d > 0 && (
        <>
          <TimeBox value={d} label="Días" />
          <span className="text-primary font-bold text-xl mb-5">:</span>
        </>
      )}
      <TimeBox value={h} label="Hs" />
      <span className="text-primary font-bold text-xl mb-5">:</span>
      <TimeBox value={m} label="Min" />
      <span className="text-primary font-bold text-xl mb-5">:</span>
      <TimeBox value={s} label="Seg" />
    </div>
  );
}
