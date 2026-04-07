"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, CheckCircle2, Calendar, User, ArrowRight, Activity, Shield } from "lucide-react";

export default function BudgetRuleArticlePage() {
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
      
      {/* 🚀 ARTICLE SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://nova.co.tz/blog/50-30-20-budget-tanzania"
            },
            "headline": "The 50/30/20 Rule: Adapting the Classic Budget for Tanzania",
            "description": "How to split your monthly income between essentials, lifestyle, and investments in Tanzania without feeling restricted.",
            "author": {
              "@type": "Organization",
              "name": "Nova Financial"
            },
            "datePublished": "2026-03-28",
            "dateModified": "2026-03-28"
          })
        }}
      />

      {/* AMBIENT GLOW */}
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

        {/* BLOG HEADER */}
        <header className="max-w-3xl mx-auto w-full mb-16 text-center">
          {/* Badge Removed Successfully */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 text-slate-900 dark:text-white leading-[1.1]">
            The 50/30/20 Rule: Adapting the Classic Budget for Tanzania
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><User size={16} className="text-[#8438FF]" /> Nova Team</span>
            <span className="flex items-center gap-2"><Calendar size={16} className="text-[#8438FF]" /> March 28, 2026</span>
            <span className="text-[10px] uppercase tracking-widest bg-[#8438FF]/10 text-[#8438FF] px-3 py-1 rounded-full">6 Min Read</span>
          </div>
        </header>

        {/* BLOG CONTENT */}
        <article className="max-w-3xl mx-auto w-full flex-grow pb-24">
          <div className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300 mb-12 font-medium">
            <p>
              Tanzania is a nation of hustlers. Whether you are trading forex, running a business, or working a 9-to-5, making money is only half the battle. The real secret to financial freedom is knowing exactly how to allocate that money once it hits your M-Pesa or bank account. 
            </p>
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-16 mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-[#8438FF] rounded-full"></span>
            What is the 50/30/20 Rule?
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
            Popularized globally, this rule is the ultimate low-stress budgeting method. Instead of tracking every single coin, you split your net income (after tax) into three main buckets: <strong className="text-slate-900 dark:text-white">50% for Needs, 30% for Wants, and 20% for Savings and Investments.</strong> Here is how it applies locally.
          </p>

          <div className="space-y-6 mb-16">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0 mt-1"><span className="text-sky-500 font-bold">50%</span></div>
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xl font-bold mb-2">Needs & Essentials</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">These are non-negotiable. This half of your income covers your rent, Luku (electricity), water bills, groceries, and transport (daladala, bodaboda, or fuel). If your basic survival costs exceed 50%, you need to either downsize your living situation or focus heavily on increasing your income.</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-1"><span className="text-amber-500 font-bold">30%</span></div>
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xl font-bold mb-2">Wants & Lifestyle</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">Budgeting shouldn't feel like a prison. 30% of your money is yours to enjoy. This covers eating out (nyama choma on weekends), Netflix subscriptions, new clothes, and weekend trips to places like Zanzibar or local lounges.</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-3xl transition-transform hover:-translate-y-1">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-1"><span className="text-emerald-500 font-bold">20%</span></div>
                <div>
                  <strong className="block text-slate-900 dark:text-white text-xl font-bold mb-2">Savings & Wealth Building</strong>
                  <span className="text-slate-600 dark:text-slate-400 leading-relaxed">This is the most critical bucket. This 20% pays your future self. Use this to build a 6-month emergency fund in a high-yield account, fund your active trading capital, buy plots of land, or aggressively pay off high-interest debt.</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-black mt-16 mb-6 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-[#8438FF] rounded-full"></span>
            Automating Your Discipline
          </h2>
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-16 leading-relaxed">
            The biggest mistake people make is trying to save *whatever is left over* at the end of the month. Instead, the moment you get paid, immediately move that 20% into your savings or investment accounts. Use our free tools to map this out before you spend a single shilling.
          </p>

          {/* BOTTOM CTA (Dual Action: Tool & Sign up) */}
          <div className="relative bg-white dark:bg-[#0F0F15]/90 p-10 md:p-14 rounded-[2.5rem] border border-slate-100 dark:border-[#8438FF]/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8438FF]/10 blur-[80px] pointer-events-none"></div>
            
            <h3 className="text-3xl md:text-4xl font-black mb-4 text-slate-900 dark:text-white tracking-tight relative z-10">
              Calculate Your 50/30/20 Split instantly.
            </h3>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 font-medium relative z-10">
              Input your income and let Nova generate your perfect budget plan.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/budget-calculator" className="inline-flex items-center justify-center gap-3 py-4 px-8 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-[1.5rem] font-bold text-base shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 group">
                Open Free Calculator <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/signup" className="inline-flex items-center justify-center gap-3 py-4 px-8 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white rounded-[1.5rem] font-bold text-base transition-all duration-300 active:scale-95 border border-slate-200 dark:border-white/10">
                Create Tracking Vault
              </Link>
            </div>
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;700;900&display=swap');
      `}</style>
    </div>
  );
}