"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, CheckCircle2 } from "lucide-react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function VatGuideBlogPost() {
  const publishDate = "May 14, 2026";
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
            "headline": "Understanding VAT in Tanzania: The Final Consumer Burden",
            "datePublished": "2026-05-14T08:00:00+03:00",
            "author": [{
                "@type": "Organization",
                "name": "Nova Wealth Management",
                "url": "https://nova.co.tz"
            }],
            "description": "A complete guide to Value Added Tax (VAT) in Tanzania. Learn when to charge the 18% VAT and why the final consumer bears the true cost."
          })
        }}
      />

      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 dark:bg-blue-500/15 blur-[120px] rounded-full"></div>
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            <span>Corporate Compliance</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-500">{readTime}</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white`}>
            Understanding VAT in Tanzania: The Final Consumer Burden.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            Should you be charging 18% VAT on your invoices? Learn exactly how Value Added Tax works, the mandatory registration threshold, and who is actually paying the tax.
          </p>
          
          <div className="flex items-center gap-4 py-6 border-y border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
              N
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Nova Financial Team</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Published on {publishDate}</p>
            </div>
          </div>
        </header>

        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400">
          
          <p>
            When pricing a service or product in Tanzania, businesses often face a massive question: <em>"Do I need to add VAT to my invoice?"</em> 
          </p>
          <p>
            Unlike Withholding Tax (which is an income tax mechanism), VAT is a <strong>consumption tax</strong> set at a standard rate of <strong>18%</strong>. If you get VAT wrong, you can either price yourself entirely out of the market, or end up owing the Tanzania Revenue Authority (TRA) millions of shillings you never actually collected.
          </p>

          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white`}>
            When Do You Charge VAT?
          </h2>
          <p>
            Here is the golden rule: <strong>You do not need to charge VAT unless your business is officially VAT Registered.</strong> 
          </p>
          <p>
            Legally, a business is only required to register for VAT if its taxable turnover exceeds <strong>200 Million TZS in a consecutive 12-month period</strong> (or 50 Million TZS in a six-month period). If your business earns less than this, adding VAT to your invoices is illegal. 
          </p>

          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 my-8">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 mt-0">The Collection Reality</h4>
            <p className="text-sm m-0">
              If you are VAT registered, you must add 18% to your invoice subtotal. Your client pays you this total amount, but <strong>the 18% is not yours</strong>. You are simply acting as an unpaid tax collector for TRA. You must hold that 18% and remit it to the government during your monthly VAT returns.
            </p>
          </div>

          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white`}>
            The "Final Consumer" Burden
          </h2>
          <p>
            The most misunderstood concept of VAT is <em>who actually absorbs the cost</em>. <strong>VAT is designed to be borne entirely by the final, everyday consumer.</strong>
          </p>
          <p>
            Here is how your VAT registration impacts your competitiveness depending on who your client is:
          </p>
          
          <ul className="space-y-6 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={24} />
              <div>
                <strong className="text-slate-900 dark:text-white">Scenario A: Your client is a Corporate, VAT-Registered Business.</strong><br/>
                <span className="text-slate-600 dark:text-slate-400">They do not care that you charged them 18% VAT. Why? Because they can legally claim that 18% back from TRA as "Input VAT". To a large corporate client, your VAT-inclusive invoice is just paperwork; the actual monetary cost to their business is strictly your base subtotal.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={24} />
              <div>
                <strong className="text-slate-900 dark:text-white">Scenario B: Your client is an Everyday Person (The Final Consumer).</strong><br/>
                <span className="text-slate-600 dark:text-slate-400">If you build a website for an unregistered local shop, or do a photoshoot for a family, they <em>cannot</em> claim the VAT back. To them, your service just became <strong>18% more expensive</strong>. You are forcing the end consumer to absorb the tax out of pocket. This can make your pricing uncompetitive if your non-VAT-registered competitors are charging 18% less for the exact same service.</span>
              </div>
            </li>
          </ul>

          <h3 className={`${headerFont.className} text-2xl mt-12 mb-4 text-slate-900 dark:text-white`}>
            Visualize Your Invoices
          </h3>
          <p>
            If your business is crossing the VAT threshold, or if you are dealing with corporate WHT deductions at the same time, calculating your true invoice totals can get tricky. We built a tool to help you properly structure your pricing.
          </p>

          <Link href="/dashboard/freelance-invoice-calculator" className="not-prose group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-500/20 hover:shadow-lg transition-all my-8 text-decoration-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white m-0">Free Invoice Strategy Tool</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Simulate how VAT and WHT impact your bottom line.</p>
              </div>
            </div>
            <ArrowRight className="text-blue-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-xs text-slate-500 text-center mt-12 italic border-t border-slate-200 dark:border-white/5 pt-8">
            Disclaimer: This article is for informational purposes only. Always consult a certified tax professional or auditor for your specific business needs as TRA regulations are subject to change.
          </p>
        </div>
      </article>
    </main>
  );
}