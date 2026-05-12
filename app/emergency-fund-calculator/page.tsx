"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, ArrowRight, Target } from "lucide-react";

export default function EmergencyFundCalculator() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);

  // CALCULATOR STATE
  const [targetGoal, setTargetGoal] = useState<number>(10000000); // 10M TZS Goal
  const [currentSavings, setCurrentSavings] = useState<number>(2000000); // 2M TZS currently saved
  const [monthsToGoal, setMonthsToGoal] = useState<number>(12); // 1 Year

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

  // MATH LOGIC
  const calculateSavingsPlan = () => {
    const amountNeeded = Math.max(0, targetGoal - currentSavings);
    const monthlyRequired = monthsToGoal > 0 ? amountNeeded / monthsToGoal : 0;
    const isGoalReached = currentSavings >= targetGoal;
    const progressPercentage = Math.min(100, (currentSavings / targetGoal) * 100);

    return { amountNeeded, monthlyRequired, isGoalReached, progressPercentage };
  };

  const { amountNeeded, monthlyRequired, isGoalReached, progressPercentage } = calculateSavingsPlan();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount);
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
            "name": "Nova Emergency Fund Calculator",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TZS"
            },
            "description": "Calculate how much you need to save monthly to build your emergency fund or reach a specific financial goal."
          })
        }}
      />

      {/* AMBIENT GLOW (Nova Purple Theme) */}
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
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto mb-16 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">FINANCIAL SECURITY</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Build your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Safety Net.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Protect yourself from <br />
              <span className="text-slate-900 dark:text-white font-bold">The Unexpected.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md mb-8">
              Whether it's a 6-month emergency fund, a new car, or a down payment on a house, calculate exactly how much you need to set aside every month to hit your goal on time.
            </p>
          </div>
        </header>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-24">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* INPUT CONTROLS */}
            <div className="group bg-white dark:bg-[#0F0F15]/80 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-2 transition-transform duration-300 space-y-8">
              
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Target Goal Amount</span>
                  <span className="text-[#8438FF]">{formatMoney(targetGoal)}</span>
                </label>
                <input 
                  type="range" min="100000" max="50000000" step="100000"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(Number(e.target.value))}
                  className="w-full accent-[#8438FF]"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Current Savings</span>
                  <span className="text-[#8438FF]">{formatMoney(currentSavings)}</span>
                </label>
                <input 
                  type="range" min="0" max={targetGoal} step="50000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="w-full accent-[#8438FF]"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Timeline (Months)</span>
                  <span className="text-[#8438FF]">{monthsToGoal} Months</span>
                </label>
                <input 
                  type="range" min="1" max="60" step="1"
                  value={monthsToGoal}
                  onChange={(e) => setMonthsToGoal(Number(e.target.value))}
                  className="w-full accent-[#8438FF]"
                />
              </div>

              {/* Progress Bar */}
              <div className="pt-4">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8438FF] transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

            </div>

            {/* RESULTS PANEL */}
            <div className="group bg-[#8438FF]/5 dark:bg-[#8438FF]/10 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-[#8438FF]/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#8438FF]/20 flex items-center justify-center text-[#8438FF] mb-6">
                <Target size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">
                {isGoalReached ? "Goal Achieved!" : "Monthly Savings Required"}
              </p>
              <h3 className={`text-4xl md:text-5xl font-black tracking-tight mb-8 ${isGoalReached ? 'text-[#10B981]' : 'text-slate-900 dark:text-white'}`}>
                {isGoalReached ? "You did it." : formatMoney(monthlyRequired)}
              </h3>
              
              <div className="h-px w-full bg-[#8438FF]/20 mb-8"></div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Remaining</p>
                  <p className="font-bold text-lg text-[#8438FF]">{formatMoney(amountNeeded)}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Time to Goal</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{monthsToGoal} Months</p>
                </div>
              </div>

              <Link href="/signup" className="mt-10 inline-flex items-center justify-center gap-3 w-full py-4 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all active:scale-95">
                Automate Your Savings <ArrowRight size={18} />
              </Link>
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