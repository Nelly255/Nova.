import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Payslip Generator | Nova",
  description: "Create professional, ready-to-print payslips for your employees instantly. Auto-calculates TRA PAYE and NSSF.",
  openGraph: {
    title: "PDF Payslip Generator | Nova",
    description: "Create professional, ready-to-print payslips for your employees instantly.",
    url: "https://nova.co.tz/payslip-generator",
    siteName: "Nova",
    images: [
      {
        url: "/og-payslip.png", // We will add this image in Step 2
        width: 1200,
        height: 630,
        alt: "Nova PDF Payslip Generator Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Payslip Generator | Nova",
    description: "Create professional, ready-to-print payslips for your employees instantly.",
    images: ["/og-payslip.png"],
  },
};

export default function PayslipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}