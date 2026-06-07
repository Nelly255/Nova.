"use client";

import { useState, useEffect, useRef } from "react";
import { Info, ChevronDown, FileText, CheckCircle2 } from "lucide-react";

// TRA CLASSES (Accurate for 2025/2026)
const TRA_CLASSES = [
  { id: 1, name: "Class 1: Computers & Data Equipment", rate: 0.375, description: "Computers, tablets, and network data handling equipment." },
  { id: 2, name: "Class 2: Light Vehicles", rate: 0.25, description: "Small self-propelled vehicles and light earth-moving equipment." },
  { id: 3, name: "Class 3: Electronics & Office Furniture", rate: 0.125, description: "General electronics, telecommunications, and office furniture." },
  { id: 4, name: "Class 4: Heavy Vehicles & Machinery", rate: 0.25, description: "Buses, tractors, lorries, and heavy machinery." },
  { id: 5, name: "Class 5: Buildings & Structures", rate: 0.05, description: "Permanent buildings and structures (Non-industrial)." },
  { id: 6, name: "Class 6: Hotels & Industrial Infrastructure", rate: 0.05, description: "Specialized industrial buildings and registered hotels." },
  { id: 7, name: "Class 7: Intangible Assets", rate: 0.05, description: "Copyrights, patents, and other amortized intangibles." },
  { id: 8, name: "Class 8: Other Assets", rate: 0.125, description: "Plant and machinery not elsewhere classified." },
];

export default function DepreciationCalculator() {
  const [assetValue, setAssetValue] = useState<number>(0);
  const [selectedClass, setSelectedClass] = useState(TRA_CLASSES[0]);
  const [years, setYears] = useState<number>(5);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculation Logic
  const calculateSchedule = () => {
    let currentNBV = assetValue;
    const schedule = [];
    for (let i = 1; i <= years; i++) {
      const depAmount = currentNBV * selectedClass.rate;
      const closingNBV = currentNBV - depAmount;
      schedule.push({
        year: i,
        opening: currentNBV,
        depreciation: depAmount,
        closing: closingNBV
      });
      currentNBV = closingNBV;
    }
    return schedule;
  };

  const schedule = calculateSchedule();
  const totalDepreciation = assetValue - (schedule[schedule.length - 1]?.closing || 0);

  // Dynamic Script Injector to completely bypass Next.js Server Errors
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
      
      // Inject the libraries directly into the browser DOM
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js");

      // @ts-ignore
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ format: 'a4' });

      // PREMIUM STYLING VARIABLES
      const slate900 = [15, 15, 21];
      const slate500 = [100, 116, 139];
      const rose600 = [225, 29, 72];
      
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
      doc.text("Asset Depreciation & Capital Allowance Report", 14, 33);

      // Top Divider
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.5);
      doc.line(14, 42, 196, 42);

      // 2. High-End Metadata Grid
      // Row 1 Labels
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate500);
      doc.text("DATE GENERATED", 14, 52);
      doc.text("ASSET CATEGORY", 70, 52);
      doc.text("FORECAST PERIOD", 150, 52);

      // Row 1 Values
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...slate900);
      doc.text(new Date().toLocaleDateString(), 14, 57);
      
      // Truncate category name if it's too long to prevent overlapping
      const catName = selectedClass.name.length > 40 ? selectedClass.name.substring(0, 40) + '...' : selectedClass.name;
      doc.text(catName, 70, 57);
      doc.text(`${years} Years`, 150, 57);

      // Row 2 Labels
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate500);
      doc.text("ACQUISITION VALUE", 14, 67);
      doc.text("APPLIED RATE", 70, 67);
      doc.text("TOTAL ACCRUED DEPRECIATION", 150, 67);

      // Row 2 Values
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...slate900);
      doc.text(`${assetValue.toLocaleString()} TSH`, 14, 73);
      doc.setTextColor(...brandAccent);
      doc.text(`${(selectedClass.rate * 100).toFixed(1)}%`, 70, 73);
      doc.setTextColor(...slate900);
      doc.text(`${totalDepreciation.toLocaleString()} TSH`, 150, 73);

      // Bottom Divider
      doc.setDrawColor(240, 240, 240);
      doc.line(14, 82, 196, 82);

      // 3. Format Table Data
      const tableData = schedule.map(row => [
        `Year ${row.year}`,
        Math.round(row.opening).toLocaleString(),
        `-${Math.round(row.depreciation).toLocaleString()}`,
        Math.round(row.closing).toLocaleString()
      ]);

      // 4. Draw Premium Minimalist Table
      // @ts-ignore
      doc.autoTable({
        startY: 92,
        head: [['YEAR', 'OPENING (NBV)', 'DEPRECIATION', 'CLOSING (NBV)']],
        body: tableData,
        theme: 'plain', 
        headStyles: { 
          fillColor: [250, 250, 252], 
          textColor: slate500, 
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 6,
          lineWidth: { bottom: 0.5 },
          lineColor: [230, 230, 230]
        },
        bodyStyles: { 
          fontSize: 9, 
          textColor: slate900,
          cellPadding: 6,
          lineWidth: { bottom: 0.1 },
          lineColor: [240, 240, 240]
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: brandAccent },
          2: { textColor: rose600 }, 
          3: { halign: 'right', fontStyle: 'bold' }
        },
        foot: [['', '', '', 'End of Schedule']],
        footStyles: { 
          fillColor: [255, 255, 255], 
          textColor: slate500, 
          halign: 'right',
          fontSize: 8,
          fontStyle: 'italic',
          cellPadding: 8
        }
      });

      // 5. Trigger File Download
      doc.save(`Nova_Depreciation_${new Date().getFullYear()}.pdf`);
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
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgb(var(--brand-500))]"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">NOVA TOOLS</span>
            </div>
            
            <h1 className="flex flex-col">
              <span style={{ fontFamily: "'Dancing Script', cursive" }} className="text-[4rem] sm:text-5xl md:text-[5.5rem] font-bold text-slate-800 dark:text-slate-200 leading-[0.8] mb-2 md:mb-4 pl-1">
                Asset
              </span>
              <span className="text-[3.5rem] sm:text-5xl md:text-[6rem] font-[900] tracking-[-0.04em] text-brand-500 leading-[0.85] mt-1 md:mt-0">
                Depreciation.
              </span>
            </h1>
          </div>
          
          <div className="lg:pl-10 lg:border-l-2 border-slate-200 dark:border-white/10">
            <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-500 dark:text-slate-400 leading-tight mb-4">
              Detailed Capital Allowance <br />
              & <span className="text-slate-900 dark:text-white font-bold">Fiscal Asset Valuation.</span>
            </p>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 leading-relaxed max-w-sm">
              Automated reporting compliant with the Tanzania Revenue Authority (TRA) Reducing Balance Standards.
            </p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 mb-12">
          
          {/* LEFT COL: INPUT SECTION */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#0F0F15]/80 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              
              <div className="space-y-6 md:space-y-8">
                {/* Cost Input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Initial Cost</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={assetValue === 0 ? "" : assetValue.toLocaleString()}
                      onChange={(e) => setAssetValue(Number(e.target.value.replace(/[^0-9]/g, '')) || 0)}
                      className="w-full bg-[#F8F9FB] dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-brand-500/50 focus:bg-white dark:focus:bg-[#0F0F15] py-3.5 md:py-4 pl-5 md:pl-6 pr-14 md:pr-16 rounded-2xl text-lg md:text-xl font-bold outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="0"
                    />
                    <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-[10px] md:text-xs font-black text-slate-300 dark:text-slate-500 tracking-widest uppercase">
                      TSH
                    </div>
                  </div>
                </div>

                {/* Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">TRA Asset Class</label>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-[#F8F9FB] dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 py-3.5 md:py-4 px-5 md:px-6 rounded-2xl font-bold flex items-center justify-between transition-all text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base"
                  >
                    <span className="truncate pr-4 text-left">{selectedClass.name}</span>
                    <ChevronDown size={18} className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#15151E] border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden backdrop-blur-xl">
                      <ul className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        {TRA_CLASSES.map(c => (
                          <li 
                            key={c.id} 
                            onClick={() => { setSelectedClass(c); setIsDropdownOpen(false); }}
                            className={`px-4 py-3 rounded-xl cursor-pointer text-sm font-bold transition-all flex flex-col gap-1
                              ${selectedClass.id === c.id 
                                ? "bg-brand-50 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300" 
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"}`}
                          >
                            <span>{c.name}</span>
                            <span className="text-[10px] font-medium opacity-70 tracking-wide line-clamp-1">{c.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex items-start gap-3 p-3 md:p-4 bg-[#F8F9FB] dark:bg-white/5 rounded-2xl">
                    <Info size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      {selectedClass.description}
                    </p>
                  </div>
                </div>

                {/* Range Slider */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex justify-between">
                    <span>Projection Period</span>
                    <span className="text-brand-500 dark:text-brand-400">{years} Years</span>
                  </label>
                  <input 
                    type="range" min="1" max="15" value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-brand-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COL: SUMMARY & TABLE SECTION */}
          <div className="lg:col-span-7 space-y-6 overflow-hidden">
            
            <div className="bg-white dark:bg-[#0F0F15]/90 p-6 sm:p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-brand-500/10 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full relative">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Rate Applied</span>
                  <div className="text-3xl md:text-4xl font-black text-brand-500">{(selectedClass.rate * 100).toFixed(1)}%</div>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 block text-slate-400">Total Accrued</span>
                  <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                    {totalDepreciation.toLocaleString()} <span className="text-sm md:text-lg font-bold text-slate-300 dark:text-slate-600">TSH</span>
                  </div>
                </div>
              </div>

              {/* FIX: Wrapper allows horizontal scrolling ONLY inside the card on mobile */}
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 -mx-2 px-2 sm:mx-0 sm:px-0">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.15em] border-b border-slate-100 dark:border-white/5 text-slate-400">
                      <th className="pb-4 px-2">Year</th>
                      <th className="pb-4 px-2">Opening (NBV)</th>
                      <th className="pb-4 px-2">Depreciation</th>
                      <th className="pb-4 px-2 text-right">Closing (NBV)</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {schedule.map((row) => (
                      <tr key={row.year} className="border-b last:border-0 border-slate-50 dark:border-white/5 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
                        <td className="py-4 px-2 font-black text-brand-500 whitespace-nowrap">Year {row.year}</td>
                        <td className="py-4 px-2 font-bold text-slate-600 dark:text-slate-300">{Math.round(row.opening).toLocaleString()}</td>
                        <td className="py-4 px-2 font-bold text-rose-500/90 bg-rose-50/30 dark:bg-transparent rounded-lg">-{Math.round(row.depreciation).toLocaleString()}</td>
                        <td className="py-4 px-2 font-black text-right text-slate-900 dark:text-white">{Math.round(row.closing).toLocaleString()}</td>
                      </tr>
                    ))}
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
                  <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" /> <span className="truncate">Compliant with Arusha TRA Standards</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SEO / INFO SECTION */}
        <section className="max-w-4xl mx-auto bg-white/40 dark:bg-[#0F0F15]/50 p-6 sm:p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 backdrop-blur-xl mt-4">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-5 text-slate-900 dark:text-white tracking-tight">About TRA Depreciation Rates</h3>
          <div className="space-y-3 md:space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            <p>
              In Tanzania, the Income Tax Act prescribes the <strong className="text-slate-900 dark:text-white">Reducing Balance Method</strong> for most asset classes. This means depreciation is calculated on the Net Book Value (NBV) at the end of the previous year, rather than the original cost.
            </p>
            <p>
              Using official rates ensures your financial projections align with the <strong className="text-slate-900 dark:text-white">Tanzania Revenue Authority (TRA)</strong> standards for capital allowance claims. This tool helps business owners in Arusha and across Tanzania plan their tax obligations more accurately.
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