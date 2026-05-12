"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, Download, Car, DollarSign, Activity, AlertCircle, Calendar, ChevronDown, Settings2, Info } from "lucide-react";

export default function ImportCalculator() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);

  // CALCULATOR STATE
  const currentYear = new Date().getFullYear();
  const [cifInput, setCifInput] = useState<string>(""); 
  const [engineCapacity, setEngineCapacity] = useState<string>("under_1000");
  const [manufactureYear, setManufactureYear] = useState<string>(""); 
  const [referenceId, setReferenceId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // CUSTOM DROPDOWN STATE
  const [isEngineOpen, setIsEngineOpen] = useState(false);

  // EXCHANGE RATE STATE
  const FALLBACK_RATE = 2565.98; // From TRA PDF
  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_RATE);
  const [rateStatus, setRateStatus] = useState<"loading" | "live" | "fallback">("loading");

  // INITIAL THEME CHECK & API FETCH
  useEffect(() => {
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    setReferenceId(`NV-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${new Date().getFullYear()}`);
    setCurrentDate(new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()));

    const fetchLiveRate = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates && data.rates.TZS) {
          setExchangeRate(data.rates.TZS);
          setRateStatus("live");
        } else {
          throw new Error("TZS rate missing");
        }
      } catch (error) {
        console.error("Nova: Live rate fetch failed, using fallback.", error);
        setRateStatus("fallback");
      }
    };

    fetchLiveRate();
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

  const handleDownloadPDF = () => {
    window.print();
  };

  // FORMAT COMMA INPUT
  const handleCifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '').replace(/\D/g, '');
    if (!rawValue) {
      setCifInput("");
      return;
    }
    setCifInput(Number(rawValue).toLocaleString('en-US'));
  };

  // CONSTANTS & TAX MATH
  const IMPORT_DUTY_RATE = 0.25; 
  const RAILWAY_LEVY_RATE = 0.02; 
  const CPF_RATE = 0.006; 
  const VAT_RATE = 0.18; 

  // PARSE INPUTS FOR MATH
  const cifUsd = parseFloat(cifInput.replace(/,/g, '')) || 0;
  const parsedYear = parseInt(manufactureYear) || currentYear;
  const vehicleAge = manufactureYear ? Math.max(0, currentYear - parsedYear) : 0;

  // EXCISE DUTY BRACKETS
  const getExciseDutyRate = () => {
    if (engineCapacity === "under_1000") return 0;
    if (engineCapacity === "1001_1500" || engineCapacity === "1501_2000") return 0.05;
    return 0.10; // 2001_2500 and over_2500
  };

  // HIV RESPONSE LEVY BRACKETS
  const getHivLevyTzs = () => {
    if (engineCapacity === "under_1000") return 50000;
    if (engineCapacity === "1001_1500") return 100000;
    if (engineCapacity === "1501_2000" || engineCapacity === "2001_2500") return 150000;
    return 200000; // over_2500
  };

  // REGISTRATION FEE BRACKETS (Flat 250k Tax + Tiered License Fee)
  const getRegistrationFeeTzs = () => {
    const flatTax = 250000;
    let licenseFee = 0;

    if (engineCapacity === "under_1000" || engineCapacity === "1001_1500") {
      licenseFee = 200000;
    } else if (engineCapacity === "1501_2000" || engineCapacity === "2001_2500") {
      licenseFee = 250000;
    } else {
      licenseFee = 300000; // over 2500cc
    }

    return flatTax + licenseFee;
  };

  // DROPDOWN LABELS
  const getEngineCapacityLabel = (val: string) => {
    if (val === "under_1000") return "Up to 1000 CC (0% Excise)";
    if (val === "1001_1500") return "1001 - 1500 CC (5% Excise)";
    if (val === "1501_2000") return "1501 - 2000 CC (5% Excise)";
    if (val === "2001_2500") return "2001 - 2500 CC (10% Excise)";
    return "Over 2500 CC (10% Excise)";
  };

  // FIXED TRA AGE PENALTY BRACKETS (0%, 15%, 30%)
  const getAgePenaltyRate = () => {
    if (vehicleAge > 10) return 0.30; 
    if (vehicleAge >= 8) return 0.15; 
    return 0; 
  };

  // ==========================================
  // PERFECTED TRA COMPOUND CALCULATION ENGINE
  // ==========================================
  const importDutyUsd = cifUsd * IMPORT_DUTY_RATE;
  
  // Excise Duty & Age Penalty apply to the base of (CIF + Import Duty)
  const exciseBaseUsd = cifUsd + importDutyUsd; 
  const exciseDutyUsd = exciseBaseUsd * getExciseDutyRate();
  const agePenaltyUsd = exciseBaseUsd * getAgePenaltyRate();
  
  // Railway and CPF remain flat against the base CIF
  const railwayLevyUsd = cifUsd * RAILWAY_LEVY_RATE;
  const cpfUsd = cifUsd * CPF_RATE;
  
  // VAT is compounding everything
  const vatBase = cifUsd + importDutyUsd + exciseDutyUsd + agePenaltyUsd + railwayLevyUsd + cpfUsd;
  const vatUsd = vatBase * VAT_RATE;

  const totalImportTaxesUsd = importDutyUsd + exciseDutyUsd + agePenaltyUsd + railwayLevyUsd + cpfUsd + vatUsd;
  const totalImportTaxesTzs = totalImportTaxesUsd * exchangeRate;
  
  // ZERO OUT FIXED FEES IF CIF IS 0
  const currentHivLevyTzs = cifUsd > 0 ? getHivLevyTzs() : 0;
  const currentRegistrationFeeTzs = cifUsd > 0 ? getRegistrationFeeTzs() : 0;
  
  const grandTotalTzs = totalImportTaxesTzs + currentHivLevyTzs + currentRegistrationFeeTzs;

  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative overflow-hidden print:bg-white print:text-black" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* AMBIENT GLOW */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0 print:hidden"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none opacity-60 z-0 print:hidden"></div>

      <div className="relative z-10 pt-6 md:pt-12 px-4 sm:px-6 print:hidden">
        
        {/* TOP NAV */}
        <nav className="max-w-6xl mx-auto mb-12 md:mb-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 text-sm md:text-base group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
          
          <button onClick={toggleTheme} className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* HERO SECTION */}
        <header className="max-w-6xl mx-auto mb-16 grid lg:grid-cols-2 gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF] animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">TRA IMPORT CALC</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Clear your
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Dream Car.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Know your exact taxes <br />
              <span className="text-slate-900 dark:text-white font-bold">Before it arrives.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md mb-8">
              Enter your CIF value from Be Forward or SBT. We pull the live USD to TZS exchange rate to calculate your precise import duty, railway levy, and VAT.
            </p>
          </div>
        </header>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-12">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* INPUT CONTROLS */}
            <div className="relative z-50 bg-white dark:bg-[#0F0F15] p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-8">
              
              {/* LIVE RATE BADGE */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#14141A] rounded-2xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-[#8438FF]" />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">1 USD = {formatMoney(exchangeRate, 'TZS')}</span>
                </div>
                {rateStatus === "loading" && <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400"><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span> Fetching</span>}
                {rateStatus === "live" && <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Live Rate</span>}
                {rateStatus === "fallback" && <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500"><span className="w-2 h-2 bg-orange-500 rounded-full"></span> Standard Rate</span>}
              </div>

              {/* COMMA-FORMATTED CIF INPUT */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  CIF Value (Cost, Insurance, Freight) in USD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8438FF]">
                    <DollarSign size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={cifInput}
                    onChange={handleCifChange}
                    placeholder="e.g. 15,000"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#8438FF] transition-colors"
                  />
                </div>
              </div>

              {/* CUSTOM ENGINE CAPACITY DROPDOWN */}
              <div className="relative z-50">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Engine Capacity (CC)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8438FF]">
                    <Settings2 size={18} />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsEngineOpen(!isEngineOpen)}
                    className={`w-full flex items-center justify-between bg-slate-50 dark:bg-[#14141A] border ${isEngineOpen ? 'border-[#8438FF] bg-[#8438FF]/5' : 'border-slate-200 dark:border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white transition-colors`}
                  >
                    <span>{getEngineCapacityLabel(engineCapacity)}</span>
                    <ChevronDown size={18} className={`text-slate-400 transition-transform ${isEngineOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isEngineOpen && (
                    <>
                      {/* Invisible Background Overlay */}
                      <div 
                        className="fixed inset-0 z-40 print:hidden cursor-default" 
                        onClick={() => setIsEngineOpen(false)}
                      ></div>
                      
                      {/* Dropdown Menu List */}
                      <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1C1C24] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {[
                          { val: "under_1000", label: "Up to 1000 CC (0% Excise)" },
                          { val: "1001_1500", label: "1001 - 1500 CC (5% Excise)" },
                          { val: "1501_2000", label: "1501 - 2000 CC (5% Excise)" },
                          { val: "2001_2500", label: "2001 - 2500 CC (10% Excise)" },
                          { val: "over_2500", label: "Over 2500 CC (10% Excise)" }
                        ].map((option) => (
                          <button 
                            key={option.val}
                            type="button"
                            onClick={() => { setEngineCapacity(option.val); setIsEngineOpen(false); }}
                            className={`w-full text-left px-6 py-3 text-sm font-bold cursor-pointer transition-colors ${engineCapacity === option.val ? 'bg-[#8438FF] text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* MANUAL YEAR INPUT */}
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Year of Manufacture
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8438FF]">
                    <Calendar size={18} />
                  </div>
                  <input 
                    type="number" 
                    min="1990"
                    max={currentYear}
                    value={manufactureYear}
                    onChange={(e) => setManufactureYear(e.target.value)}
                    placeholder="e.g. 2018"
                    className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8438FF] transition-colors no-spinners"
                  />
                </div>
                {vehicleAge >= 8 && (
                  <p className="text-xs font-semibold text-rose-500 mt-3 flex items-center gap-1.5 animate-in fade-in"><AlertCircle size={14}/> Age depreciation penalty ({getAgePenaltyRate() * 100}%) applied ({vehicleAge} years old).</p>
                )}
              </div>

            </div>

            {/* RESULTS PANEL (SCREEN VERSION) */}
            <div className="relative z-10 bg-[#8438FF]/5 dark:bg-[#8438FF]/10 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-[#8438FF]/20 backdrop-blur-3xl flex flex-col justify-center">
              
              <div className="w-14 h-14 rounded-2xl bg-[#8438FF]/20 flex items-center justify-center text-[#8438FF] mb-6">
                <Car size={24} />
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold tracking-widest uppercase mb-2">Total Estimated Tax</p>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
                {formatMoney(grandTotalTzs, 'TZS')}
              </h3>
              
              <div className="h-px w-full bg-[#8438FF]/20 mb-6"></div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Import Duty (25%)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(importDutyUsd, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Excise Duty ({getExciseDutyRate() * 100}%)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(exciseDutyUsd, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Age Penalty ({getAgePenaltyRate() * 100}%)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(agePenaltyUsd, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Railway Levy (2%)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(railwayLevyUsd, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Customs Processing Fee (0.6%)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(cpfUsd, 'USD')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-3 border-t border-[#8438FF]/10">
                  <span className="text-slate-500 dark:text-slate-400">VAT (18%)</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(vatUsd, 'USD')}</span>
                </div>
                
                {/* DYNAMIC HIV LEVY & REGISTRATION */}
                <div className="flex justify-between text-sm font-bold pt-3 border-t border-[#8438FF]/10">
                  <span className="text-slate-500 dark:text-slate-400">Vehicle Registration</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(currentRegistrationFeeTzs, 'TZS')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-500 dark:text-slate-400">HIV Response Levy</span>
                  <span className="text-slate-900 dark:text-white">{formatMoney(currentHivLevyTzs, 'TZS')}</span>
                </div>
              </div>

              <button 
                onClick={handleDownloadPDF} 
                disabled={cifUsd === 0}
                className="mt-auto inline-flex items-center justify-center gap-3 w-full py-4 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
              >
                Download PDF Valuation <Download size={18} />
              </button>
            </div>

          </div>

          {/* DISCLAIMER SECTION */}
          <div className="mt-10 px-4 md:px-0 max-w-3xl mx-auto">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-200/50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400">
              <Info size={20} className="shrink-0 mt-0.5 text-[#8438FF]" />
              <p className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-slate-700 dark:text-slate-200">Disclaimer:</strong> This calculator provides an estimate using the live, automatically updated USD/TZS exchange rate. Actual final assessments by the Tanzania Revenue Authority (TRA) may vary slightly based on the exact TRA exchange rate on the day of clearance and physical port inspections.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================= */}
      {/* PRINT UI (ONLY VISIBLE ON PDF EXPORT)     */}
      {/* ========================================= */}
      <div className="hidden print:block max-w-4xl mx-auto p-8 bg-white text-black">
        
        {/* Print Header */}
        <div className="border-b-2 border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">Nova.</h1>
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-500">Official Import Valuation Estimate</h2>
          </div>
          <div className="text-right text-sm font-medium text-slate-600">
            <p>Date: {currentDate}</p>
            <p>Ref: {referenceId}</p>
          </div>
        </div>

        {/* Vehicle Information Table */}
        <div className="mb-10">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-2">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="flex justify-between pr-8">
              <span className="text-slate-500">Year of Manufacture</span>
              <span className="font-bold">{manufactureYear || "N/A"}</span>
            </div>
            <div className="flex justify-between pl-8 border-l border-slate-200">
              <span className="text-slate-500">Engine Capacity</span>
              <span className="font-bold">{getEngineCapacityLabel(engineCapacity)}</span>
            </div>
            <div className="flex justify-between pr-8">
              <span className="text-slate-500">Customs Value CIF</span>
              <span className="font-bold">{formatMoney(cifUsd, 'USD')}</span>
            </div>
            <div className="flex justify-between pl-8 border-l border-slate-200">
              <span className="text-slate-500">Exchange Rate Used</span>
              <span className="font-bold">{formatMoney(exchangeRate, 'TZS')} / USD</span>
            </div>
          </div>
        </div>

        {/* Tax Breakdown Table */}
        <div className="mb-10">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-slate-300 pb-2">Tax Breakdown (USD)</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Import Duty (25%)</span>
              <span className="font-bold">{formatMoney(importDutyUsd, 'USD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Excise Duty ({getExciseDutyRate() * 100}%)</span>
              <span className="font-bold">{formatMoney(exciseDutyUsd, 'USD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Age Depreciation Penalty ({getAgePenaltyRate() * 100}%)</span>
              <span className="font-bold">{formatMoney(agePenaltyUsd, 'USD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Railway Development Levy (2%)</span>
              <span className="font-bold">{formatMoney(railwayLevyUsd, 'USD')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Customs Processing Fee (0.6%)</span>
              <span className="font-bold">{formatMoney(cpfUsd, 'USD')}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-100">
              <span className="text-slate-600">Value Added Tax (18%)</span>
              <span className="font-bold">{formatMoney(vatUsd, 'USD')}</span>
            </div>
          </div>
        </div>

        {/* Totals Section */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-12">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold">Total Import Taxes (USD)</span>
              <span className="font-bold text-lg">{formatMoney(totalImportTaxesUsd, 'USD')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-bold">Total Import Taxes (TZS)</span>
              <span className="font-bold text-lg">{formatMoney(totalImportTaxesTzs, 'TZS')}</span>
            </div>
            
            <div className="flex justify-between items-center text-slate-600 pt-4 border-t border-slate-200">
              <span className="font-bold">HIV Response Levy (TZS)</span>
              <span className="font-bold text-lg">{formatMoney(currentHivLevyTzs, 'TZS')}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 pb-4 border-b border-slate-200">
              <span className="font-bold">Vehicle Registration Fee (TZS)</span>
              <span className="font-bold text-lg">{formatMoney(currentRegistrationFeeTzs, 'TZS')}</span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xl font-black uppercase">Grand Total (TZS)</span>
              <span className="text-3xl font-black">{formatMoney(grandTotalTzs, 'TZS')}</span>
            </div>
          </div>
        </div>

        {/* Print Footer / Disclaimer */}
        <div className="text-xs text-slate-400 text-center border-t border-slate-200 pt-6">
          <p className="mb-1">This document is a generated estimate provided by Nova Wealth Management.</p>
          <p>Actual final assessments by the Tanzania Revenue Authority (TRA) may vary based on exact vehicle specifications, daily exchange rate fluctuations, and physical inspections at the port.</p>
        </div>

      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
        
        /* HIDDEN SPINNERS CSS HACK */
        input.no-spinners::-webkit-inner-spin-button,
        input.no-spinners::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input.no-spinners {
          -moz-appearance: textfield;
        }

        @media print {
          body, html {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          @page {
            margin: 15mm;
            size: A4 portrait;
          }
        }
      `}</style>
    </div>
  );
}