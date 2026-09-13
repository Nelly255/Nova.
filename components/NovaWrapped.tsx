"use client";

import { useRef, useState, useEffect } from "react";
import { Download, Sparkles, TrendingUp, ArrowDownToLine, Receipt, ShieldCheck, Fingerprint } from "lucide-react";

interface NovaWrappedProps {
  month: string;
  netWorth: string;
  monthlyIncome: string;
  monthlyExpense: string;
  topCategory: string;
  transactionCount: number;
  userName?: string;
}

export default function NovaWrapped({ 
  month, 
  netWorth, 
  monthlyIncome, 
  monthlyExpense, 
  topCategory, 
  transactionCount,
  userName = "Nelson Jackson" 
}: NovaWrappedProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [docId, setDocId] = useState("");

  useEffect(() => {
    const today = new Date().getDate();
    if (today >= 29 && today <= 31) { 
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
    
    setDocId(`STMT-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${new Date().getFullYear()}`);
  }, []);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(reportRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#FFFFFF",
        logging: false
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Financial-Statement-${month.replace(" ", "-")}.pdf`);
      
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* 📱 VISIBLE UI: The Trigger Card (Updated to Light/Serious Theme) */}
      <div className="bg-white rounded-3xl p-6 text-slate-900 shadow-xl shadow-slate-200/50 relative overflow-hidden group mb-6 md:mb-8 border border-slate-200">
        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck size={16} className="text-slate-400" />
              <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">MONTHLY STATEMENT</p>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Financial Summary</h3>
            <p className="text-slate-500 text-sm mt-1 font-medium">Your account statement for <span className="text-slate-900 font-bold">{month}</span> is ready to view and download.</p>
          </div>

          <button 
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 w-full sm:w-auto justify-center"
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

      {/* 🥷 HIDDEN UI: The Premium PDF Template (Updated to Light/Serious Theme) */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={reportRef} 
          className="w-[800px] h-[1130px] relative overflow-hidden"
          style={{ 
            backgroundColor: "#FFFFFF", 
            fontFamily: "'Plus Jakarta Sans', sans-serif", 
            color: "#0F172A", 
            padding: "56px 64px",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Very subtle background texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000000 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
          
          {/* Subtle light blurs for depth without being overly flashy */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full" style={{ backgroundColor: "rgba(241, 245, 249, 0.8)", filter: "blur(100px)" }}></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full" style={{ backgroundColor: "rgba(248, 250, 252, 0.8)", filter: "blur(100px)" }}></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-10 pb-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={0} color="#0F172A" strokeWidth={1} />
                <span style={{ color: "#475569", fontSize: "15px", fontWeight: "700", letterSpacing: "2px" }}></span>
              </div>
              <div className="text-right" style={{ color: "#64748b", fontSize: "11px", fontWeight: "600", letterSpacing: "1px", fontFamily: "monospace" }}>
                DOC ID: {docId} <br/>
                GENERATED: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div className="flex justify-between items-end mb-12">
              <div>
                <h1 style={{ fontSize: "45px", fontWeight: "800", letterSpacing: "-2px", margin: "0 0 12px 0", color: "#0F172A", lineHeight: "1.2" }}>
                  Monthly Summary
                </h1>
                <p style={{ fontSize: "20px", fontWeight: "600", color: "#64748b", margin: 0 }}>
                  Period closing {month}
                </p>
              </div>
              <div className="text-right p-5 rounded-2xl" style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "2px", color: "#64748b", margin: "0 0 4px 0" }}>Prepared For</p>
                <p style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", margin: 0 }}>{userName}</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 mb-auto">
              
              <div className="p-10 rounded-[24px] relative overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)" }}>
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20" style={{ backgroundColor: "rgba(241, 245, 249, 1)" }}></div>
                <p className="flex items-center gap-3 relative z-10" style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", margin: "0 0 12px 0" }}>
                  <TrendingUp size={20} color="#0F172A" /> Total Net Worth
                </p>
                <p className="relative z-10" style={{ fontSize: "72px", fontWeight: "800", letterSpacing: "-3px", color: "#0F172A", margin: 0, lineHeight: "1" }}>
                  {netWorth}
                </p>
              </div>

              <div className="flex gap-6">
                <div className="flex-1 p-8 rounded-[24px]" style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <p className="flex items-center gap-2" style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", margin: "0 0 12px 0" }}>
                    <ArrowDownToLine size={16} color="#16A34A" /> Total Inflows
                  </p>
                  <p style={{ fontSize: "40px", fontWeight: "800", letterSpacing: "-1px", color: "#16A34A", margin: 0 }}>
                    {monthlyIncome}
                  </p>
                </div>
                <div className="flex-1 p-8 rounded-[24px]" style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <p className="flex items-center gap-2" style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", margin: "0 0 12px 0" }}>
                    <Receipt size={16} color="#E11D48" /> Total Outflows
                  </p>
                  <p style={{ fontSize: "40px", fontWeight: "800", letterSpacing: "-1px", color: "#E11D48", margin: 0 }}>
                    {monthlyExpense}
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-1 p-8 rounded-[24px]" style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", margin: "0 0 8px 0" }}>
                    Top Spending Category
                  </p>
                  <p style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-1px", color: "#0F172A", margin: 0, wordWrap: "break-word" }}>
                    {topCategory}
                  </p>
                </div>
                <div className="flex-1 p-8 rounded-[24px]" style={{ backgroundColor: "#F8FAFC", border: "1px solid rgba(0,0,0,0.05)" }}>
                  <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", color: "#64748b", margin: "0 0 8px 0" }}>
                    Total Transactions
                  </p>
                  <p style={{ fontSize: "32px", fontWeight: "800", letterSpacing: "-1px", color: "#0F172A", margin: 0 }}>
                    {transactionCount} <span style={{ fontSize: "20px", color: "#64748b" }}>entries</span>
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-8 flex justify-between items-end mt-12" style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              <div className="flex items-center gap-4">
                <Fingerprint size={40} color="#94A3B8" strokeWidth={1} />
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", margin: "0 0 2px 0" }}>Account Summary</p>
                  <p style={{ fontSize: "11px", fontWeight: "500", color: "#64748b", margin: 0 }}>This document is a summary of your account activity for the specified period.</p>
                </div>
              </div>
              <div className="text-right">
                <p style={{ fontSize: "10px", fontWeight: "800", letterSpacing: "3px", color: "#94A3B8", margin: 0 }}></p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}