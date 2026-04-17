"use client";

import { useState, useRef } from "react";

interface BrandedImage {
  dataUrl: string;
  name: string;
}

export default function PhotoBrandingPanel() {
  const [images, setImages] = useState<BrandedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("photos", f));

    const res = await fetch("/api/photos/brand", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Branding failed");
      setLoading(false);
      return;
    }

    const { images: dataUrls } = await res.json();
    setImages(
      dataUrls.map((url: string, i: number) => ({
        dataUrl: url,
        name: files[i]?.name ?? `photo-${i + 1}.jpg`,
      }))
    );
    setLoading(false);
  }

  async function downloadPdf() {
    const res = await fetch("/api/photos/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: images.map((i) => i.dataUrl) }),
    });
    const blob = await res.blob();
    triggerDownload(blob, "listing-photos.pdf");
  }

  async function downloadZip() {
    const res = await fetch("/api/photos/export-zip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: images.map((i) => i.dataUrl) }),
    });
    const blob = await res.blob();
    triggerDownload(blob, "branded-photos.zip");
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Upload Photos
        </button>
        <span className="text-sm text-gray-500">
          JPG/PNG — multiple files supported
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      {loading && (
        <p className="text-sm text-gray-500 animate-pulse">Branding photos...</p>
      )}

      {images.length > 0 && (
        <>
          <div className="flex gap-3">
            <button
              onClick={downloadPdf}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-sm"
            >
              Export PDF
            </button>
            <button
              onClick={downloadZip}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium text-sm"
            >
              Download ZIP
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={i} className="group relative rounded-lg overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full object-cover"
                />
                <a
                  href={img.dataUrl}
                  download={img.name.replace(/\.\w+$/, "-branded.jpg")}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-medium transition-opacity"
                >
                  Download
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
