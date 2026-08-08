"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { Plus, Wallet, Smartphone, Landmark, Banknote, CreditCard, ArrowRight, Loader2, TrendingUp, Download, FileText, X, FileDown, Trash2, Lightbulb, AlertTriangle, ArrowLeftRight, ChevronLeft, ChevronRight, Info } from "lucide-react";
import AddWalletModal from "@/components/AddWalletModal"; 
import ContraTransferModal from "@/components/ContraTransferModal";

const formatTZS = (amount: number) => {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getWalletBranding = (provider: string) => {
  switch (provider?.toLowerCase()) {
    case 'm-pesa':
    case 'mpesa':
      return { bg: 'from-red-600 to-red-500', icon: Smartphone, label: 'Vodacom M-Pesa' };
    case 'tigo-pesa':
    case 'tigo':
      return { bg: 'from-blue-700 to-blue-500', icon: Smartphone, label: 'Tigo Pesa' };
    case 'airtel-money':
    case 'airtel':
      return { bg: 'from-rose-600 to-rose-500', icon: Smartphone, label: 'Airtel Money' };
    case 'halopesa':
    case 'halo':
      return { bg: 'from-orange-500 to-amber-500', icon: Smartphone, label: 'HaloPesa' };
    case 'crdb':
      return { bg: 'from-emerald-600 to-emerald-500', icon: Landmark, label: 'CRDB Bank' };
    case 'nmb':
      return { bg: 'from-sky-600 to-blue-500', icon: Landmark, label: 'NMB Bank' };
    case 'cash':
      return { bg: 'from-amber-500 to-yellow-500', icon: Banknote, label: 'Physical Cash' };
    default:
      return { bg: 'from-brand-600 to-brand-500', icon: Wallet, label: provider || 'Wallet' };
  }
};

const ITEMS_PER_PAGE = 6; 

export default function WalletsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const [currencySymbol, setCurrencySymbol] = useState("TSh ");

  const [currentPage, setCurrentPage] = useState(1);

  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [selectedWalletForStatement, setSelectedWalletForStatement] = useState<any>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [processingWalletId, setProcessingWalletId] = useState<string | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<{ id: string, name: string } | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null); 
  const [showProTip, setShowProTip] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency === "USD") setCurrencySymbol("$");
    
    fetchData();

    const hasSeenTip = localStorage.getItem("nova_wallet_tip_seen");
    if (!hasSeenTip) setShowProTip(true);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [accountsRes, txRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('date', { ascending: true }) 
      ]);

      if (accountsRes.data) {
        setAccounts(accountsRes.data);
        setTotalBalance(accountsRes.data.reduce((sum, account) => sum + Number(account.balance), 0));
        
        const maxPages = Math.ceil(accountsRes.data.length / ITEMS_PER_PAGE);
        if (currentPage > maxPages) setCurrentPage(Math.max(1, maxPages));
      }

      if (txRes.data) setTransactions(txRes.data);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissProTip = () => {
    localStorage.setItem("nova_wallet_tip_seen", "true");
    setShowProTip(false);
  };

  const initiateDeleteWallet = async (walletId: string, walletName: string) => {
    try {
      setProcessingWalletId(walletId);
      const { count, error: countError } = await supabase.from("transactions").select("*", { count: 'exact', head: true }).eq("account_id", walletId);
      if (countError) throw countError;

      if (count && count > 0) {
        setDeleteErrorMsg(`Oops! You cannot delete "${walletName}" because it has ${count} transaction(s) inside it. Please go to Transactions and delete them first!`);
        return;
      }

      setWalletToDelete({ id: walletId, name: walletName });
    } catch (error) {
      setDeleteErrorMsg("Something went wrong trying to delete the wallet.");
    } finally {
      setProcessingWalletId(null);
    }
  };

  const confirmDeleteWallet = async () => {
    if (!walletToDelete) return;
    setProcessingWalletId(walletToDelete.id);

    try {
      const { error } = await supabase.from("accounts").delete().eq("id", walletToDelete.id);
      if (!error) {
        fetchData(); 
        window.dispatchEvent(new Event("transactionUpdated")); 
        setWalletToDelete(null); 
      } else {
        setDeleteErrorMsg("Something went wrong trying to delete the wallet.");
      }
    } catch (error) {
      setDeleteErrorMsg("Something went wrong trying to delete the wallet.");
    } finally {
      setProcessingWalletId(null);
    }
  };

  const getStatementData = () => {
    if (!selectedWalletForStatement) return null;
    const walletId = selectedWalletForStatement.id;
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const walletTxs = transactions.filter(t => t.account_id === walletId);
    const currentBalance = Number(selectedWalletForStatement.balance);
    const txsAfterStart = walletTxs.filter(t => new Date(t.date) >= start);
    
    const rolledBackIncome = txsAfterStart.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const rolledBackExpense = txsAfterStart.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    
    const openingBalance = currentBalance - rolledBackIncome + rolledBackExpense;
    const periodTxs = walletTxs.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });

    return { openingBalance, periodTxs };
  };

  const generateCSV = () => {
    if (!selectedWalletForStatement) return;
    setIsGeneratingCSV(true);

    setTimeout(() => {
      const data = getStatementData();
      if (!data) return setIsGeneratingCSV(false);
      const { openingBalance, periodTxs } = data;

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += `Account Statement: ${selectedWalletForStatement.name}\nProvider: ${getWalletBranding(selectedWalletForStatement.provider).label}\nPeriod: ${startDate} to ${endDate}\n\nDate,Description,Category,Type,Amount In,Amount Out,Running Balance\n${startDate},Opening Balance,,,,"",${openingBalance}\n`;

      let runningBalance = openingBalance;
      periodTxs.forEach(tx => {
        const amount = Number(tx.amount);
        let amountIn = "", amountOut = "";
        if (tx.type === 'income') { runningBalance += amount; amountIn = amount.toString(); } else { runningBalance -= amount; amountOut = amount.toString(); }
        csvContent += `${tx.date},${tx.title.replace(/,/g, " ")},${tx.category.replace(/,/g, " ")},${tx.type},${amountIn},${amountOut},${runningBalance}\n`;
      });

      csvContent += `\nClosing Balance as of ${endDate}:,,,,,,${runningBalance}\n`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Statement_${selectedWalletForStatement.name}_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsGeneratingCSV(false);
      setStatementModalOpen(false);
    }, 800);
  };

  const generatePDF = () => {
    if (!selectedWalletForStatement) return;
    setIsGeneratingPDF(true);

    setTimeout(() => {
      const data = getStatementData();
      if (!data) return setIsGeneratingPDF(false);
      
      const { openingBalance, periodTxs } = data;
      const branding = getWalletBranding(selectedWalletForStatement.provider);

      let runningBalance = openingBalance;
      let totalIn = 0;
      let totalOut = 0;

      const rowsHtml = periodTxs.map(tx => {
        const amount = Number(tx.amount);
        let amountIn = "-", amountOut = "-";
        if (tx.type === 'income') { runningBalance += amount; totalIn += amount; amountIn = formatTZS(amount); } else { runningBalance -= amount; totalOut += amount; amountOut = formatTZS(amount); }
        return `<tr class="tx-row"><td class="date-col">${tx.date}</td><td><div class="tx-title">${tx.title}</div><div class="tx-cat">${tx.category}</div></td><td class="text-right text-green">${amountIn !== "-" ? "+" + amountIn : "-"}</td><td class="text-right text-red">${amountOut}</td><td class="text-right font-bold">${formatTZS(runningBalance)}</td></tr>`;
      }).join('');

      const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title></title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
            @page { size: A4 portrait; margin: 0; }
            body { font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; line-height: 1.5; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; position: relative; padding: 20mm; box-sizing: border-box; }
            .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 120px; font-weight: 800; color: #e2e8f0; opacity: 0.3; z-index: -1; white-space: nowrap; pointer-events: none; }
            .header-container { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 30px; }
            .brand-logo { display: flex; align-items: center; gap: 12px; }
            .brand-logo svg { width: 32px; height: 32px; color: #0f172a; }
            .brand-name { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }
            .doc-title { text-align: right; }
            .doc-title h1 { margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
            .doc-title p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; font-family: 'JetBrains Mono', monospace; }
            .meta-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .meta-block h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; margin: 0 0 4px 0; }
            .meta-block p { margin: 0; font-size: 14px; font-weight: 600; color: #0f172a; }
            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
            .card { border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; background: white; }
            .card-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; font-weight: 600; }
            .card-value { font-size: 18px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            thead { display: table-header-group; }
            th { background-color: #0f172a; color: white; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
            th:first-child { border-top-left-radius: 8px; border-bottom-left-radius: 8px; }
            th:last-child { border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
            td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
            .tx-row { page-break-inside: avoid; }
            .tx-row:nth-child(even) { background-color: #fafaf9; }
            .date-col { font-family: 'JetBrains Mono', monospace; color: #64748b; font-size: 11px; }
            .tx-title { font-weight: 600; color: #0f172a; }
            .tx-cat { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px;}
            .text-right { text-align: right; }
            .text-green { color: #059669; font-family: 'JetBrains Mono', monospace; }
            .text-red { color: #e11d48; font-family: 'JetBrains Mono', monospace; }
            .font-bold { font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace; }
            .balance-row td { background-color: #f8fafc; font-weight: 800; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; font-size: 13px; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; text-transform: uppercase; letter-spacing: 1px; }
          </style>
        </head>
        <body>
          <div class="watermark">NOVA INTELLIGENT WEALTH MANAGEMENT</div>
          <div class="header-container">
            <div class="brand-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <div class="brand-name">NOVA.</div>
            </div>
            <div class="doc-title"><h1>Statement</h1><p>REF: NV-${Math.floor(Math.random() * 1000000)}</p></div>
          </div>
          <div class="meta-section">
            <div><div class="meta-block" style="margin-bottom: 12px;"><h3>Account Holder</h3><p>Private Client</p></div><div class="meta-block"><h3>Account / Wallet</h3><p>${selectedWalletForStatement.name}</p></div></div>
            <div class="text-right"><div class="meta-block" style="margin-bottom: 12px;"><h3>Provider details</h3><p>${branding.label}</p></div><div class="meta-block"><h3>Statement Period</h3><p>${startDate} &mdash; ${endDate}</p></div></div>
          </div>
          <div class="summary-cards">
            <div class="card"><div class="card-label">Total Deposits In</div><div class="card-value text-green">+ ${formatTZS(totalIn)}</div></div>
            <div class="card"><div class="card-label">Total Withdrawals Out</div><div class="card-value text-red">- ${formatTZS(totalOut)}</div></div>
            <div class="card" style="background-color: #0f172a; color: white;"><div class="card-label" style="color: #94a3b8;">Net Movement</div><div class="card-value">${formatTZS(totalIn - totalOut)}</div></div>
          </div>
          <table>
            <thead><tr><th>Date</th><th>Transaction Details</th><th class="text-right">Credit (+)</th><th class="text-right">Debit (-)</th><th class="text-right">Balance</th></tr></thead>
            <tbody><tr class="balance-row"><td class="date-col">${startDate}</td><td colspan="3">OPENING BALANCE CARRIED FORWARD</td><td class="text-right font-bold">${formatTZS(openingBalance)}</td></tr>${rowsHtml}<tr class="balance-row"><td class="date-col">${endDate}</td><td colspan="3">CLOSING BALANCE</td><td class="text-right font-bold">${formatTZS(runningBalance)}</td></tr></tbody>
          </table>
          <div class="footer"><p>This is a computer-generated document and does not require a signature.</p><p>Securely generated by Nova Wealth Management Systems on ${new Date().toLocaleString()}</p></div>
          <script>window.onload = function() { setTimeout(function() { window.print(); window.close(); }, 400); };</script>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) { printWindow.document.open(); printWindow.document.write(printHtml); printWindow.document.close(); } 
      else { setDeleteErrorMsg("Pop-up blocked! Please allow pop-ups to generate PDF statements."); }

      setIsGeneratingPDF(false);
      setStatementModalOpen(false);
    }, 800);
  };

  const totalPages = Math.ceil(accounts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAccounts = accounts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-500 relative z-10 pb-32">
      
      {/* HEADER (🚀 FIXED: Added relative z-50 to pop it above the other widgets) */}
      <div className="relative z-50 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Wallets & Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your mobile money, bank accounts, and cash.</p>
        </div>

        <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-3 w-full">
            <ContraTransferModal accounts={accounts} onSuccess={fetchData} currencySymbol={currencySymbol}>
              <button 
                disabled={accounts.length < 2}
                className="group/contra relative flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftRight size={18} /> <span className="hidden sm:inline">Contra</span> Transfer
                
                {/* 🚀 PREMIUM HINT TOOLTIP (DESKTOP ONLY) */}
                <span className="hidden sm:block absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 w-[260px] p-3.5 bg-slate-900 dark:bg-slate-100 text-slate-300 dark:text-slate-600 text-xs font-medium rounded-2xl shadow-xl opacity-0 invisible group-hover/contra:opacity-100 group-hover/contra:visible transition-all duration-300 z-50 translate-y-2 group-hover/contra:translate-y-0 pointer-events-none text-left normal-case border border-slate-800 dark:border-white">
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-100 border-l border-t border-slate-800 dark:border-white rotate-45"></span>
                  <span className="font-bold flex items-center gap-1.5 mb-1 text-white dark:text-slate-900">
                    <Info size={14} className="text-brand-400 dark:text-brand-600" /> What is a Contra?
                  </span>
                  <span className="block leading-relaxed">
                    Move money safely between your own accounts. It won't trigger false income or expenses, keeping your net worth accurate.
                  </span>
                </span>
              </button>
            </ContraTransferModal>

            <AddWalletModal onSuccess={fetchData}>
              <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-[0_4px_12px_rgb(var(--brand-500)/0.3)] transition-all active:scale-95 whitespace-nowrap">
                <Plus size={18} /> Add Wallet
              </button>
            </AddWalletModal>
          </div>

          {/* 🚀 MOBILE-ONLY INLINE HINT */}
          <div className="sm:hidden flex items-start gap-2 px-3 py-2.5 bg-brand-50 dark:bg-brand-500/10 border border-brand-200/50 dark:border-brand-500/20 rounded-xl mt-1 animate-in fade-in duration-300 w-full">
            <Info size={14} className="text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed text-brand-800 dark:text-brand-200 font-medium">
              <strong className="font-bold">Contra:</strong> Move money safely between accounts without faking income or expenses.
            </p>
          </div>
        </div>
      </div>

      {/* TOTAL BALANCE WIDGET */}
      <div className="bg-white dark:bg-[#0F0F15]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[80px] pointer-events-none rounded-full"></div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-semibold mb-2">
              <Wallet size={18} className="text-brand-500" />
              Total Liquidity
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {isLoading ? "..." : formatTZS(totalBalance)}
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm h-fit border border-emerald-500/20">
            <TrendingUp size={16} /> Ready to allocate
          </div>
        </div>
      </div>

      {/* ONE-TIME PRO TIP */}
      {showProTip && (
        <div className="bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-[2rem] p-6 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg"><Lightbulb size={24} /></div>
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100 mb-1">Nova Pro Tip</h3>
            <p className="text-sm text-brand-700/80 dark:text-brand-300/80">When creating a new wallet, leave the <strong>Initial Balance as 0</strong>. Then, go to the Transactions page and log an <strong>"Income"</strong> for your actual starting balance. This creates a perfect paper trail for your statements!</p>
          </div>
          <button onClick={dismissProTip} className="absolute top-4 right-4 sm:static bg-brand-200/50 hover:bg-brand-200 dark:bg-brand-500/20 dark:hover:bg-brand-500/40 text-brand-700 dark:text-brand-300 p-2 rounded-full transition-colors" title="Got it!"><X size={18} /></button>
        </div>
      )}

      {/* WALLETS GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500"><Loader2 size={40} className="animate-spin mb-4 text-brand-500" /><p className="font-medium">Loading your wallets...</p></div>
      ) : accounts.length === 0 ? (
        <div className="bg-slate-50 dark:bg-[#12121A] border border-dashed border-slate-300 dark:border-white/10 rounded-[2rem] p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 text-slate-400 dark:text-slate-500"><CreditCard size={32} /></div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No wallets found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">You haven't added any accounts yet. Connect your M-Pesa, Bank, or physical wallet to start tracking your wealth.</p>
          <AddWalletModal onSuccess={fetchData}><button className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-md transition-all hover:-translate-y-1 active:scale-95">Add Your First Wallet <ArrowRight size={18} /></button></AddWalletModal>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {paginatedAccounts.map((account) => {
              const branding = getWalletBranding(account.provider);
              const Icon = branding.icon;
              
              return (
                <div key={account.id} className={`group relative overflow-hidden rounded-3xl p-5 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-1 duration-300 bg-gradient-to-br ${branding.bg}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full blur-xl transform -translate-x-4 translate-y-4"></div>
                  
                  <div className="relative z-10 flex flex-col h-full justify-between gap-5">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white/90 truncate pr-3 text-base">{account.name}</span>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                        <Icon size={16} className="text-white" />
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-0.5">Current Balance</p>
                      <h3 className="text-2xl font-black tracking-tight drop-shadow-sm truncate">{formatTZS(Number(account.balance))}</h3>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/20 pt-3 mt-1">
                      <div>
                        <span className="text-xs font-bold opacity-90 block mb-1">{branding.label}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest bg-black/20 px-1.5 py-0.5 rounded-md">Active</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setSelectedWalletForStatement(account); setStatementModalOpen(true); }} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors text-white tooltip-trigger group/btn relative" aria-label="Generate Statement">
                          <Download size={14} />
                          <span className="absolute -top-8 right-0 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Statement</span>
                        </button>

                        <button onClick={() => initiateDeleteWallet(account.id, account.name)} disabled={processingWalletId === account.id} className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/50 backdrop-blur-md border border-white/10 hover:border-rose-500/50 transition-colors text-white tooltip-trigger group/del relative disabled:opacity-50" aria-label="Delete Wallet">
                          {processingWalletId === account.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          <span className="absolute -top-8 right-0 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover/del:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 rounded-2xl bg-white dark:bg-[#0F0F15]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 shadow-sm"
                aria-label="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="px-4 py-2 rounded-2xl bg-white dark:bg-[#0F0F15]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center justify-center min-w-[100px]">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Page {currentPage} <span className="text-slate-400 dark:text-slate-500 mx-1">/</span> {totalPages}
                </span>
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 rounded-2xl bg-white dark:bg-[#0F0F15]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 shadow-sm"
                aria-label="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {mounted && statementModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setStatementModalOpen(false)} />
          <div className="relative bg-white dark:bg-[#0F0F15] rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getWalletBranding(selectedWalletForStatement?.provider || '').bg} flex items-center justify-center text-white shadow-inner`}><FileText size={18} /></div>
                <div><h3 className="font-bold text-slate-900 dark:text-white leading-tight">Generate Statement</h3><p className="text-xs text-slate-500">{selectedWalletForStatement?.name}</p></div>
              </div>
              <button onClick={() => setStatementModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-4 mb-8">
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"/></div>
              <div><label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors [color-scheme:light] dark:[color-scheme:dark]"/></div>
              <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/5">This will generate a file containing your opening balance, all transactions, bank charges, and the closing balance for this period.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={generateCSV} disabled={isGeneratingCSV || isGeneratingPDF} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white disabled:opacity-70 font-bold py-3.5 rounded-xl transition-all border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-1">{isGeneratingCSV ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}<span className="text-xs">Export CSV</span></button>
              <button onClick={generatePDF} disabled={isGeneratingCSV || isGeneratingPDF} className="w-full bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-70 font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_12px_rgb(var(--brand-500)/0.3)] flex flex-col items-center justify-center gap-1">{isGeneratingPDF ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}<span className="text-xs">Print / Save PDF</span></button>
            </div>
          </div>
        </div>
      , document.body)}

      {mounted && walletToDelete && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !processingWalletId && setWalletToDelete(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            {!processingWalletId && <button onClick={() => setWalletToDelete(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"><X size={20} /></button>}
            <div className="p-6 text-center pt-8">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-200 dark:border-rose-500/30"><Trash2 size={24} /></div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Delete Wallet?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-300">{walletToDelete.name}</span>? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setWalletToDelete(null)} disabled={processingWalletId === walletToDelete.id} className="flex-1 py-3.5 rounded-xl font-bold text-slate-700 bg-white/80 border border-slate-200 hover:bg-white dark:text-slate-300 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 transition-colors active:scale-95 shadow-sm disabled:opacity-50">Cancel</button>
                <button onClick={confirmDeleteWallet} disabled={processingWalletId === walletToDelete.id} className="flex-1 py-3.5 flex items-center justify-center gap-2 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-[0_4px_14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0">{processingWalletId === walletToDelete.id ? <Loader2 size={18} className="animate-spin" /> : "Yes, Delete"}</button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}

      {mounted && deleteErrorMsg && createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteErrorMsg(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#0A0A0E] border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 border border-rose-200 dark:border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={28} /></div>
            <h3 className="text-xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Action Denied</h3>
            <p className="text-slate-500 text-sm mb-8">{deleteErrorMsg}</p>
            <button onClick={() => setDeleteErrorMsg(null)} className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold py-3.5 rounded-xl transition-colors active:scale-95">Understood</button>
          </div>
        </div>
      , document.body)}

    </div>
  );
}