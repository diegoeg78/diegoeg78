import ListingForm from "@/components/ListingForm";

export default function NewListingPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">New Listing</h1>
      <p className="text-sm text-gray-500 mb-8">Fill in the details — paste AI content into each tab.</p>
      <ListingForm />
    </main>
  );
}
