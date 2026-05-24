import Link from "next/link";
import { NovoProcessoForm } from "@/components/requerente/NovoProcessoForm";

export default function NovoProcessoPage() {
  return (
    <main className="mx-auto max-w-lg p-6">
      <Link
        href="/requerente"
        className="mb-4 inline-block text-sm text-emerald-700 hover:underline"
      >
        ← Voltar
      </Link>
      <h2 className="mb-4 text-xl font-semibold text-gray-900">Novo processo</h2>
      <NovoProcessoForm />
    </main>
  );
}
