"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun, Calculator, Tag, Percent, DollarSign, FileText, CheckCircle2 } from "lucide-react";

export default function MarkupMarginCalculator() {
  // THEME STATE
  const [isDark, setIsDark] = useState(true);

  // CORE STATE
  const [cost, setCost] = useState<number>(1000);
  const [sellingPrice, setSellingPrice] = useState<number>(1500);
  
  // To handle smooth typing in the margin field without cursor jumping
  const [marginInput, setMarginInput] = useState<string>("33.3");

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

  // CALCULATIONS
  const profit = sellingPrice - cost;
  const derivedMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const derivedMarkup = cost > 0 ? (profit / cost) * 100 : 0;

  // SYNC DERIVED MARGIN TO INPUT WHEN COST OR SELLING PRICE CHANGES
  useEffect(() => {
    // Only auto-update if the user isn't actively typing in the margin field
    if (document.activeElement?.id !== "margin-input") {
      setMarginInput(derivedMargin.toFixed(1));
    }
  }, [cost, sellingPrice, derivedMargin]);

  const handleMarginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value.replace(/[^0-9.]/g, '');
    setMarginInput(valStr);
    
    const valNum = parseFloat(valStr);
    if (!isNaN(valNum) && valNum < 100) {
      // Calculate new selling price based on cost and desired margin
      const newSP = cost / (1 - valNum / 100);
      setSellingPrice(Math.round(newSP));
    }
  };

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
      const blue500 = [59, 130, 246];
      
      // 1. Draw Sleek Brand Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(...slate900);
      doc.text("Nova Analytics.", 14, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...slate500);
      doc.text("Pricing & Margin Statement", 14, 33);

      // Top Divider
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 42, 196, 42);

      // 2. High-End Metadata Grid
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate500);
      doc.text("DATE GENERATED", 14, 52);
      doc.text("GROSS MARGIN", 70, 52);
      doc.text("GROSS PROFIT", 140, 52);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate900);
      doc.text(new Date().toLocaleDateString(), 14, 57);
      
      doc.setTextColor(...blue500);
      doc.text(`${derivedMargin.toFixed(1)}%`, 70, 57);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...emerald500);
      doc.text(`${profit.toLocaleString()} TSH`, 140, 57);

      doc.setDrawColor(240, 240, 240);
      doc.line(14, 67, 196, 67);

      // 3. Pricing Breakdown Table
      // @ts-ignore
      doc.autoTable({
        startY: 77,
        head: [['METRIC', 'VALUE']],
        body: [
          ['Cost per Unit', `${cost.toLocaleString()} TSH`],
          ['Selling Price per Unit', `${sellingPrice.toLocaleString()} TSH`],
          ['Gross Profit', `${profit.toLocaleString()} TSH`],
          ['Markup (Profit / Cost)', `${derivedMarkup.toFixed(1)}%`],
          ['Margin (Profit / Revenue)', `${derivedMargin.toFixed(1)}%`],
        ],
        theme: 'plain', 
        headStyles: { fillColor: [250, 250, 252], textColor: slate500, fontStyle: 'bold', fontSize: 8, cellPadding: 6, lineWidth: { bottom: 0.5 }, lineColor: [230, 230, 230] },
        bodyStyles: { fontSize: 9, textColor: slate900, cellPadding: 6, lineWidth: { bottom: 0.1 }, lineColor: [240, 240, 240] },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: purpleAccent } },
      });

      // 5. Trigger File Download
      doc.save(`Nova_Pricing_Report_${new Date().getFullYear()}.pdf`);
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
        <Link href="/tools" className="inline-flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all font-semibold bg-white dark:bg-[#12121A] px-4 py-2 md:px-5 md:py-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 group text-sm sm:text-base">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="hidden sm:inline">Back to Tools</span>
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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA TOOLS • FINANCE</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Markup vs
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6rem] font-[900] tracking-[-0.04em] text-[#8438FF] leading-[0.85] mt-1 md:mt-0">
                Margin.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Convert between markup, <br />
              <span className="text-slate-900 dark:text-white font-bold">margin and selling price.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
              Tanzania retail and wholesale pricing made easy. Input your cost and target margins to automatically calculate your optimal selling price.
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 mb-12">
          
          {/* LEFT COL: INPUT SECTION */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              <div className="space-y-6 md:space-y-8">
                
                {/* CORE INPUTS */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#8438FF]/10 rounded-xl text-[#8438FF]">
                      <Calculator size={18} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">Pricing Variables</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <InputField 
                      label="Cost per unit (TZS)" 
                      value={cost} 
                      setter={setCost} 
                      placeholder="e.g. 1000" 
                      symbol="TSH"
                    />
                    <InputField 
                      label="Selling price per unit (TZS)" 
                      value={sellingPrice} 
                      setter={setSellingPrice} 
                      placeholder="e.g. 1500" 
                      symbol="TSH"
                    />
                  </div>
                </div>

                <div className="relative flex py-5 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">OR</span>
                  <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                </div>

                {/* MARGIN TARGET */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Desired margin %</label>
                  <div className="relative">
                    <input 
                      id="margin-input"
                      type="text" 
                      inputMode="decimal"
                      value={marginInput}
                      onChange={handleMarginInputChange}
                      className="w-full bg-[#F8F9FB] dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-[#8438FF]/50 focus:bg-white dark:focus:bg-[#0F0F15] py-3.5 md:py-4 pl-5 md:pl-6 pr-14 md:pr-16 rounded-2xl text-lg md:text-xl font-bold outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                      placeholder="e.g. 30"
                    />
                    <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black text-slate-300 dark:text-slate-500 tracking-widest uppercase pointer-events-none">
                      %
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COL: SUMMARY & TABLE SECTION */}
          <div className="lg:col-span-7 space-y-6 overflow-hidden">
            
            <div className="bg-white dark:bg-[#0F0F15]/90 p-6 sm:p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-violet-500/10 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full relative">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Gross Margin</span>
                  <div className="text-3xl md:text-4xl font-black text-[#8438FF] flex items-baseline gap-2">
                    {derivedMargin.toFixed(1)}%
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Gross Profit</span>
                  <div className={`text-3xl md:text-5xl font-black tracking-tight ${profit >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                    {profit.toLocaleString()} <span className="text-sm md:text-lg font-bold text-slate-300 dark:text-slate-600">TSH</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto w-full pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 -mx-2 px-2 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100 dark:border-white/5 text-slate-400">
                      <th className="pb-4 md:pb-5 px-2">Metric</th>
                      <th className="pb-4 md:pb-5 px-2 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-slate-600 dark:text-slate-400 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0"><DollarSign size={14}/></div>
                          <span className="whitespace-nowrap">Cost</span>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-slate-900 dark:text-white text-base md:text-lg">{cost.toLocaleString()} TSH</td>
                    </tr>
                    <tr className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-emerald-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><Tag size={14}/></div>
                          <span className="whitespace-nowrap">Selling Price</span>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-emerald-500 text-base md:text-lg">{sellingPrice.toLocaleString()} TSH</td>
                    </tr>
                    <tr className="border-b last:border-0 border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-blue-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0"><Percent size={14}/></div>
                          <span className="whitespace-nowrap">Markup</span>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-lg md:text-xl text-blue-500">{derivedMarkup.toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-10 md:mt-12 space-y-4 md:space-y-5">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full py-4 md:py-5 bg-[#8438FF] hover:bg-[#7328F5] text-white rounded-2xl md:rounded-[1.5rem] font-bold text-sm md:text-[15px] flex items-center justify-center gap-3 shadow-[0_8px_20px_rgba(132,56,255,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <FileText size={18} className="md:w-5 md:h-5 group-hover:-translate-y-1 transition-transform duration-300" /> 
                  {isGeneratingPDF ? "Generating PDF..." : "Generate Pricing Report"}
                </button>
                <div className="flex items-center justify-center gap-2 text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center px-4">
                  <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" /> <span className="truncate">Generated PDF </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SEO / INFO SECTION */}
        <section className="max-w-4xl mx-auto bg-white/40 dark:bg-[#0F0F15]/50 p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-xl mt-4">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-5 text-slate-900 dark:text-white tracking-tight">How to convert markup and margin</h3>
          <div className="space-y-3 md:space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            <p>
              While often used interchangeably, <strong className="text-slate-900 dark:text-white">Margin</strong> and <strong className="text-slate-900 dark:text-white">Markup</strong> evaluate profit from different perspectives. 
              Margin represents the percentage of revenue that remains as profit after accounting for the cost of goods sold.
            </p>
            <p>
              Markup, on the other hand, shows how much more your selling price is than the amount the item costs you. 
              Nova Analytics allows you to input your desired margin to automatically structure your retail pricing strategies.
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
function InputField({ label, value, setter, placeholder, symbol = "TSH" }: { label: string, value: number, setter: (val: number) => void, placeholder: string, symbol?: string }) {
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
          {symbol}
        </div>
      </div>
    </div>
  );
}