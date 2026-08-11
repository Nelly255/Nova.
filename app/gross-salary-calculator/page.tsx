"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Landmark, Target, ArrowLeft, Moon, Sun } from "lucide-react";

export default function DashboardNetToGrossCalculator() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);

  // START AT ZERO SO PLACEHOLDER SHOWS
  const [targetNetSalary, setTargetNetSalary] = useState<number>(0);

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

  // TANZANIA MAINLAND PAYE LOGIC (2024/2025 UPDATED RATES)
  const calculateNetFromGross = (gross: number) => {
    // Handle edge case
    if (gross <= 0) {
      return { gross: 0, nssf: 0, paye: 0, net: 0 };
    }

    const nssf = gross * 0.10;
    const taxableIncome = gross - nssf;
    let paye = 0;

    // CORRECTED TAX BRACKETS - Tanzania Mainland 2024/2025
    if (taxableIncome <= 270000) {
      paye = 0;
    } else if (taxableIncome <= 520000) {
      paye = (taxableIncome - 270000) * 0.08;
    } else if (taxableIncome <= 760000) {
      paye = 20000 + (taxableIncome - 520000) * 0.20;
    } else if (taxableIncome <= 1000000) {
      paye = 68000 + (taxableIncome - 760000) * 0.25; // FIXED: was 680000
    } else {
      paye = 128000 + (taxableIncome - 1000000) * 0.30; // FIXED: was 128000 (correct)
    }

    const net = Math.max(0, gross - nssf - paye);
    return { gross, nssf, paye, net };
  };

  // IMPROVED BINARY SEARCH - More precise and faster
  const calculateRequiredGross = (targetNet: number): { gross: number; nssf: number; paye: number; net: number } => {
    // Handle zero or negative target
    if (targetNet <= 0) {
      return calculateNetFromGross(0);
    }

    // If target is very small, handle directly
    if (targetNet < 1000) {
      let testGross = targetNet;
      let result = calculateNetFromGross(testGross);
      while (result.net < targetNet && testGross < targetNet * 2) {
        testGross += 100;
        result = calculateNetFromGross(testGross);
      }
      return result;
    }

    let low = targetNet; // Gross can never be lower than net (after taxes)
    let high = targetNet * 3; // Higher safe upper bound
    let mid = 0;
    let bestResult = calculateNetFromGross(low);
    let iterations = 0;
    const maxIterations = 100;

    // Binary search with precision goal
    while (iterations < maxIterations) {
      mid = (low + high) / 2;
      const result = calculateNetFromGross(mid);
      
      if (Math.abs(result.net - targetNet) < 1) {
        // Found within 1 TZS precision
        return result;
      }
      
      if (result.net < targetNet) {
        low = mid;
        bestResult = result;
      } else {
        high = mid;
        bestResult = result;
      }
      iterations++;
    }

    // Return the closest result
    const finalResult = calculateNetFromGross(mid);
    
    // Ensure we're not below target
    if (finalResult.net < targetNet) {
      // Increment gross until we meet or exceed target
      let adjustedGross = mid;
      let adjustedResult = finalResult;
      while (adjustedResult.net < targetNet && adjustedGross < targetNet * 3) {
        adjustedGross += 100;
        adjustedResult = calculateNetFromGross(adjustedGross);
      }
      return adjustedResult;
    }
    
    return finalResult;
  };

  const result = calculateRequiredGross(targetNetSalary);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
    setTargetNetSalary(rawValue ? parseInt(rawValue, 10) : 0);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 relative overflow-hidden print:bg-white print:text-black transition-colors duration-500" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#3B82F6]/10 dark:bg-[#3B82F6]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0 print:hidden"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 lg:p-12 print:hidden">
        
        {/* TOP NAV */}
        <nav className="max-w-6xl mx-auto mb-12 md:mb-16 flex items-center justify-between">
          <Link href="/tools" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm md:text-base">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Back to Tools</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <button 
            onClick={toggleTheme} 
            className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        <header className="max-w-6xl mx-auto mb-12 md:mb-16 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">SALARY NEGOTIATION</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Know your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#3B82F6] leading-[0.85] mt-1 md:mt-0">
                Salary With Tax.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Start with what you want to take home. <br />
              <span className="text-slate-900 dark:text-white font-bold">Your Expected Salary.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
             Enter your target net pay and we'll work backwards to show you the gross salary you need.
            </p>
          </div>
        </header>

        <section className="max-w-6xl mx-auto pb-12">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* INPUT CONTROLS */}
            <div className="relative z-50 bg-white dark:bg-[#0F0F15] p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 flex flex-col justify-center">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider" htmlFor="targetNet">
                  Target Monthly Net Pay (TZS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#3B82F6]">
                    <Target size={24} />
                  </div>
                  <input 
                    id="targetNet"
                    type="text" 
                    value={targetNetSalary === 0 ? '' : targetNetSalary.toLocaleString('en-US')}
                    onChange={handleNetChange}
                    placeholder="e.g. 3,000,000"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-5 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#3B82F6] transition-colors"
                    aria-label="Target monthly net salary in TZS"
                  />
                </div>
              </div>

              <div className="p-5 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10 text-sm text-blue-800 dark:text-blue-400 font-medium">
                This tool automatically calculates the hidden tax burden, providing the exact gross figure required to satisfy NSSF (10%) and TRA (PAYE).
              </div>

            </div>

            {/* RESULTS PANEL */}
            <div className="relative z-10 bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-[#3B82F6]/20 backdrop-blur-3xl flex flex-col justify-center">
              
              <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] mb-6">
                <Landmark size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Required Gross Salary</p>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
                {formatMoney(result.gross)}
              </h3>
              
              <div className="h-px w-full bg-[#3B82F6]/20 mb-6"></div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Target Net Salary</span>
                  <span className="text-[#3B82F6]">{formatMoney(targetNetSalary)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-4 border-t border-[#3B82F6]/10">
                  <span className="text-slate-500 dark:text-slate-400">Taxes You Need to Cover:</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400 pl-4">NSSF (10%)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(result.nssf)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400 pl-4">PAYE (TRA)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(result.paye)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#3B82F6]/10">
                  <span className="text-slate-500 dark:text-slate-400">Total Tax Burden</span>
                  <span className="text-rose-500">{formatMoney(result.nssf + result.paye)}</span>
                </div>
              </div>

              <button 
                onClick={handleDownloadPDF} 
                className="mt-auto inline-flex items-center justify-center gap-3 w-full py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
              >
                Download Salary Report <Download size={18} />
              </button>
            </div>

          </div>
        </section>
      </div>

      {/* PRINT UI */}
      <div className="hidden print:block max-w-3xl mx-auto p-8 bg-white text-black">
        <div className="border-b-2 border-black pb-6 mb-8">
          <h1 className="text-5xl font-black tracking-tighter mb-2">Nova.</h1>
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-500">Gross Salary Report</h2>
        </div>

        <div className="mb-10">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-2">Compensation Analysis</h3>
          <div className="space-y-4 text-base">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
              <span className="text-slate-600 font-bold">Target Net Salary (Take-Home)</span>
              <span className="font-bold text-lg">{formatMoney(targetNetSalary)}</span>
            </div>
            
            <div className="pt-4 pb-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Required Tax Coverages</span>
            </div>
            
            <div className="flex justify-between items-center px-4">
              <span className="text-slate-600">Required NSSF Contribution</span>
              <span className="font-bold text-slate-900">{formatMoney(result.nssf)}</span>
            </div>
            <div className="flex justify-between items-center px-4 pb-4 border-b border-slate-200">
              <span className="text-slate-600">Required P.A.Y.E Tax</span>
              <span className="font-bold text-slate-900">{formatMoney(result.paye)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-4 px-4">
              <span className="text-2xl font-black uppercase">Required Gross Salary</span>
              <span className="text-3xl font-black">{formatMoney(result.gross)}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 text-center border-t border-slate-200 pt-6">
          <p>Generated by Nova Wealth Management.</p>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
        
        @media print {
          body, html { background-color: white !important; margin: 0 !important; padding: 0 !important; }
          @page { margin: 15mm; size: A4 portrait; }
          header, nav, footer, aside, .fixed, .sticky { display: none !important; }
          main, body, html, #__next { overflow: visible !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
}