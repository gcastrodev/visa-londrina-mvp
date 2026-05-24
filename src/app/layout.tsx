import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VISA Londrina – Portal de Licenciamento",
  description: "Portal de envio de documentos para licenciamento sanitário",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
