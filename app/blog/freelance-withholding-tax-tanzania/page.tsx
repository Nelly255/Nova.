"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Receipt, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function WhtGuideBlogPost() {
  const publishDate = "May 14, 2026";
  const readTime = "5 min read";

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 pb-24 ${bodyFont.className}`}>
      
      {/* 🚀 SEO SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "The Freelancer’s Guide to Withholding Tax (WHT) in Tanzania",
            "datePublished": "2026-05-14T08:00:00+03:00",
            "author": [{
                "@type": "Organization",
                "name": "Nova Wealth Management",
                "url": "https://nova.co.tz"
            }],
            "description": "Learn exactly how Withholding Tax (WHT) works in Tanzania, the different rates (5% and 10%), and how to calculate it on your taxable amount."
          })
        }}
      />

      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 dark:bg-violet-500/15 blur-[120px] rounded-full"></div>
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            <span>Freelance & Business</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-500">{readTime}</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white`}>
            The Freelancer’s Guide to Withholding Tax (WHT) in Tanzania.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Why did your corporate client pay you less than what you invoiced? Here is the WHT trap every freelancer falls into, and how to properly calculate your gross fees.
          </p>
          
          <div className="flex items-center gap-4 py-6 border-y border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-xl">
              N
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Nova Financial Team</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Published on {publishDate}</p>
            </div>
          </div>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-violet-600 dark:prose-a:text-violet-400">
          
          <p>
            If you are a freelancer, consultant, or agency owner in Tanzania, you’ve likely experienced the frustration of sending an invoice for 1,000,000 TZS, only to see 950,000 TZS deposited into your bank account. 
          </p>
          <p>
            The missing 50,000 TZS wasn't a bank error or a client trying to shortchange you. It was <strong>Withholding Tax (WHT)</strong>.
          </p>

          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white`}>
            What is Withholding Tax?
          </h2>
          <p>
            In Tanzania, when a registered corporate entity pays for a service, TRA requires that company to withhold a specific percentage of the total fee and pay it directly to the government on the service provider's behalf. It is essentially an advance payment on your annual income tax.
          </p>

          <h3 className={`${headerFont.className} text-2xl mb-4 text-slate-900 dark:text-white`}>
            Common WHT Rates in Tanzania (For Residents)
          </h3>
          <p>WHT is not a flat 5% across the board. The rate strictly depends on the <em>type</em> of service being provided:</p>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-violet-500 mt-1 shrink-0" size={20} />
              <span><strong>Professional & Technical Services: 5%</strong> (This covers developers, designers, consultants, accountants, etc.)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-violet-500 mt-1 shrink-0" size={20} />
              <span><strong>Rental of Land or Buildings: 10%</strong> (If you lease out commercial office space)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-violet-500 mt-1 shrink-0" size={20} />
              <span><strong>Dividends: 5%</strong> (If listed on the DSE) or <strong>10%</strong> (If unlisted)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-violet-500 mt-1 shrink-0" size={20} />
              <span><strong>Interest Payments: 10%</strong></span>
            </li>
          </ul>

          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 my-8">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 mt-0">How is WHT Calculated?</h4>
            <p className="text-sm m-0">
              A very common question is whether WHT is calculated on the total invoice amount <em>including</em> VAT. The answer is no. <strong>WHT is calculated strictly on the base Subtotal (the VAT-exclusive taxable amount).</strong> For example, if your base fee is 1,000,000 TZS, the WHT is calculated exactly on that 1,000,000 TZS, regardless of whether you add 18% VAT on top of it.
            </p>
          </div>
          
          <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl border border-rose-100 dark:border-rose-500/20 my-8">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-rose-600 mt-1 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-rose-900 dark:text-rose-400 mb-2 mt-0">The Freelancer's Dilemma</h4>
                <p className="text-sm text-rose-800 dark:text-rose-300 m-0">
                  If you calculate your business expenses and determine you absolutely need 1,000,000 TZS in your pocket to make a profit, invoicing for 1,000,000 TZS will leave you short. To guarantee you receive your target take-home pay, you must <strong>gross up</strong> your invoice to <strong>1,052,631 TZS</strong>. 
                </p>
              </div>
            </div>
          </div>

          <Link href="/dashboard/freelance-invoice-calculator" className="not-prose group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/10 border border-violet-100 dark:border-violet-500/20 hover:shadow-lg transition-all my-8 text-decoration-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                <Receipt size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white m-0">Free Invoice Strategy Tool</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Enter your target pay, and we will reverse-engineer your invoice for WHT.</p>
              </div>
            </div>
            <ArrowRight className="text-violet-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-xs text-slate-500 text-center mt-12 italic border-t border-slate-200 dark:border-white/5 pt-8">
            Disclaimer: This article is for informational purposes only. Always consult a certified tax professional or auditor for your specific business needs.
          </p>
        </div>
      </article>
    </main>
  );
}