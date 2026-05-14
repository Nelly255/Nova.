"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Receipt, FileText, CheckCircle2, Circle, ArrowRight, Briefcase, Type, LayoutTemplate, Palette } from "lucide-react";

export default function DashboardFreelanceCalculator() {
  // CALCULATOR STATE
  const [companyName, setCompanyName] = useState<string>("");
  const [slogan, setSlogan] = useState<string>("");
  const [targetNet, setTargetNet] = useState<number>(0);
  const [applyVAT, setApplyVAT] = useState<boolean>(false);
  const [applyWHT, setApplyWHT] = useState<boolean>(true);
  
  // DOCUMENT CUSTOMIZATION STATE
  const [template, setTemplate] = useState<"modern" | "executive" | "minimal">("modern");
  const [docColor, setDocColor] = useState<string>("#8B5CF6"); // Default Violet

  const premiumColors = [
    { name: 'Violet', hex: '#8B5CF6' },
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Corporate Slate', hex: '#475569' },
    { name: 'Crimson', hex: '#E11D48' },
    { name: 'Midnight', hex: '#0F172A' }
  ];

  // REVERSE ENGINEER INVOICE LOGIC
  const calculateInvoice = () => {
    if (targetNet <= 0) {
      return { subtotal: 0, vatAmount: 0, invoiceTotal: 0, whtAmount: 0, cashReceived: 0 };
    }

    const subtotal = applyWHT ? targetNet / 0.95 : targetNet;
    const vatAmount = applyVAT ? subtotal * 0.18 : 0;
    const invoiceTotal = subtotal + vatAmount;
    const whtAmount = applyWHT ? subtotal * 0.05 : 0;
    const cashReceived = invoiceTotal - whtAmount;

    return { subtotal, vatAmount, invoiceTotal, whtAmount, cashReceived };
  };

  const { subtotal, vatAmount, invoiceTotal, whtAmount, cashReceived } = calculateInvoice();

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
    setTargetNet(rawValue ? parseInt(rawValue, 10) : 0);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).toUpperCase();

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* 🚀 FIXED AMBIENT GLOWS - Added specific class to force hide on print */}
      <div className="ambient-glow absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0 print:hidden"></div>
      <div className="ambient-glow absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0 print:hidden"></div>

      {/* WEB UI WRAPPER */}
      <div className="web-ui-only relative z-10 pt-6 md:pt-12 px-4 sm:px-6 print:hidden">
        
        {/* HEADER SECTION */}
        <header className="max-w-6xl mx-auto mb-10 md:mb-12 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shadow-[0_0_8px_#8B5CF6] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">FREELANCE BILLING</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[3rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Perfect your
              </span>
              <span className="text-[2.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8B5CF6] leading-[0.85] mt-1 md:mt-0">
                Invoices.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Never undercharge <br className="hidden sm:block" />
              <span className="text-slate-900 dark:text-white font-bold">For taxes again.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Enter the exact amount of money you want to keep. We will reverse-engineer your invoice to include VAT and account for client WHT deductions.
            </p>
          </div>
        </header>

        {/* DOCUMENT SETTINGS AREA (Template & Color Picker) */}
        <div className="max-w-6xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0F0F15] p-5 md:p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
          
          {/* Template Selector */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <LayoutTemplate size={16} /> Document Style
            </span>
            <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-full">
              {['modern', 'executive', 'minimal'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t as any)}
                  className={`px-2 md:px-4 py-2.5 text-xs md:text-sm font-bold capitalize rounded-lg transition-all ${template === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Palette size={16} /> Brand Accent Color
            </span>
            <div className="flex gap-3 md:gap-4 flex-wrap items-center h-full pb-1">
              {premiumColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setDocColor(color.hex)}
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-4 transition-all duration-300 active:scale-90 ${docColor === color.hex ? 'border-white dark:border-slate-800 shadow-[0_0_0_2px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_2px_rgba(255,255,255,0.2)] scale-110 md:scale-125' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

        </div>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-24">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* INPUT CONTROLS */}
            <div className="group bg-white dark:bg-[#0F0F15]/80 p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 space-y-6 flex flex-col justify-center">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Company Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Briefcase size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Studios"
                      className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Document Tagline
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Type size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      placeholder="e.g. Digital Design Experts"
                      className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                  Target Net Retained (TZS)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-[#8B5CF6]">
                    <Receipt size={24} />
                  </div>
                  <input 
                    type="text" 
                    value={targetNet === 0 ? '' : targetNet.toLocaleString('en-US')}
                    onChange={handleNetChange}
                    placeholder="e.g. 5,000,000"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-2xl pl-14 pr-4 py-4 md:py-5 text-xl md:text-2xl font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>
              </div>

              {/* PREMIUM TOGGLES */}
              <div className="space-y-3 pt-2">
                
                {/* WHT Toggle */}
                <button 
                  onClick={() => setApplyWHT(!applyWHT)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${applyWHT ? 'bg-violet-50 dark:bg-[#8B5CF6]/10 border-violet-200 dark:border-[#8B5CF6]/30' : 'bg-slate-50 dark:bg-[#14141A] border-slate-200 dark:border-white/5'}`}
                >
                  <div className="flex flex-col items-start text-left pr-4">
                    <span className={`text-sm font-bold ${applyWHT ? 'text-violet-900 dark:text-violet-100' : 'text-slate-700 dark:text-slate-300'}`}>Withholding Tax (5%)</span>
                    <span className={`text-xs mt-0.5 ${applyWHT ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-500'}`}>Client deducts this before paying you.</span>
                  </div>
                  <div className={`shrink-0 transition-transform duration-300 ${applyWHT ? 'text-[#8B5CF6] scale-110' : 'text-slate-300 dark:text-slate-600'}`}>
                    {applyWHT ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </div>
                </button>

                {/* VAT Toggle */}
                <button 
                  onClick={() => setApplyVAT(!applyVAT)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${applyVAT ? 'bg-violet-50 dark:bg-[#8B5CF6]/10 border-violet-200 dark:border-[#8B5CF6]/30' : 'bg-slate-50 dark:bg-[#14141A] border-slate-200 dark:border-white/5'}`}
                >
                  <div className="flex flex-col items-start text-left pr-4">
                    <span className={`text-sm font-bold ${applyVAT ? 'text-violet-900 dark:text-violet-100' : 'text-slate-700 dark:text-slate-300'}`}>Value Added Tax (18%)</span>
                    <span className={`text-xs mt-0.5 ${applyVAT ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-500'}`}>Only if you are VAT registered.</span>
                  </div>
                  <div className={`shrink-0 transition-transform duration-300 ${applyVAT ? 'text-[#8B5CF6] scale-110' : 'text-slate-300 dark:text-slate-600'}`}>
                    {applyVAT ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </div>
                </button>

              </div>

            </div>

            {/* RESULTS PANEL (Web UI Preview) */}
            <div className="group bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-[#8B5CF6]/20 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-center">
              
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-6">
                <FileText size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold tracking-widest uppercase mb-2">Invoice Subtotal (Your Fee)</p>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-6 md:mb-8">
                {formatMoney(subtotal)}
              </h3>
              
              <div className="h-px w-full bg-[#8B5CF6]/20 mb-6"></div>

              <div className="space-y-3 md:space-y-4 mb-8">
                {applyVAT && (
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Add VAT (18%)</span>
                    <span className="text-slate-900 dark:text-white">+{formatMoney(vatAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm md:text-base font-bold pt-2 border-t border-[#8B5CF6]/10">
                  <span className="text-slate-500 dark:text-slate-400">Total Invoice Amount</span>
                  <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{formatMoney(invoiceTotal)}</span>
                </div>

                <div className="pt-3 md:pt-4 pb-1 md:pb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">Post-Invoice Processing:</span>
                </div>

                {applyWHT && (
                  <div className="flex justify-between text-xs sm:text-sm font-bold">
                    <span className="text-slate-500 dark:text-slate-400">Client Deducts WHT (5%)</span>
                    <span className="text-rose-500">-{formatMoney(whtAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs sm:text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Cash Received in Bank</span>
                  <span className="text-[#8B5CF6]">{formatMoney(cashReceived)}</span>
                </div>

                {applyVAT && (
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-400 dark:text-slate-500 pt-2">
                    <span>*You must remit to TRA:</span>
                    <span>-{formatMoney(vatAmount)}</span>
                  </div>
                )}
                
              </div>

              <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={targetNet === 0}
                  className="inline-flex items-center justify-center gap-2 py-3.5 md:py-4 text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-md hover:shadow-lg text-sm md:text-base"
                  style={{ backgroundColor: docColor }}
                >
                  <Download size={18} /> Print PDF
                </button>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center gap-2 py-3.5 md:py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold border border-slate-200 dark:border-white/10 transition-all active:scale-95 text-sm md:text-base"
                >
                  Dashboard <ArrowRight size={18} />
                </Link>
              </div>

            </div>

          </div>
        </section>
      </div>

      {/* =========================================
          🖨️ PDF PRINT TEMPLATES (Dynamic Colors applied here)
          ========================================= */}
      
      {/* TEMPLATE 1: MODERN (Creative & Bold) */}
      <div className={`hidden print:block print-template w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 ${template !== 'modern' && 'print:hidden'}`}>
        <div className="p-12 flex flex-col h-full">
          
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-16">
              <div>
                <h1 className="text-5xl font-black tracking-tighter mb-2" style={{ color: docColor }}>
                  {companyName.trim() !== "" ? companyName : "Nova."}
                </h1>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  {companyName.trim() !== "" && slogan.trim() !== "" ? slogan : "Pricing Strategy Profile"}
                </h2>
              </div>
              <div className="text-right border-l-4 pl-6" style={{ borderColor: docColor }}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Date Issued</p>
                <p className="text-sm font-bold text-slate-800">{today}</p>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">01 / Invoice Generation Structure</h3>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <div className="flex justify-between items-center text-lg mb-4">
                  <span className="text-slate-600 font-medium">Professional Fees (Subtotal)</span>
                  <span className="font-bold text-slate-900">{formatMoney(subtotal)}</span>
                </div>
                {applyVAT && (
                  <div className="flex justify-between items-center text-lg mb-4">
                    <span className="text-slate-600 font-medium">Value Added Tax (18%)</span>
                    <span className="font-bold text-slate-900">+{formatMoney(vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl mt-6 shadow-sm border border-slate-200">
                  <span className="font-bold uppercase tracking-wider text-sm" style={{ color: docColor }}>Invoice Grand Total</span>
                  <span className="font-black text-3xl text-slate-900">{formatMoney(invoiceTotal)}</span>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">02 / Cash Flow & Taxation</h3>
              <div className="space-y-4 px-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-600 font-medium">Invoice Total Paid by Client</span>
                  <span className="font-bold text-slate-900">{formatMoney(invoiceTotal)}</span>
                </div>
                {applyWHT && (
                  <div className="flex justify-between items-center text-lg pb-4 border-b border-slate-100">
                    <span className="text-slate-600 font-medium">Less: Client WHT Deduction (5%)</span>
                    <span className="font-bold text-rose-600">-{formatMoney(whtAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 text-lg">
                  <span className="font-bold text-slate-700">Cash Received in Bank</span>
                  <span className="font-bold text-slate-900">{formatMoney(cashReceived)}</span>
                </div>
                {applyVAT && (
                  <div className="flex justify-between items-center text-lg text-slate-500 pb-4 border-b border-slate-100">
                    <span className="font-medium">Less: VAT to remit to TRA</span>
                    <span className="font-bold">-{formatMoney(vatAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl p-10 text-white flex justify-between items-center shadow-lg" style={{ backgroundColor: docColor }}>
              <div>
                <span className="block text-sm font-bold uppercase tracking-widest text-white/80 mb-1">Final Disbursement</span>
                <span className="text-3xl font-black">Net Retained Earnings</span>
              </div>
              <span className="text-5xl font-black">{formatMoney(targetNet)}</span>
            </div>
          </div>
          
          {/* Legal Footer */}
          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs font-medium text-slate-400">
            <p>This is a strategic planning document, not an official tax return.<br/>Powered by Nova Wealth Management.</p>
          </div>

        </div>
      </div>

      {/* TEMPLATE 2: EXECUTIVE (Corporate & Tabular) */}
      <div className={`hidden print:block print-template w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 ${template !== 'executive' && 'print:hidden'}`}>
        <div className="p-12 flex flex-col h-full">
          
          <div className="flex-grow">
            <div className="border-b-4 pb-8 mb-12 flex justify-between items-end" style={{ borderColor: docColor }}>
              <div>
                <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                  {companyName.trim() !== "" ? companyName : "Nova."}
                </h1>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  {companyName.trim() !== "" && slogan.trim() !== "" ? slogan : "Financial Compensation Report"}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-serif text-slate-600">{today}</p>
              </div>
            </div>

            <div className="mb-10 text-justify">
              <p className="text-slate-700 font-serif leading-relaxed">
                This document serves as an official internal calculation to determine the required gross invoice amount necessary to yield a precise net disbursement of <strong>{formatMoney(targetNet)}</strong>, after accounting for all mandatory statutory deductions.
              </p>
            </div>

            <table className="w-full mb-12 border-collapse">
              <thead>
                <tr>
                  <th className="text-left border-b-2 py-4 font-serif text-sm uppercase tracking-wider" style={{ borderColor: docColor }}>Item Description</th>
                  <th className="text-right border-b-2 py-4 font-serif text-sm uppercase tracking-wider" style={{ borderColor: docColor }}>Amount (TZS)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 border-b border-slate-200 text-slate-700">Subtotal (Base Professional Fees)</td>
                  <td className="py-4 border-b border-slate-200 text-right font-bold text-slate-900">{formatMoney(subtotal)}</td>
                </tr>
                {applyVAT && (
                  <tr>
                    <td className="py-4 border-b border-slate-200 text-slate-700">Value Added Tax (18%)</td>
                    <td className="py-4 border-b border-slate-200 text-right font-bold text-slate-900">{formatMoney(vatAmount)}</td>
                  </tr>
                )}
                <tr className="bg-slate-50">
                  <td className="py-4 border-b-2 font-bold text-slate-900 uppercase text-sm px-4" style={{ borderColor: docColor }}>Total Invoice Value</td>
                  <td className="py-4 border-b-2 text-right font-black text-xl px-4" style={{ borderColor: docColor }}>{formatMoney(invoiceTotal)}</td>
                </tr>
                
                <tr><td colSpan={2} className="py-4"></td></tr>
                
                <tr>
                  <td className="py-4 border-b border-slate-200 text-slate-700">Client Withholding Tax Deduction (5%)</td>
                  <td className="py-4 border-b border-slate-200 text-right text-rose-600">{applyWHT ? `(${formatMoney(whtAmount)})` : '-'}</td>
                </tr>
                <tr>
                  <td className="py-4 border-b border-slate-200 font-bold text-slate-900">Gross Cash Deposited to Bank</td>
                  <td className="py-4 border-b border-slate-200 text-right font-bold text-slate-900">{formatMoney(cashReceived)}</td>
                </tr>
                {applyVAT && (
                  <tr>
                    <td className="py-4 border-b border-slate-200 text-slate-700 italic">Less: VAT Liability to TRA</td>
                    <td className="py-4 border-b border-slate-200 text-right italic text-slate-600">({formatMoney(vatAmount)})</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-6 font-serif font-bold uppercase text-lg" style={{ color: docColor }}>Net Retained Earnings</td>
                  <td className="py-6 text-right font-black text-2xl border-b-[4px] border-double" style={{ borderColor: docColor }}>{formatMoney(targetNet)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Footer */}
          <div className="mt-16 pt-8 border-t-2 border-slate-200 text-center text-xs font-serif text-slate-500">
            <p>This is a strategic planning document, not an official tax return.<br/>Powered by Nova Wealth Management.</p>
          </div>

        </div>
      </div>

      {/* TEMPLATE 3: MINIMAL (Clean & Sharp) */}
      <div className={`hidden print:block print-template w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white text-slate-900 relative ${template !== 'minimal' && 'print:hidden'}`}>
        <div className="p-16 flex flex-col h-full">
          
          <div className="flex-grow">
            <div className="mb-24">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
                {companyName.trim() !== "" ? companyName : "Nova."}
              </h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {companyName.trim() !== "" && slogan.trim() !== "" ? slogan : "Invoice Strategy"}
              </p>
            </div>

            <div className="mb-16">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Net Retained Earnings</p>
              <p className="text-6xl font-light tracking-tighter" style={{ color: docColor }}>{formatMoney(targetNet)}</p>
            </div>

            <div className="grid grid-cols-2 gap-16">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b pb-2 mb-6" style={{ borderColor: docColor }}>Client Invoice Breakdown</p>
                
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">{formatMoney(subtotal)}</span>
                </div>
                {applyVAT && (
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-slate-600">VAT (18%)</span>
                    <span className="font-semibold">{formatMoney(vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                  <span className="font-bold text-lg">{formatMoney(invoiceTotal)}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 border-b pb-2 mb-6" style={{ borderColor: docColor }}>Actual Cash Flow</p>
                
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-slate-600">Paid by Client</span>
                  <span className="font-semibold">{formatMoney(invoiceTotal)}</span>
                </div>
                {applyWHT && (
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-slate-600">Less WHT (5%)</span>
                    <span className="text-rose-600">-{formatMoney(whtAmount)}</span>
                  </div>
                )}
                {applyVAT && (
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-slate-600">Less VAT to TRA</span>
                    <span className="text-slate-600">-{formatMoney(vatAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider">Net Retained</span>
                  <span className="font-bold text-lg">{formatMoney(targetNet)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Footer & Metadata */}
          <div className="pt-8 border-t border-slate-200 flex flex-col items-center justify-center text-center mt-12">
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 w-full flex justify-between">
              <span>{today}</span>
              <span>Page 1 of 1</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
              This is a strategic planning document, not an official tax return.<br/>Powered by Nova Wealth Management.
            </p>
          </div>

        </div>
      </div>

      {/* 🚀 AGGRESSIVE PRINT STYLES - Forces UI elements to vanish completely */}
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
          
          /* NUKE THE AMBIENT GLOW AND WEB UI */
          .ambient-glow, .web-ui-only { 
            display: none !important; 
            opacity: 0 !important; 
            visibility: hidden !important; 
          }

          /* Force the templates to display block */
          .print-template {
            display: flex !important;
          }

          @page { margin: 0; size: A4 portrait; }
          header, nav, footer, aside, .fixed, .sticky { display: none !important; }
          main, body, html, #__next { overflow: visible !important; height: 100% !important; }
        }
      `}</style>
    </div>
  );
}