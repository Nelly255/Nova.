"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, Calculator, PieChart, ShoppingCart, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export default function BudgetCalculatorPage() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);

  // INCOME STATE
  const [income, setIncome] = useState<number>(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  // 50/30/20 CALCULATIONS
  const needs = income * 0.50;
  const wants = income * 0.30;
  const savings = income * 0.20;

  // Dynamic Script Injector for PDF
  const loadScript = (src: string) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js");

      // @ts-ignore
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ format: 'a4' });

      // PREMIUM STYLING VARIABLES
      const slate900 = [15, 15, 21];
      const slate500 = [100, 116, 139];
      const purpleAccent = [132, 56, 255];
      const emerald500 = [16, 185, 129];
      const sky500 = [14, 165, 233];
      const amber500 = [245, 158, 11];
      
      // 1. Draw Sleek Brand Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(...slate900);
      doc.text("Nova Analytics.", 14, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...slate500);
      doc.text("50/30/20 Optimal Budget Plan", 14, 33);

      // Top Divider
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 42, 196, 42);

      // 2. High-End Metadata Grid
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate500);
      doc.text("DATE GENERATED", 14, 52);
      doc.text("BUDGET STRATEGY", 70, 52);
      doc.text("MONTHLY NET INCOME", 140, 52);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate900);
      doc.text(new Date().toLocaleDateString(), 14, 57);
      
      doc.text("50 / 30 / 20 Rule", 70, 57);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...purpleAccent);
      doc.text(`${income.toLocaleString()} TSH`, 140, 57);

      doc.setDrawColor(240, 240, 240);
      doc.line(14, 67, 196, 67);

      // 3. Allocation Table
      // @ts-ignore
      doc.autoTable({
        startY: 77,
        head: [['CATEGORY', 'ALLOCATION %', 'TARGET AMOUNT (TSH)', 'DESCRIPTION']],
        body: [
          ['Needs & Essentials', '50%', needs.toLocaleString(), 'Rent, groceries, utilities, transport.'],
          ['Wants & Lifestyle', '30%', wants.toLocaleString(), 'Dining out, entertainment, hobbies.'],
          ['Savings & Debt', '20%', savings.toLocaleString(), 'Investments, emergency fund, extra debt paydown.'],
        ],
        theme: 'plain', 
        headStyles: { fillColor: [250, 250, 252], textColor: slate500, fontStyle: 'bold', fontSize: 8, cellPadding: 6, lineWidth: { bottom: 0.5 }, lineColor: [230, 230, 230] },
        bodyStyles: { fontSize: 9, textColor: slate900, cellPadding: 6, lineWidth: { bottom: 0.1 }, lineColor: [240, 240, 240] },
        columnStyles: { 
          0: { fontStyle: 'bold' },
          1: { fontStyle: 'bold', textColor: slate500 },
          2: { halign: 'right', fontStyle: 'bold', textColor: purpleAccent } 
        },
      });

      // 5. Trigger File Download
      doc.save(`Nova_Budget_${new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#07070A] text-slate-900 dark:text-slate-50 p-4 sm:p-6 md:p-12 transition-colors duration-500 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#8438FF]/10 dark:bg-[#8438FF]/15 rounded-full blur-[120px] pointer-events-none opacity-80"></div>

      {/* TOP NAV */}
      <nav className="max-w-6xl mx-auto mb-10 md:mb-16 flex items-center justify-between relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm sm:text-base">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <button onClick={toggleTheme} className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#12121A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-[#1A1A24] transition-all active:scale-90">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      <main className="max-w-6xl mx-auto relative z-10">
        
        {/* UNIQUE HEADER LAYOUT */}
        <header className="mb-12 md:mb-20 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8438FF] shadow-[0_0_8px_#8438FF]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA TOOLS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Zero-Based
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Budgeting.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Allocate your income <br />
              & <span className="text-slate-900 dark:text-white font-bold">Build Financial Discipline.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
              Input your monthly net income to instantly generate an optimal 50/30/20 spending plan tailored for your wealth-building journey.
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 mb-12">
          
          {/* LEFT COL: INPUT SECTION */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              <div className="space-y-6 md:space-y-8">
                
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#8438FF]/10 rounded-xl text-[#8438FF]">
                      <Calculator size={18} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">Monthly Cash Flow</h3>
                  </div>
                  
                  <InputField label="Total Monthly Net Income (After Tax)" value={income} setter={setIncome} placeholder="0" />
                </div>

                <div className="p-4 bg-[#F8F9FB] dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">The 50/30/20 Rule</h4>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                    This institutional standard ensures your basic needs are met, you enjoy your lifestyle, and you consistently build wealth without feeling restricted.
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COL: SUMMARY & TABLE SECTION */}
          <div className="lg:col-span-7 space-y-6 overflow-hidden">
            
            <div className="bg-white dark:bg-[#0F0F15]/90 p-6 sm:p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-violet-500/10 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full relative">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Budget Strategy</span>
                  <div className="text-3xl md:text-4xl font-black text-[#8438FF] flex items-baseline gap-2">
                    50/30/20
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Income to Allocate</span>
                  <div className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                    {income.toLocaleString()} <span className="text-sm md:text-lg font-bold text-slate-300 dark:text-slate-600">TSH</span>
                  </div>
                </div>
              </div>

              {/* Safe w-full overflow container */}
              <div className="overflow-x-auto w-full pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 -mx-2 px-2 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-collapse min-w-[450px]">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100 dark:border-white/5 text-slate-400">
                      <th className="pb-4 md:pb-5 px-2">Category</th>
                      <th className="pb-4 md:pb-5 px-2 text-center">%</th>
                      <th className="pb-4 md:pb-5 px-2 text-right">Target Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {/* NEEDS */}
                    <tr className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-sky-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center flex-shrink-0"><ShieldCheck size={14}/></div>
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap">Needs & Essentials</span>
                            <span className="text-[10px] font-medium text-slate-400">Rent, Food, Bills</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-center text-slate-500">50%</td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-slate-900 dark:text-white text-base md:text-lg">{needs.toLocaleString()}</td>
                    </tr>
                    
                    {/* WANTS */}
                    <tr className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-amber-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0"><ShoppingCart size={14}/></div>
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap">Wants & Lifestyle</span>
                            <span className="text-[10px] font-medium text-slate-400">Dining, Entertainment</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-center text-slate-500">30%</td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-slate-900 dark:text-white text-base md:text-lg">{wants.toLocaleString()}</td>
                    </tr>

                    {/* SAVINGS */}
                    <tr className="border-b last:border-0 border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-emerald-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><PieChart size={14}/></div>
                          <div className="flex flex-col">
                            <span className="whitespace-nowrap">Savings & Investments</span>
                            <span className="text-[10px] font-medium text-slate-400">Emergency, Stocks, Debt</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-center text-slate-500">20%</td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-emerald-500 text-lg md:text-xl">{savings.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-10 md:mt-12 space-y-4 md:space-y-5">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF || income === 0}
                  className="w-full py-4 md:py-5 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-2xl md:rounded-[1.5rem] font-bold text-sm md:text-[15px] flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <FileText size={18} className="md:w-5 md:h-5 group-hover:-translate-y-1 transition-transform duration-300" /> 
                  {isGeneratingPDF ? "Generating PDF..." : "Generate Budget Plan (PDF)"}
                </button>
                <div className="flex items-center justify-center gap-2 text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center px-4">
                  <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" /> <span className="truncate">Locally Generated PDF • Private & Secure</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SEO / INFO SECTION */}
        <section className="max-w-4xl mx-auto bg-white/40 dark:bg-[#0F0F15]/50 p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-xl mt-4">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-5 text-slate-900 dark:text-white tracking-tight">Why the 50/30/20 Rule?</h3>
          <div className="space-y-3 md:space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            <p>
              Popularized by financial experts, the <strong className="text-slate-900 dark:text-white">50/30/20 budgeting rule</strong> is a simple, highly effective method to manage your money. Instead of tracking every single shilling you spend, you just divide your after-tax income into three main categories.
            </p>
            <p>
              By strictly allocating <strong className="text-slate-900 dark:text-white">20% to savings and debt reduction</strong>, you ensure that you are consistently building wealth and insulating yourself against financial shocks in Tanzania's dynamic economy. Use this calculator to set your targets before the month even begins.
            </p>
          </div>
        </section>

      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;700;900&display=swap');
      `}</style>
    </div>
  );
}

// MATCHING INPUT FIELD COMPONENT
function InputField({ label, value, setter, placeholder }: { label: string, value: number, setter: (val: number) => void, placeholder: string }) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numericValue = parseInt(rawValue, 10);
    setter(isNaN(numericValue) ? 0 : numericValue);
  };

  const displayValue = value === 0 ? '' : value.toLocaleString();

  return (
    <div>
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          inputMode="numeric"
          value={displayValue}
          onChange={handleInputChange}
          className="w-full bg-[#F8F9FB] dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-[#8438FF]/50 focus:bg-white dark:focus:bg-[#0F0F15] py-3.5 md:py-4 pl-5 md:pl-6 pr-14 md:pr-16 rounded-2xl text-lg md:text-xl font-bold outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
          placeholder={placeholder}
        />
        <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black text-slate-300 dark:text-slate-500 tracking-widest uppercase pointer-events-none">
          TSH
        </div>
      </div>
    </div>
  );
}