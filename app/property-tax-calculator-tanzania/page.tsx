"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, Scale, Landmark, Calculator, DollarSign, Download, Sun, Moon, AlertTriangle } from "lucide-react";

export default function PropertyTaxCalculator() {
  const [isDark, setIsDark] = useState(true);
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  
  // Financial States
  const [propertyValue, setPropertyValue] = useState<number>(0);
  const [originalCost, setOriginalCost] = useState<number>(0); 
  const [legalFeePct, setLegalFeePct] = useState<number>(1);
  const [agencyFeePct, setAgencyFeePct] = useState<number>(0);

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

  // Calculations
  const calculateTaxes = () => {
    if (propertyValue <= 0) return { stampDuty: 0, cgt: 0, legalFee: 0, agencyFee: 0, totalBuyerCost: 0, netSellerRevenue: 0, profit: 0 };

    const stampDuty = propertyValue * 0.01; 
    const legalFee = propertyValue * (legalFeePct / 100);
    const totalBuyerCost = propertyValue + stampDuty + legalFee;

    const profit = Math.max(0, propertyValue - originalCost);
    const cgt = profit * 0.10; 
    const agencyFee = propertyValue * (agencyFeePct / 100);
    const netSellerRevenue = propertyValue - cgt - agencyFee - legalFee;

    return { stampDuty, cgt, legalFee, agencyFee, totalBuyerCost, netSellerRevenue, profit };
  };

  const { stampDuty, cgt, legalFee, agencyFee, totalBuyerCost, netSellerRevenue, profit } = calculateTaxes();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNumberChange = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
    setter(rawValue ? parseInt(rawValue, 10) : 0);
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
        <header className="max-w-6xl mx-auto mb-10 md:mb-12 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA TOOLS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[3rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Property Tax
              </span>
              <span className="text-[2.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8B5CF6] leading-[0.85] mt-1 md:mt-0">
                Calculator.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10 mb-4">
            <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Calculate your taxes <br className="hidden sm:block" />
              <span className="text-slate-900 dark:text-white font-bold">& Prevent Surprises.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Estimate your Stamp Duty (1%) or Capital Gains Tax (10%) and generate a professional calculation report instantly before you sign any contracts.
            </p>
          </div>
        </header>

        {/* ROLE TOGGLE */}
        <div className="max-w-6xl mx-auto mb-8 bg-white dark:bg-[#0F0F15] p-2 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex">
          <button 
            onClick={() => setRole('buyer')}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${role === 'buyer' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Home size={18} /> I am Buying
          </button>
          <button 
            onClick={() => setRole('seller')}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${role === 'seller' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <DollarSign size={18} /> I am Selling
          </button>
        </div>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-12 grid lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* INPUTS */}
          <div className="bg-white dark:bg-[#0F0F15]/80 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-6">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                {role === 'buyer' ? 'Agreed Purchase Price (TZS)' : 'Agreed Selling Price (TZS)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6]">
                  <Calculator size={20} />
                </div>
                <input 
                  type="text" 
                  value={propertyValue === 0 ? '' : propertyValue.toLocaleString('en-US')}
                  onChange={handleNumberChange(setPropertyValue)}
                  placeholder="e.g. 50,000,000"
                  className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            {role === 'seller' && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                  Original Cost + Improvements (TZS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Landmark size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={originalCost === 0 ? '' : originalCost.toLocaleString('en-US')}
                    onChange={handleNumberChange(setOriginalCost)}
                    placeholder="e.g. 30,000,000"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Legal Fee (%)</label>
                <input type="number" value={legalFeePct} onChange={(e)=>setLegalFeePct(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Broker Fee (%)</label>
                <input type="number" value={agencyFeePct} onChange={(e)=>setAgencyFeePct(Number(e.target.value))} className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"/>
              </div>
            </div>

          </div>

          {/* RESULTS */}
          <div className="bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 p-6 sm:p-8 rounded-[2rem] border border-[#8B5CF6]/20 shadow-xl flex flex-col justify-center">
            
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-6">
              <Scale size={24} />
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">
              {role === 'buyer' ? 'Total Acquisition Cost' : 'Final Net Disbursement'}
            </p>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
              {formatMoney(role === 'buyer' ? totalBuyerCost : netSellerRevenue)}
            </h3>
            
            <div className="space-y-4 pt-4 border-t border-[#8B5CF6]/20">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Stamp Duty (1%)</span>
                <span className={role === 'buyer' ? 'text-rose-500' : 'text-slate-400'}>{role === 'buyer' ? '+' : ''}{formatMoney(stampDuty)}</span>
              </div>
              {role === 'seller' && (
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Capital Gains Tax (10%)</span>
                  <span className="text-rose-500">-{formatMoney(cgt)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Professional Fees</span>
                <span className="text-rose-500">-{formatMoney(legalFee + agencyFee)}</span>
              </div>
            </div>

            <button 
              onClick={() => window.print()}
              disabled={propertyValue === 0}
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
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Legal & Financial Disclaimer</p>
              <p>
                The calculations provided by Nova are for informational and strategic planning purposes only. While we strive to keep our formulas updated with the latest Tanzania Revenue Authority (TRA) guidelines, actual tax liabilities, stamp duties, and government valuations may vary. 
                Nova Wealth Management is not a registered tax consultancy. Always consult with a certified CPA, registered advocate, or official TRA representative before finalizing any financial transactions, real estate purchases, or tax returns.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================
          🖨️ PDF PRINT TEMPLATE (Hidden from web UI)
          ========================================= */}
      <div className="hidden print:block print-template w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900">
        <div className="p-12 flex flex-col h-full">
          
          <div className="flex-grow">
            {/* Header */}
            <div className="border-b-4 pb-8 mb-12 flex justify-between items-end border-[#8B5CF6]">
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                  Nova.
                </h1>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Real Estate Tax Assessment
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-serif text-slate-600">{today}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] mt-1">
                  {role === 'buyer' ? 'Buyer Profile' : 'Seller Profile'}
                </p>
              </div>
            </div>

            {/* Context Paragraph */}
            <div className="mb-10 text-justify">
              <p className="text-slate-700 font-serif leading-relaxed">
                This document serves as an official calculation estimate for the upcoming property transaction. It outlines the base valuation, statutory TRA tax obligations ({role === 'buyer' ? 'Stamp Duty' : 'Capital Gains Tax'}), and professional service fees.
              </p>
            </div>

            {/* Calculation Table */}
            <table className="w-full mb-12 border-collapse">
              <thead>
                <tr>
                  <th className="text-left border-b-2 py-4 font-serif text-sm uppercase tracking-wider border-[#8B5CF6]">Item Description</th>
                  <th className="text-right border-b-2 py-4 font-serif text-sm uppercase tracking-wider border-[#8B5CF6]">Amount (TZS)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 border-b border-slate-200 text-slate-700 font-bold">Base Property Valuation</td>
                  <td className="py-4 border-b border-slate-200 text-right font-bold text-slate-900">{formatMoney(propertyValue)}</td>
                </tr>
                
                {role === 'seller' && (
                  <>
                    <tr>
                      <td className="py-4 border-b border-slate-200 text-slate-500 italic">Less: Original Cost / Improvements</td>
                      <td className="py-4 border-b border-slate-200 text-right text-slate-500 italic">({formatMoney(originalCost)})</td>
                    </tr>
                    <tr>
                      <td className="py-4 border-b border-slate-200 text-slate-700 font-bold">Taxable Capital Gain (Profit)</td>
                      <td className="py-4 border-b border-slate-200 text-right font-bold text-slate-900">{formatMoney(profit)}</td>
                    </tr>
                    <tr><td colSpan={2} className="py-2"></td></tr>
                  </>
                )}

                {/* Taxes & Fees */}
                {role === 'buyer' ? (
                  <tr>
                    <td className="py-4 border-b border-slate-200 text-slate-700">TRA Stamp Duty (1%)</td>
                    <td className="py-4 border-b border-slate-200 text-right font-bold text-rose-600">+{formatMoney(stampDuty)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td className="py-4 border-b border-slate-200 text-slate-700">TRA Capital Gains Tax (10%)</td>
                    <td className="py-4 border-b border-slate-200 text-right font-bold text-rose-600">-{formatMoney(cgt)}</td>
                  </tr>
                )}
                
                <tr>
                  <td className="py-4 border-b border-slate-200 text-slate-700">Legal & Advocate Fees ({legalFeePct}%)</td>
                  <td className="py-4 border-b border-slate-200 text-right text-rose-600">{role === 'buyer' ? '+' : '-'}{formatMoney(legalFee)}</td>
                </tr>
                
                {agencyFeePct > 0 && (
                  <tr>
                    <td className="py-4 border-b border-slate-200 text-slate-700">Broker Agency Fee ({agencyFeePct}%)</td>
                    <td className="py-4 border-b border-slate-200 text-right text-rose-600">{role === 'buyer' ? '+' : '-'}{formatMoney(agencyFee)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-6 font-serif font-bold uppercase text-lg text-[#8B5CF6]">
                    {role === 'buyer' ? 'Total Capital Required' : 'Net Disbursement to Seller'}
                  </td>
                  <td className="py-6 text-right font-black text-2xl border-b-[4px] border-double border-[#8B5CF6]">
                    {formatMoney(role === 'buyer' ? totalBuyerCost : netSellerRevenue)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 🚀 PDF LEGAL DISCLAIMER */}
          <div className="mt-16 pt-8 border-t-2 border-slate-200 text-center text-xs font-serif text-slate-500">
            <p className="font-bold text-slate-700 mb-1">CONFIDENTIAL STRATEGY DOCUMENT</p>
            <p>Generated by the Nova Tracking Engine.</p>
            <p className="mt-4 italic text-[10px] text-slate-400">
              Disclaimer: This document provides an estimated calculation based on user inputs and current general tax rates. It does not constitute official tax advice, a formal government valuation, or a legal tax return. Final assessments are strictly subject to TRA and relevant ministry approvals.
            </p>
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