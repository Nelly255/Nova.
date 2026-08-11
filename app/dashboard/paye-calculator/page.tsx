"use client";

import { useState } from "react";
import { Download, Wallet, Landmark, PieChart } from "lucide-react";

export default function DashboardPAYECalculator() {
  // START AT ZERO SO PLACEHOLDER SHOWS
  const [grossSalary, setGrossSalary] = useState<number>(0);

  // TANZANIA MAINLAND PAYE LOGIC
  const calculatePAYE = (gross: number) => {
    // Standard NSSF Employee Contribution (10%)
    const nssf = gross * 0.10;
    
    // Taxable Income is Gross minus approved pension contributions (NSSF)
    const taxableIncome = gross - nssf;
    let paye = 0;

    // Standard TRA Monthly Tax Brackets
    if (taxableIncome <= 270000) {
      paye = 0;
    } else if (taxableIncome <= 520000) {
      paye = (taxableIncome - 270000) * 0.08;
    } else if (taxableIncome <= 760000) {
      paye = 20000 + (taxableIncome - 520000) * 0.09;
    } else if (taxableIncome <= 1000000) {
      paye = 41600 + (taxableIncome - 760000) * 0.20;
    } else {
      paye = 89600 + (taxableIncome - 1000000) * 0.25;
    }

    const netSalary = gross - nssf - paye;

    return { nssf, taxableIncome, paye, netSalary };
  };

  const { nssf, taxableIncome, paye, netSalary } = calculatePAYE(grossSalary);

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

  return (
    <div className="w-full bg-transparent text-slate-900 dark:text-slate-50 relative overflow-hidden print:bg-white print:text-black" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0 print:hidden"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 lg:p-12 print:hidden">
        
        <header className="max-w-6xl mx-auto mb-12 md:mb-16 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className=""></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">INCOME TAX</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Calculate your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-brand-500 leading-[0.85] mt-1 md:mt-0">
                Take Home.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Know exactly what hits <br />
              <span className="text-slate-900 dark:text-white font-bold">Your Bank Account.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Enter your Gross Salary to calculate your standard NSSF contributions and accurate TRA PAYE tax deductions for Tanzania Mainland.
            </p>
          </div>
        </header>

        <section className="max-w-6xl mx-auto pb-12">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* INPUT CONTROLS */}
            <div className="relative z-50 bg-white dark:bg-[#0F0F15] p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8 flex flex-col justify-center">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
                  Monthly Gross Salary (TZS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-brand-500">
                    <Wallet size={24} />
                  </div>
                  <input 
                    type="text" 
                    value={grossSalary === 0 ? '' : grossSalary.toLocaleString('en-US')}
                    onChange={handleGrossChange}
                    placeholder="e.g. 2,000,000"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-5 text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-5 bg-brand-50 dark:bg-brand-500/5 rounded-2xl border border-brand-100 dark:border-brand-500/10 text-sm text-brand-800 dark:text-brand-400 font-medium">
                Calculations are based on the latest Tanzania Revenue Authority (TRA) tax brackets and standard 10% employee NSSF contributions.
              </div>

            </div>

            {/* RESULTS PANEL */}
            <div className="relative z-10 bg-brand-500/5 dark:bg-brand-500/10 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-brand-500/20 backdrop-blur-3xl flex flex-col justify-center">
              
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-500 mb-6">
                <PieChart size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Net Take-Home Pay</p>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
                {formatMoney(netSalary)}
              </h3>
              
              <div className="h-px w-full bg-brand-500/20 mb-6"></div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Gross Salary</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(grossSalary)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">NSSF Deduction (10%)</span>
                  <span className="text-rose-500">-{formatMoney(nssf)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pb-4 border-b border-brand-500/10">
                  <span className="text-slate-500 dark:text-slate-400">Taxable Income</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(taxableIncome)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2">
                  <span className="text-slate-500 dark:text-slate-400">PAYE Tax (TRA)</span>
                  <span className="text-rose-500">-{formatMoney(paye)}</span>
                </div>
              </div>

              <button 
                onClick={handleDownloadPDF} 
                disabled={grossSalary === 0}
                className="mt-auto inline-flex items-center justify-center gap-3 w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-[0_8px_20px_rgb(var(--brand-500)/0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
              >
                Download Payslip Estimate <Download size={18} />
              </button>
            </div>

          </div>
        </section>
      </div>

      {/* PRINT UI */}
      <div className="hidden print:block max-w-3xl mx-auto p-8 bg-white text-black">
        <div className="border-b-2 border-black pb-6 mb-8">
          <h1 className="text-5xl font-black tracking-tighter mb-2">Nova.</h1>
          <h2 className="text-xl font-bold uppercase tracking-widest text-slate-500">Payslip Estimate (Tanzania Mainland)</h2>
        </div>

        <div className="mb-10">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-2">Earnings & Deductions Summary</h3>
          <div className="space-y-4 text-base">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg">
              <span className="text-slate-600 font-bold">Gross Salary</span>
              <span className="font-bold text-lg">{formatMoney(grossSalary)}</span>
            </div>
            <div className="flex justify-between items-center px-4">
              <span className="text-slate-600">NSSF Contribution (10%)</span>
              <span className="font-bold text-red-600">-{formatMoney(nssf)}</span>
            </div>
            <div className="flex justify-between items-center px-4">
              <span className="text-slate-600">Taxable Income Base</span>
              <span className="font-bold">{formatMoney(taxableIncome)}</span>
            </div>
            <div className="flex justify-between items-center px-4 pb-4 border-b border-slate-200">
              <span className="text-slate-600">P.A.Y.E Tax Deducted</span>
              <span className="font-bold text-red-600">-{formatMoney(paye)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-4 px-4">
              <span className="text-2xl font-black uppercase">Net Take-Home</span>
              <span className="text-3xl font-black">{formatMoney(netSalary)}</span>
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