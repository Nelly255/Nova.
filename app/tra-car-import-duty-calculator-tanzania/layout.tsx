import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TRA Car Import Duty Calculator Tanzania",
  description: "Calculate accurate TRA import duty, excise duty, and VAT for vehicles imported to Tanzania. Stop guessing your CIF value.",
  openGraph: {
    title: "TRA Car Import Duty Calculator | Nova",
    description: "Calculate accurate TRA import duties and taxes for vehicles instantly.",
    url: "https://nova.co.tz/tra-car-import-duty-calculator-tanzania",
  }
};

export default function TRACalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}