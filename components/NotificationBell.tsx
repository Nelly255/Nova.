"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CalendarClock, Info, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Helper for Relative Timestamps
const getRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp; 

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Priority Sorting Logic: Unread first, then Priority (Danger > Warning > Success > Info), then Newest
const sortNotifications = (notifs: any[]) => {
  const getPriority = (type: string) => {
    if (type === 'danger') return 4;
    if (type === 'warning') return 3;
    if (type === 'success') return 2;
    return 1;
  };

  return [...notifs].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    if (getPriority(a.type) !== getPriority(b.type)) return getPriority(b.type) - getPriority(a.type);
    return new Date(b.time).getTime() - new Date(a.time).getTime();
  });
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getCurrentTime = () => new Date().toISOString();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateNotifications = useCallback(async () => {
    const currentMonthStr = new Date().toISOString().slice(0, 7); 
    
    // Fetch subscriptions and ALL expense data for the current month
    const [subsRes, txRes] = await Promise.all([
      supabase.from("subscriptions").select("*"),
      supabase.from("transactions").select("*").eq("type", "expense").like("date", `${currentMonthStr}%`)
    ]);

    const currentDate = new Date();
    const today = currentDate.getDate();

    const subs = subsRes.data || [];
    const txs = txRes.data || [];

    const savedHistory = localStorage.getItem("nova_notif_history");
    let historyItems = savedHistory ? JSON.parse(savedHistory) : [];

    // STRICT PURGE: Instantly remove ANY notification that isn't from the current month
    historyItems = historyItems.filter((n: any) => {
      if (!n.time) return false;
      return n.time.startsWith(currentMonthStr);
    });

    // SMART CHECK: Looks across all possible transaction fields to see if the sub was paid this month
    const isPaidThisMonth = (subName: string) => {
      if (!subName) return false;
      const lowerSub = subName.toLowerCase();
      return txs.some(tx => {
        const textToSearch = `${tx.title || ''} ${tx.description || ''} ${tx.narration || ''} ${tx.name || ''}`.toLowerCase();
        return textToSearch.includes(lowerSub);
      });
    };

    if (subs.length > 0) {
      subs.forEach(sub => {
        const baseSubPrefix = `sub-alert-${sub.id}`;
        const currentMonthPrefix = `${baseSubPrefix}-${currentMonthStr}`;

        // CRITICAL CLEANUP: If paid, permanently remove ALL alerts for this sub
        if (isPaidThisMonth(sub.name)) {
          historyItems = historyItems.filter((n: any) => !n.id.startsWith(baseSubPrefix));
          return; 
        }

        const daysUntilDue = sub.billing_date - today;
        let alertState = "";
        let notifProps = null;

        if (daysUntilDue < 0) {
          alertState = "overdue";
          notifProps = { type: "danger", title: "Overdue Subscription", message: `${sub.name} was due on the ${sub.billing_date}th. Please log payment!` };
        } else if (daysUntilDue === 0) {
          alertState = "today";
          notifProps = { type: "warning", title: "Bill Due Today", message: `${sub.name} is due today! Have you paid it?` };
        } else if (daysUntilDue === 1) {
          alertState = "tmrw";
          notifProps = { type: "info", title: "Upcoming Bill", message: `${sub.name} will be due tomorrow.` };
        } else if (daysUntilDue > 1 && daysUntilDue <= 3) {
          alertState = "upcoming";
          notifProps = { type: "info", title: "Upcoming Bill", message: `${sub.name} is due in ${daysUntilDue} days.` };
        }

        if (alertState && notifProps) {
          const specificId = `${currentMonthPrefix}-${alertState}`;
          const alreadyExists = historyItems.some((n: any) => n.id === specificId);

          if (!alreadyExists) {
            // Remove older alerts for this specific sub to prevent stacking (e.g., clearing "due tomorrow" for "due today")
            historyItems = historyItems.filter((n: any) => !n.id.startsWith(baseSubPrefix));
            
            historyItems.push({
              id: specificId,
              ...notifProps,
              time: getCurrentTime(), 
              read: false,
              isPersistent: true 
            });
          }
        }
      });
    }

    // Handle Monthly Budget Reminder
    const yearMonthId = `budget-reminder-${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    
    if (today === 1) {
      const hasBudgetReminder = historyItems.some((n: any) => n.id === yearMonthId);
      
      if (!hasBudgetReminder) {
        historyItems.push({
          id: yearMonthId,
          type: "info",
          title: "Happy New Month! 🎯",
          message: "A fresh month means fresh goals. Take a moment to review and set your new budgets.",
          time: getCurrentTime(),
          read: false,
          isPersistent: true 
        });
      }
    }

    const hasGeneratedWelcome = localStorage.getItem("has_generated_welcome_notif");
    if (!hasGeneratedWelcome) {
      historyItems.push({
        id: "welcome",
        type: "success",
        title: "Welcome to Nova.",
        message: "Your financial dashboard is ready to go.",
        time: getCurrentTime(), 
        read: false,
        isPersistent: true
      });
      localStorage.setItem("has_generated_welcome_notif", "true");
    }

    // Sort by priority and trim to 15 maximum to prevent bloat
    const sortedAndTrimmed = sortNotifications(historyItems).slice(0, 15);
    localStorage.setItem("nova_notif_history", JSON.stringify(sortedAndTrimmed));
    setNotifications(sortedAndTrimmed);
  }, []);

  useEffect(() => {
    generateNotifications();
    
    window.addEventListener("transactionUpdated", generateNotifications);
    window.addEventListener("subscriptionUpdated", generateNotifications);
    
    return () => {
      window.removeEventListener("transactionUpdated", generateNotifications);
      window.removeEventListener("subscriptionUpdated", generateNotifications);
    };
  }, [generateNotifications]);

  useEffect(() => {
    const handleCustomNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      
      const newNotif = { 
        ...customEvent.detail, 
        id: `notif-${Date.now()}`, 
        time: customEvent.detail.time || getCurrentTime(),
        read: false,
        isPersistent: true 
      };
      
      setNotifications(prev => {
        const sortedAndTrimmed = sortNotifications([...prev, newNotif]).slice(0, 15);
        const persistentOnly = sortedAndTrimmed.filter(n => n.isPersistent);
        localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
        
        return sortedAndTrimmed;
      });
    };
    window.addEventListener('newNotification', handleCustomNotification);
    return () => window.removeEventListener('newNotification', handleCustomNotification);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'subscriptions' },
        (payload) => {
          const newSub = payload.new;
          
          const newNotif = {
            id: `realtime-sub-${newSub.id}-${Date.now()}`,
            type: "success",
            title: "New Subscription Tracked",
            message: `${newSub.name} was successfully added to your bills.`,
            time: getCurrentTime(),
            read: false,
            isPersistent: true
          };

          setNotifications(prev => {
            if (prev.some(n => n.message.includes(newSub.name) && n.time === newNotif.time)) {
              return prev;
            }
            const sortedAndTrimmed = sortNotifications([...prev, newNotif]).slice(0, 15);
            const persistentOnly = sortedAndTrimmed.filter(n => n.isPersistent);
            localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
            return sortedAndTrimmed;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNotificationClick = (id: string, type: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => n.id === id ? { ...n, read: true } : n);
      const sorted = sortNotifications(updated);
      const persistentOnly = sorted.filter(n => n.isPersistent);
      localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
      
      return sorted;
    });
    
    if (type === "warning" || type === "danger" || id.startsWith("sub-") || id.startsWith("realtime-sub-")) {
      setIsOpen(false); 
      router.push("/dashboard/subscriptions"); 
    } else if (id.startsWith("budget-reminder")) {
      setIsOpen(false);
      router.push("/dashboard/budgets");
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const sorted = sortNotifications(updated);
      const persistentOnly = sorted.filter(n => n.isPersistent);
      localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
      return sorted;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 transition-colors p-2 relative z-50 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white dark:border-[#0A0A0E] rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998] bg-slate-900/10 dark:bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed left-4 right-4 top-24 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 z-[10000] sm:w-96 bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/50 dark:border-white/10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 origin-top sm:origin-top-right duration-200 flex flex-col">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-200/50 dark:border-white/5 transition-colors shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 transition-colors">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 sm:hidden">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1 max-h-[320px] pb-2">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm font-medium">You're all caught up!</div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif.id, notif.type)}
                    className={`p-5 border-b border-slate-200/50 dark:border-white/5 transition-all duration-300 flex gap-4 cursor-pointer group ${
                      notif.read 
                        ? 'bg-transparent opacity-60 hover:opacity-100' 
                        : 'bg-white/40 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10'
                    }`}
                  >
                    <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm transition-colors ${
                      notif.type === 'danger' ? 'bg-rose-100/50 border-rose-200/50 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' :
                      notif.type === 'warning' ? 'bg-amber-100/50 border-amber-200/50 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400' : 
                      notif.type === 'success' ? 'bg-emerald-100/50 border-emerald-200/50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 
                      'bg-brand-500/10 border-brand-500/20 text-brand-600 dark:text-brand-400'
                    }`}>
                      {notif.read ? <CheckCircle2 size={20} /> : 
                       notif.type === 'danger' ? <AlertTriangle size={20} /> :
                       notif.type === 'warning' ? <CalendarClock size={20} /> : <Info size={20} />}
                    </div>
                    
                    <div className="flex-1 pr-2">
                      <p className={`text-sm font-bold transition-colors ${
                        notif.read 
                          ? 'text-slate-600 dark:text-slate-400' 
                          : 'text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400'
                      }`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mt-2">{getRelativeTime(notif.time)}</p>
                    </div>
                    
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-2 flex-shrink-0 shadow-sm shadow-brand-500/50"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}