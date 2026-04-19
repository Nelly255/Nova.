import Link from "next/link";
import { ArrowLeft, CheckCircle2, Wallet, Smartphone, LineChart, ArrowRight } from "lucide-react";
import { Metadata } from "next";

// 🚀 SEO Metadata optimized for Google Search
export const metadata: Metadata = {
  title: "How to Track Expenses in Tanzania | Nova Finance",
  description: "Learn the best ways to track your expenses, manage M-Pesa transactions, and budget effectively in Tanzania. Take control of your money today.",
  keywords: ["track expenses Tanzania", "budgeting Tanzania", "M-Pesa tracker", "finance app Tanzania", "Nova finance", "TSh budgeting"],
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0A0A0E] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">
      <article className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>

        {/* Header Section */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 rounded-full">
              Personal Finance
            </span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              5 min read
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight mb-6">
            How to Track Expenses Effectively in Tanzania
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
            From Daladala fares in cash to paying LUKU via M-Pesa, managing money in Tanzania can get messy. Here is the ultimate guide to keeping your finances organized.
          </p>
        </header>

        {/* Article Body */}
        <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none text-zinc-700 dark:text-zinc-300">
          
          <p>
            Tracking expenses in Tanzania is unique. Unlike places where everything goes through a single bank card, our daily spending is highly fragmented. You might pay for your groceries with <strong>CRDB or NMB</strong>, send money to family via <strong>M-Pesa or Tigo Pesa</strong>, and use <strong>cash</strong> for the Bodaboda or Daladala.
          </p>

          <p>
            When your money is scattered across different wallets and networks, it is incredibly easy to wonder at the end of the month: <em>"Where did my salary go?"</em>
          </p>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">Why Tracking Your Money Matters</h2>
          <p>
            Without tracking, you are guessing. By tracking your spending, you get a clear picture of your financial habits. It allows you to:
          </p>
          <ul className="space-y-2 mb-8 list-none pl-0">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={20} />
              <span>Catch sneaky fees (like mobile money withdrawal charges).</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={20} />
              <span>See exactly how much you spend on recurring bills like LUKU, DAWASA, and DSTV.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-500 mt-1 shrink-0" size={20} />
              <span>Find extra money to put towards your savings or emergency fund.</span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">3 Steps to Master Your Expenses</h2>
          
          <div className="space-y-8 mt-6">
            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Wallet size={20} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white m-0">1. Consolidate Your Wallets</h3>
              </div>
              <p className="m-0 text-zinc-600 dark:text-zinc-400 text-base">
                Create a list of every place you hold money. Bank accounts, Mobile Money (M-Pesa, Airtel Money, Halopesa), and physical cash. You need a system that can track transfers between these wallets, not just your expenses.
              </p>
            </div>

            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Smartphone size={20} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white m-0">2. Log Expenses Instantly</h3>
              </div>
              <p className="m-0 text-zinc-600 dark:text-zinc-400 text-base">
                If you wait until the end of the week, you will forget. Paid 2,000 TSh for a Bodaboda? Log it immediately. Sent 10,000 TSh to a friend? Log it. It takes 5 seconds, but saves you hours of confusion later.
              </p>
            </div>

            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <LineChart size={20} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white m-0">3. Use the Right Categories</h3>
              </div>
              <p className="m-0 text-zinc-600 dark:text-zinc-400 text-base">
                Keep it simple. Use standard categories like "Groceries", "Transport", "Dining Out", and "Bills & Utilities". Avoid creating too many niche categories, as it makes reviewing your monthly spending overly complicated.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mt-10 mb-4">The Best Way to Track in Tanzania</h2>
          <p>
            Spreadsheets are boring and hard to update on your phone. Most international finance apps don't understand our local context (like transaction fees on M-Pesa withdrawals).
          </p>
          <p>
            That is exactly why we built <strong>Nova</strong>. 
          </p>
          <p>
            Nova is a modern, fast, and beautiful finance dashboard that lets you track your banks, mobile money, and cash in one place. It supports TSh natively, helps you account for bank charges, and sends you smart reminders for your upcoming subscriptions.
          </p>

        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Ready to take control of your money?
            </h2>
            <p className="text-indigo-100 mb-8 max-w-xl mx-auto text-base sm:text-lg">
              Stop guessing where your money goes. Start tracking your expenses, budgets, and subscriptions today with Nova.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 bg-white text-indigo-600 hover:bg-zinc-50 font-bold py-3.5 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              Get Started for Free <ArrowRight size={18} />
            </Link>
          </div>
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        </div>

      </article>
    </div>
  );
}