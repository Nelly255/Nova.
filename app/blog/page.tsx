"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, ArrowRight, Calendar, User, BookOpen, Activity, Shield } from "lucide-react";

export default function BlogIndexPage() {
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
      
      {/* 🚀 SCHEMA MARKUP (Optimized for Blog Hub) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Nova Financial Intelligence Blog",
            "description": "Insights, guides, and strategies for managing wealth, tracking expenses, and building financial independence in Tanzania.",
            "url": "https://nova.co.tz/blog"
          })
        }}
      />

      {/* AMBIENT GLOW */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6 flex flex-col min-h-screen">
        
        {/* TOP NAV */}
        <nav className="max-w-6xl mx-auto w-full mb-12 md:mb-16 flex items-center justify-between">
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

        {/* 🚀 HERO SECTION (Matched to Trackers UI) */}
        <header className="max-w-6xl mx-auto w-full mb-20 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA JOURNAL</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Financial
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Intelligence.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10 mb-4">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Master your money <br />
              & <span className="text-slate-900 dark:text-white font-bold">Build Lasting Wealth.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Strategies, insights, and guides to help you track your assets, eliminate debt, and achieve true financial independence in Tanzania.
            </p>
          </div>
        </header>

        {/* BLOG GRID */}
        <main className="max-w-6xl mx-auto w-full flex-grow pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* FEATURED / PLATFORM POST */}
            <BlogCard 
              href="/blog/best-budgeting-app-tanzania"
              category="Platform"
              title="The Best Budgeting App in Tanzania: Managing Your Wealth in 2026"
              excerpt="Discover why global apps fail in the local market, and how tracking TSH and M-Pesa transactions can transform your financial life."
              date="April 3, 2026"
              readTime="5 min read"
              featured={true}
            />

            {/* WEALTH BUILDING POST (Patched and Linked!) */}
            <BlogCard 
              href="/blog/asset-depreciation-tanzania"
              category="Wealth Building"
              title="How to Calculate Asset Depreciation for TRA Compliance"
              excerpt="Understand TRA capital allowance classes and the reducing balance method to track your true net worth in Tanzania."
              date="April 1, 2026"
              readTime="4 min read"
            />

            {/* STRATEGY POST */}
            <BlogCard 
              href="/blog/50-30-20-budget-tanzania"
              category="Strategy"
              title="The 50/30/20 Rule: Adapting the Classic Budget for Tanzania"
              excerpt="How to split your monthly income between essentials, lifestyle, and investments in Tanzania without feeling restricted."
              date="March 28, 2026"
              readTime="6 min read"
            />

          </div>
        </main>

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

// 📝 BLOG CARD COMPONENT
function BlogCard({ href, category, title, excerpt, date, readTime, featured = false }: { href: string, category: string, title: string, excerpt: string, date: string, readTime: string, featured?: boolean }) {
  return (
    <Link href={href} className={`group bg-white dark:bg-[#0F0F15]/80 p-6 md:p-8 rounded-[2rem] border ${featured ? 'border-[#8438FF]/30 dark:border-[#8438FF]/50 shadow-[0_8px_30px_rgba(132,56,255,0.1)]' : 'border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} backdrop-blur-3xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full relative overflow-hidden`}>
      
      {featured && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8438FF]/10 blur-[50px] pointer-events-none"></div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#8438FF] bg-[#8438FF]/10 px-3 py-1 rounded-full">
          {category}
        </span>
        {featured && (
          <span className="flex h-2 w-2 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF] animate-pulse"></span>
        )}
      </div>

      <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-[#8438FF] transition-colors leading-tight">
        {title}
      </h3>
      
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed flex-grow mb-6">
        {excerpt}
      </p>

      <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {date}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-white group-hover:text-[#8438FF] transition-colors">
          Read Article <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}