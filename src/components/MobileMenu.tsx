"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex flex-col justify-center gap-[5px] p-2"
        aria-label="Open menu"
      >
        <span className="block w-6 h-0.5 bg-gray-800" />
        <span className="block w-6 h-0.5 bg-gray-800" />
        <span className="block w-6 h-0.5 bg-gray-800" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-4/5 max-w-sm bg-[#111111] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end px-6 py-5">
          <button
            onClick={() => setOpen(false)}
            className="text-white text-3xl leading-none"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col px-8">
          {[
            { href: "#features", label: "Features" },
            { href: "#how-it-works", label: "How it works" },
            { href: "#pricing", label: "Pricing" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="py-5 text-xl font-medium text-white border-b border-gray-700 hover:text-gray-300"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="px-8 mt-8 flex flex-col gap-4">
          <Link
            href="/sign-in"
            onClick={() => setOpen(false)}
            className="w-full py-4 text-center text-base font-medium text-white border border-white rounded hover:bg-white/10 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setOpen(false)}
            className="w-full py-4 text-center text-base font-semibold text-gray-950 bg-[#c49a2a] rounded hover:bg-[#b08820] transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </>
  );
}
