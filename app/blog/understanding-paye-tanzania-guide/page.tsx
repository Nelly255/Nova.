"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Calculator, Wallet } from "lucide-react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function PayeGuideBlogPost() {
  const publishDate = "May 14, 2026";
  const readTime = "4 min read";

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 pb-24 ${bodyFont.className}`}>
      
      {/* 🚀 SEO SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "Understanding PAYE in Tanzania: How Your Net Salary is Calculated",
            "datePublished": "2026-05-14T08:00:00+03:00",
            "author": [{
                "@type": "Organization",
                "name": "Nova Wealth Management",
                "url": "https://nova.co.tz"
            }],
            "description": "Learn exactly how Pay As You Earn (PAYE) and NSSF deductions work in Tanzania, and calculate your exact take-home pay."
          })
        }}
      />

      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/10 dark:bg-emerald-500/15 blur-[120px] rounded-full"></div>
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <span>Taxation & Salary</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-500">{readTime}</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white`}>
            Understanding PAYE in Tanzania: A Complete Guide.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Looking at your payslip can be confusing. Between NSSF deductions and progressive tax brackets, figuring out your true net income takes effort. Here is exactly how PAYE works.
          </p>
          
          <div className="flex items-center gap-4 py-6 border-y border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xl">
              N
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Nova Financial Team</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Published on {publishDate}</p>
            </div>
          </div>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-emerald-600 dark:prose-a:text-emerald-400">
          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white flex items-center gap-3`}>
            <Wallet className="text-emerald-500" /> What is PAYE?
          </h2>
          <p>
            PAYE (Pay As You Earn) is the income tax deducted directly from an employee's salary by their employer. In Tanzania, it operates on a progressive scale. This means you aren't taxed a flat rate on your entire income; instead, the tax rate increases as your income moves into higher brackets.
          </p>
          
          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 my-8">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 mt-0">The NSSF Deduction Comes First</h4>
            <p className="text-sm m-0">
              A common misconception is that PAYE is calculated on your total gross salary. It isn't. First, 10% of your gross salary is deducted for the National Social Security Fund (NSSF). Your <em>taxable income</em> is the remaining amount, and PAYE is calculated on that figure.
            </p>
          </div>

          <h3 className={`${headerFont.className} text-2xl mb-4 text-slate-900 dark:text-white`}>
            Why Manual Calculation is Difficult
          </h3>
          <p>
            Because the tax brackets change depending on whether you are in mainland Tanzania or Zanzibar, and because the brackets apply only to the portion of income within that specific range, doing the math with a standard calculator is prone to errors.
          </p>

          <Link href="/dashboard/paye-calculator" className="not-prose group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-500/20 hover:shadow-lg transition-all my-8 text-decoration-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Calculator size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white m-0">Calculate Your Exact Net Pay</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Use our free TRA-compliant PAYE calculator.</p>
              </div>
            </div>
            <ArrowRight className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-xs text-slate-500 text-center mt-12 italic border-t border-slate-200 dark:border-white/5 pt-8">
            Disclaimer: This article is for informational purposes only. Tax laws are subject to change by the Tanzania Revenue Authority (TRA).
          </p>
        </div>
      </article>
    </main>
  );
}