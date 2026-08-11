"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Download, FileText, ArrowLeft, Moon, Sun, Building, User, Calendar, Wallet, Palette, Hash, Briefcase, ChevronDown, Check, AlertTriangle, AlertCircle } from "lucide-react";

export default function PayslipGenerator() {
  const [isDark, setIsDark] = useState(true);

  // Payslip Data States
  const [companyName, setCompanyName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("Full-Time");
  
  // Custom Dropdown & Toast State
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const statusRef = useRef<HTMLDivElement>(null);
  
  // Date States
  const [payPeriod, setPayPeriod] = useState(""); // YYYY-MM format
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD format
  
  // Financial States
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [allowances, setAllowances] = useState<number>(0);
  const [paye, setPaye] = useState<number>(0);
  const [nssf, setNssf] = useState<number>(0);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  // 🚀 DEFAULT THEME SET TO PURPLE
  const [themeColor, setThemeColor] = useState<"blue" | "emerald" | "purple" | "slate" | "ruby" | "amber" | "teal" | "indigo">("purple");

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

  // 🚀 HANDLE CLICK OUTSIDE FOR CUSTOM DROPDOWN
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚀 AUTO-CALCULATE PAYE & NSSF WHEN SALARY CHANGES
  useEffect(() => {
    const gross = basicSalary + allowances;
    if (gross > 0) {
      const calculatedNssf = gross * 0.10;
      const taxableIncome = gross - calculatedNssf;
      
      let calculatedPaye = 0;
      if (taxableIncome > 1000000) {
        calculatedPaye = 89600 + (taxableIncome - 1000000) * 0.25;
      } else if (taxableIncome > 760000) {
        calculatedPaye = 41600 + (taxableIncome - 760000) * 0.20;
      } else if (taxableIncome > 520000) {
        calculatedPaye = 20000 + (taxableIncome - 520000) * 0.09;
      } else if (taxableIncome > 270000) {
        calculatedPaye = (taxableIncome - 270000) * 0.08;
      }

      setNssf(calculatedNssf);
      setPaye(calculatedPaye);
    } else {
      setNssf(0);
      setPaye(0);
    }
  }, [basicSalary, allowances]);

  // Derived Calculations
  const grossPay = basicSalary + allowances;
  const totalDeductions = paye + nssf + otherDeductions;
  const netPay = Math.max(0, grossPay - totalDeductions);

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

  // 🚀 SMART VALIDATION: Tells user exactly what is missing!
  const handleDownloadPDF = () => {
    const missingFields = [];
    
    if (!companyName) missingFields.push("Company Name");
    if (!employeeName) missingFields.push("Employee Name");
    if (!payPeriod) missingFields.push("Pay Period");
    if (!issueDate) missingFields.push("Issue Date");
    if (basicSalary === 0) missingFields.push("Basic Salary");

    if (missingFields.length > 0) {
      // Build a clean, readable error message
      const errorMsg = `Missing required fields: ${missingFields.join(", ")}`;
      setErrorMessage(errorMsg);
      
      // Auto-hide the error after 4 seconds
      setTimeout(() => {
        setErrorMessage("");
      }, 4000);
      return;
    }
    
    // If all required fields are present, generate PDF
    window.print();
  };

  // Date Formatters for the PDF
  const formattedPayPeriod = payPeriod 
    ? new Date(payPeriod + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
    : "PAY PERIOD";
    
  const formattedIssueDate = issueDate 
    ? new Date(issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    : "";

  // Expanded Template Color Definitions
  const printThemes = {
    blue: { main: "#0EA5E9", bg: "#F0F9FF", border: "#bae6fd", text: "#0369a1" },
    emerald: { main: "#10B981", bg: "#ECFDF5", border: "#a7f3d0", text: "#047857" },
    purple: { main: "#8B5CF6", bg: "#F5F3FF", border: "#ddd6fe", text: "#6d28d9" },
    slate: { main: "#334155", bg: "#F8FAFC", border: "#cbd5e1", text: "#0f172a" },
    ruby: { main: "#E11D48", bg: "#FFF1F2", border: "#fecdd3", text: "#be123c" },
    amber: { main: "#F59E0B", bg: "#FFFBEB", border: "#fde68a", text: "#b45309" },
    teal: { main: "#14B8A6", bg: "#F0FDFA", border: "#99f6e4", text: "#0f766e" },
    indigo: { main: "#6366F1", bg: "#EEF2FF", border: "#c7d2fe", text: "#4338ca" },
  };

  const currentTheme = printThemes[themeColor];
  const documentId = `DOC-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`;

  const statusOptions = ["Full-Time", "Part-Time", "Contractor", "Intern"];

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 relative overflow-hidden print:bg-white print:text-black transition-colors duration-500" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* 🚀 CUSTOM ERROR TOAST */}
      <div className={`print:hidden fixed top-6 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-400 ease-out ${errorMessage ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'}`}>
        <div className="bg-rose-500 dark:bg-rose-600 text-white px-5 py-3.5 rounded-2xl shadow-[0_12px_40px_rgba(225,29,72,0.4)] flex items-center gap-3 font-semibold text-sm border border-rose-400 dark:border-rose-500/50 backdrop-blur-md">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      </div>

      {/* PURPLE AMBIENT GLOW */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8B5CF6]/10 dark:bg-[#8B5CF6]/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0 print:hidden"></div>

      {/* 🚀 WEB UI WRAPPER */}
      <div className="web-ui-only relative z-10 pt-6 md:pt-12 px-4 sm:px-6 print:hidden flex flex-col min-h-screen">
        
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-[#12121A] border border-purple-100 dark:border-white/5 shadow-sm">
              <div className=""></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-slate-400">NOVA HR TOOLS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[3rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Official PDF
              </span>
              <span className="text-[2.5rem] sm:text-5xl md:text-[6.5rem] font-[900] tracking-[-0.04em] text-[#8B5CF6] leading-[0.85] mt-1 md:mt-0">
                Payslips.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10 mb-4">
            <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-3">
              Generate professional payslips <br className="hidden sm:block" />
              <span className="text-slate-900 dark:text-white font-bold">For your employees.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-md">
              Enter basic salary and watch TRA taxes auto-calculate. Choose your company's brand color and generate a printable PDF payslip instantly.
            </p>
          </div>
        </header>

        {/* CALCULATOR INTERFACE */}
        <section className="max-w-6xl mx-auto pb-12 grid lg:grid-cols-2 gap-6 md:gap-8 flex-grow">
            
          {/* INPUT CONTROLS */}
          <div className="bg-white dark:bg-[#0F0F15]/80 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-xl space-y-6">
            
            {/* 🚀 FIXED GRID: Lots of space for company and names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Company Name <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6]"><Building size={18} /></div>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nova Tech LLC" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Employee Name <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6]"><User size={18} /></div>
                  <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="John Doe" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"/>
                </div>
              </div>
            </div>

            {/* 🚀 FIXED GRID: Dates get their own full 50/50 row so they are never cramped */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Pay Period <span className="text-rose-500">*</span></label>
                <div className="relative custom-date-wrapper">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6] z-10"><Calendar size={18} /></div>
                  <input type="month" value={payPeriod} onChange={(e) => setPayPeriod(e.target.value)} className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] [color-scheme:light] dark:[color-scheme:dark] relative z-0 cursor-pointer"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Issue Date <span className="text-rose-500">*</span></label>
                <div className="relative custom-date-wrapper">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6] z-10"><Calendar size={18} /></div>
                  <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6] [color-scheme:light] dark:[color-scheme:dark] relative z-0 cursor-pointer"/>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Employee ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6]"><Hash size={18} /></div>
                  <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="EMP-001" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Status</label>
                <div className="relative" ref={statusRef}>
                  <div 
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                    className={`w-full flex items-center justify-between bg-slate-50 dark:bg-[#14141A] border ${isStatusOpen ? 'border-[#8B5CF6]' : 'border-slate-200 dark:border-white/10'} rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 dark:text-white cursor-pointer transition-colors`}
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8B5CF6]">
                      <Briefcase size={18} />
                    </div>
                    <span>{employmentStatus}</span>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isStatusOpen ? 'rotate-180 text-[#8B5CF6]' : ''}`} />
                  </div>
                  
                  {isStatusOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-[#1A1A24] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                      {statusOptions.map((option) => (
                        <div 
                          key={option}
                          onClick={() => {
                            setEmploymentStatus(option);
                            setIsStatusOpen(false);
                          }}
                          className={`flex items-center justify-between px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${employmentStatus === option ? 'bg-purple-50 dark:bg-purple-500/10 text-[#8B5CF6]' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                          {option}
                          {employmentStatus === option && <Check size={16} className="text-[#8B5CF6]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Basic Salary (TZS) <span className="text-rose-500">*</span></label>
                <span className="block text-[10px] text-slate-500 mb-2">Fixed base pay before allowances</span>
                <input type="text" value={basicSalary === 0 ? '' : basicSalary.toLocaleString('en-US')} onChange={handleNumberChange(setBasicSalary)} placeholder="0" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">Allowances (TZS)</label>
                <span className="block text-[10px] text-slate-500 mb-2">Transport, housing, bonus, etc.</span>
                <input type="text" value={allowances === 0 ? '' : allowances.toLocaleString('en-US')} onChange={handleNumberChange(setAllowances)} placeholder="0" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:border-[#8B5CF6]"/>
              </div>
            </div>

            <hr className="border-slate-200 dark:border-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">PAYE (TZS) <span className="text-[9px] font-normal text-purple-500">(Auto)</span></label>
                <input type="text" value={paye === 0 ? '' : paye.toLocaleString('en-US')} onChange={handleNumberChange(setPaye)} placeholder="0" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:border-[#8B5CF6]"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">NSSF (TZS) <span className="text-[9px] font-normal text-purple-500">(Auto)</span></label>
                <input type="text" value={nssf === 0 ? '' : nssf.toLocaleString('en-US')} onChange={handleNumberChange(setNssf)} placeholder="0" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:border-[#8B5CF6]"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Other Deds.</label>
                <input type="text" value={otherDeductions === 0 ? '' : otherDeductions.toLocaleString('en-US')} onChange={handleNumberChange(setOtherDeductions)} placeholder="0" className="w-full bg-slate-50 dark:bg-[#14141A] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:border-[#8B5CF6]"/>
              </div>
            </div>

          </div>

          {/* RESULTS PANEL & COLOR PICKER */}
          <div className="bg-[#8B5CF6]/5 dark:bg-[#8B5CF6]/10 p-6 sm:p-8 rounded-[2rem] border border-[#8B5CF6]/20 shadow-xl flex flex-col justify-center">
            
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-6">
              <FileText size={24} />
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">
              Final Net Pay
            </p>
            <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
              {formatMoney(netPay)}
            </h3>
            
            <div className="space-y-4 pt-4 border-t border-[#8B5CF6]/20 mb-8">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-500 dark:text-slate-400">Total Gross Earnings</span>
                <span className="text-slate-900 dark:text-white">{formatMoney(grossPay)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pb-4 border-b border-[#8B5CF6]/10">
                <span className="text-slate-500 dark:text-slate-400">Total Deductions</span>
                <span className="text-rose-500">-{formatMoney(totalDeductions)}</span>
              </div>
            </div>

            {/* 🚀 EXPANDED BRAND COLOR PICKER */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                <Palette size={14} /> PDF Brand Color
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "purple", hex: "#8B5CF6", name: "Purple" },
                  { id: "blue", hex: "#0EA5E9", name: "Sky" },
                  { id: "emerald", hex: "#10B981", name: "Emerald" },
                  { id: "slate", hex: "#334155", name: "Executive" },
                  { id: "ruby", hex: "#E11D48", name: "Ruby" },
                  { id: "amber", hex: "#F59E0B", name: "Amber" },
                  { id: "teal", hex: "#14B8A6", name: "Teal" },
                  { id: "indigo", hex: "#6366F1", name: "Indigo" }
                ].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setThemeColor(color.id as any)}
                    className={`w-8 h-8 rounded-full transition-all active:scale-90 ${themeColor === color.id ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white dark:ring-offset-[#0F0F15]' : 'opacity-70 hover:opacity-100 border border-slate-200 dark:border-white/10'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <button 
              onClick={handleDownloadPDF} 
              className="mt-auto w-full py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-2xl font-bold shadow-[0_8px_20px_rgba(139,92,246,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Download size={18} /> Generate PDF Payslip
            </button>
          </div>
        </section>

        {/* 🚀 WEB UI LEGAL DISCLAIMER */}
        <div className="max-w-6xl mx-auto pb-24 mt-8">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-100/50 dark:bg-[#12121A]/50 border border-slate-200 dark:border-white/5 flex gap-4 items-start shadow-sm">
            <AlertTriangle size={20} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Legal Disclaimer</p>
              <p>
                The payslips generated by Nova are intended for standard HR record-keeping and informational purposes based on user-provided inputs. While the auto-calculated deductions reflect general TRA tax brackets, actual tax liabilities may vary based on specific corporate tax structures or exemptions. 
                Always consult with a certified CPA or official TRA representative to ensure compliance.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================
          🖨️ HIGH-END CORPORATE PDF PRINT TEMPLATE
          ========================================= */}
      <div className="hidden print:block print-template w-full max-w-[210mm] min-h-[297mm] mx-auto bg-white">
        
        {/* Sleek Top Brand Accent Bar */}
        <div className="w-full h-3" style={{ backgroundColor: currentTheme.main }}></div>
        
        <div className="px-12 py-10 flex flex-col h-full print-body relative">
          
          <div className="flex-grow">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 
                  className="text-3xl font-black tracking-tight uppercase mb-1 print-brand-text"
                  style={{ color: currentTheme.main, letterSpacing: '-0.02em' }}
                >
                  {companyName || "COMPANY NAME"}
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  EMPLOYEE EARNINGS STATEMENT
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight mb-1">
                  PAYSLIP
                </h2>
                <div className="text-xs text-slate-500 space-y-1">
                  <p><span className="font-bold text-slate-700">PERIOD:</span> {formattedPayPeriod}</p>
                  <p><span className="font-bold text-slate-700">DATE:</span> {formattedIssueDate}</p>
                  <p><span className="font-bold text-slate-700">REF:</span> {documentId}</p>
                </div>
              </div>
            </div>

            {/* Employee Identification Card */}
            <div className="mb-12 rounded-lg p-5 border flex justify-between items-center print-card" style={{ borderColor: currentTheme.border, backgroundColor: currentTheme.bg }}>
               <div>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Employee Details</p>
                 <p className="text-xl font-bold text-slate-900">{employeeName || "Employee Name"}</p>
                 {employeeId && <p className="text-xs font-medium text-slate-600 mt-1">ID: {employeeId}</p>}
               </div>
               <div className="text-right">
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Employment Status</p>
                 <p className="text-sm font-bold uppercase" style={{ color: currentTheme.text }}>
                   {employmentStatus || "FULL-TIME"}
                 </p>
               </div>
            </div>

            {/* Financial Ledgers */}
            <div className="grid grid-cols-2 gap-10 mb-12">
              
              {/* Earnings Ledger */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3 border-b-2 border-slate-800 pb-2">Earnings</h3>
                <table className="w-full text-sm print-table">
                  <tbody>
                    <tr>
                      <td className="py-3 text-slate-600 border-b border-slate-100">Basic Salary</td>
                      <td className="py-3 text-right font-medium text-slate-900 border-b border-slate-100">{formatMoney(basicSalary)}</td>
                    </tr>
                    {allowances > 0 && (
                      <tr>
                        <td className="py-3 text-slate-600 border-b border-slate-100">Allowances</td>
                        <td className="py-3 text-right font-medium text-slate-900 border-b border-slate-100">{formatMoney(allowances)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">Gross Earnings</td>
                      <td className="py-4 text-right font-bold text-slate-900">{formatMoney(grossPay)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Deductions Ledger */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-900 mb-3 border-b-2 border-slate-800 pb-2">Deductions</h3>
                <table className="w-full text-sm print-table">
                  <tbody>
                    {paye > 0 && (
                      <tr>
                        <td className="py-3 text-slate-600 border-b border-slate-100">P.A.Y.E (TRA)</td>
                        <td className="py-3 text-right font-medium text-slate-900 border-b border-slate-100">{formatMoney(paye)}</td>
                      </tr>
                    )}
                    {nssf > 0 && (
                      <tr>
                        <td className="py-3 text-slate-600 border-b border-slate-100">NSSF Contribution (10%)</td>
                        <td className="py-3 text-right font-medium text-slate-900 border-b border-slate-100">{formatMoney(nssf)}</td>
                      </tr>
                    )}
                    {otherDeductions > 0 && (
                      <tr>
                        <td className="py-3 text-slate-600 border-b border-slate-100">Other Deductions</td>
                        <td className="py-3 text-right font-medium text-slate-900 border-b border-slate-100">{formatMoney(otherDeductions)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td className="py-4 font-bold text-slate-900 uppercase text-xs tracking-wider">Total Deductions</td>
                      <td className="py-4 text-right font-bold text-slate-900">{formatMoney(totalDeductions)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>

            {/* Premium Net Pay Callout */}
            <div 
              className="rounded-lg p-8 flex justify-between items-center mb-16 border-l-[6px]"
              style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.main }} 
            >
              <div>
                <span className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Final Transfer Amount
                </span>
                <span 
                  className="text-xl font-bold uppercase tracking-tight"
                  style={{ color: currentTheme.text }} 
                >
                  Net Take-Home Pay
                </span>
              </div>
              <span className="text-4xl font-black tracking-tight text-slate-900">
                {formatMoney(netPay)}
              </span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-16 mt-auto px-4 mb-8">
              <div className="border-t border-slate-300 pt-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Authorized Signature (Employer)</p>
              </div>
              <div className="border-t border-slate-300 pt-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Employee Signature</p>
              </div>
            </div>

            {/* 🚀 PDF LEGAL DISCLAIMER */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[8px] text-slate-400 leading-tight text-justify">
                <strong>Disclaimer:</strong> This earnings statement is system-generated based on user-provided inputs and acts as a standard template for HR record-keeping. While auto-calculations reflect general TRA (Tanzania Revenue Authority) brackets, specific tax liabilities, exemptions, and compliance responsibilities lie entirely with the employer. This document does not replace official tax guidance.
              </p>
            </div>

          </div>

          {/* Footer watermark */}
          <div className="mt-6 flex justify-between items-center text-[9px] uppercase tracking-widest text-slate-400 font-medium">
            <p>Generated securely via Nova Financial Tools</p>
            <p>Page 1 of 1</p>
          </div>

        </div>
      </div>

      {/* 🚀 AGGRESSIVE CSS FIXES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
        
        /* MAGIC FIX: Hide default browser calendar icons but keep the input clickable! */
        .custom-date-wrapper input[type="date"]::-webkit-calendar-picker-indicator,
        .custom-date-wrapper input[type="month"]::-webkit-calendar-picker-indicator {
            opacity: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }

        @media print {
          /* Force standard crisp fonts for PDF rendering */
          .print-body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
          }
          
          body, html { 
            background-color: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .web-ui-only { display: none !important; }
          .print-template { display: block !important; }
          
          @page { 
            size: A4 portrait; 
            margin: 0; 
          }
          
          header, nav, footer, aside, .fixed, .sticky { display: none !important; }
        }
      `}</style>
    </div>
  );
}