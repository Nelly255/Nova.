"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Activity, ArrowLeft } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });
const bodyFont = Inter({ subsets: ["latin"] });

export default function PrivacyPolicy() {
  return (
    <main className={`min-h-screen bg-slate-50 dark:bg-[#0A0A0E] text-slate-900 dark:text-slate-50 flex flex-col selection:bg-indigo-500/30 transition-colors duration-500 ${bodyFont.className}`}>
      
      {/* Simple Header */}
      <header className="w-full max-w-4xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <Activity size={24} className="text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className={`${headerFont.className} font-extrabold text-xl tracking-tight text-slate-900 dark:text-white`}>
            Nova.
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Content */}
      <div className="w-full max-w-3xl mx-auto px-6 py-12 md:py-20 z-10 flex-1">
        <div className="mb-12">
          <h1 className={`${headerFont.className} text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight`}>
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: March 22, 2026</p>
        </div>

        <div className="space-y-8 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>1. Introduction</h2>
            <p>
              At Nova, we take your privacy and financial security seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
          </section>

          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>2. Information We Collect</h2>
            <p className="mb-3">We may collect information about you in a variety of ways. The information we may collect includes:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong className="text-slate-800 dark:text-slate-200">Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register with the application.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Financial Data:</strong> Data related to your budgets, transactions, debts, and savings goals that you manually input into the application. We do not connect directly to your bank accounts without explicit consent.</li>
            </ul>
          </section>

          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>3. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal and financial information. Our database infrastructure is powered by industry-leading providers (Supabase) to ensure your data is encrypted at rest and in transit. However, please be aware that no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section>
            <h2 className={`${headerFont.className} text-2xl font-bold text-slate-900 dark:text-white mb-3`}>4. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: info@nova.co.tz
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto py-8 border-t border-slate-200 dark:border-white/5 text-center text-sm text-slate-500 px-6">
        © {new Date().getFullYear()} Nova Wealth Management. All rights reserved.
      </footer>
    </main>
  );
}