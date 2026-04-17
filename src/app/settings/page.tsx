import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BrandingProfileForm from "@/components/BrandingProfileForm";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Branding Settings</h1>
      <p className="text-sm text-gray-500 mb-8">This info appears on every branded photo and AI-generated document. Set it once.</p>
      <BrandingProfileForm />
    </main>
  );
}
