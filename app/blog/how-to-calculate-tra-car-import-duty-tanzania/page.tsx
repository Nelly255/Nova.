"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Car, ShieldAlert, CheckCircle2, Ship } from "lucide-react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function CarImportGuideBlogPost() {
  const publishDate = "May 15, 2026";
  const readTime = "6 min read";

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 pb-24 ${bodyFont.className}`}>
      
      {/* 🚀 SEO SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "How to Calculate TRA Car Import Duty in Tanzania (2026 Guide)",
            "datePublished": "2026-05-15T08:00:00+03:00",
            "author": [{
                "@type": "Organization",
                "name": "Nova Wealth Management",
                "url": "https://nova.co.tz"
            }],
            "description": "Learn exactly how the Tanzania Revenue Authority (TRA) calculates import duty, excise duty, and VAT on cars imported from Japan, UK, and Dubai."
          })
        }}
      />

      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-600/10 dark:bg-rose-500/15 blur-[120px] rounded-full"></div>
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 text-xs font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            <span>Assets & Taxation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-500">{readTime}</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white`}>
            How to Calculate TRA Car Import Duty in Tanzania.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Found your dream car on BeForward or SBT Japan? Before you hit buy, you need to know exactly how much TRA will charge you at the Dar es Salaam port. Here is the exact formula.
          </p>
          
          <div className="flex items-center gap-4 py-6 border-y border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xl">
              N
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Nova Financial Team</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Published on {publishDate}</p>
            </div>
          </div>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-rose-600 dark:prose-a:text-rose-400">
          
          <p>
            Importing a car into Tanzania is an exciting milestone, but the customs clearing process can be a rude awakening if you aren't prepared. The price you see on Japanese export websites is only half the story. 
          </p>
          <p>
            By the time your vehicle leaves the Dar es Salaam port, the Tanzania Revenue Authority (TRA) will have applied a series of compounding taxes. To avoid having your car stuck at the port racking up storage fees, you need to understand the <strong>CIF Value</strong> and the four major taxes applied to it.
          </p>

          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white`}>
            Step 1: Understanding CIF (The Base Value)
          </h2>
          <p>
            TRA does not calculate your taxes based purely on the price of the car. They calculate it based on the <strong>CIF</strong>:
          </p>
          <ul className="space-y-3 mb-8">
            <li><strong>C - Cost:</strong> The actual price of the vehicle.</li>
            <li><strong>I - Insurance:</strong> The cost to insure the vehicle while in transit.</li>
            <li><strong>F - Freight:</strong> The shipping cost to get it to Dar es Salaam.</li>
          </ul>
          
          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 my-8">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 mt-0">The Current Value Rule</h4>
            <p className="text-sm m-0">
              TRA uses a standardized depreciation database. If you buy a 2018 Toyota Crown for $3,000, but TRA's database says the current market value of that vehicle is $6,000, <strong>they will use their $6,000 valuation</strong> to calculate your taxes.
            </p>
          </div>

          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white`}>
            Step 2: The 4 Major Port Taxes
          </h2>
          <p>Once the CIF value in Tanzanian Shillings is established, TRA applies the following taxes sequentially:</p>

          <ul className="space-y-6 mb-8 mt-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-rose-500 mt-1 shrink-0" size={24} />
              <div>
                <strong className="text-slate-900 dark:text-white">1. Import Duty (25%)</strong><br/>
                <span className="text-slate-600 dark:text-slate-400">This is a flat 25% charged directly on the CIF value of the vehicle.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-rose-500 mt-1 shrink-0" size={24} />
              <div>
                <strong className="text-slate-900 dark:text-white">2. Excise Duty (Depends on Engine CC)</strong><br/>
                <span className="text-slate-600 dark:text-slate-400">Excise duty is charged on the sum of (CIF + Import Duty). The rate depends on your engine size. Vehicles under 1000cc often pay 0%, vehicles between 1000cc - 2000cc pay 5%, and larger engines (above 2000cc) pay 10%.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-rose-500 mt-1 shrink-0" size={24} />
              <div>
                <strong className="text-slate-900 dark:text-white">3. Value Added Tax - VAT (18%)</strong><br/>
                <span className="text-slate-600 dark:text-slate-400">VAT is charged at 18% on the sum of (CIF + Import Duty + Excise Duty). Because it compounds on top of the other taxes, it is usually the largest tax chunk you will pay.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-rose-500 mt-1 shrink-0" size={24} />
              <div>
                <strong className="text-slate-900 dark:text-white">4. Railway Development Levy (2%)</strong><br/>
                <span className="text-slate-600 dark:text-slate-400">A flat 2% charge applied to the original CIF value, used to fund infrastructure projects.</span>
              </div>
            </li>
          </ul>

          <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-500/20 my-8">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-rose-600 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-400 mb-2 mt-0">The Age Penalty</h4>
                <p className="text-sm text-rose-800 dark:text-rose-300 m-0">
                  Tanzania discourages importing very old vehicles. If your car is older than 8 years from its year of manufacture, TRA will slap you with an <strong>Age Penalty</strong> (often an additional 15% to 30% Excise Duty depending on how old the car is).
                </p>
              </div>
            </div>
          </div>

          <h3 className={`${headerFont.className} text-2xl mt-12 mb-4 text-slate-900 dark:text-white`}>
            Stop Guessing Your Taxes
          </h3>
          <p>
            Doing this compounding math manually is tedious. We built a zero-friction tool that calculates your exact Import Duty, Excise Duty, VAT, and RDL based on the latest TRA formulas. 
          </p>

          <Link href="/dashboard/tra-car-import-duty-calculator-tanzania" className="not-prose group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/10 border border-rose-100 dark:border-rose-500/20 hover:shadow-lg transition-all my-8 text-decoration-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center">
                <Car size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white m-0">TRA Import Duty Calculator</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Enter your CIF and Engine CC to generate a full tax breakdown.</p>
              </div>
            </div>
            <ArrowRight className="text-rose-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-xs text-slate-500 text-center mt-12 italic border-t border-slate-200 dark:border-white/5 pt-8">
            Disclaimer: This article is for informational purposes only. Clearing agent fees, TPA port charges, and shipping line charges are separate from TRA taxes. Always consult a licensed clearing and forwarding agent for official assessments.
          </p>
        </div>
      </article>
    </main>
  );
}