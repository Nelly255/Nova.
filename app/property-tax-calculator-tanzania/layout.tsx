import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanzania Property Tax Calculator",
  description: "Calculate Stamp Duty (1%) and Capital Gains Tax (10%) for real estate transactions in Tanzania. Estimate your legal fees and total costs before you sign.",
  openGraph: {
    title: "Property Tax Calculator | Nova",
    description: "Calculate Stamp Duty, CGT, and legal fees instantly for Tanzanian real estate.",
    url: "https://nova.co.tz/property-tax-calculator-tanzania",
  }
};

export default function PropertyTaxCalculatorLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return <>{children}</>;
}