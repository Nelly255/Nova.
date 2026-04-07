"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, CheckCircle2, Calendar, User, ArrowRight, Activity, Shield } from "lucide-react";

export default function BlogPostPage() {
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
      
      {/* 🚀 ARTICLE SCHEMA MARKUP (Replaces export const metadata for Client Components) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://nova.co.tz/blog/best-budgeting-app-tanzania"
            },
            "headline": "The Best Budgeting App in Tanzania (2026)",
            "description": "Looking for the best way to manage your Tanzanian Shillings? Discover why Nova is the top budgeting app for tracking M-Pesa, bank accounts, and daily expenses in TZ.",
            "author": {
              "@type": "Organization",
              "name": "Nova Financial"
            },
            "datePublished": "2026-04-03",
            "dateModified": "2026-04-06"
          })
        }}
      />

      {/* AMBIENT GLOW (Signature Nova Purple) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6 flex flex-col min-h-screen">
        
        {/* TOP NAV */}
        <nav className="max-w-4xl mx-auto w-full mb-12 md:mb-16 flex items-center justify-between">
          <Link href="/blog" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm md:text-base">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Back to Journal</span>
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

        {/* BLOG HEADER (Matched to the new Cursive UI) */}
        <header className="max-w-3xl mx-auto w-full mb-16 text-center">
          <h1 className="flex flex-col items-center justify-center mb-8">
            <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[3.5rem] sm:text-5xl md:text-[5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
              The Best
            </span>
            <span className="text-[3rem] sm:text-4xl md:text-[5rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
              Budgeting App.
            </span>
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><User size={16} className="text-[#8438FF]" /> Nova Team</span>
            <span className="flex items-center gap-2"><Calendar size={16} className="text-[#8438FF]" /> April 3, 2026</span>
            <span className="text-[10px] uppercase tracking-widest bg-[#8438FF]/10 text-[#8438FF] px-3 py-1 rounded-full">5 Min Read</span>
          </div>
        </header>

        {/* BLOG CONTENT */}
        <article className="max-w-3xl mx-auto w-full flex-grow pb-24">
          <div className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300 mb-12 font-medium">
            <p>
              Managing personal finances in Tanzania comes with unique challenges. Between handling cash for daladala, paying for Luku via M-Pesa or Tigo Pesa, and managing accounts at CRDB or NMB, tracking where your money actually goes can feel impossible. 
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-16 mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-[#8438FF] rounded-full"></span>
            The Problem with Global Budgeting Apps
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Most popular financial apps are built for Western markets. They don't understand mobile money integrations, they force you to use Dollars instead of Tanzanian Shillings (TSh), and they lack the flexibility needed for the local economy. That’s exactly why we built <strong className="text-slate-900 dark:text-white">Nova</strong>.
          </p>

          <h2 className="text-2xl md:text-3xl font-black mt-16 mb-8 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-[#8438FF] rounded-full"></span>
            Why Nova is the Top Choice for Tanzanians
          </h2>
          
          <div className="space-y-6 mb-16">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-[#8438FF] mt-1 flex-shrink-0" size={24} />
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xl font-bold mb-2">1. Native TSh Support</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">No more mental math converting USD to TSh. Nova tracks your net worth and daily expenses entirely in Tanzanian Shillings.</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-[#8438FF] mt-1 flex-shrink-0" size={24} />
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xl font-bold mb-2">2. Perfect for Mobile Money & Cash</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">Whether you are paying street vendors in cash or sending money via mobile networks, Nova allows you to log custom transactions instantly.</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="text-[#8438FF] mt-1 flex-shrink-0" size={24} />
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xl font-bold mb-2">3. Comprehensive Asset Tracking</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">Tanzanians build wealth differently. Log your plots of land, vehicles, and business equity alongside your bank balances in one secure dashboard.</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-16 mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-[#8438FF] rounded-full"></span>
            Take Control of Your Financial Future
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-16 leading-relaxed">
            You can't improve what you don't measure. By using a dedicated expense tracker and budgeting tool like Nova, you can identify bad spending habits, save more for investments, and finally see your true net worth grow.
          </p>

          {/* BOTTOM CTA (Glassmorphic Premium Box) */}
          <div className="relative bg-white dark:bg-[#0F0F15]/90 p-10 md:p-14 rounded-[2.5rem] border border-slate-100 dark:border-[#8438FF]/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8438FF]/10 blur-[80px] pointer-events-none"></div>
            
            <h3 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 dark:text-white tracking-tight relative z-10">
              Ready to start tracking?
            </h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 font-medium relative z-10">
              Join the smartest financial platform in Tanzania today.
            </p>
            <Link href="/login" className="inline-flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-10 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-[1.5rem] font-bold text-base shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 group relative z-10">
              Open Your Free Vault <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </article>

        {/* FOOTER */}
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

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;700;900&display=swap');
      `}</style>
    </div>
  );
}