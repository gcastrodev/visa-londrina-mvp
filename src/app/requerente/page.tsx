import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatusProcessoBadge } from "@/components/StatusBadge";
import { LABEL_TIPO_PROCESSO } from "@/types";

export default async function RequerentePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const empresa = await prisma.empresa.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!empresa) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Sua conta não possui empresa vinculada. Entre em contato com a VISA.
        </p>
      </main>
    );
  }

  const processos = await prisma.processo.findMany({
    where: { empresaId: empresa.id },
    orderBy: { criadoEm: "desc" },
    include: {
      documentos: { select: { id: true, tipo: true, status: true } },
    },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Meus processos</h2>
          <p className="text-sm text-gray-600">{empresa.razaoSocial}</p>
        </div>
        <Link
          href="/requerente/novo"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Novo processo
        </Link>
      </div>

      {processos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-600">Você ainda não tem processos.</p>
          <Link
            href="/requerente/novo"
            className="mt-4 inline-block text-sm font-medium text-emerald-700 hover:underline"
          >
            Criar primeiro processo
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {processos.map((p) => (
            <li key={p.id}>
              <Link
                href={`/requerente/processos/${p.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {LABEL_TIPO_PROCESSO[p.tipo]}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 font-mono">{p.protocolo}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {p.documentos.length} documento(s) ·{" "}
                      {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <StatusProcessoBadge status={p.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
