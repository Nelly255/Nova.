"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CalendarClock, Info, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Helper for Relative Timestamps
const getRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  // Fallback for old notifications that saved static strings like "10:30 AM"
  if (isNaN(date.getTime())) return timestamp; 

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 🚀 UPDATED: We now use full ISO strings for relative time math
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

  // 1. Initial Notification Generation
  useEffect(() => {
    const generateNotifications = async () => {
      // Get real-time alerts from DB (Subscriptions)
      const { data } = await supabase.from("subscriptions").select("*");
      const currentDate = new Date();
      const today = currentDate.getDate();
      let liveAlerts: any[] = [];

      if (data) {
        data.forEach(sub => {
          if (sub.billing_date >= today && sub.billing_date <= today + 3) {
            liveAlerts.push({
              id: `sub-${sub.id}`,
              type: "warning",
              title: "Upcoming Bill",
              message: `${sub.name} is due on the ${sub.billing_date}th!`,
              time: getCurrentTime(), 
              read: false,
              isPersistent: false
            });
          }
        });
      }

      // Pull local history of custom actions
      const savedHistory = localStorage.getItem("nova_notif_history");
      let historyItems = savedHistory ? JSON.parse(savedHistory) : [];

      // Persistent 1st of the Month Warm Budget Reminder
      if (today === 1) {
        const yearMonthId = `budget-reminder-${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        const hasBudgetReminder = historyItems.some((n: any) => n.id === yearMonthId);
        
        if (!hasBudgetReminder) {
          const budgetNotif = {
            id: yearMonthId,
            type: "info",
            title: "Happy New Month! 🎯",
            message: "A fresh month means fresh goals. Take a moment to review and set your new budgets.",
            time: getCurrentTime(),
            read: false,
            isPersistent: true 
          };
          historyItems = [budgetNotif, ...historyItems];
          localStorage.setItem("nova_notif_history", JSON.stringify(historyItems));
        }
      }

      // The Welcome Message 
      const hasGeneratedWelcome = localStorage.getItem("has_generated_welcome_notif");
      if (!hasGeneratedWelcome) {
        const welcomeNotif = {
          id: "welcome",
          type: "info",
          title: "Welcome to Nova.",
          message: "Your financial dashboard is ready to go.",
          time: getCurrentTime(), 
          read: false,
          isPersistent: true
        };
        historyItems = [welcomeNotif, ...historyItems];
        localStorage.setItem("has_generated_welcome_notif", "true");
        localStorage.setItem("nova_notif_history", JSON.stringify(historyItems));
      }

      setNotifications([...liveAlerts, ...historyItems]);
    };

    generateNotifications();
  }, []);

  // 2. Custom Local Event Listener
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
        const updatedList = [newNotif, ...prev];
        const persistentOnly = updatedList.filter(n => n.isPersistent).slice(0, 10);
        localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
        
        return updatedList;
      });
    };
    window.addEventListener('newNotification', handleCustomNotification);
    return () => window.removeEventListener('newNotification', handleCustomNotification);
  }, []);

  // 🚀 NEW: 3. Supabase Real-Time Listener
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
            // Prevent duplicate pings if our local event fired first
            if (prev.some(n => n.message.includes(newSub.name) && n.time === newNotif.time)) {
              return prev;
            }
            const updatedList = [newNotif, ...prev];
            const persistentOnly = updatedList.filter(n => n.isPersistent).slice(0, 10);
            localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
            return updatedList;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Click Handlers
  const handleNotificationClick = (id: string, type: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => n.id === id ? { ...n, read: true } : n);
      const persistentOnly = updated.filter(n => n.isPersistent);
      localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
      
      return updated;
    });
    
    if (type === "warning" || id.startsWith("sub-") || id.startsWith("realtime-sub-")) {
      setIsOpen(false); 
      router.push("/dashboard/subscriptions"); 
    } else if (id.startsWith("budget-reminder")) {
      setIsOpen(false);
      router.push("/dashboard/budgets");
    }
  };

  // 🚀 NEW: Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      const persistentOnly = updated.filter(n => n.isPersistent);
      localStorage.setItem("nova_notif_history", JSON.stringify(persistentOnly));
      return updated;
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors p-2 relative z-50 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
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
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* 🚀 NEW: Render Mark All As Read button if unread notifications exist */}
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
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
                      'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {notif.read ? <CheckCircle2 size={20} /> : 
                       notif.type === 'danger' ? <AlertTriangle size={20} /> :
                       notif.type === 'warning' ? <CalendarClock size={20} /> : <Info size={20} />}
                    </div>
                    
                    <div className="flex-1 pr-2">
                      <p className={`text-sm font-bold transition-colors ${
                        notif.read 
                          ? 'text-slate-600 dark:text-slate-400' 
                          : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                      }`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
                      {/* 🚀 UPDATED: Display relative time calculation */}
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 mt-2">{getRelativeTime(notif.time)}</p>
                    </div>
                    
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0 shadow-sm shadow-indigo-500/50"></div>
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