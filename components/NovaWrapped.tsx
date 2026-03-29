"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Sparkles, TrendingUp, Wallet, ArrowDownToLine, Receipt } from "lucide-react";

interface NovaWrappedProps {
  month: string;
  netWorth: string;
  monthlyIncome: string;
  monthlyExpense: string;
  topCategory: string;
  transactionCount: number;
}

export default function NovaWrapped({ month, netWorth, monthlyIncome, monthlyExpense, topCategory, transactionCount }: NovaWrappedProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 🚀 PRODUCTION LOGIC: Show only between the 28th and 2nd of the month
  useEffect(() => {
    const today = new Date().getDate();
    if (today >= 30 || today <= 2) { 
      setIsVisible(true);
    }
  }, []);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      // High-res capture
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#0A0A0E",
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Nova-Wrapped-${month.replace(" ", "-")}.pdf`);
      
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 📱 VISIBLE UI: The Trigger Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden group mb-6 md:mb-8 border border-white/10">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={16} className="text-indigo-200 animate-pulse" />
              {/* 🚀 PATCHED: Fixed the "M" typo */}
              <p className="text-[10px] font-extrabold tracking-widest text-indigo-100 uppercase">MONTHLY REVIEW</p>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">Nova Wrapped</h3>
            <p className="text-indigo-100 text-sm mt-1 font-medium">Your <span className="text-white font-bold">{month}</span> financial intelligence report is ready.</p>
          </div>

          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-white text-indigo-900 px-6 py-3 rounded-2xl font-extrabold shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 w-full sm:w-auto justify-center"
          >
            {isGenerating ? (
              <span className="animate-pulse flex items-center gap-2">Generating PDF...</span>
            ) : (
              <>
                <Download size={18} /> Download Statement
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🥷 HIDDEN UI: The Premium PDF Template */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={reportRef} 
          className="w-[800px] h-[1130px] relative overflow-hidden"
          style={{ backgroundColor: "#0A0A0E", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#ffffff", padding: "64px" }}
        >
          {/* Subtle Grid Background & Glows */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
          <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full" style={{ backgroundColor: "rgba(79, 70, 229, 0.25)", filter: "blur(120px)" }}></div>
          <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full" style={{ backgroundColor: "rgba(147, 51, 234, 0.25)", filter: "blur(120px)" }}></div>

          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className="flex justify-between items-end pb-10 mb-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <h1 className="text-7xl font-extrabold tracking-tighter" style={{ color: "#ffffff" }}>
                  Nova.
                </h1>
                <p className="text-2xl font-bold mt-3 tracking-wide" style={{ color: "#818cf8" }}>Financial Intelligence Report</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: "#64748b" }}>Statement Period</p>
                <p className="text-3xl font-extrabold" style={{ color: "#f8fafc" }}>{month}</p>
              </div>
            </div>

            {/* Row 1: The Massive Net Worth Block */}
            <div className="mb-8 p-10 rounded-[2rem]" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>
              <p className="text-xl font-bold mb-3 flex items-center gap-3 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                <TrendingUp size={24} color="#34d399" /> True Net Worth
              </p>
              <p className="text-7xl font-extrabold tracking-tighter" style={{ color: "#ffffff" }}>{netWorth}</p>
            </div>

            {/* Row 2: Income vs Expense */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="p-10 rounded-[2rem]" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-lg font-bold mb-3 flex items-center gap-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                  <ArrowDownToLine color="#34d399" /> Monthly Cash In
                </p>
                <p className="text-5xl font-extrabold tracking-tight" style={{ color: "#34d399" }}>{monthlyIncome}</p>
              </div>
              <div className="p-10 rounded-[2rem]" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-lg font-bold mb-3 flex items-center gap-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                  <Receipt color="#fb7185" /> Monthly Cash Out
                </p>
                <p className="text-5xl font-extrabold tracking-tight" style={{ color: "#fb7185" }}>{monthlyExpense}</p>
              </div>
            </div>

            {/* Row 3: Insights */}
            <div className="grid grid-cols-2 gap-8 mb-auto">
              <div className="p-10 rounded-[2rem]" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Highest Spending Category</p>
                {/* 🚀 PATCHED: Changed 'truncate' to 'break-words' to prevent cut off */}
                <p className="text-4xl font-extrabold tracking-tight break-words" style={{ color: "#f8fafc" }}>{topCategory}</p>
              </div>
              <div className="p-10 rounded-[2rem]" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Total Transactions Processed</p>
                <p className="text-4xl font-extrabold tracking-tight" style={{ color: "#f8fafc" }}>{transactionCount} Logged</p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-sm font-medium" style={{ color: "#64748b" }}>Generated securely by your Nova Financial Vault.</p>
              <p className="text-sm font-bold tracking-widest uppercase" style={{ color: "#4f46e5" }}>STRICTLY CONFIDENTIAL</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}