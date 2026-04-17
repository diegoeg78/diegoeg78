"use client";

import { useState, useEffect } from "react";

interface Profile {
  agentName: string;
  phone: string;
  email: string;
  website: string;
  overlayPosition: string;
  bgColor: string;
  textColor: string;
  opacity: number;
  fontSize: number;
}

const defaults: Profile = {
  agentName: "",
  phone: "",
  email: "",
  website: "",
  overlayPosition: "bottom-right",
  bgColor: "#000000",
  textColor: "#ffffff",
  opacity: 0.6,
  fontSize: 22,
};

export default function BrandingProfileForm() {
  const [form, setForm] = useState<Profile>(defaults);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/branding-profile")
      .then((r) => r.json())
      .then((data) => { if (data.agentName) setForm({ ...defaults, ...data }); });
  }, []);

  function set(field: keyof Profile, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/branding-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {(["agentName", "phone", "email", "website"] as const).map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {field === "agentName" ? "Agent Name" : field}
          </label>
          <input
            type="text"
            value={form[field] as string}
            onChange={(e) => set(field, e.target.value)}
            required={field !== "website"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select
            value={form.overlayPosition}
            onChange={(e) => set("overlayPosition", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="bottom-right">Bottom</option>
            <option value="top-left">Top</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
          <input type="color" value={form.bgColor} onChange={(e) => set("bgColor", e.target.value)} className="w-full h-10 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
          <input type="color" value={form.textColor} onChange={(e) => set("textColor", e.target.value)} className="w-full h-10 border border-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Opacity: {form.opacity}
          </label>
          <input
            type="range" min="0.1" max="1" step="0.05"
            value={form.opacity}
            onChange={(e) => set("opacity", parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font size: {form.fontSize}px
          </label>
          <input
            type="range" min="12" max="36" step="1"
            value={form.fontSize}
            onChange={(e) => set("fontSize", parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
      >
        Save Profile
      </button>
      {saved && <span className="text-green-600 text-sm ml-3">Saved!</span>}
    </form>
  );
}
