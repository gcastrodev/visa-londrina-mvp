import { AppHeader } from "@/components/AppHeader";

export default function AnalistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader titulo="Dashboard do Analista" />
      {children}
    </div>
  );
}
