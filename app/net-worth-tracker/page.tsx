"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, ArrowRight, TrendingUp, Landmark, ShieldCheck, Activity } from "lucide-react";

export default function NetWorthTrackerPage() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);

  // INITIAL THEME CHECK
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
      
      {/* 🚀 SCHEMA MARKUP (Optimized for Software Feature) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Nova Net Worth Tracker",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TZS"
            },
            "description": "Track your total net worth. Combine your trading portfolios, real estate, cash, and liabilities into one powerful financial dashboard."
          })
        }}
      />

      {/* AMBIENT GLOW (Swapped to Signature Nova Purple for UI Match) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6">
        
        {/* TOP NAV */}
        <nav className="max-w-6xl mx-auto mb-12 md:mb-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm md:text-base">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto mb-20 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">WEALTH ANALYTICS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Map your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Empire.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Consolidate your assets <br />
              & <span className="text-slate-900 dark:text-white font-bold">Track Your True Value.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md mb-8">
              True financial freedom isn't about your salary; it's about your net worth. Combine your active trading accounts, cash, physical real estate, and liabilities into one definitive number.
            </p>
            
            <Link href="/login" className="inline-flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-8 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-[1.5rem] font-bold text-[15px] shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 group">
              Start Tracking Wealth <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </header>

        {/* BENTO BOX FEATURES */}
        <section className="max-w-6xl mx-auto pb-24">
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Total Wealth Visualization
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                Watch your net worth curve grow month over month. Our interactive charts plot your financial trajectory so you know exactly when you'll hit that tipping point of total time flexibility and independence.
              </p>
            </div>

            <div className="group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[#8438FF]/10 flex items-center justify-center text-[#8438FF] mb-6 border border-[#8438FF]/20">
                <Landmark size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Liquid & Illiquid Assets
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                From your forex and commodities portfolios to physical plots in Arusha. Track it all, whether it's cold hard cash or long-term real estate.
              </p>
            </div>

            <div className="group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
                <Activity size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Liability Management
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Keep a strict eye on your Debt-to-Asset ratio. Automatically offset your gross wealth against active loans and mortgages for a realistic valuation.
              </p>
            </div>

            <div className="md:col-span-2 group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500 mb-6 border border-sky-500/20">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
                Private & Secure Ledgers
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                Your portfolio size is nobody's business but yours. Nova stores your asset valuations with end-to-end encryption. No bank logins required—you hold the data, you hold the power.
              </p>
            </div>

          </div>
        </section>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
      `}</style>
    </div>
  );
}