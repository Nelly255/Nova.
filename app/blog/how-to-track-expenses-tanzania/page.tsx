"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Wallet, Smartphone, LineChart } from "lucide-react";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function ExpenseTrackingBlogPost() {
  const publishDate = "April 19, 2026";
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
            "headline": "How to Track Expenses Effectively in Tanzania",
            "datePublished": "2026-04-19T08:00:00+03:00",
            "author": [{
                "@type": "Organization",
                "name": "Nova Wealth Management",
                "url": "https://nova.co.tz"
            }],
            "description": "Learn the best ways to track your expenses, manage M-Pesa transactions, and budget effectively in Tanzania."
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
            <span>Personal Finance</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-slate-500">{readTime}</span>
          </div>
          <h1 className={`${headerFont.className} text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6 text-slate-900 dark:text-white`}>
            How to Track Expenses Effectively in Tanzania.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
            From Daladala fares in cash to paying LUKU via M-Pesa, managing money in Tanzania can get messy. Here is the ultimate guide to keeping your finances organized.
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
            Tracking expenses in Tanzania is unique. Unlike places where everything goes through a single bank card, our daily spending is highly fragmented. You might pay for your groceries with <strong>CRDB or NMB</strong>, send money to family via <strong>M-Pesa or Tigo Pesa</strong>, and use <strong>physical cash</strong> for the Bodaboda or Daladala.
          </p>

          <p>
            When your money is scattered across different wallets and networks, it is incredibly easy to wonder at the end of the month: <em>"Where did my salary actually go?"</em>
          </p>

          <h2 className={`${headerFont.className} text-3xl mt-12 mb-6 text-slate-900 dark:text-white`}>
            Why Tracking Your Money Matters
          </h2>
          <p>
            Without tracking, you are guessing. By tracking your spending, you get a clear picture of your financial habits. It allows you to:
          </p>
          
          <ul className="space-y-4 mb-8 mt-6">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-indigo-500 mt-1 shrink-0" size={24} />
              <span className="text-slate-700 dark:text-slate-300"><strong>Catch sneaky fees:</strong> Mobile money withdrawal charges and bank transfer fees add up faster than you think.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-indigo-500 mt-1 shrink-0" size={24} />
              <span className="text-slate-700 dark:text-slate-300"><strong>Monitor recurring bills:</strong> See exactly how much you spend annually on LUKU, DAWASA, and DSTV.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-indigo-500 mt-1 shrink-0" size={24} />
              <span className="text-slate-700 dark:text-slate-300"><strong>Find hidden cash:</strong> Identify wasteful spending and redirect that money towards your savings or emergency fund.</span>
            </li>
          </ul>

          <h2 className={`${headerFont.className} text-3xl mt-16 mb-6 text-slate-900 dark:text-white`}>
            3 Steps to Master Your Expenses
          </h2>
          
          <div className="space-y-6 my-8">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wallet size={24} />
                </div>
                <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white m-0`}>1. Consolidate Your Wallets</h3>
              </div>
              <p className="m-0 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Create a list of every place you hold money. Bank accounts, Mobile Money (M-Pesa, Airtel Money, Halopesa), and physical cash. You need a system that can track transfers between these wallets, not just your expenses.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Smartphone size={24} />
                </div>
                <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white m-0`}>2. Log Expenses Instantly</h3>
              </div>
              <p className="m-0 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                If you wait until the end of the week, you will forget. Paid 2,000 TZS for a Bodaboda? Log it immediately. Sent 10,000 TZS to a friend? Log it. It takes 5 seconds, but saves you hours of confusion later.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <LineChart size={24} />
                </div>
                <h3 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white m-0`}>3. Use the Right Categories</h3>
              </div>
              <p className="m-0 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Keep it simple. Use standard categories like "Groceries", "Transport", "Dining Out", and "Bills & Utilities". Avoid creating too many niche categories, as it makes reviewing your monthly spending overly complicated.
              </p>
            </div>
          </div>

          <h2 className={`${headerFont.className} text-3xl mt-12 mb-4 text-slate-900 dark:text-white`}>
            The Best Way to Track in Tanzania
          </h2>
          <p>
            Spreadsheets are boring and hard to update on your phone. Most international finance apps don't understand our local context (like transaction fees on M-Pesa withdrawals).
          </p>
          <p>
            That is exactly why we built <strong>Nova</strong>. 
          </p>

          {/* FINAL CTA */}
          <div className="not-prose mt-12 p-8 sm:p-10 rounded-[2.5rem] bg-slate-900 dark:bg-white text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className={`${headerFont.className} text-2xl sm:text-3xl font-extrabold text-white dark:text-slate-900 mb-4 relative z-10 tracking-tight`}>
              Ready to take control of your money?
            </h3>
            <p className="text-slate-300 dark:text-slate-600 mb-8 relative z-10 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Nova is a modern, fast, and beautiful finance dashboard that lets you track your banks, mobile money, and cash in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2">
                Get Started for Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>

        </div>
      </article>
    </main>
  );
}