import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { HistorySync } from "@/components/providers/history-sync";

export const metadata: Metadata = {
  title: "Hookprint",
  description: "Decode viral short-form reels into remixable creative DNA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-[linear-gradient(180deg,#f8fbff,#eef6ff_35%,#fffaf3)] text-slate-950">
        <HistorySync />
        <div className="site-frame flex min-h-full flex-col">
          <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-cyan-200/60">
                  HP
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">Hookprint</p>
                  <p className="text-xs text-slate-500">Local-first viral reel breakdowns</p>
                </div>
              </Link>
              <nav className="-mx-1 flex items-center gap-2 overflow-x-auto rounded-full border border-white/70 bg-white/75 p-1 text-sm shadow-sm shadow-slate-200/60 [scrollbar-width:none] sm:mx-0">
                <Link href="/" className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950">
                  Home
                </Link>
                <Link href="/analyze" className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950">
                  Analyze
                </Link>
                <Link href="/history" className="rounded-full px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950">
                  History
                </Link>
              </nav>
            </div>
          </header>
          <div className="flex min-h-full flex-1 flex-col">{children}</div>
          <footer className="border-t border-white/50 bg-white/55">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <p>Hookprint runs free by default with a deterministic local engine and browser storage.</p>
              <p>Upload a reel, break down the Viral DNA, and save the analysis locally.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
