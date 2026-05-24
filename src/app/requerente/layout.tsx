import { AppHeader } from "@/components/AppHeader";

export default function RequerenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader titulo="Portal do Requerente" />
      {children}
    </div>
  );
}
