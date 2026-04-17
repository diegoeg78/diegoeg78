"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ListingFormProps {
  initial?: Partial<ListingPayload>;
  listingId?: number;
}

export interface ListingPayload {
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  mlsDescription: string;
  cmaData: string;
  cmaSummary: string;
  videoScript: string;
  fairHousingScan: string;
  sellerNotes: string;
}

const blank: ListingPayload = {
  address: "",
  city: "",
  state: "",
  price: 0,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 0,
  yearBuilt: 0,
  mlsDescription: "",
  cmaData: "[]",
  cmaSummary: "",
  videoScript: "",
  fairHousingScan: "",
  sellerNotes: "",
};

const TABS = [
  { id: "details", label: "Details" },
  { id: "mls", label: "MLS Description" },
  { id: "cma", label: "CMA" },
  { id: "video", label: "Video Script" },
  { id: "compliance", label: "Fair Housing" },
  { id: "seller", label: "Seller Notes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ListingForm({ initial, listingId }: ListingFormProps) {
  const [form, setForm] = useState<ListingPayload>({ ...blank, ...initial });
  const [tab, setTab] = useState<TabId>("details");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function set<K extends keyof ListingPayload>(k: K, v: ListingPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const url = listingId ? `/api/listings/${listingId}` : "/api/listings";
      const method = listingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      if (!listingId) router.push(`/listings/${saved.id}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const textareaCls = `${inputCls} min-h-[220px] resize-y font-mono text-xs`;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.id
                ? "bg-white border border-b-white border-gray-200 -mb-px text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Details tab */}
      {tab === "details" && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input type="text" value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls} maxLength={2} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(
              [
                { key: "price", label: "List Price ($)" },
                { key: "bedrooms", label: "Bedrooms" },
                { key: "bathrooms", label: "Bathrooms" },
                { key: "sqft", label: "Sq Ft" },
                { key: "yearBuilt", label: "Year Built" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={form[key] || ""}
                  onChange={(e) => set(key, parseFloat(e.target.value) || 0)}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "mls" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">MLS Description</label>
          <textarea value={form.mlsDescription} onChange={(e) => set("mlsDescription", e.target.value)} className={textareaCls} placeholder="Paste or type the AI-generated MLS description..." />
        </div>
      )}

      {tab === "cma" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comparable Sales (JSON array)
            </label>
            <textarea
              value={form.cmaData}
              onChange={(e) => set("cmaData", e.target.value)}
              className={textareaCls}
              placeholder={`[\n  {\n    "address": "123 Elm St",\n    "price": 485000,\n    "sqft": 1850,\n    "beds": 3,\n    "baths": 2,\n    "soldDate": "2025-03-15"\n  }\n]`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CMA Summary</label>
            <textarea value={form.cmaSummary} onChange={(e) => set("cmaSummary", e.target.value)} className={textareaCls} placeholder="Pricing analysis and recommendation..." />
          </div>
        </div>
      )}

      {tab === "video" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Video Script</label>
          <textarea value={form.videoScript} onChange={(e) => set("videoScript", e.target.value)} className={textareaCls} placeholder="Paste the AI-generated video script..." />
        </div>
      )}

      {tab === "compliance" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fair Housing Scan Results</label>
          <textarea value={form.fairHousingScan} onChange={(e) => set("fairHousingScan", e.target.value)} className={textareaCls} placeholder="Fair housing compliance analysis..." />
        </div>
      )}

      {tab === "seller" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seller Presentation Notes</label>
          <textarea value={form.sellerNotes} onChange={(e) => set("sellerNotes", e.target.value)} className={textareaCls} placeholder="Notes and talking points for the seller presentation..." />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50"
        >
          {saving ? "Saving…" : listingId ? "Save Changes" : "Create Listing"}
        </button>
        {listingId && (
          <>
            <a
              href={`/api/listings/${listingId}/export-pdf`}
              target="_blank"
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-sm inline-flex items-center gap-2"
            >
              Export PDF
            </a>
            <a
              href={`/api/listings/${listingId}/export-docx`}
              target="_blank"
              className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium text-sm inline-flex items-center gap-2"
            >
              Export Word
            </a>
          </>
        )}
      </div>
    </div>
  );
}
