import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    if (session.user.role === "ANALISTA" || session.user.role === "ADMIN") {
      redirect("/analista");
    }
    redirect("/requerente");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
            Vigilância Sanitária
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-gray-900">VISA Londrina</h1>
          <p className="mt-2 text-sm text-gray-600">
            Portal de licenciamento sanitário
          </p>
        </div>

        <Suspense fallback={<p className="text-center text-sm text-gray-500">Carregando...</p>}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
          Ambiente de desenvolvimento — use as credenciais do seed
        </p>
      </div>
    </main>
  );
}
