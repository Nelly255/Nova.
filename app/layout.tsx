import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

// 🚀 UPGRADED METADATA
export const metadata: Metadata = {
  title: "Nova. | Intelligent Wealth Management",
  description: "Your financial life, beautifully organized. Track assets, crush debt, and monitor cash flow from one powerful dashboard.",
  metadataBase: new URL("https://nova.co.tz"),
  manifest: "/manifest.json", 
  openGraph: {
    title: "Nova | Financial Intelligence",
    description: "Track TSh and manage your wealth with Nova.",
    url: "https://nova.co.tz",
    siteName: "Nova",
    images: [
      {
        url: "/og-image.jpg", 
        width: 1200,
        height: 630,
        alt: "Nova Dashboard Preview",
      },
    ],
    locale: "en_TZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova | Financial Intelligence",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nova",
  },
};

// 📱 VIEWPORT
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 🚀 THE MAGIC INITIALIZATION SCRIPT (Kills Flashbangs & Color pops) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // 1. INITIALIZE SYSTEM/LIGHT/DARK MODE
                let theme = localStorage.getItem('app_theme');
                let isDark = false;
                
                if (theme === 'dark') {
                  isDark = true;
                } else if (theme === 'light') {
                  isDark = false;
                } else {
                  // Fallback to System if 'system' is explicitly saved, or if no theme is saved
                  isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                }

                if (isDark) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }

                // 2. INITIALIZE ACCENT COLOR THEME
                let colorId = localStorage.getItem('nova_color') || 'indigo';
                const themes = {
                  'indigo': { "50": "238 242 255", "100": "224 231 255", "400": "129 140 248", "500": "99 102 241", "600": "79 70 229", "700": "67 56 202" },
                  'emerald': { "50": "236 253 245", "100": "209 250 229", "400": "52 211 153", "500": "16 185 129", "600": "5 150 105", "700": "4 120 87" },
                  'rose': { "50": "255 241 242", "100": "255 228 230", "400": "251 113 133", "500": "244 63 94", "600": "225 29 72", "700": "190 18 60" },
                  'amber': { "50": "255 251 235", "100": "254 243 199", "400": "251 191 36", "500": "245 158 11", "600": "217 119 6", "700": "180 83 9" }
                };
                
                const activeTheme = themes[colorId] || themes['indigo'];
                for (const [key, value] of Object.entries(activeTheme)) {
                  document.documentElement.style.setProperty('--brand-' + key, value);
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      
      {/* Notice the background uses the globals.css CSS Variables now, not hardcoded Tailwind colors */}
      <body className={`${inter.className} antialiased transition-colors duration-500 relative min-h-screen overflow-x-hidden`}>
        
        {/* GLOBAL AMBIENT MESH GRADIENT */}
        <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-500/20 dark:bg-brand-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none z-0 transition-colors duration-700"></div>
        <div className="fixed bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none z-0 transition-colors duration-700"></div>

        {/* MAIN CONTENT WRAPPER */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
        
        <CookieBanner />
        
      </body>
    </html>
  );
}