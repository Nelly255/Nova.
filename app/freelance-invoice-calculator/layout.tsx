import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelance Withholding Tax & Invoice Calculator",
  description: "Reverse-engineer your freelance invoice in Tanzania. Calculate exactly how much to gross up to cover 5% WHT and 18% VAT.",
  openGraph: {
    title: "Freelance WHT & Invoice Calculator | Nova",
    description: "Protect your profit margins. Gross up your invoices for TRA WHT and VAT.",
    url: "https://nova.co.tz/freelance-invoice-calculator",
  }
};

export default function FreelanceCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}