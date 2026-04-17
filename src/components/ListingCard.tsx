import Link from "next/link";
import GenerateAllButton from "./GenerateAllButton";

interface ListingRow {
  id: number;
  address: string;
  city: string;
  state: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  mlsDescription: string;
  cmaSummary: string;
  videoScript: string;
  fairHousingScan: string;
  sellerNotes: string;
  cmaData: string;
}

const SECTIONS = [
  { key: "mlsDescription",  label: "MLS" },
  { key: "cmaSummary",      label: "CMA" },
  { key: "videoScript",     label: "Video" },
  { key: "fairHousingScan", label: "FH Scan" },
  { key: "sellerNotes",     label: "Seller" },
] as const;

function completedCount(listing: ListingRow): number {
  return SECTIONS.filter(({ key }) => {
    const val = listing[key as keyof ListingRow] as string;
    return val && val.trim().length > 0;
  }).length;
}

export default function ListingCard({ listing }: { listing: ListingRow }) {
  const done = completedCount(listing);
  const total = SECTIONS.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 hover:border-blue-200 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{listing.address}</p>
          <p className="text-sm text-gray-500 truncate">
            {[listing.city, listing.state].filter(Boolean).join(", ")}
          </p>
          <p className="text-sm font-bold text-blue-600 mt-0.5">
            ${listing.price.toLocaleString()}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              pct === 100
                ? "bg-green-100 text-green-700"
                : pct >= 60
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {pct}%
          </span>
          <p className="text-xs text-gray-400 mt-0.5">{done}/{total} sections</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-yellow-400" : "bg-blue-400"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Section badges */}
      <div className="flex flex-wrap gap-1.5">
        {SECTIONS.map(({ key, label }) => {
          const filled =
            (listing[key as keyof ListingRow] as string)?.trim().length > 0;
          return (
            <span
              key={key}
              className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                filled
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-50 text-gray-400 border border-gray-200"
              }`}
            >
              {filled ? "✓" : "○"} {label}
            </span>
          );
        })}
      </div>

      {/* Specs */}
      <p className="text-xs text-gray-400">
        {listing.bedrooms}bd · {listing.bathrooms}ba · {listing.sqft.toLocaleString()} sqft
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
        <Link
          href={`/listings/${listing.id}`}
          className="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700"
        >
          Open
        </Link>
        <a
          href={`/api/listings/${listing.id}/export-pdf`}
          target="_blank"
          className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
        >
          PDF
        </a>
        <a
          href={`/api/listings/${listing.id}/export-docx`}
          target="_blank"
          className="px-3 py-1.5 text-xs font-medium border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
        >
          Word
        </a>
        <GenerateAllButton listingId={listing.id} />
      </div>
    </div>
  );
}
