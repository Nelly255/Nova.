"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Wallet, PieChart, ArrowLeft, Moon, Sun, User, Building, AlertTriangle } from "lucide-react";

export default function DashboardPAYECalculator() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);
  const [role, setRole] = useState<"employee" | "employer">("employee");

  // CALCULATOR STATES
  const [grossSalary, setGrossSalary] = useState<number>(0);
  const [hasTenPlusEmployees, setHasTenPlusEmployees] = useState<boolean>(true);

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

  // TANZANIA MAINLAND PAYE LOGIC
  const calculatePAYE = (gross: number) => {
    // 1. Employee Deductions
    const nssf = gross * 0.10; // Standard 10% employee contribution
    const taxableIncome = gross - nssf;
    let paye = 0;

    if (taxableIncome <= 270000) {
      paye = 0;
    } else if (taxableIncome <= 520000) {
      paye = (taxableIncome - 270000) * 0.08;
    } else if (taxableIncome <= 760000) {
      paye = 20000 + (taxableIncome - 520000) * 0.20;
    } else if (taxableIncome <= 1000000) {
      paye = 68000 + (taxableIncome - 760000) * 0.25;
    } else {
      paye = 128000 + (taxableIncome - 1000000) * 0.30;
    }

    const netSalary = gross - nssf - paye;

    // 2. Employer Taxes (Cost of Employment)
    const employerNssf = gross * 0.10; // 10% Employer match
    
    // 🚀 NEW: SDL is 3.5% and ONLY applies if 10+ employees
    const sdl = hasTenPlusEmployees ? gross * 0.035 : 0; 
    
    const wcf = gross * 0.005; // Workers Compensation Fund (0.5% Private Sector)
    const totalEmployerCost = gross + employerNssf + sdl + wcf;

    return { nssf, taxableIncome, paye, netSalary, sdl, wcf, employerNssf, totalEmployerCost };
  };

  const { nssf, taxableIncome, paye, netSalary, sdl, wcf, employerNssf, totalEmployerCost } = calculatePAYE(grossSalary);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
    setGrossSalary(rawValue ? parseInt(rawValue, 10) : 0);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 relative overflow-hidden print:bg-white print:text-black transition-colors duration-500" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* EMERALD AMBIENT GLOW */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#10B981]/10 dark:bg-[#10B981]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0 print:hidden"></div>

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-[#12121A] border border-emerald-100 dark:border-white/5 shadow-sm">
              <div className=""></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-slate-400">NOVA TOOLS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[3rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Calculate your
              </span>
              <span className="text-[2.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#10B981] leading-[0.85] mt-1 md:mt-0">
                {role === 'employee' ? 'Take Home.' : 'True Cost.'}
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10 mb-4">
            <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-3">
              {role === 'employee' ? 'Know exactly what hits' : 'Know exactly what leaves'} <br className="hidden sm:block" />
              <span className="text-slate-900 dark:text-white font-bold">{role === 'employee' ? 'Your Bank Account.' : 'Your Business Account.'}</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              {role === 'employee' 
                ? 'Enter your Gross Salary to calculate your standard NSSF contributions and accurate TRA PAYE tax deductions for Tanzania Mainland.'
                : 'Calculate the total financial liability of an employee, including the mandatory 10% NSSF match, conditional 3.5% SDL, and 0.5% WCF.'}
            </p>
          </div>
        </header>

        {/* ROLE TOGGLE */}
        <div className="max-w-6xl mx-auto mb-8 bg-white dark:bg-[#0F0F15] p-2 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex">
          <button 
            onClick={() => setRole('employee')}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${role === 'employee' ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <User size={18} /> I am an Employee
          </button>
          <button 
            onClick={() => setRole('employer')}
            className={`flex-1 py-3.5 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${role === 'employer' ? 'bg-[#10B981] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Building size={18} /> I am an Employer
          </button>
        </div>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-12 grid lg:grid-cols-2 gap-6 md:gap-8">
            
          {/* INPUT CONTROLS */}
          <div className="bg-white dark:bg-[#0F0F15]/80 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-6 flex flex-col justify-center">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                Monthly Gross Salary (TZS)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#10B981]">
                  <Wallet size={20} />
                </div>
                <input 
                  type="text" 
                  value={grossSalary === 0 ? '' : grossSalary.toLocaleString('en-US')}
                  onChange={handleGrossChange}
                  placeholder="e.g. 2,000,000"
                  className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 text-xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#10B981] transition-colors"
                />
              </div>
            </div>

            {/* 🚀 NEW: SDL TOGGLE FOR EMPLOYERS */}
            {role === 'employer' && (
              <div className="animate-in fade-in slide-in-from-top-4 flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#14141A] shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">10 or more employees?</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">SDL (3.5%) is only mandatory for 10+ staff.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={hasTenPlusEmployees} 
                    onChange={() => setHasTenPlusEmployees(!hasTenPlusEmployees)} 
                  />
                  <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-[#2A2A35] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-[#10B981]"></div>
                </label>
              </div>
            )}

            <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/10 text-sm text-emerald-800 dark:text-emerald-400 font-medium">
              Calculations are based on the latest Tanzania Revenue Authority (TRA) tax brackets and standard statutory requirements.
            </div>

          </div>

          {/* RESULTS PANEL */}
          <div className="bg-[#10B981]/5 dark:bg-[#10B981]/10 p-6 sm:p-8 rounded-[2rem] border border-[#10B981]/20 shadow-xl flex flex-col justify-center">
            
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-6">
              <PieChart size={24} />
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">
              {role === 'employee' ? 'Net Take-Home Pay' : 'Total Cost of Employment'}
            </p>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
              {formatMoney(role === 'employee' ? netSalary : totalEmployerCost)}
            </h3>
            
            <div className="space-y-4 pt-4 border-t border-[#10B981]/20">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Gross Salary Base</span>
                <span className="text-slate-900 dark:text-white">{formatMoney(grossSalary)}</span>
              </div>
              
              {role === 'employee' ? (
                <>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-500 dark:text-slate-400">NSSF Deduction (10%)</span>
                    <span className="text-rose-500">-{formatMoney(nssf)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pb-4 border-b border-[#10B981]/10">
                    <span className="text-slate-500 dark:text-slate-400">Taxable Income</span>
                    <span className="text-slate-900 dark:text-white">{formatMoney(taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2">
                    <span className="text-slate-500 dark:text-slate-400">PAYE Tax (TRA)</span>
                    <span className="text-rose-500">-{formatMoney(paye)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Employer NSSF Match (10%)</span>
                    <span className="text-rose-500">+{formatMoney(employerNssf)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Skills Development Levy (3.5%)</span>
                    <span className={sdl > 0 ? "text-rose-500" : "text-slate-500"}>{sdl > 0 ? '+' : ''}{formatMoney(sdl)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2">
                    <span className="text-slate-500 dark:text-slate-400">Workers Comp Fund (0.5%)</span>
                    <span className="text-rose-500">+{formatMoney(wcf)}</span>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={handleDownloadPDF} 
              disabled={grossSalary === 0}
              className="mt-8 w-full py-4 bg-[#10B981] hover:bg-[#059669] text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none flex items-center justify-center gap-2"
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
                The calculations provided by Nova are for informational and strategic planning purposes only. While we strive to keep our formulas updated with the latest Tanzania Revenue Authority (TRA) guidelines, actual tax liabilities and statutory deductions may vary based on specific employment contracts and Ministry updates. 
                Nova Wealth Management is not a registered tax consultancy. Always consult with a certified CPA or official TRA representative before finalizing payroll runs or employment offers.
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
            <div className="border-b-4 pb-8 mb-12 flex justify-between items-end border-[#10B981]">
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                  Nova.
                </h1>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {role === 'employee' ? 'Employee Salary Assessment' : 'Employer Cost Assessment'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-serif text-slate-600">{today}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-[#10B981] mt-1">
                  Tanzania Mainland
                </p>
              </div>
            </div>

            {/* Context Paragraph */}
            <div className="mb-10 text-justify">
              <p className="text-slate-700 font-serif leading-relaxed">
                {role === 'employee' 
                  ? 'This document outlines the estimated statutory deductions applied to the provided gross monthly salary according to the Tanzania Revenue Authority (TRA) guidelines, concluding with the final net take-home pay.'
                  : 'This document provides a breakdown of the total financial liability for an employer based on the provided gross monthly salary, including mandatory statutory contributions (NSSF, SDL, WCF).'}
              </p>
            </div>

            {/* Calculation Table */}
            <table className="w-full mb-12 border-collapse">
              <thead>
                <tr>
                  <th className="text-left border-b-2 py-4 font-serif text-sm uppercase tracking-wider border-[#10B981]">Item Description</th>
                  <th className="text-right border-b-2 py-4 font-serif text-sm uppercase tracking-wider border-[#10B981]">Amount (TZS)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 border-b border-slate-200 text-slate-700 font-bold">Gross Monthly Salary Base</td>
                  <td className="py-4 border-b border-slate-200 text-right font-bold text-slate-900">{formatMoney(grossSalary)}</td>
                </tr>
                
                {role === 'employee' ? (
                  <>
                    <tr>
                      <td className="py-4 border-b border-slate-200 text-slate-700">Less: NSSF Contribution (10%)</td>
                      <td className="py-4 border-b border-slate-200 text-right text-rose-600">-{formatMoney(nssf)}</td>
                    </tr>
                    <tr>
                      <td className="py-4 border-b border-slate-200 text-slate-700 font-bold bg-slate-50">Taxable Income</td>
                      <td className="py-4 border-b border-slate-200 text-right font-bold text-slate-900 bg-slate-50">{formatMoney(taxableIncome)}</td>
                    </tr>
                    <tr>
                      <td className="py-4 border-b border-slate-200 text-slate-700">Less: TRA P.A.Y.E Tax</td>
                      <td className="py-4 border-b border-slate-200 text-right text-rose-600">-{formatMoney(paye)}</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td className="py-4 border-b border-slate-200 text-slate-700">Add: Employer NSSF Match (10%)</td>
                      <td className="py-4 border-b border-slate-200 text-right text-rose-600">+{formatMoney(employerNssf)}</td>
                    </tr>
                    <tr>
                      {/* FIXED THE ESCAPED LESS THAN HERE FOR THE PDF TOO */}
                      <td className="py-4 border-b border-slate-200 text-slate-700">Add: Skills Development Levy (3.5%) {sdl === 0 ? <span className="text-[10px] text-slate-400 ml-1">(Exempt &lt; 10 staff)</span> : ''}</td>
                      <td className="py-4 border-b border-slate-200 text-right text-rose-600">{sdl > 0 ? '+' : ''}{formatMoney(sdl)}</td>
                    </tr>
                    <tr>
                      <td className="py-4 border-b border-slate-200 text-slate-700">Add: Workers Compensation Fund (0.5%)</td>
                      <td className="py-4 border-b border-slate-200 text-right text-rose-600">+{formatMoney(wcf)}</td>
                    </tr>
                  </>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-6 font-serif font-bold uppercase text-lg text-[#10B981]">
                    {role === 'employee' ? 'Final Net Take-Home Pay' : 'Total Cost to Employer'}
                  </td>
                  <td className="py-6 text-right font-black text-2xl border-b-[4px] border-double border-[#10B981]">
                    {formatMoney(role === 'employee' ? netSalary : totalEmployerCost)}
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
              Disclaimer: This document provides an estimated calculation based on user inputs and current general tax rates. It does not constitute official tax advice or a legal payroll stub. Final assessments are strictly subject to TRA and relevant ministry approvals.
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