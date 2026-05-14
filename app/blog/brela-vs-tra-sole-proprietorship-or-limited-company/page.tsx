"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, UserCircle, Scale, Receipt, CheckCircle2 } from "lucide-react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function BrelaVsTraBlogPost() {
  const publishDate = "May 16, 2026";
  const readTime = "7 min read";

  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 pb-24 ${bodyFont.className}`}>
      
      {/* 🚀 SEO SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": "BRELA vs TRA: Should You Register a Sole Proprietorship or a Limited Company?",
            "datePublished": "2026-05-16T08:00:00+03:00",
            "author": [{
                "@type": "Organization",
                "name": "Nova Wealth Management",
                "url": "https://nova.co.tz"
            }],
            "description": "Understand the differences between a Sole Proprietorship (Business Name) and a Limited Liability Company (LLC) in Tanzania. Learn the BRELA registration requirements and TRA tax implications."
          })
        }}
      />

      {/* AMBIENT GLOW */}
      <div className="absolute top-0 inset-x-0 h-[500px] overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 dark:bg-indigo-500/15 blur-[120px] rounded-full"></div>
      </div>

      <article className="relative z-10 max-w-3xl mx-auto px-6 pt-12 md:pt-20">
        
        {/* BACK BUTTON */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-10">
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        {/* HEADER */}
        <header className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            <span>Business Setup & Compliance</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-500">{readTime}</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white`}>
            BRELA vs TRA: Sole Proprietorship or Limited Company?
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            The first major crossroad for any freelancer or founder in Tanzania. Make the wrong choice, and you will drown in compliance paperwork. Make the right choice, and you protect your personal assets while optimizing your taxes.
          </p>
          
          <div className="flex items-center gap-4 py-6 border-y border-slate-200 dark:border-white/10">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
              N
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">Nova Financial Team</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Published on {publishDate}</p>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-2xl">
          
          <p>
            You’ve decided to turn your hustle into a legitimate business. Your first step is registering with <strong>BRELA</strong> (Business Registrations and Licensing Agency), followed immediately by visiting <strong>TRA</strong> (Tanzania Revenue Authority) to get your TIN and tax clearance.
          </p>
          <p>
            But what exactly are you registering? A <em>Business Name</em> (Sole Proprietorship) or a <em>Limited Company</em> (LLC)? The choice dictates how you are taxed, your legal liabilities, and how corporate clients interact with your invoices.
          </p>

          {/* SECTION 1: SOLE PROPRIETORSHIP */}
          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white flex items-center gap-3`}>
            <UserCircle className="text-sky-500" size={32} /> The Sole Proprietorship (Business Name)
          </h2>
          <p>
            When you register a Business Name with BRELA (e.g., "Nova Design Studio"), you are creating a <strong>Sole Proprietorship</strong>. Legally, <em>you and the business are the exact same entity.</em>
          </p>
          
          <h3 className={`${headerFont.className} text-xl mb-4 text-slate-900 dark:text-white`}>The Pros:</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
              <span><strong>Cheap & Fast:</strong> Registration on the BRELA ORS system is affordable (often under 20,000 TZS) and can be approved in days.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
              <span><strong>Simple Taxes:</strong> At TRA, business income is simply treated as your personal income. You are taxed on individual progressive tax brackets rather than a flat corporate rate.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
              <span><strong>Low Compliance:</strong> No need for expensive audited financials by certified CPAs or annual company returns to BRELA.</span>
            </li>
          </ul>

          <h3 className={`${headerFont.className} text-xl mb-4 text-slate-900 dark:text-white`}>The Cons:</h3>
          <p>
            <strong>Unlimited Liability.</strong> Because you and the business are the same, if the business gets sued or defaults on a bank loan, creditors can legally seize your personal assets (your house, your car, your personal bank accounts) to settle the debt.
          </p>

          <hr className="my-10 border-slate-200 dark:border-white/10" />

          {/* SECTION 2: LIMITED COMPANY */}
          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white flex items-center gap-3`}>
            <Building2 className="text-indigo-500" size={32} /> The Limited Liability Company (LLC)
          </h2>
          <p>
            When you incorporate a Limited Company with BRELA, you are birthing a brand new "legal person." The company has its own TIN, its own bank accounts, and its own legal liabilities.
          </p>

          <h3 className={`${headerFont.className} text-xl mb-4 text-slate-900 dark:text-white`}>The Pros:</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
              <span><strong>Limited Liability:</strong> If the company goes bankrupt, your personal assets are protected. You only lose what you invested in the company.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
              <span><strong>Corporate Trust:</strong> Large corporations, NGOs, and government tenders almost exclusively work with Limited Companies. It signals permanence and professionalism.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={18} />
              <span><strong>Capital Raising:</strong> You can issue shares to investors in exchange for capital.</span>
            </li>
          </ul>

          <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 my-8">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 mt-0">The Heavy Compliance Burden</h4>
            <p className="text-sm m-0">
              Running a Limited Company in Tanzania is not for the faint of heart. You will pay a flat <strong>30% Corporate Tax</strong> on profits. You must file Annual Returns with BRELA, file estimated and final tax returns with TRA, and hire a registered auditor to prepare your financial statements every year. Furthermore, you must comply with WCF (Workers Compensation Fund) and municipal levies.
            </p>
          </div>

          <hr className="my-10 border-slate-200 dark:border-white/10" />

          {/* SECTION 3: THE VERDICT & INVOICING */}
          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white flex items-center gap-3`}>
            <Scale className="text-purple-500" size={32} /> The Verdict: Which should you choose?
          </h2>
          <p>
            If you are a solo freelancer, creative, or consultant testing a new business idea, <strong>start with a Sole Proprietorship (Business Name).</strong> Keep your overhead low and your taxes simple while you build your client base. You can always upgrade to a Limited Company later.
          </p>
          <p>
            If you are taking on high-risk contracts, raising capital, hiring a large team, or trying to win major corporate tenders, you must incorporate a <strong>Limited Liability Company</strong>.
          </p>

          <h3 className={`${headerFont.className} text-2xl mt-12 mb-4 text-slate-900 dark:text-white`}>
            The Invoice Trap (Applies to Both!)
          </h3>
          <p>
            Regardless of whether you are a Sole Proprietor or a Limited Company, if you are providing professional services to corporate clients, you are subject to <strong>Withholding Tax (WHT)</strong>. 
          </p>
          <p>
            When you send your invoice, corporate clients will legally deduct 5% WHT before paying you. If you don't account for this in your pricing, you will constantly lose money. You need to <strong>gross up</strong> your invoices to ensure your net payout matches your financial goals.
          </p>

          {/* INLINE CTA */}
          <Link href="/dashboard/freelance-invoice-calculator" className="not-prose group flex items-center justify-between p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/10 border border-indigo-100 dark:border-indigo-500/20 hover:shadow-lg transition-all my-8 text-decoration-none">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <Receipt size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white m-0">Free Invoice Strategy Tool</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 m-0">Reverse engineer your invoice to perfectly account for WHT and VAT.</p>
              </div>
            </div>
            <ArrowRight className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </Link>

          <p className="text-xs text-slate-500 text-center mt-12 italic border-t border-slate-200 dark:border-white/5 pt-8">
            Disclaimer: This article is for informational purposes only and does not constitute formal legal or tax advice. Registration processes and tax laws are subject to change by BRELA and TRA. Always consult a certified legal professional or auditor for your specific business needs.
          </p>

        </div>
      </article>
    </main>
  );
}