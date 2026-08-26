"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Download, Sun, Moon, AlertTriangle, Calendar, Wallet, Coins, Receipt, Percent } from "lucide-react";

export default function ROICalculator() {
  const [isDark, setIsDark] = useState(true);
  
  // Advanced Financial States
  const [investment, setInvestment] = useState<number>(0);
  const [additionalCosts, setAdditionalCosts] = useState<number>(0);
  const [totalReturn, setTotalReturn] = useState<number>(0); 
  const [years, setYears] = useState<number>(1);
  const [inflationRate, setInflationRate] = useState<number>(0);

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

  // Pro Calculations
  const calculateROI = () => {
    const totalInvested = investment + additionalCosts;
    
    if (totalInvested <= 0) return { netProfit: 0, roi: 0, annualizedRoi: 0, realYield: 0, totalInvested: 0 };

    const netProfit = totalReturn - totalInvested;
    const roi = (netProfit / totalInvested) * 100;
    
    let annualizedRoi = 0;
    if (years > 0 && totalReturn > 0) {
      annualizedRoi = (Math.pow((totalReturn / totalInvested), (1 / years)) - 1) * 100;
    }

    const realYield = annualizedRoi - inflationRate;

    return { netProfit, roi, annualizedRoi, realYield, totalInvested };
  };

  const { netProfit, roi, annualizedRoi, realYield, totalInvested } = calculateROI();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(amount) + '%';
  };

  const handleNumberChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
    setter(rawValue ? parseInt(rawValue, 10) : 0);
  };

  const handleFloatChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    setter(rawValue ? parseFloat(rawValue) : 0);
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* PURPLE AMBIENT GLOW */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0 print:hidden"></div>

      {/* 🚀 WEB UI WRAPPER */}
      <div className="web-ui-only relative z-10 pt-6 md:pt-12 px-4 sm:px-6 print:hidden">
        
        {/* TOP NAV */}
        <nav className="max-w-6xl mx-auto w-full mb-12 md:mb-16 flex items-center justify-between">
          <Link href="/tools" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm md:text-base">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Back to Tools</span>
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
        <header className="max-w-6xl mx-auto mb-12 md:mb-16 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA TOOLS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[3rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Return on Investment
              </span>
              <span className="text-[2.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8B5CF6] leading-[0.85] mt-1 md:mt-0">
                Calculator.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10 mb-4">
            <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Track your profitability <br className="hidden sm:block" />
              <span className="text-slate-900 dark:text-white font-bold">& Measure True Success.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Calculate advanced ROI (CAGR), factor in maintenance costs, and adjust for inflation to see the true performance of your capital.
            </p>
          </div>
        </header>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-12 grid lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* INPUTS */}
          <div className="bg-white dark:bg-[#0F0F15]/80 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Initial Capital (TZS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6]">
                  <Wallet size={20} />
                </div>
                <input 
                  type="text" 
                  value={investment === 0 ? '' : investment.toLocaleString('en-US')}
                  onChange={handleNumberChange(setInvestment)}
                  placeholder="e.g. 10,000,000"
                  className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Additional Costs / Fees (TZS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Receipt size={20} />
                </div>
                <input 
                  type="text" 
                  value={additionalCosts === 0 ? '' : additionalCosts.toLocaleString('en-US')}
                  onChange={handleNumberChange(setAdditionalCosts)}
                  placeholder="e.g. 500,000"
                  className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Final Return Value (TZS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Coins size={20} />
                </div>
                <input 
                  type="text" 
                  value={totalReturn === 0 ? '' : totalReturn.toLocaleString('en-US')}
                  onChange={handleNumberChange(setTotalReturn)}
                  placeholder="e.g. 15,000,000"
                  className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Holding (Years)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="number" 
                    step="0.1"
                    value={years === 0 ? '' : years}
                    onChange={handleFloatChange(setYears)}
                    placeholder="e.g. 1"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Inflation (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Percent size={18} />
                  </div>
                  <input 
                    type="number" 
                    step="0.1"
                    value={inflationRate === 0 ? '' : inflationRate}
                    onChange={handleFloatChange(setInflationRate)}
                    placeholder="e.g. 4.5"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-3 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RESULTS */}
          <div className="bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 p-6 sm:p-8 rounded-[2rem] border border-[#8B5CF6]/20 shadow-xl flex flex-col justify-center">
            
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-6">
              <TrendingUp size={24} />
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">
              Total Net Profit
            </p>
            <h3 className={`text-4xl md:text-5xl font-black tracking-tight mb-8 ${netProfit >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
              {netProfit > 0 ? '+' : ''}{formatMoney(netProfit)}
            </h3>
            
            <div className="space-y-4 pt-4 border-t border-[#8B5CF6]/20">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Total ROI</span>
                <span className={roi >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {roi > 0 ? '+' : ''}{formatPercent(roi)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Annualized Yield (CAGR)</span>
                <span className={annualizedRoi >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                  {annualizedRoi > 0 ? '+' : ''}{formatPercent(annualizedRoi)}
                </span>
              </div>

              {inflationRate > 0 && (
                <div className="flex justify-between text-sm font-bold pt-2">
                  <span className="text-slate-500 dark:text-slate-400">Real Yield (Inflation Adj.)</span>
                  <span className={realYield >= 0 ? 'text-emerald-500' : 'text-rose-500'}>
                    {realYield > 0 ? '+' : ''}{formatPercent(realYield)}
                  </span>
                </div>
              )}
            </div>

            <button 
              onClick={() => window.print()}
              disabled={investment === 0}
              className="mt-8 w-full py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-2xl font-bold shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              <Download size={18} /> Export PDF Report
            </button>
          </div>
        </section>

        {/* 🚀 WEB UI LEGAL DISCLAIMER */}
        <div className="max-w-6xl mx-auto pb-24">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-100/50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-white/5 flex gap-4 items-start shadow-sm">
            <AlertTriangle size={20} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Financial Disclaimer</p>
              <p>
                Calculations provide performance tracking for informational purposes. Annualized yield uses standard Compound Annual Growth Rate (CAGR) formulas. Ensure you account for personal tax liabilities outside of this tool.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================
          🖨️ PDF PRINT TEMPLATE (Minimalist Pro version)
          ========================================= */}
      <div className="hidden print:block print-template w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900">
        <div className="p-12 flex flex-col h-full">
          
          <div className="flex-grow">
            {/* Header */}
            <div className="border-b-4 pb-6 mb-10 flex justify-between items-end border-[#8B5CF6]">
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-1">Nova.</h1>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">ROI Assessment</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-serif font-bold text-slate-900">{today}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mt-1">Performance Report</p>
              </div>
            </div>

            {/* Calculation Table */}
            <table className="w-full mb-12 border-collapse">
              <thead>
                <tr>
                  <th className="text-left border-b-2 py-3 font-serif text-xs uppercase tracking-wider border-[#8B5CF6] text-slate-500">Metric</th>
                  <th className="text-right border-b-2 py-3 font-serif text-xs uppercase tracking-wider border-[#8B5CF6] text-slate-500">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 border-b border-slate-100 text-slate-700 font-bold">Initial Capital</td>
                  <td className="py-4 border-b border-slate-100 text-right font-bold text-slate-900">{formatMoney(investment)}</td>
                </tr>
                {additionalCosts > 0 && (
                  <tr>
                    <td className="py-4 border-b border-slate-100 text-slate-700 font-bold">Additional Costs</td>
                    <td className="py-4 border-b border-slate-100 text-right font-bold text-slate-900">{formatMoney(additionalCosts)}</td>
                  </tr>
                )}
                <tr className="bg-slate-50">
                  <td className="py-4 px-2 border-b border-slate-200 text-slate-900 font-bold">Total Capital Invested</td>
                  <td className="py-4 px-2 border-b border-slate-200 text-right font-bold text-slate-900">{formatMoney(totalInvested)}</td>
                </tr>
                <tr>
                  <td className="py-4 border-b border-slate-100 text-slate-700 font-bold">Final Return Value</td>
                  <td className="py-4 border-b border-slate-100 text-right font-bold text-slate-900">{formatMoney(totalReturn)}</td>
                </tr>
                <tr>
                  <td className="py-4 border-b border-slate-100 text-slate-700 font-bold">Holding Period</td>
                  <td className="py-4 border-b border-slate-100 text-right font-bold text-slate-900">{years} {years === 1 ? 'Year' : 'Years'}</td>
                </tr>
                
                <tr><td colSpan={2} className="py-6"></td></tr>

                <tr>
                  <td className="py-4 border-b border-slate-100 text-slate-700">Total ROI</td>
                  <td className="py-4 border-b border-slate-100 text-right font-bold text-emerald-600">{formatPercent(roi)}</td>
                </tr>
                <tr>
                  <td className="py-4 border-b border-slate-100 text-slate-700">Annualized Yield (CAGR)</td>
                  <td className="py-4 border-b border-slate-100 text-right font-bold text-emerald-600">{formatPercent(annualizedRoi)}</td>
                </tr>
                {inflationRate > 0 && (
                  <tr>
                    <td className="py-4 border-b border-slate-100 text-slate-700">Real Yield (Inflation Adjusted - {inflationRate}%)</td>
                    <td className="py-4 border-b border-slate-100 text-right font-bold text-emerald-600">{formatPercent(realYield)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-6 font-serif font-bold uppercase text-lg text-[#8B5CF6]">Net Profit</td>
                  <td className="py-6 text-right font-black text-2xl border-b-[4px] border-double border-[#8B5CF6]">
                    {netProfit > 0 ? '+' : ''}{formatMoney(netProfit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 🚀 PDF FOOTER (Minimal) */}
          <div className="mt-auto pt-6 border-t border-slate-200 text-center text-[10px] font-serif text-slate-400 uppercase tracking-widest">
            Generated by Nova Tools
          </div>

        </div>
      </div>

      {/* 🚀 AGGRESSIVE PRINT STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
        
        @media print {
          body, html { 
            background-color: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Hide the interactive UI entirely */
          .web-ui-only { 
            display: none !important; 
          }

          /* Force the template to display */
          .print-template {
            display: block !important;
          }

          @page { margin: 0; size: A4 portrait; }
          header, nav, footer, aside, .fixed, .sticky { display: none !important; }
        }
      `}</style>
    </div>
  );
}