"use client";

import { useState, useRef } from "react";
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
  agentNotes: string;
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
  agentNotes: "",
  mlsDescription: "",
  cmaData: "[]",
  cmaSummary: "",
  videoScript: "",
  fairHousingScan: "",
  sellerNotes: "",
};

const TABS = [
  { id: "details",    label: "Details" },
  { id: "mls",        label: "MLS Description" },
  { id: "cma",        label: "CMA" },
  { id: "video",      label: "Video Script" },
  { id: "compliance", label: "Fair Housing" },
  { id: "seller",     label: "Seller Notes" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface GenerateState {
  loading: boolean;
  preview: string;
  model: string;
  costUsd: number;
  error: string;
}

const emptyGen = (): GenerateState => ({
  loading: false, preview: "", model: "", costUsd: 0, error: "",
});

export default function ListingForm({ initial, listingId }: ListingFormProps) {
  const [form, setForm] = useState<ListingPayload>({ ...blank, ...initial });
  const [tab, setTab] = useState<TabId>("details");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [gen, setGen] = useState<GenerateState>(emptyGen());
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [extractedBanner, setExtractedBanner] = useState(false);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function set<K extends keyof ListingPayload>(k: K, v: ListingPayload[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetGen() { setGen(emptyGen()); }

  function acceptGen(field: keyof ListingPayload) {
    set(field, gen.preview as ListingPayload[typeof field]);
    resetGen();
  }

  async function generate(task: string) {
    if (!listingId) return;
    setGen({ loading: true, preview: "", model: "", costUsd: 0, error: "" });
    try {
      const res = await fetch(`/api/listings/${listingId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, agentNotes: form.agentNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setGen({
        loading: false,
        preview: data.text,
        model: data.model,
        costUsd: data.estimatedCostUsd,
        error: "",
      });
    } catch (e) {
      setGen({ loading: false, preview: "", model: "", costUsd: 0, error: String(e) });
    }
  }

  async function handleScreenshotUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setExtractError("");
    setExtractedBanner(false);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp";
      const res = await fetch("/api/listings/extract-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");
      if (data.address)   set("address",   data.address);
      if (data.city)      set("city",      data.city);
      if (data.state)     set("state",     data.state);
      if (data.price)     set("price",     data.price);
      if (data.bedrooms)  set("bedrooms",  data.bedrooms);
      if (data.bathrooms) set("bathrooms", data.bathrooms);
      if (data.sqft)      set("sqft",      data.sqft);
      if (data.yearBuilt) set("yearBuilt", data.yearBuilt);
      if (data.agentNotes) set("agentNotes", data.agentNotes);
      setExtractedBanner(true);
    } catch (err) {
      setExtractError(String(err));
    } finally {
      setExtracting(false);
      if (screenshotInputRef.current) screenshotInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
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
      setSaveError(String(e));
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const textareaCls = `${inputCls} min-h-[200px] resize-y font-mono text-xs`;

  // ── Generate panel shown under the textarea when preview exists ──────────
  function GenPanel({ field }: { field: keyof ListingPayload }) {
    if (gen.error) {
      return (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {gen.error}
        </p>
      );
    }
    if (!gen.preview) return null;
    return (
      <div className="border border-green-200 rounded-xl bg-green-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-green-700">AI Draft — review before accepting</span>
          <span className="text-xs text-green-600 font-mono">
            {gen.model.includes("haiku") ? "Haiku" : "Sonnet"} · ${gen.costUsd.toFixed(4)}
          </span>
        </div>
        <pre className="text-xs text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
          {gen.preview}
        </pre>
        <div className="flex gap-2">
          <button
            onClick={() => acceptGen(field)}
            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium"
          >
            Accept → paste into field
          </button>
          <button
            onClick={resetGen}
            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50"
          >
            Discard
          </button>
        </div>
      </div>
    );
  }

  // ── Generate button (disabled until listing is saved) ────────────────────
  function GenBtn({ task, label }: { task: string; label: string }) {
    const disabled = !listingId || gen.loading;
    return (
      <button
        onClick={() => { resetGen(); generate(task); }}
        disabled={disabled}
        title={!listingId ? "Save the listing first" : undefined}
        className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100"
      >
        {gen.loading ? "Generating…" : `✦ ${label}`}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); resetGen(); }}
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

      {/* ── Details ── */}
      {tab === "details" && (
        <div className="grid grid-cols-1 gap-4">

          {/* MLS Screenshot import */}
          <div className="border border-dashed border-amber-300 rounded-xl p-4 bg-amber-50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-medium text-gray-800">Import from MLS Screenshot</p>
                <p className="text-xs text-gray-500 mt-0.5">Upload a screenshot — AI (Haiku) extracts address, price, beds, baths, sqft automatically</p>
              </div>
              <div>
                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
                <button
                  onClick={() => screenshotInputRef.current?.click()}
                  disabled={extracting}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-amber-400 bg-white text-amber-800 hover:bg-amber-100 disabled:opacity-50 transition-colors"
                >
                  {extracting ? "Extracting…" : "📸 Upload MLS Screenshot"}
                </button>
              </div>
            </div>
            {extractError && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{extractError}</p>
            )}
            {extractedBanner && (
              <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                <p className="text-xs text-green-800">✓ Fields populated from screenshot — please review and correct</p>
                <button onClick={() => setExtractedBanner(false)} className="text-green-600 hover:text-green-900 text-xs ml-4">✕</button>
              </div>
            )}
          </div>

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
                { key: "price",     label: "List Price ($)" },
                { key: "bedrooms",  label: "Bedrooms" },
                { key: "bathrooms", label: "Bathrooms" },
                { key: "sqft",      label: "Sq Ft" },
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent Notes / Highlights
              <span className="ml-2 font-normal text-gray-400 text-xs">used by AI for all generation tasks</span>
            </label>
            <textarea
              value={form.agentNotes}
              onChange={(e) => set("agentNotes", e.target.value)}
              className={`${inputCls} min-h-[100px] resize-y`}
              placeholder="Renovated kitchen, new roof 2023, quiet cul-de-sac, walking distance to park…"
            />
          </div>
        </div>
      )}

      {/* ── MLS Description ── */}
      {tab === "mls" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">MLS Description</label>
            <GenBtn task="mls-description" label="Generate MLS Description" />
          </div>
          <textarea
            value={form.mlsDescription}
            onChange={(e) => set("mlsDescription", e.target.value)}
            className={textareaCls}
            placeholder="Paste or generate an MLS description…"
          />
          <GenPanel field="mlsDescription" />
        </div>
      )}

      {/* ── CMA ── */}
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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">CMA Summary</label>
              <GenBtn task="cma-summary" label="Generate CMA Summary" />
            </div>
            <textarea
              value={form.cmaSummary}
              onChange={(e) => set("cmaSummary", e.target.value)}
              className={textareaCls}
              placeholder="Pricing analysis and recommendation…"
            />
            <GenPanel field="cmaSummary" />
          </div>
        </div>
      )}

      {/* ── Video Script ── */}
      {tab === "video" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Video Script</label>
            <GenBtn task="video-script" label="Generate Video Script" />
          </div>
          <textarea
            value={form.videoScript}
            onChange={(e) => set("videoScript", e.target.value)}
            className={textareaCls}
            placeholder="Shooting script for the listing walkthrough video…"
          />
          <GenPanel field="videoScript" />
        </div>
      )}

      {/* ── Fair Housing ── */}
      {tab === "compliance" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Fair Housing Scan Results</label>
            <GenBtn task="fair-housing" label="Scan MLS Description" />
          </div>
          {!form.mlsDescription && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Fill in the MLS Description first — the scanner checks that text.
            </p>
          )}
          <textarea
            value={form.fairHousingScan}
            onChange={(e) => set("fairHousingScan", e.target.value)}
            className={textareaCls}
            placeholder="Run the scanner to check your MLS description for fair housing compliance…"
          />
          <GenPanel field="fairHousingScan" />
        </div>
      )}

      {/* ── Seller Notes ── */}
      {tab === "seller" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Seller Presentation Notes</label>
            <GenBtn task="seller-presentation" label="Generate Talking Points" />
          </div>
          <textarea
            value={form.sellerNotes}
            onChange={(e) => set("sellerNotes", e.target.value)}
            className={textareaCls}
            placeholder="Talking points for the seller presentation…"
          />
          <GenPanel field="sellerNotes" />
        </div>
      )}

      {saveError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {saveError}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
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
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-sm"
            >
              Export PDF
            </a>
            <a
              href={`/api/listings/${listingId}/export-docx`}
              target="_blank"
              className="px-5 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium text-sm"
            >
              Export Word
            </a>
          </>
        )}
      </div>
    </div>
  );
}
