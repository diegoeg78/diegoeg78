import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Playfair_Display } from "next/font/google";

export const dynamic = "force-dynamic";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-playfair",
});

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/listings");

  return (
    <div className={`${playfair.variable} min-h-screen`} style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
      {/* ── Marketing Nav ─────────────────────────────────────── */}
      <nav className="bg-[#f5f0e8] border-b border-[#e5ddd0] px-6 py-4 flex items-center">
        <div className="flex items-center gap-2 mr-10">
          <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Georgia, serif" }}>
            Listing<span className="text-[#c49a2a]">OS</span>
          </span>
          <span className="text-xs font-medium text-gray-400 tracking-widest uppercase ml-1 mt-1">Command Center</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900">How it works</a>
          <a href="#pricing" className="hover:text-gray-900">Pricing</a>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/sign-in" className="px-4 py-2 text-sm font-medium text-gray-800 border border-gray-800 rounded hover:bg-gray-100 transition-colors">
            Sign in
          </Link>
          <Link href="/sign-up" className="px-4 py-2 text-sm font-medium text-white bg-gray-950 rounded hover:bg-gray-800 transition-colors">
            Start free trial
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-[#f5f0e8] min-h-[92vh] flex items-stretch">
        <div className="flex flex-col lg:flex-row w-full">
          {/* Left */}
          <div className="flex-1 px-10 md:px-16 lg:px-20 py-20 flex flex-col justify-center max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-px bg-[#c49a2a]" />
              <span className="text-xs font-semibold tracking-widest text-[#c49a2a] uppercase">MLS Command Center</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-950 leading-[1.05] mb-8">
              Sell smarter.<br />
              <span className="italic text-[#c49a2a]">Close faster.</span><br />
              Work less.
            </h1>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-md" style={{ fontFamily: "system-ui, sans-serif" }}>
              Upload a listing. Get a complete branded marketing and selling system — pricing strategy, social media, email campaigns, and a daily action plan — in minutes.
            </p>
            <div>
              <Link
                href="/sign-up"
                className="inline-block px-8 py-4 text-base font-semibold text-gray-950 bg-[#c49a2a] rounded hover:bg-[#b08820] transition-colors"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Get your free playbook →
              </Link>
            </div>
          </div>

          {/* Right — App mockup */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-gray-900 to-gray-950 items-center justify-center p-12">
            <div className="w-full max-w-lg bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-3 text-xs text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>ListingOS — Command Center</span>
              </div>
              <div className="p-6">
                <p className="text-xl font-bold text-white mb-1" style={{ fontFamily: "Georgia, serif" }}>2847 Coral Ridge Dr</p>
                <p className="text-[#c49a2a] text-sm mb-5" style={{ fontFamily: "system-ui, sans-serif" }}>$649,000 · Miami, FL 33065</p>
                <div className="grid grid-cols-2 gap-3 mb-4" style={{ fontFamily: "system-ui, sans-serif" }}>
                  {[
                    { label: "RECOMMENDED PRICE", value: "$649K", color: "text-white" },
                    { label: "DAYS TO CLOSE", value: "18–24", color: "text-green-400" },
                    { label: "WALK SCORE", value: "82 / 100", color: "text-white" },
                    { label: "MARKET TEMP", value: "Hot ↑", color: "text-green-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-gray-800 rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 tracking-wider uppercase mb-1">{label}</p>
                      <p className={`font-semibold text-sm ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-[10px] text-gray-400 tracking-wider uppercase mb-2" style={{ fontFamily: "system-ui, sans-serif" }}>CAMPAIGN PROGRESS</p>
                  <div className="space-y-1.5">
                    <div className="h-2 bg-[#c49a2a] rounded-full w-4/5" />
                    <div className="h-2 bg-[#c49a2a] rounded-full w-3/5 opacity-70" />
                  </div>
                </div>
                <div className="flex gap-2" style={{ fontFamily: "system-ui, sans-serif" }}>
                  <button className="flex-1 py-2 text-xs font-semibold bg-[#c49a2a] text-gray-950 rounded">Download Package</button>
                  <button className="flex-1 py-2 text-xs font-semibold bg-gray-700 text-gray-300 rounded">Edit Campaign</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="bg-[#f5f0e8] border-t border-b border-[#e5ddd0]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e5ddd0]">
          {[
            { prefix: "",  num: "2",   suffix: "min", label: "TO FULL PLAYBOOK" },
            { prefix: "",  num: "6",   suffix: "+",   label: "FREE DATA SOURCES" },
            { prefix: "",  num: "100", suffix: "%",   label: "MLS COMPLIANT" },
            { prefix: "$", num: "0",   suffix: "",    label: "API DATA COSTS" },
          ].map(({ prefix, num, suffix, label }) => (
            <div key={label} className="px-8 py-8">
              <p className="text-5xl font-bold text-gray-950 mb-2">
                <span className="text-[#c49a2a]">{prefix}</span>
                {num}
                <span className="text-[#c49a2a]">{suffix}</span>
              </p>
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase" style={{ fontFamily: "system-ui, sans-serif" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#111111] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight flex-1">
              From listing to playbook<br />in four steps
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed flex-1 lg:pt-4" style={{ fontFamily: "system-ui, sans-serif" }}>
              No MLS API. No scraping. No legal risk. Just your listing data, enriched with free public sources, powered by AI.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-800">
            {[
              { num: "01", title: "Input your listing", desc: "Answer a short interview or upload a screenshot of your MLS listing. Either way works — you're in control of your data.", badge: "2 MINUTES" },
              { num: "02", title: "We enrich it", desc: "Census demographics, HUD market data, FRED mortgage trends, and Walk Score are pulled automatically for your zip code.", badge: "AUTOMATIC" },
              { num: "03", title: "AI builds the plan", desc: "Pricing strategy, marketing copy, branded graphics, email templates, open house plan, and a full daily action calendar.", badge: "AI-POWERED" },
              { num: "04", title: "Download and execute", desc: "Export your full package as PDF or Word. Launch your campaign. Follow the plan. Close faster.", badge: "ONE CLICK" },
            ].map(({ num, title, desc, badge }) => (
              <div key={num} className="bg-[#111111] p-8 flex flex-col gap-4">
                <p className="text-6xl font-bold text-gray-700">{num}</p>
                <p className="text-xl font-bold text-white">{title}</p>
                <p className="text-gray-400 text-sm leading-relaxed flex-1" style={{ fontFamily: "system-ui, sans-serif" }}>{desc}</p>
                <span className="inline-block px-3 py-1 text-xs font-semibold text-gray-300 bg-gray-800 rounded w-fit" style={{ fontFamily: "system-ui, sans-serif" }}>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get ─────────────────────────────────────── */}
      <section id="features" className="bg-[#f5f0e8] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 mb-16">
            <div className="flex-1">
              <p className="text-xs font-semibold tracking-widest text-[#c49a2a] uppercase mb-4" style={{ fontFamily: "system-ui, sans-serif" }}>What you get</p>
              <h2 className="text-5xl font-bold text-gray-950">Everything a listing<br />needs to sell</h2>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed flex-1 lg:pt-12" style={{ fontFamily: "system-ui, sans-serif" }}>
              Every playbook is built from real neighborhood data, current market conditions, and AI-powered strategy — not generic templates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#e5ddd0] border border-[#e5ddd0]">
            {[
              { icon: "📊", title: "Pricing Intelligence", desc: "Data-backed price recommendations using Census, HUD, and FRED market data. Know exactly where to price to sell fast without leaving money behind." },
              { icon: "📸", title: "Branded Photo Suite", desc: "Upload your listing photos. Get them back branded with your logo, colors, and contact info — ready for every platform." },
              { icon: "📱", title: "Social Media Package", desc: "Instagram, Facebook, and LinkedIn posts — written, designed, and ready to publish. Captions included for every graphic." },
              { icon: "✉️", title: "Buyer Lead Email", desc: "A compelling email to your buyer leads, written to convert. Personalized to the listing, the neighborhood, and the target buyer profile." },
              { icon: "📅", title: "Campaign Engine", desc: "Monthly themed and weekly drip campaigns. A full content calendar with daily tasks so you never wonder what to do next." },
              { icon: "📦", title: "Export Everything", desc: "Download your full playbook as a PDF or Word doc. Share it with clients, assistants, or your team in one click." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#f5f0e8] p-8">
                <div className="w-12 h-12 bg-gray-950 rounded-xl flex items-center justify-center text-2xl mb-5">{icon}</div>
                <p className="text-lg font-bold text-gray-950 mb-3">{title}</p>
                <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "system-ui, sans-serif" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section id="pricing" className="bg-[#f5f0e8] border-t border-[#e5ddd0] py-32 px-6 text-center">
        <p className="text-xs font-semibold tracking-widest text-[#c49a2a] uppercase mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>Start today</p>
        <h2 className="text-6xl md:text-7xl font-bold text-gray-950 mb-6">Your first playbook is free</h2>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto" style={{ fontFamily: "system-ui, sans-serif" }}>
          No credit card. No MLS credentials. No setup. Just a better way to sell listings.
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-10 py-5 text-base font-semibold text-gray-950 bg-[#c49a2a] rounded hover:bg-[#b08820] transition-colors"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Create your free account →
        </Link>
        <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-400" style={{ fontFamily: "system-ui, sans-serif" }}>
          <span>✓ No MLS API needed</span>
          <span>✓ Works for any US listing</span>
          <span>✓ Cancel anytime</span>
        </div>
      </section>
    </div>
  );
}
