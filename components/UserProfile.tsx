"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, User, LogOut, ChevronUp, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

// UPGRADED: Added popDirection so it can pop down from the top header on mobile!
export default function UserProfile({ 
  isCollapsed = false, 
  popDirection = 'up' 
}: { 
  isCollapsed?: boolean;
  popDirection?: 'up' | 'down';
}) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [name, setName] = useState("Nelly");
  const [email, setEmail] = useState("nelly@example.com");

  useEffect(() => {
    const savedAvatar = localStorage.getItem("user_avatar");
    if (savedAvatar) setAvatarUrl(savedAvatar);

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || "No email");
        setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User");
        
        if (session.user.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
          localStorage.setItem("user_avatar", session.user.user_metadata.avatar_url);
        }
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setEmail(session.user.email || "No email");
        setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "User");
        if (session.user.user_metadata?.avatar_url) {
          setAvatarUrl(session.user.user_metadata.avatar_url);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      localStorage.setItem("user_avatar", publicUrl);
      setAvatarUrl(publicUrl);

      window.dispatchEvent(new Event('avatarUpdated'));

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert('Error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setIsUploading(true);

    try {
      await supabase.auth.updateUser({
        data: { avatar_url: null }
      });

      setAvatarUrl(null);
      localStorage.removeItem("user_avatar");
      window.dispatchEvent(new Event('avatarUpdated'));

    } catch (error) {
      console.error("Error removing photo:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_avatar");
    setIsMenuOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative z-[100] w-full min-w-0">
      
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
          {/* UPGRADED: Dynamic Pop Direction based on props! */}
          <div className={`absolute ${popDirection === 'up' ? 'left-0 bottom-full mb-2 origin-bottom-left' : 'right-0 top-full mt-2 origin-top-right'} z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isCollapsed ? 'w-48' : 'w-full'}`}>
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}

      <div className={`flex items-center ${isCollapsed ? 'justify-center p-0 md:p-2' : 'gap-2 p-2'} rounded-2xl bg-transparent md:bg-white/60 md:dark:bg-white/5 md:border border-transparent md:border-slate-200/50 md:dark:border-white/10 shadow-none md:shadow-sm backdrop-blur-md transition-colors w-full group min-w-0`}>
        
        <div className="relative group/avatar">
          <div 
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center shrink-0 overflow-hidden transition-transform hover:scale-105 relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            title="Change profile picture"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-white" />
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
              {isUploading ? <Loader2 size={16} className="text-white animate-spin" /> : <Camera size={16} className="text-white" />}
            </div>
          </div>

          {avatarUrl && !isUploading && (
            <button
              onClick={handleRemovePhoto}
              title="Remove photo"
              className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity scale-0 group-hover/avatar:scale-100"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>

        <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />

        {!isCollapsed && (
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex flex-1 items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-white/10 rounded-xl px-2 py-1 transition-colors min-w-0"
            title="Account Options"
          >
            <div className="flex flex-col overflow-hidden pr-2 min-w-0">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {name}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate transition-colors">
                {email}
              </span>
            </div>
            <ChevronUp size={16} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </div>
        )}
        
      </div>
    </div>
  );
}