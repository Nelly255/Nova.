"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Calculator, PiggyBank, BellRing, ArrowRight, Moon, Sun } from "lucide-react";

export default function BudgetingAppPage() {
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
      
      {/* 🚀 SCHEMA MARKUP */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Nova Budgeting Tool",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "FinanceApplication",
          })
        }}
      />

      {/* AMBIENT GLOW (Signature Nova Purple) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>

      <div className="relative z-10 pt-6 md:pt-12">
        
        {/* TOP NAV WITH THEME TOGGLE */}
        <nav className="max-w-6xl mx-auto mb-16 px-6 md:px-0 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span>Back to Home</span>
          </Link>
          
          <button 
            onClick={toggleTheme} 
            className="p-3 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* ASYMMETRIC HERO SECTION */}
        <header className="max-w-6xl mx-auto px-6 mb-24 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA SMART BUDGET</span>
            </div>
            
            {/* Perfectly scaled cursive and clean flex-col stack */}
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-4 pl-1">
                Smart
              </span>
              <span className="text-6xl md:text-[6rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85]">
                Budgeting.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-5">
              Give every shilling <br />
              <span className="text-slate-900 dark:text-white font-bold">A Purpose.</span>
            </p>
            <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm mb-8">
              Create custom budgets for rent, transport, food, and investments. Nova tracks your progress in real-time so you never overspend your monthly salary.
            </p>
            
            <Link href="/login" className="inline-flex items-center justify-center gap-3 w-full sm:w-auto py-4 px-8 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-[1.5rem] font-bold text-[15px] shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 group">
              Build My Budget <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </header>

        {/* GLASSMORPHISM FEATURE CARDS */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Calculator size={24} />} 
              title="Zero-Based Budgeting" 
              description="Allocate exactly how much you want to spend in each category before the month begins." 
            />
            <FeatureCard 
              icon={<BellRing size={24} />} 
              title="Stay on Track" 
              description="Visual progress bars show you exactly how much you have left to spend in each category." 
            />
            <FeatureCard 
              icon={<PiggyBank size={24} />} 
              title="Automate Savings" 
              description="By tracking your spending limits, you naturally free up more cash to put into savings and investments." 
            />
          </div>
        </section>

      </div>

      {/* GLOBAL FONT STYLES */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
        `
      }} />
    </div>
  );
}

// MATCHING PREMIUM COMPONENT STYLING (Purple Edition)
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300 group">
      <div className="w-14 h-14 rounded-2xl bg-[#8438FF]/10 flex items-center justify-center text-[#8438FF] mb-8 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-black uppercase tracking-wide text-slate-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}