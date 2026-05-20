import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanzania PAYE & Employer Cost Calculator",
  description: "Calculate your exact net take-home pay or your true employer costs (NSSF, SDL, WCF) using the latest TRA tax brackets.",
  openGraph: {
    title: "Tanzania PAYE & Net Salary Calculator",
    description: "Calculate your exact net take-home pay or your true employer costs instantly.",
    url: "https://nova.co.tz/paye-calculator",
  }
};

export default function PayeCalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}