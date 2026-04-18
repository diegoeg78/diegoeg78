"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteListingButton({
  listingId,
  address,
  variant = "small",
}: {
  listingId: number;
  address: string;
  variant?: "small" | "large";
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${address}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const text = await res.text();
        throw new Error(text || "Delete failed");
      }
      if (variant === "large") {
        router.push("/listings");
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(String(e));
      setDeleting(false);
    }
  }

  const cls =
    variant === "large"
      ? "px-4 py-2 text-sm font-medium border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
      : "px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50";

  return (
    <>
      <button onClick={handleDelete} disabled={deleting} className={cls}>
        {deleting ? "Deleting…" : variant === "large" ? "Delete Listing" : "Delete"}
      </button>
      {error && <span className="text-xs text-red-600 ml-2">{error}</span>}
    </>
  );
}
