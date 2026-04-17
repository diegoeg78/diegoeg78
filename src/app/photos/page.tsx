import PhotoBrandingPanel from "@/components/PhotoBrandingPanel";

export default function PhotosPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Photo Branding</h1>
      <p className="text-sm text-gray-500 mb-8">
        Upload listing photos — your contact info will be overlaid automatically.
      </p>
      <PhotoBrandingPanel />
    </main>
  );
}
