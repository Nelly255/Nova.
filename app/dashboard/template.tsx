export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return (
    // This wrapper triggers a smooth fade and slide-up animation every time you change pages!
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
      {children}
    </div>
  );
}