"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Home, ShieldAlert } from "lucide-react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function PropertyTaxGuideBlog() {
  const publishDate = "May 20, 2026";
  const readTime = "6 min read";

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 pb-24 ${bodyFont.className}`}>
      
      {/* PURPLE AMBIENT GLOW */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 blur-[120px] rounded-full"></div>
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#8B5CF6] transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">
            <span>Real Estate & Taxation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-500 dark:text-slate-400">{readTime}</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white`}>
            Buying Land in Tanzania: Hidden Taxes, CGT, and Stamp Duty.
          </h1>
          
          <div className="flex items-center gap-4 py-6 border-y border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-[#8B5CF6] font-bold text-xl">N</div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Nova Financial Team</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Published on {publishDate}</p>
            </div>
          </div>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-[#8B5CF6]">
          <p>The real estate market in Tanzania is booming, but the process of officially transferring a Title Deed (Hati) is notoriously bureaucratic. A massive point of confusion for both buyers and sellers is the tax burden: <em>Who pays TRA?</em></p>

          <h2 className="text-[#8B5CF6]">1. The Buyer’s Burden: Stamp Duty (1%)</h2>
          <p>If you are buying property or land, you are responsible for paying <strong>Stamp Duty</strong>. This is a mandatory tax required to legally stamp and register the sales agreement and transfer documents. It is calculated as <strong>1% of the property value</strong>.</p>
          
          <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-500/20 my-8">
            <h4 className="font-bold text-purple-900 dark:text-purple-400 mb-2 mt-0">The TRA Valuation Rule</h4>
            <p className="text-sm m-0 text-slate-700 dark:text-slate-300">If TRA determines the market value is 100M TZS, but your contract says 30M TZS, they will calculate your 1% Stamp Duty based on their 100M TZS valuation. Always account for the official valuer's assessment.</p>
          </div>

          <h2 className="text-[#8B5CF6]">2. The Seller’s Burden: Capital Gains Tax (10%)</h2>
          <p>If you are selling property, you are responsible for paying <strong>Capital Gains Tax (CGT)</strong>. TRA taxes the profit you made from the sale. CGT is calculated at <strong>10% of the net profit</strong> (Selling Price minus the Original Purchase Price and Cost of Improvements).</p>

          <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-500/20 my-8">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-rose-600 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-400 mb-2 mt-0">Keep Your Receipts</h4>
                <p className="text-sm text-rose-800 dark:text-rose-300 m-0">
                  If you bought an empty plot for 10M TZS, built a wall for 5M TZS, and sold it for 30M TZS, your profit is 15M TZS. However, if you cannot provide official receipts for the 5M TZS wall, TRA will not deduct it, and you will be taxed on a 20M TZS profit.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-[#8B5CF6]">3. The Hidden Costs: Legal & Broker Fees</h2>
          <p>Taxes aren't the only expense. To safely execute a property transfer, you will need professionals:</p>
          <ul>
            <li><strong>Legal/Advocate Fees (1% - 3%):</strong> Required to draft the sale agreement and facilitate the transfer at the Ministry of Lands. This is usually paid by the buyer, though sometimes split.</li>
            <li><strong>Agency/Broker Fees (5% - 10%):</strong> If a "dalali" found the buyer or the property, they will take a cut of the final sale price. This is typically paid by the seller.</li>
          </ul>

          <hr className="my-12 border-slate-200 dark:border-white/10" />

          {/* RELOCATED CTA / TOOL LINK */}
          <h3 className={`${headerFont.className} text-2xl mb-4 text-slate-900 dark:text-white`}>
            Calculate Your Property Taxes Instantly
          </h3>
          <p>
            Don't get caught off guard at the advocate's office. We built a free calculator to help you estimate your Stamp Duty, CGT, and legal fees before you enter negotiations.
          </p>

          <Link href="/property-tax-calculator-tanzania" className="not-prose group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/10 border border-purple-100 dark:border-purple-500/20 hover:shadow-lg transition-all mt-8 mb-12 text-decoration-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-[#8B5CF6] rounded-xl flex items-center justify-center shadow-sm">
                <Home size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white m-0">Tanzania Property Tax Calculator</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0 mt-1">Calculate Stamp Duty, CGT, and Legal fees instantly.</p>
              </div>
            </div>
            <ArrowRight className="text-[#8B5CF6] group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* LEGAL DISCLAIMER */}
          <p className="text-xs text-slate-500 text-center italic border-t border-slate-200 dark:border-white/5 pt-8">
            Disclaimer: This article is for informational purposes only and does not constitute official tax or legal advice. Property transfers require official government valuation. Always consult a registered advocate or tax consultant for your specific real estate transactions in Tanzania.
          </p>
        </div>
      </article>
    </main>
  );
}