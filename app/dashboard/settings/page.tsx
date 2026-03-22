"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, Globe, Wallet, Download, FileSpreadsheet, Loader2, CheckCircle2, 
  FileText, ArrowRight, CalendarDays, Moon, Sun, Trash2, X, AlertTriangle
} from "lucide-react"; // <-- UPGRADED: Added AlertTriangle for our custom errors!

export default function SettingsPage() {
  // Localization & Theme States
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("dark");
  const [saved, setSaved] = useState(false);

  // Export States
  const [exportingTx, setExportingTx] = useState(false);
  const [exportingAssets, setExportingAssets] = useState(false);
  const [exportingTxPdf, setExportingTxPdf] = useState(false);
  const [exportingAssetsPdf, setExportingAssetsPdf] = useState(false);

  const [exportPeriod, setExportPeriod] = useState<"all" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Custom Danger Modal States
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  // UPGRADED: Custom Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); // Auto dismiss after 3.5 seconds
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency") || "USD";
    const savedTheme = localStorage.getItem("app_theme") || "dark";
    
    setCurrency(savedCurrency);
    setTheme(savedTheme);
  }, []);

  // --- Theme Logic ---
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("app_theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // --- General Save (Currency) ---
  const handleSave = () => {
    localStorage.setItem("app_currency", currency);
    setSaved(true);
    window.dispatchEvent(new Event("transactionUpdated"));
    setTimeout(() => setSaved(false), 2000);
  };

  // --- Data Management Logic ---
  const handleClearData = () => {
    setShowWipeModal(true);
    setWipeSuccess(false); // Reset success state when opening
  };

  const executeClearData = async () => {
    setIsWiping(true);
    
    try {
      // Safely delete all records for the authenticated user
      await supabase.from("transactions").delete().not('id', 'is', null);
      await supabase.from("assets").delete().not('id', 'is', null);
      await supabase.from("subscriptions").delete().not('id', 'is', null);

      // Trigger global updates so other components reflect the empty state
      window.dispatchEvent(new Event("transactionUpdated"));
      
      setIsWiping(false);
      setWipeSuccess(true);

      // Auto-close the modal after showing the success message for 2.5 seconds
      setTimeout(() => {
        setShowWipeModal(false);
        setWipeSuccess(false);
      }, 2500);

    } catch (error) {
      console.error("Failed to wipe data:", error);
      setIsWiping(false);
      // UPGRADED: Custom Toast instead of alert()
      showToast("Something went wrong while deleting your data. Please try again.");
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    // UPGRADED: Custom Toast instead of alert()
    if (!data || data.length === 0) {
      showToast("No data available for this period.");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = data.map(row => {
      return headers.map(header => {
        let value = row[header];
        if (value === null || value === undefined) value = "";
        value = value.toString().replace(/"/g, '""'); 
        return `"${value}"`;
      }).join(",");
    });
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data: any[], title: string) => {
    // UPGRADED: Custom Toast instead of alert()
    if (!data || data.length === 0) {
      showToast("No data available for this period.");
      return;
    }
    
    const headers = Object.keys(data[0]);
    
    let dateRangeText = "All Time";
    if (exportPeriod === "custom" && (startDate || endDate)) {
      dateRangeText = `${startDate || 'Beginning'} to ${endDate || 'Today'}`;
    }

    const isDark = theme === "dark";
    const bgColor = isDark ? "#020617" : "#ffffff";
    const textColor = isDark ? "#f8fafc" : "#0f172a";
    const mutedText = isDark ? "#94a3b8" : "#64748b";
    const borderColor = isDark ? "#1e293b" : "#e2e8f0";
    const thBg = isDark ? "#0f172a" : "#f8fafc";
    const rowAltBg = isDark ? "#0a0f1c" : "#f8fafc";

    let html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background-color: ${bgColor}; color: ${textColor}; }
            .header { text-align: center; margin-bottom: 40px; }
            h1 { color: #6366f1; margin-bottom: 5px; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            .date { color: ${mutedText}; font-size: 14px; font-weight: bold; }
            .timestamp { color: ${mutedText}; font-size: 12px; margin-top: 4px; opacity: 0.8; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
            th, td { border-bottom: 1px solid ${borderColor}; padding: 12px 8px; text-align: left; }
            th { background-color: ${thBg}; color: ${textColor}; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid ${borderColor}; }
            tr:nth-child(even) { background-color: ${rowAltBg}; }
            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: ${mutedText}; border-top: 1px solid ${borderColor}; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title.replace(/_/g, " ")}</h1>
            <div class="date">Period: ${dateRangeText}</div>
            <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h.replace(/_/g, " ")}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${data.map(row => `<tr>${headers.map(h => `<td>${row[h] !== null ? row[h] : ""}</td>`).join("")}</tr>`).join("")}
            </tbody>
          </table>
          <div class="footer">Securely generated by Tracker. | Financial Data Export</div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      // UPGRADED: Custom Toast instead of alert()
      showToast("Please allow pop-ups for this site to generate PDFs.");
    }
  };

  const handleExportTx = async (type: 'csv' | 'pdf') => {
    type === 'csv' ? setExportingTx(true) : setExportingTxPdf(true);
    
    let query = supabase.from("transactions").select("*").order("date", { ascending: false });
    
    if (exportPeriod === "custom") {
      if (startDate) query = query.gte("date", startDate);
      if (endDate) query = query.lte("date", endDate);
    }

    const { data, error } = await query;
    if (!error && data) {
      if (type === 'csv') downloadCSV(data, "Tracker_Transactions");
      else downloadPDF(data, "Tracker_Transactions_Report");
    }
    
    type === 'csv' ? setExportingTx(false) : setExportingTxPdf(false);
  };

  const handleExportAssets = async (type: 'csv' | 'pdf') => {
    type === 'csv' ? setExportingAssets(true) : setExportingAssetsPdf(true);
    
    let query = supabase.from("assets").select("*").order("purchase_date", { ascending: false });
    
    if (exportPeriod === "custom") {
      if (startDate) query = query.gte("purchase_date", startDate);
      if (endDate) query = query.lte("purchase_date", endDate);
    }

    const { data, error } = await query;
    if (!error && data) {
      if (type === 'csv') downloadCSV(data, "Tracker_Assets_Depreciation");
      else downloadPDF(data, "Tracker_Assets_Depreciation_Report");
    }
    
    type === 'csv' ? setExportingAssets(false) : setExportingAssetsPdf(false);
  };

  return (
    <div className="p-8 md:p-10 max-w-4xl mx-auto space-y-8 pb-32 relative z-10">
      
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 transition-colors">Customize your tracker experience and manage data.</p>
      </header>

      {/* ========================================= */}
      {/* APP PREFERENCES */}
      {/* ========================================= */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl dark:shadow-black/50 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Globe size={20} className="text-indigo-500 dark:text-indigo-400" /> Preferences
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-3">App Theme</label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 rounded-xl transition-colors">
              <button 
                onClick={() => handleThemeChange("light")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  theme === "light" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Sun size={18} /> Light
              </button>
              <button 
                onClick={() => handleThemeChange("dark")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  theme === "dark" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Moon size={18} /> Dark
              </button>
            </div>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Wallet size={16} /> Base Currency
            </label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 rounded-xl transition-colors">
              <button 
                onClick={() => setCurrency("USD")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  currency === "USD" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                USD ($)
              </button>
              <button 
                onClick={() => setCurrency("TZS")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  currency === "TZS" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <span className="font-extrabold tracking-tighter">TSh</span> TZS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* TAX & DATA EXPORT */}
      {/* ========================================= */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl dark:shadow-black/50 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2 mb-4 transition-colors">
          <FileSpreadsheet size={20} className="text-indigo-500 dark:text-indigo-400 transition-colors" /> Tax & Data Export
        </h2>
          
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 transition-colors">
          Download your raw financial data instantly. Export as a CSV for Excel, or a beautifully formatted PDF report for your accountant.
        </p>

        {/* The Date Range Selector UI */}
        <div className="mb-6 p-4 rounded-xl bg-white/80 dark:bg-slate-950/50 border border-slate-200/50 dark:border-white/10 transition-colors shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Export Period</span>
          </div>
          
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 rounded-xl w-full sm:w-fit mb-4 transition-colors">
            <button
              onClick={() => setExportPeriod("all")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${exportPeriod === 'all' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setExportPeriod("custom")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${exportPeriod === 'custom' ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              Custom Range
            </button>
          </div>

          {exportPeriod === "custom" && (
            <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1 ml-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="hidden sm:block mt-5 text-slate-300 dark:text-slate-600"><ArrowRight size={16} /></div>
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1 ml-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transactions Export Card */}
          <div className="p-5 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex flex-col justify-between gap-5 transition-colors shadow-sm hover:border-indigo-500/30 dark:hover:border-indigo-500/30">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 transition-colors">Transactions Data</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Income, expenses, and savings.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button 
                onClick={() => handleExportTx('csv')}
                disabled={exportingTx || exportingTxPdf}
                className="flex items-center justify-center gap-2 bg-slate-100/80 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-70"
              >
                {exportingTx ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} CSV
              </button>
              <button 
                onClick={() => handleExportTx('pdf')}
                disabled={exportingTx || exportingTxPdf}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-[0_4px_14px_rgba(249,115,22,0.3)] transition-all active:scale-95 disabled:opacity-70"
              >
                {exportingTxPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} PDF
              </button>
            </div>
          </div>

          {/* Assets Export Card */}
          <div className="p-5 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex flex-col justify-between gap-5 transition-colors shadow-sm hover:border-indigo-500/30 dark:hover:border-indigo-500/30">
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 transition-colors">Asset Depreciation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">TRA rates and current NBV.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button 
                onClick={() => handleExportAssets('csv')}
                disabled={exportingAssets || exportingAssetsPdf}
                className="flex items-center justify-center gap-2 bg-slate-100/80 hover:bg-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-70"
              >
                {exportingAssets ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} CSV
              </button>
              <button 
                onClick={() => handleExportAssets('pdf')}
                disabled={exportingAssets || exportingAssetsPdf}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-[0_4px_14px_rgba(249,115,22,0.3)] transition-all active:scale-95 disabled:opacity-70"
              >
                {exportingAssetsPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} PDF
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-200/50 dark:border-indigo-500/20">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <p>Your exports are generated purely locally in your browser for maximum privacy. No data is sent to external report servers.</p>
        </div>
      </div>

      {/* ========================================= */}
      {/* DANGER ZONE */}
      {/* ========================================= */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-rose-500/20 dark:border-rose-500/10 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl dark:shadow-black/50 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 mb-1">Danger Zone</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Permanently wipe all financial data, goals, and assets. This cannot be undone.</p>
          </div>
          <button 
            onClick={handleClearData}
            className="w-full md:w-auto flex justify-center items-center gap-2 py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Trash2 size={18} /> Clear All Data
          </button>
        </div>
      </div>

      {/* Save Button for General Settings */}
      <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex justify-end transition-colors relative z-10">
        <button 
          onClick={handleSave}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-slate-900/20 dark:shadow-white/20 w-full sm:w-auto active:scale-95"
        >
          <Save size={18} /> {saved ? "Saved Successfully!" : "Save Settings"}
        </button>
      </div>

      {/* ============================================== */}
      {/* CUSTOM DANGER MODAL */}
      {/* ============================================== */}
      {showWipeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isWiping && setShowWipeModal(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            {!isWiping && !wipeSuccess && (
              <button 
                onClick={() => setShowWipeModal(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            )}
            
            {wipeSuccess ? (
              <div className="p-6 text-center pt-8 pb-10 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Clean Slate!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your financial data has been completely wiped.
                </p>
              </div>
            ) : (
              <div className="p-6 text-center pt-8">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30">
                  <Trash2 size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Wipe All Data?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                  Are you <span className="font-bold text-slate-700 dark:text-slate-300">ABSOLUTELY sure?</span> This will permanently delete all your financial data, goals, and assets. This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowWipeModal(false)} 
                    disabled={isWiping}
                    className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-white/80 border border-slate-200 hover:bg-white dark:text-slate-300 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95 shadow-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeClearData} 
                    disabled={isWiping}
                    className="flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isWiping ? <Loader2 size={18} className="animate-spin" /> : "Yes, Wipe Data"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* UPGRADED: CUSTOM TOAST NOTIFICATION */}
      {/* ============================================== */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] backdrop-blur-xl border ${
            toast.type === 'error' 
              ? 'bg-rose-500/90 dark:bg-rose-500/80 border-rose-400 dark:border-rose-400/50 text-white' 
              : 'bg-emerald-500/90 dark:bg-emerald-500/80 border-emerald-400 dark:border-emerald-400/50 text-white'
          }`}>
            {toast.type === 'error' ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}