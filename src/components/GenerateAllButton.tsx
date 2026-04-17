"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  listingId: number;
}

type Phase = "idle" | "batch1" | "batch2" | "done" | "error";

const PHASE_LABEL: Record<Phase, string> = {
  idle:   "✦ Generate All",
  batch1: "Running MLS · CMA · Video…",
  batch2: "Running Fair Housing · Seller…",
  done:   "Done — refresh to see",
  error:  "Error — try again",
};

export default function GenerateAllButton({ listingId }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [cost, setCost]   = useState<number | null>(null);
  const [err, setErr]     = useState("");
  const router = useRouter();

  async function handleClick() {
    if (phase !== "idle" && phase !== "error" && phase !== "done") return;
    setPhase("batch1");
    setErr("");
    setCost(null);

    try {
      // The server runs both batches internally; we just show progress phases
      // Switch label to batch2 halfway through (optimistic UX)
      const timer = setTimeout(() => setPhase("batch2"), 4000);

      const res = await fetch(`/api/listings/${listingId}/generate-all`, {
        method: "POST",
      });
      clearTimeout(timer);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Generation failed");
      }

      const data = await res.json();
      setCost(data.totalCostUsd);
      setPhase("done");
      router.refresh();
    } catch (e) {
      setErr(String(e));
      setPhase("error");
    }
  }

  const isRunning = phase === "batch1" || phase === "batch2";

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleClick}
        disabled={isRunning}
        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all disabled:cursor-wait ${
          phase === "done"
            ? "bg-green-50 border-green-300 text-green-700"
            : phase === "error"
            ? "bg-red-50 border-red-300 text-red-700"
            : "bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100"
        }`}
      >
        {isRunning && (
          <span className="inline-block w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin mr-1.5 align-[-2px]" />
        )}
        {PHASE_LABEL[phase]}
      </button>
      {phase === "done" && cost !== null && (
        <span className="text-xs text-gray-400">AI cost: ${cost.toFixed(4)}</span>
      )}
      {err && <span className="text-xs text-red-500">{err}</span>}
    </div>
  );
}
