"use client";

import { useState } from "react";
import { Activity, TrendingUp, TrendingDown, FileText, CheckCircle2 } from "lucide-react";

export default function NetWorthCalculator() {
  // ASSETS STATE
  const [cash, setCash] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [property, setProperty] = useState<number>(0);
  const [otherAssets, setOtherAssets] = useState<number>(0);

  // DEBTS STATE
  const [mortgage, setMortgage] = useState<number>(0);
  const [creditCards, setCreditCards] = useState<number>(0);
  const [loans, setLoans] = useState<number>(0);

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // CALCULATIONS
  const totalAssets = cash + investments + property + otherAssets;
  const totalDebts = mortgage + creditCards + loans;
  const netWorth = totalAssets - totalDebts;
  
  const debtToAssetRatio = totalAssets > 0 ? ((totalDebts / totalAssets) * 100).toFixed(1) : "0";

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
      const rose600 = [225, 29, 72];
      const emerald500 = [16, 185, 129];
      
      // Dynamically fetch the current brand color for the PDF!
      let brandAccent = [132, 56, 255]; // Fallback to original purple
      try {
        const rootStyle = getComputedStyle(document.documentElement);
        const brandVar = rootStyle.getPropertyValue('--brand-500').trim();
        if (brandVar) {
          const parts = brandVar.split(/[\s,]+/).filter(Boolean).map(Number);
          if (parts.length === 3 && !parts.some(isNaN)) {
            brandAccent = parts;
          }
        }
      } catch (e) {
        console.warn("Could not read brand color for PDF, using fallback.");
      }

      // 1. Draw Sleek Brand Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(...slate900);
      doc.text("Nova Analytics.", 14, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(...slate500);
      doc.text("Personal Net Worth Statement", 14, 33);

      // Top Divider
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 42, 196, 42);

      // 2. High-End Metadata Grid
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate500);
      doc.text("DATE GENERATED", 14, 52);
      doc.text("DEBT-TO-ASSET RATIO", 70, 52);
      doc.text("TOTAL NET WORTH", 140, 52);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate900);
      doc.text(new Date().toLocaleDateString(), 14, 57);
      
      doc.setTextColor(...(parseFloat(debtToAssetRatio) > 50 ? rose600 : slate900));
      doc.text(`${debtToAssetRatio}%`, 70, 57);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(netWorth >= 0 ? brandAccent : rose600));
      doc.text(`${netWorth.toLocaleString()} TSH`, 140, 57);

      doc.setDrawColor(240, 240, 240);
      doc.line(14, 67, 196, 67);

      // 3. Asset Breakdown Table
      // @ts-ignore
      doc.autoTable({
        startY: 77,
        head: [['ASSET CATEGORY', 'VALUATION (TSH)']],
        body: [
          ['Liquid Cash', cash.toLocaleString()],
          ['Investments & Portfolio', investments.toLocaleString()],
          ['Real Estate Holdings', property.toLocaleString()],
          ['Valuable Assets', otherAssets.toLocaleString()],
        ],
        theme: 'plain', 
        headStyles: { fillColor: [250, 250, 252], textColor: slate500, fontStyle: 'bold', fontSize: 8, cellPadding: 6, lineWidth: { bottom: 0.5 }, lineColor: [230, 230, 230] },
        bodyStyles: { fontSize: 9, textColor: slate900, cellPadding: 6, lineWidth: { bottom: 0.1 }, lineColor: [240, 240, 240] },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: emerald500 } },
        foot: [['Total Gross Assets', totalAssets.toLocaleString()]],
        footStyles: { fillColor: [255, 255, 255], textColor: slate900, halign: 'right', fontSize: 10, fontStyle: 'bold', cellPadding: 8, lineWidth: { top: 0.5 }, lineColor: [230, 230, 230] }
      });

      // 4. Liability Breakdown Table
      // @ts-ignore
      doc.autoTable({
        // @ts-ignore
        startY: doc.lastAutoTable.finalY + 15,
        head: [['LIABILITY CATEGORY', 'OUTSTANDING DEBT (TSH)']],
        body: [
          ['Mortgages', mortgage.toLocaleString()],
          ['Credit Balances', creditCards.toLocaleString()],
          ['Active Loans', loans.toLocaleString()],
        ],
        theme: 'plain', 
        headStyles: { fillColor: [250, 250, 252], textColor: slate500, fontStyle: 'bold', fontSize: 8, cellPadding: 6, lineWidth: { bottom: 0.5 }, lineColor: [230, 230, 230] },
        bodyStyles: { fontSize: 9, textColor: slate900, cellPadding: 6, lineWidth: { bottom: 0.1 }, lineColor: [240, 240, 240] },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: rose600 } },
        foot: [['Total Liabilities', totalDebts.toLocaleString()]],
        footStyles: { fillColor: [255, 255, 255], textColor: slate900, halign: 'right', fontSize: 10, fontStyle: 'bold', cellPadding: 8, lineWidth: { top: 0.5 }, lineColor: [230, 230, 230] }
      });

      // 5. Trigger File Download
      doc.save(`Nova_NetWorth_${new Date().getFullYear()}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-50 p-4 sm:p-6 md:p-12 transition-colors duration-500 relative overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-[120px] pointer-events-none opacity-80 z-0"></div>

      <main className="max-w-6xl mx-auto relative z-10 pt-4">
        
        {/* UNIQUE HEADER LAYOUT */}
        <header className="mb-12 md:mb-20 grid lg:grid-cols-2 gap-8 md:gap-10 items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#12121A] border border-slate-200 dark:border-white/5 shadow-sm">
              <div className=""></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA TOOLS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 pl-1">
                Net Worth
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6rem] font-[900] tracking-[-0.04em] text-brand-500 leading-[0.85] mt-1 md:mt-0">
                Analytics.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              A precise breakdown <br />
              & <span className="text-slate-900 dark:text-white font-bold">Financial Empire Valuation.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
              Input your capital assets and outstanding debts to get a raw, unfiltered look at your current standing in Tanzania.
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 mb-12">
          
          {/* LEFT COL: INPUT SECTION */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              <div className="space-y-6 md:space-y-8">
                
                {/* ASSETS SECTION */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-brand-500/10 rounded-xl text-brand-500">
                      <TrendingUp size={18} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">Capital & Assets</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <InputField label="Liquid Cash" value={cash} setter={setCash} placeholder="0" />
                    <InputField label="Investments & Portfolio" value={investments} setter={setInvestments} placeholder="0" />
                    <InputField label="Real Estate Holdings" value={property} setter={setProperty} placeholder="0" />
                    <InputField label="Valuable Assets" value={otherAssets} setter={setOtherAssets} placeholder="0" />
                  </div>
                </div>

                <div className="h-px w-full bg-slate-100 dark:bg-white/5 my-8"></div>

                {/* LIABILITIES SECTION */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-slate-400">
                      <TrendingDown size={18} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-[0.15em] text-slate-900 dark:text-white">Outstanding Debts</h3>
                  </div>

                  <div className="space-y-6">
                    <InputField label="Mortgages" value={mortgage} setter={setMortgage} placeholder="0" />
                    <InputField label="Credit Balances" value={creditCards} setter={setCreditCards} placeholder="0" />
                    <InputField label="Active Loans" value={loans} setter={setLoans} placeholder="0" />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COL: SUMMARY & TABLE SECTION */}
          {/* THE FIX: Added overflow-hidden to column, removed 'h-full flex flex-col' from the card so flexbox stops breaking the layout on mobile */}
          <div className="lg:col-span-7 space-y-6 overflow-hidden">
            
            <div className="bg-white dark:bg-[#0F0F15]/90 p-6 sm:p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-brand-500/10 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full relative">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Debt-to-Asset Ratio</span>
                  <div className="text-3xl md:text-4xl font-black text-brand-500 flex items-baseline gap-2">
                    {debtToAssetRatio}%
                    {parseFloat(debtToAssetRatio) > 50 && <span className="text-xs text-rose-500 font-bold bg-rose-500/10 px-2 py-1 rounded-lg">High Risk</span>}
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Total Net Worth</span>
                  <div className={`text-3xl md:text-5xl font-black tracking-tight ${netWorth >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                    {netWorth.toLocaleString()} <span className="text-sm md:text-lg font-bold text-slate-300 dark:text-slate-600">TSH</span>
                  </div>
                </div>
              </div>

              {/* THE FIX: Safe w-full overflow container */}
              <div className="overflow-x-auto w-full pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 -mx-2 px-2 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-collapse min-w-[400px]">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100 dark:border-white/5 text-slate-400">
                      <th className="pb-4 md:pb-5 px-2">Category</th>
                      <th className="pb-4 md:pb-5 px-2 text-right">Valuation (TSH)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      {/* THE FIX: Moved flexbox inside a div to prevent HTML table wrapping bugs on mobile */}
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-emerald-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><TrendingUp size={14}/></div>
                          <span className="whitespace-nowrap">Gross Assets</span>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-slate-900 dark:text-white text-base md:text-lg">{totalAssets.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-rose-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0"><TrendingDown size={14}/></div>
                          <span className="whitespace-nowrap">Total Liabilities</span>
                        </div>
                      </td>
                      <td className="py-4 md:py-6 px-2 font-bold text-right text-rose-500 text-base md:text-lg">-{totalDebts.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b last:border-0 border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 md:py-6 px-2">
                        <div className="font-black text-brand-500 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0"><Activity size={14}/></div>
                          <span className="whitespace-nowrap">Net Worth Balance</span>
                        </div>
                      </td>
                      <td className={`py-4 md:py-6 px-2 font-bold text-right text-lg md:text-xl ${netWorth >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>{netWorth.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-10 md:mt-12 space-y-4 md:space-y-5">
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full py-4 md:py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl md:rounded-[1.5rem] font-bold text-sm md:text-[15px] flex items-center justify-center gap-3 shadow-[0_8px_20px_rgb(var(--brand-500)/0.3)] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  <FileText size={18} className="md:w-5 md:h-5 group-hover:-translate-y-1 transition-transform duration-300" /> 
                  {isGeneratingPDF ? "Generating PDF..." : "Generate Premium Report"}
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
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-5 text-slate-900 dark:text-white tracking-tight">Financial Intelligence</h3>
          <div className="space-y-3 md:space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            <p>
              Your net worth is the single most important metric in your financial life. It represents the ultimate value of everything you've built. By taking your <strong className="text-slate-900 dark:text-white">Gross Assets</strong> and subtracting your <strong className="text-slate-900 dark:text-white">Total Liabilities</strong>, you generate a raw, unfiltered look at your true wealth.
            </p>
            <p>
              Nova's institutional-grade analytics are designed to help you turn a negative net worth into a positive one, and a positive one into a lasting legacy. Start tracking your portfolio today to take absolute control of your financial destiny in Tanzania.
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
          className="w-full bg-[#F8F9FB] dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-brand-500/50 focus:bg-white dark:focus:bg-[#0F0F15] py-3.5 md:py-4 pl-5 md:pl-6 pr-14 md:pr-16 rounded-2xl text-lg md:text-xl font-bold outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
          placeholder={placeholder}
        />
        <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black text-slate-300 dark:text-slate-500 tracking-widest uppercase pointer-events-none">
          TSH
        </div>
      </div>
    </div>
  );
}