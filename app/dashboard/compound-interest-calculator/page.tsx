"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

export default function DashboardCompoundInterestCalculator() {
  // CALCULATOR STATE
  const [initialInvestment, setInitialInvestment] = useState<number>(1000000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(250000);
  const [years, setYears] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(10); // 10% annual return

  // MATH LOGIC
  const calculateWealth = () => {
    const r = interestRate / 100;
    const n = 12; // months in a year
    const t = years;
    
    const principalFutureValue = initialInvestment * Math.pow(1 + r / n, n * t);
    const seriesFutureValue = monthlyContribution * ((Math.pow(1 + r / n, n * t) - 1) / (r / n));
    
    const totalFutureValue = principalFutureValue + seriesFutureValue;
    const totalInvested = initialInvestment + (monthlyContribution * 12 * years);
    const totalInterest = totalFutureValue - totalInvested;

    return { totalFutureValue, totalInvested, totalInterest };
  };

  const { totalFutureValue, totalInvested, totalInterest } = calculateWealth();

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
            "name": "Nova Compound Interest Calculator",
            "operatingSystem": "Web, iOS, Android",
            "applicationCategory": "FinanceApplication",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "TZS"
            },
            "description": "Calculate your future wealth and see how compound interest can grow your savings over time."
          })
        }}
      />

      {/* AMBIENT GLOW */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 lg:p-12">
        
        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto mb-12 md:mb-16 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">WEALTH CALCULATOR</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Project your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Future.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              See the power of <br />
              <span className="text-slate-900 dark:text-white font-bold">Compound Interest.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Adjust your initial deposit, monthly savings, and time horizon to see exactly how your money can multiply through consistent investment.
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
                  <span>Initial Investment</span>
                  <span className="text-[#8438FF]">{formatMoney(initialInvestment)}</span>
                </label>
                <input 
                  type="range" min="0" max="10000000" step="100000"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="w-full accent-[#8438FF]"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Monthly Contribution</span>
                  <span className="text-[#8438FF]">{formatMoney(monthlyContribution)}</span>
                </label>
                <input 
                  type="range" min="0" max="2000000" step="50000"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full accent-[#8438FF]"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Years to Grow</span>
                  <span className="text-[#8438FF]">{years} Years</span>
                </label>
                <input 
                  type="range" min="1" max="40" step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-[#8438FF]"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  <span>Estimated Annual Return (%)</span>
                  <span className="text-[#8438FF]">{interestRate}%</span>
                </label>
                <input 
                  type="range" min="1" max="20" step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-[#8438FF]"
                />
              </div>

            </div>

            {/* RESULTS PANEL */}
            <div className="group bg-[#8438FF]/5 dark:bg-[#8438FF]/10 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-[#8438FF]/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#8438FF]/20 flex items-center justify-center text-[#8438FF] mb-6">
                <TrendingUp size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Total Future Wealth</p>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
                {formatMoney(totalFutureValue)}
              </h3>
              
              <div className="h-px w-full bg-[#8438FF]/20 mb-8"></div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Invested</p>
                  <p className="font-bold text-lg text-slate-900 dark:text-white">{formatMoney(totalInvested)}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Interest Earned</p>
                  <p className="font-bold text-lg text-[#10B981]">{formatMoney(totalInterest)}</p>
                </div>
              </div>

              <Link href="/dashboard" className="mt-10 inline-flex items-center justify-center gap-3 w-full py-4 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all active:scale-95">
                Start Building Wealth <ArrowRight size={18} />
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