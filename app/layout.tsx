import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 🚀 UPGRADED METADATA: This makes your link look "Premium" when shared
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
        url: "/og-image.jpg", // ⚠️ Put your dashboard screenshot in /public/og-image.jpg
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

// 📱 VIEWPORT: Essential for mobile PWA behavior (hides the notch white space)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F19" },
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
        {/* THE MAGIC SCRIPT THAT KILLS THE FLASHBANG */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('app_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      
      <body className={`${inter.className} antialiased bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-50 transition-colors duration-500 relative min-h-screen overflow-x-hidden`}>
        
        {/* GLOBAL AMBIENT MESH GRADIENT */}
        <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-purple-500/20 dark:bg-purple-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-70 pointer-events-none z-0"></div>

        {/* MAIN CONTENT WRAPPER */}
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
        
      </body>
    </html>
  );
}