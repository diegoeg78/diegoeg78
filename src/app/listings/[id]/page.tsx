import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ListingForm from "@/components/ListingForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listing = await (prisma as any).listing.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!listing) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/listings" className="text-sm text-gray-400 hover:text-gray-600">
          ← Listings
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">{listing.address}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{listing.address}</h1>
          <p className="text-blue-600 font-semibold text-lg mt-1">
            ${listing.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {listing.bedrooms}bd · {listing.bathrooms}ba · {listing.sqft.toLocaleString()} sqft
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/listings/${listing.id}/export-pdf`}
            target="_blank"
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 font-medium text-sm"
          >
            Export PDF
          </a>
          <a
            href={`/api/listings/${listing.id}/export-docx`}
            target="_blank"
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium text-sm"
          >
            Export Word
          </a>
        </div>
      </div>

      <ListingForm
        listingId={listing.id}
        initial={{
          address: listing.address,
          city: listing.city,
          state: listing.state,
          price: listing.price,
          bedrooms: listing.bedrooms,
          bathrooms: listing.bathrooms,
          sqft: listing.sqft,
          yearBuilt: listing.yearBuilt,
          mlsDescription: listing.mlsDescription,
          cmaData: listing.cmaData,
          cmaSummary: listing.cmaSummary,
          videoScript: listing.videoScript,
          fairHousingScan: listing.fairHousingScan,
          sellerNotes: listing.sellerNotes,
        }}
      />
    </main>
  );
}
