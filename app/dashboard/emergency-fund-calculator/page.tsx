"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

export default function DashboardEmergencyFundCalculator() {
  // CALCULATOR STATE
  const [targetGoal, setTargetGoal] = useState<number>(10000000); // 10M TZS Goal
  const [currentSavings, setCurrentSavings] = useState<number>(2000000); // 2M TZS currently saved
  const [monthsToGoal, setMonthsToGoal] = useState<number>(12); // 1 Year

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
    <div className="w-full bg-transparent text-slate-900 dark:text-slate-50 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
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

      {/* AMBIENT GLOW */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 lg:p-12">
        
        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto mb-12 md:mb-16 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className=""></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">FINANCIAL SECURITY</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Build your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-brand-500 leading-[0.85] mt-1 md:mt-0">
                Safety Net.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Protect yourself from <br />
              <span className="text-slate-900 dark:text-white font-bold">The Unexpected.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Whether it's a 6-month emergency fund, a new car, or a down payment on a house, calculate exactly how much you need to set aside every month to hit your goal on time.
            </p>
          </div>
        </header>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-12">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* INPUT CONTROLS */}
            <div className="group bg-white dark:bg-[#0F0F15]/80 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 space-y-8">
              
              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Target Goal Amount</span>
                  <span className="text-brand-500">{formatMoney(targetGoal)}</span>
                </label>
                <input 
                  type="range" min="100000" max="50000000" step="100000"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Current Savings</span>
                  <span className="text-brand-500">{formatMoney(currentSavings)}</span>
                </label>
                <input 
                  type="range" min="0" max={targetGoal} step="50000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Timeline (Months)</span>
                  <span className="text-brand-500">{monthsToGoal} Months</span>
                </label>
                <input 
                  type="range" min="1" max="60" step="1"
                  value={monthsToGoal}
                  onChange={(e) => setMonthsToGoal(Number(e.target.value))}
                  className="w-full accent-brand-500"
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
                    className="h-full bg-brand-500 transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

            </div>

            {/* RESULTS PANEL */}
            <div className="group bg-brand-500/5 dark:bg-brand-500/10 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-brand-500/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-500 mb-6">
                <Target size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">
                {isGoalReached ? "Goal Achieved!" : "Monthly Savings Required"}
              </p>
              <h3 className={`text-4xl md:text-5xl font-black tracking-tight mb-8 ${isGoalReached ? 'text-[#10B981]' : 'text-slate-900 dark:text-white'}`}>
                {isGoalReached ? "You did it." : formatMoney(monthlyRequired)}
              </h3>
              
              <div className="h-px w-full bg-brand-500/20 mb-8"></div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Remaining</p>
                  <p className="font-bold text-lg text-brand-500">{formatMoney(amountNeeded)}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Time to Goal</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{monthsToGoal} Months</p>
                </div>
              </div>

              <Link href="/dashboard" className="mt-10 inline-flex items-center justify-center gap-3 w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-[0_8px_20px_rgb(var(--brand-500)/0.3)] transition-all active:scale-95">
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