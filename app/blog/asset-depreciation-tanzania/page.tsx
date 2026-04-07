"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, CheckCircle2, Calendar, User, ArrowRight, Activity, Shield } from "lucide-react";

export default function DepreciationArticlePage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('app_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('app_theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://nova.co.tz/blog/asset-depreciation-tanzania"
            },
            "headline": "How to Calculate Asset Depreciation for TRA Compliance",
            "description": "Understand the reducing balance method and TRA capital allowance classes to track your asset values correctly in Tanzania.",
            "author": { "@type": "Organization", "name": "Nova Financial" },
            "datePublished": "2026-04-01"
          })
        }}
      />

      {/* AMBIENT GLOW - Swapped back to Nova Purple */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6 flex flex-col min-h-screen">
        
        <nav className="max-w-4xl mx-auto w-full mb-12 md:mb-16 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm md:text-base">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Back to Journal</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <button onClick={toggleTheme} className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        <header className="max-w-3xl mx-auto w-full mb-16 text-center">
          {/* Badge Removed Successfully */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 text-slate-900 dark:text-white leading-[1.1]">
            How to Calculate Asset Depreciation for TRA Compliance
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><User size={16} className="text-[#8438FF]" /> Nova Team</span>
            <span className="flex items-center gap-2"><Calendar size={16} className="text-[#8438FF]" /> April 1, 2026</span>
            <span className="text-[10px] uppercase tracking-widest bg-[#8438FF]/10 text-[#8438FF] px-3 py-1 rounded-full">4 Min Read</span>
          </div>
        </header>

        <article className="max-w-3xl mx-auto w-full flex-grow pb-24">
          <div className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300 mb-12 font-medium">
            <p>
              In Tanzania, your net worth isn't just about the money in your bank account—it's about your assets. However, a MacBook bought in 2024 isn't worth the same in 2026. Understanding depreciation is the difference between a "guess" and a "financial statement."
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-16 mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-[#8438FF] rounded-full"></span>
            The TRA Standard: Reducing Balance
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            The Tanzania Revenue Authority (TRA) primarily uses the <strong className="text-slate-900 dark:text-white">Reducing Balance Method</strong>. Instead of losing a fixed amount every year, the asset loses a percentage of its *current* value. This reflects reality: a car loses more value in its first year than in its tenth.
          </p>

          <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-white/5 mb-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl">
            <h3 className="text-xl font-bold mb-4">Common TRA Classes:</h3>
            <ul className="space-y-4 text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#8438FF]"/> <strong>Class 1 (37.5%):</strong> Computers, phones, and heavy earth-moving equipment.</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#8438FF]"/> <strong>Class 2 (25%):</strong> Cars, small buses, and pickup trucks.</li>
              <li className="flex items-center gap-3"><CheckCircle2 size={18} className="text-[#8438FF]"/> <strong>Class 3 (12.5%):</strong> Furniture, fixtures, and large ships/aircraft.</li>
            </ul>
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-16 mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-[#8438FF] rounded-full"></span>
            Why This Matters for Your Net Worth
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-16 leading-relaxed">
            If you list a 5-year-old Toyota IST at its original buying price in your asset tracker, you are lying to yourself about your wealth. Real wealth building requires honest data. Tracking depreciation allows you to plan for future replacements and understand your true equity.
          </p>

          <div className="relative bg-white dark:bg-[#0F0F15]/90 p-10 md:p-14 rounded-[2.5rem] border border-slate-100 dark:border-[#8438FF]/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8438FF]/10 blur-[80px] pointer-events-none"></div>
            <h3 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 dark:text-white tracking-tight relative z-10">Generate a Professional Asset Report.</h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 font-medium relative z-10">Use our calculator to see your asset's value over the next 5 years.</p>
            <Link href="/depreciation-calculator" className="inline-flex items-center justify-center gap-3 py-4 px-10 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-[1.5rem] font-bold text-base shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 group relative z-10">
              Launch Depreciation Tool <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>

        <footer className="w-full max-w-7xl mx-auto pt-12 pb-12 border-t border-slate-200 dark:border-white/5 z-10 relative mt-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#8438FF]" />
              <span className="font-bold text-slate-900 dark:text-white">Nova Financial.</span> © {new Date().getFullYear()}
            </div>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 font-medium"><Shield size={14} className="text-emerald-500"/> Bank-Grade Security</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}