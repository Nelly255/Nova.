"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Activity } from "lucide-react";

const headerFont = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // --- 1. CORE AUTH CHECK ---
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    };
    checkUser();

    // --- 2. AUTH STATE LISTENER ---
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      }
    });

    // --- 3. THE 30-MINUTE IDLE TIMER ---
    let timeoutId: NodeJS.Timeout;
    
    const logoutUser = async () => {
      console.log("User idle for 30 mins. Logging out...");
      
      // 🚀 PATCH: Grab the user email before signing out and stash it
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        localStorage.setItem("nova_locked_email", session.user.email);
      }
      
      await supabase.auth.signOut();
      router.push("/login");
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 30 minutes * 60 seconds * 1000 milliseconds
      timeoutId = setTimeout(logoutUser, 30 * 60 * 1000); 
    };

    // Listen for any sign of life from the user
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    // Start the timer when they first load the page
    resetTimer();

    // Cleanup listeners when component unmounts
    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeoutId);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
    };
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0E] flex flex-col items-center justify-center selection:bg-brand-500/30">
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-24 h-24 bg-brand-500/20 rounded-full blur-xl animate-pulse"></div>
          <Activity size={40} className="text-brand-600 dark:text-brand-400 animate-pulse relative z-10" />
        </div>
        <h1 className={`${headerFont.className} text-xl font-bold text-slate-900 dark:text-white tracking-widest uppercase animate-pulse`}>
          Unlocking Vault...
        </h1>
      </div>
    );
  }

  return <>{children}</>;
}