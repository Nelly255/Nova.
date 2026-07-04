"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Save, Globe, Wallet, Download, FileSpreadsheet, Loader2, CheckCircle2, 
  FileText, ArrowRight, CalendarDays, Moon, Sun, Laptop, Palette, Trash2, X, AlertTriangle, Check
} from "lucide-react"; 

// 🚀 PREMIUM COLOR PALETTES
const COLOR_THEMES = [
  { 
    name: "Indigo (Default)", 
    id: "indigo", 
    hex: "#4F46E5",
    vars: { "50": "238 242 255", "100": "224 231 255", "400": "129 140 248", "500": "99 102 241", "600": "79 70 229", "700": "67 56 202" }
  },
  { 
    name: "Emerald", 
    id: "emerald", 
    hex: "#059669",
    vars: { "50": "236 253 245", "100": "209 250 229", "400": "52 211 153", "500": "16 185 129", "600": "5 150 105", "700": "4 120 87" }
  },
  { 
    name: "Rose", 
    id: "rose", 
    hex: "#E11D48",
    vars: { "50": "255 241 242", "100": "255 228 230", "400": "251 113 133", "500": "244 63 94", "600": "225 29 72", "700": "190 18 60" }
  },
  { 
    name: "Amber", 
    id: "amber", 
    hex: "#D97706",
    vars: { "50": "255 251 235", "100": "254 243 199", "400": "251 191 36", "500": "245 158 11", "600": "217 119 6", "700": "180 83 9" }
  }
];

export default function SettingsPage() {
  const [currency, setCurrency] = useState("TZS");
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>("system");
  const [activeColor, setActiveColor] = useState("indigo");
  const [saved, setSaved] = useState(false);

  // Export States
  const [exportingTx, setExportingTx] = useState(false);
  const [exportingAssets, setExportingAssets] = useState(false);
  const [exportingTxPdf, setExportingTxPdf] = useState(false);
  const [exportingAssetsPdf, setExportingAssetsPdf] = useState(false);

  const [exportPeriod, setExportPeriod] = useState<"all" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showWipeModal, setShowWipeModal] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [wipeSuccess, setWipeSuccess] = useState(false);

  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500); 
  };

  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency") || "TZS";
    
    // 🚀 PATCHED: FORCE 'SYSTEM' AS THE ABSOLUTE DEFAULT IF NOTHING IS SET
    let savedTheme = localStorage.getItem("app_theme") as 'light' | 'dark' | 'system';
    if (!savedTheme) {
      savedTheme = "system";
      localStorage.setItem("app_theme", "system"); // Locks it in for the whole app
    }
    
    const savedColor = localStorage.getItem("nova_color") || "indigo";
    
    setCurrency(savedCurrency);
    setTheme(savedTheme);
    setActiveColor(savedColor);
    
    // Ensure CSS variables are loaded if navigating directly to settings
    applyColorTheme(savedColor, false);
  }, []);

  // 🚀 HANDLERS
  const handleThemeChange = (newMode: 'light' | 'dark' | 'system') => {
    setTheme(newMode);
    localStorage.setItem("app_theme", newMode);
    
    // Immediately apply for instant feedback
    if (newMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newMode === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (newMode === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const applyColorTheme = (colorId: string, saveToStorage: boolean = true) => {
    setActiveColor(colorId);
    if (saveToStorage) localStorage.setItem('nova_color', colorId);
    
    const themeObj = COLOR_THEMES.find(t => t.id === colorId) || COLOR_THEMES[0];
    Object.entries(themeObj.vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--brand-${key}`, value);
    });
  };

  const handleSave = () => {
    localStorage.setItem("app_currency", currency);
    setSaved(true);
    window.dispatchEvent(new Event("transactionUpdated"));
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    setShowWipeModal(true);
    setWipeSuccess(false); 
  };

  const executeClearData = async () => {
    setIsWiping(true);
    try {
      await Promise.all([
        supabase.from("transactions").delete().not('id', 'is', null),
        supabase.from("assets").delete().not('id', 'is', null),
        supabase.from("subscriptions").delete().not('id', 'is', null),
        supabase.from("budgets").delete().not('id', 'is', null),
        supabase.from("savings_goals").delete().not('id', 'is', null),
        supabase.from("debts").delete().not('id', 'is', null)
      ]);

      await supabase.from("accounts").delete().not('id', 'is', null);

      window.dispatchEvent(new Event("transactionUpdated"));
      window.dispatchEvent(new Event("assetUpdated"));
      window.dispatchEvent(new Event("subscriptionUpdated"));
      window.dispatchEvent(new Event("budgetUpdated"));
      window.dispatchEvent(new Event("goalUpdated"));
      
      setIsWiping(false);
      setWipeSuccess(true);

      setTimeout(() => {
        setShowWipeModal(false);
        setWipeSuccess(false);
      }, 2500);

    } catch (error) {
      console.error("Failed to wipe data:", error);
      setIsWiping(false);
      showToast("Something went wrong while deleting your data. Please try again.");
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
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

  const downloadPDF = async (data: any[], title: string, options?: any) => {
    if (!data || data.length === 0) {
      showToast("No data available for this period.");
      return;
    }
    
    let userName = "Nova User";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Nova User";
      } else {
         const savedName = localStorage.getItem("user_name");
         if(savedName) userName = savedName;
      }
    } catch (error) {
      console.error("Failed to fetch user name for PDF", error);
    }

    const headers = Object.keys(data[0]);
    
    let dateRangeText = "All Time";
    if (exportPeriod === "custom" && (startDate || endDate)) {
      dateRangeText = `${startDate || 'Beginning'} to ${endDate || 'Today'}`;
    }

    const sym = currency === "TZS" ? "TSh " : "$";
    
    const formatCurrency = (val: number, isIncome = false) => {
        const sign = val < 0 ? '-' : (isIncome && val > 0 ? '+' : '');
        return `${sign}${sym}${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    let summaryHtml = '';
    if (options?.isTransactions) {
      const { openingBalance = 0, totalIncome = 0, totalExpense = 0, closingBalance = 0 } = options;
      
      summaryHtml = `
        <div class="summary-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 40px;">
          <div class="summary-card">
            <span class="summary-label">Opening Balance</span>
            <span class="summary-value" style="color: #475569;">${formatCurrency(openingBalance)}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Total Income</span>
            <span class="summary-value text-emerald">${formatCurrency(totalIncome, true)}</span>
          </div>
          <div class="summary-card">
            <span class="summary-label">Total Expenses</span>
            <span class="summary-value text-rose">-${sym}${Math.abs(totalExpense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-card" style="background: #EEF2FF; border-color: #C7D2FE;">
            <span class="summary-label" style="color: #4F46E5;">Closing Balance</span>
            <span class="summary-value" style="color: #312E81;">${formatCurrency(closingBalance)}</span>
          </div>
        </div>
      `;
    }

    let html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title.replace(/_/g, " ")} - Nova</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            @page { margin: 15mm; size: A4; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            
            body { 
              font-family: 'Inter', sans-serif; 
              color: #0F172A; 
              background-color: #FFFFFF; 
              padding: 20px; 
              margin: 0; 
              line-height: 1.5; 
            }
            
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: flex-end; 
              border-bottom: 2px solid #E2E8F0; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .brand-container { text-align: right; }
            .brand { font-size: 32px; font-weight: 800; color: #4F46E5; letter-spacing: -1px; margin: 0; line-height: 1; }
            .report-title { font-size: 14px; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px; }
            .report-date { font-size: 12px; color: #94A3B8; font-weight: 500; }
            .user-name { font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 2px; }
            
            .summary-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; }
            .summary-label { font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; display: block; }
            .summary-value { font-size: 18px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px; }
            .text-emerald { color: #10B981; }
            .text-rose { color: #E11D48; }

            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 40px; }
            th { 
              text-align: left; 
              padding: 12px 16px; 
              border-bottom: 2px solid #CBD5E1; 
              color: #475569; 
              font-weight: 700; 
              text-transform: uppercase; 
              letter-spacing: 0.5px; 
              font-size: 10px; 
            }
            td { 
              padding: 14px 16px; 
              border-bottom: 1px solid #F1F5F9; 
              color: #334155; 
              font-weight: 500;
            }
            tr:nth-child(even) td { background-color: #F8FAFC; }
            
            .align-right { text-align: right; }
            .amount-cell { font-variant-numeric: tabular-nums; font-weight: 600; }
            .contra-label { background: #E2E8F0; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; margin-left: 6px; }
            
            .footer { 
              text-align: center; 
              font-size: 10px; 
              color: #94A3B8; 
              margin-top: 50px; 
              border-top: 1px solid #E2E8F0; 
              padding-top: 20px; 
              font-weight: 500;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="report-title">${title.replace(/_/g, " ")}</div>
              <div class="user-name">${userName}</div>
              <div class="report-date">Period: ${dateRangeText}</div>
            </div>
            <div class="brand-container">
              <h1 class="brand">Nova.</h1>
              <div class="report-date" style="margin-top: 6px;">Generated ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          ${summaryHtml}

          <table>
            <thead>
              <tr>
                ${headers.map(h => {
                  const isNumber = h.includes('amount') || h.includes('price') || h.includes('value') || h.includes('depreciation') || h === 'running_balance';
                  return `<th class="${isNumber ? 'align-right' : ''}">${h.replace(/_/g, " ")}</th>`;
                }).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.map((row, index) => {
                const isOB = index === 0 && options?.isTransactions;
                const isContra = (row.category || '').toLowerCase() === 'contra' || (row.type || '').toLowerCase() === 'transfer';
                
                return `
                <tr>
                  ${headers.map(h => {
                    let val = row[h];
                    if (val === null || val === undefined) val = "-";
                    
                    if (isOB) {
                      // Custom row rendering specifically for Opening Balance 
                      if (h === 'title') return `<td><strong>${val}</strong></td>`;
                      if (h === 'running_balance') return `<td class="align-right amount-cell" style="font-weight: 800; color: #0F172A;">${formatCurrency(val)}</td>`;
                      if (h === 'amount') return `<td class="align-right amount-cell" style="color: #94A3B8;">-</td>`;
                      if (h === 'date') return `<td style="color: #94A3B8; font-size: 10px;">${val}</td>`;
                      return `<td><span style="color:#CBD5E1;">-</span></td>`;
                    }

                    // Standard dynamic row rendering
                    const isNumber = h.includes('amount') || h.includes('price') || h.includes('value') || h.includes('depreciation') || h === 'running_balance';
                    
                    if (isNumber && !isNaN(val)) {
                      const formattedNum = Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      
                      if (h === 'running_balance') {
                         return `<td class="align-right amount-cell" style="font-weight: 700;">${sym}${formattedNum}</td>`;
                      }
                      
                      if (isContra) {
                         return `<td class="align-right amount-cell" style="color: #94A3B8;">${sym}${formattedNum}</td>`;
                      } else if (row.type === 'expense') {
                         return `<td class="align-right amount-cell text-rose">-${sym}${formattedNum}</td>`;
                      } else if (row.type === 'income') {
                         return `<td class="align-right amount-cell text-emerald">+${sym}${formattedNum}</td>`;
                      }
                      return `<td class="align-right amount-cell">${sym}${formattedNum}</td>`;
                    }
                    
                    if (h.includes('date') && val !== "-") {
                       val = new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    }
                    
                    if (h === 'type') {
                      return `<td style="text-transform: capitalize; ${isContra ? 'color: #94A3B8;' : ''}">${val}</td>`;
                    }

                    if (h === 'title' && isContra) {
                      return `<td>${val} <span class="contra-label">Transfer</span></td>`;
                    }
                    
                    return `<td>${val}</td>`;
                  }).join("")}
                </tr>
              `}).join("")}
            </tbody>
          </table>
          <div class="footer">
            Official Financial Statement securely generated by the Nova Tracking Engine.<br/>
            CONFIDENTIAL DOCUMENT
          </div>
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
      }, 500);
    } else {
      showToast("Please allow pop-ups for this site to generate PDFs.");
    }
  };

  const handleExportTx = async (type: 'csv' | 'pdf') => {
    type === 'csv' ? setExportingTx(true) : setExportingTxPdf(true);
    
    try {
      // 1. Calculate Opening Balance if using a custom date range
      let openingBalance = 0;
      if (exportPeriod === "custom" && startDate) {
        const { data: obData } = await supabase
          .from("transactions")
          .select("type, amount, category")
          .lt("date", startDate);
        
        if (obData) {
          const obIncome = obData.filter(t => t.type === 'income' && (t.category || '').toLowerCase() !== 'contra').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          const obExpense = obData.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
          openingBalance = obIncome - obExpense;
        }
      }

      // 2. Fetch Active Period Transactions
      let query = supabase.from("transactions").select("*").order("date", { ascending: true });
      
      if (exportPeriod === "custom") {
        if (startDate) query = query.gte("date", startDate);
        if (endDate) query = query.lte("date", endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        let runningBal = openingBalance;
        let periodIncome = 0;
        let periodExpense = 0;

        // 3. Map transactions and generate running balance line-by-line
        const txRows = data
          .filter(tx => !((tx.category || '').toLowerCase() === 'contra' && tx.type === 'income'))
          .map(tx => {
            const isContra = (tx.category || '').toLowerCase() === 'contra';
            const txType = isContra ? 'transfer' : tx.type;
            const amt = Number(tx.amount || 0);

            if (!isContra) {
              if (txType === 'income') {
                  runningBal += amt;
                  periodIncome += amt;
              } else if (txType === 'expense') {
                  runningBal -= amt;
                  periodExpense += amt;
              }
            }

            return {
              date: tx.date,
              title: tx.title,
              category: tx.category,
              type: txType, 
              amount: amt,
              running_balance: runningBal
            };
          });

        // 4. Prepend the Opening Balance to act as Row 1 in both CSV and PDF
        const finalData = [
            {
                date: startDate || "All Time",
                title: "Opening Balance",
                category: "-",
                type: "balance",
                amount: openingBalance,
                running_balance: openingBalance
            },
            ...txRows
        ];

        const closingBalance = openingBalance + periodIncome - periodExpense;

        if (type === 'csv') {
            downloadCSV(finalData, "Transactions_Data");
        } else {
            await downloadPDF(finalData, "Transactions_Report", {
                isTransactions: true,
                openingBalance,
                totalIncome: periodIncome,
                totalExpense: periodExpense,
                closingBalance
            }); 
        }
      }
    } catch (err) {
      showToast("Failed to export transactions.");
    } finally {
      type === 'csv' ? setExportingTx(false) : setExportingTxPdf(false);
    }
  };

  const handleExportAssets = async (type: 'csv' | 'pdf') => {
    type === 'csv' ? setExportingAssets(true) : setExportingAssetsPdf(true);
    
    let query = supabase.from("assets").select("*").order("purchase_date", { ascending: true });
    
    if (exportPeriod === "custom") {
      if (startDate) query = query.gte("purchase_date", startDate);
      if (endDate) query = query.lte("purchase_date", endDate);
    }

    const { data, error } = await query;
    if (!error && data) {
      const currentYear = new Date().getFullYear();
      
      const formattedAssets = data.map(asset => {
        const purchaseYear = new Date(asset.purchase_date).getFullYear();
        const rate = Number(asset.depreciation_rate) / 100;
        const purchasePrice = Number(asset.purchase_price);
        const salvageValue = Number(asset.salvage_value) || 0;

        let nbv = purchasePrice;
        if (currentYear >= purchaseYear) {
          const yearsOwned = currentYear - purchaseYear;
          nbv = purchasePrice * Math.pow(1 - rate, yearsOwned + 1);
          if (nbv < salvageValue) nbv = salvageValue;
        }
        
        const accumulated = purchasePrice - nbv;

        return {
          name: asset.name,
          purchase_date: asset.purchase_date,
          purchase_price: purchasePrice,
          depreciation_rate: `${asset.depreciation_rate}%`,
          salvage_value: salvageValue,
          accumulated_depreciation: accumulated,
          net_book_value: nbv
        };
      });

      if (type === 'csv') downloadCSV(formattedAssets, "Assets_Depreciation_Data");
      else await downloadPDF(formattedAssets, "Assets_Depreciation_Report"); 
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
          <Globe size={20} className="text-brand-500 dark:text-brand-400" /> Preferences
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 🚀 3-WAY THEME SELECTOR */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-3">App Mode</label>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 rounded-xl transition-colors">
              <button 
                onClick={() => handleThemeChange("light")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  theme === "light" ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Sun size={16} /> Light
              </button>
              <button 
                onClick={() => handleThemeChange("dark")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  theme === "dark" ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Moon size={16} /> Dark
              </button>
              <button 
                onClick={() => handleThemeChange("system")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  theme === "system" ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <Laptop size={16} /> Auto
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
                  currency === "USD" ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                USD ($)
              </button>
              <button 
                onClick={() => setCurrency("TZS")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  currency === "TZS" ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                }`}
              >
                <span className="font-extrabold tracking-tighter">TSh</span> TZS
              </button>
            </div>
          </div>

          {/* 🚀 ACCENT COLOR PICKER */}
          <div className="md:col-span-2 mt-2 pt-6 border-t border-slate-200/50 dark:border-white/5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-400 mb-4 flex items-center gap-2">
              <Palette size={16} /> Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-4">
              {COLOR_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => applyColorTheme(t.id)}
                  className="relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 border-[3px] focus:outline-none"
                  style={{ 
                    backgroundColor: t.hex, 
                    borderColor: activeColor === t.id ? (theme === 'dark' ? 'white' : '#0F172A') : 'transparent',
                    boxShadow: activeColor === t.id ? `0 0 20px -2px ${t.hex}` : 'none'
                  }}
                  title={t.name}
                >
                  {activeColor === t.id && <Check size={20} className="text-white drop-shadow-md" />}
                  
                  {/* Tooltip */}
                  <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap pointer-events-none">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* TAX & DATA EXPORT */}
      {/* ========================================= */}
      <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl dark:shadow-black/50 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2 mb-4 transition-colors">
          <FileSpreadsheet size={20} className="text-brand-500 dark:text-brand-400 transition-colors" /> Tax & Data Export
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
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${exportPeriod === 'all' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setExportPeriod("custom")}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${exportPeriod === 'custom' ? 'bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
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
                  className="w-full bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div className="hidden sm:block mt-5 text-slate-300 dark:text-slate-600"><ArrowRight size={16} /></div>
              <div className="w-full sm:flex-1">
                <label className="block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 mb-1 ml-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/60 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transactions Export Card */}
          <div className="p-5 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex flex-col justify-between gap-5 transition-colors shadow-sm hover:border-brand-500/30 dark:hover:border-brand-500/30">
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
                className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-70"
              >
                {exportingTxPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} PDF
              </button>
            </div>
          </div>

          {/* Assets Export Card */}
          <div className="p-5 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 flex flex-col justify-between gap-5 transition-colors shadow-sm hover:border-brand-500/30 dark:hover:border-brand-500/30">
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
                className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-70"
              >
                {exportingAssetsPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />} PDF
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 p-3 rounded-xl border border-brand-200/50 dark:border-brand-500/20">
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
          className="bg-brand-600 hover:bg-brand-700 text-white transition-colors px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand-500/20 w-full sm:w-auto active:scale-95"
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
      {/* CUSTOM TOAST NOTIFICATION */}
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