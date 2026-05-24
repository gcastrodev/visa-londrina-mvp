import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FiltrosFila } from "@/components/analista/FiltrosFila";
import { StatusProcessoBadge } from "@/components/StatusBadge";
import { LABEL_TIPO_PROCESSO, type StatusProcesso } from "@/types";

interface PageProps {
  searchParams: {
    status?: string;
    search?: string;
    ordenar?: string;
  };
}

export default async function AnalistaPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  if (session.user.role !== "ANALISTA" && session.user.role !== "ADMIN") {
    redirect("/requerente");
  }

  const status = searchParams.status as StatusProcesso | undefined;
  const search = searchParams.search;
  const ordenar = searchParams.ordenar ?? "criadoEm";

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  } else {
    where.status = { not: "RASCUNHO" };
  }
  if (search) {
    where.OR = [
      { protocolo: { contains: search, mode: "insensitive" } },
      { empresa: { razaoSocial: { contains: search, mode: "insensitive" } } },
      { empresa: { cnpj: { contains: search } } },
    ];
  }

  const orderBy: Record<string, string> = {};
  if (ordenar === "riscoIA") orderBy.riscoIA = "desc";
  else if (ordenar === "prazoAnalise") orderBy.prazoAnalise = "asc";
  else orderBy.criadoEm = "desc";

  const [processos, contagemEnviados, contagemEmAnalise] = await Promise.all([
    prisma.processo.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        empresa: true,
        documentos: { select: { id: true, status: true } },
        analista: { select: { nome: true } },
      },
    }),
    prisma.processo.count({ where: { status: "ENVIADO" } }),
    prisma.processo.count({ where: { status: "EM_ANALISE" } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-2xl font-semibold text-blue-900">{contagemEnviados}</p>
          <p className="text-sm text-blue-700">Aguardando análise</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-2xl font-semibold text-amber-900">{contagemEmAnalise}</p>
          <p className="text-sm text-amber-700">Em análise</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-2xl font-semibold text-gray-900">{processos.length}</p>
          <p className="text-sm text-gray-600">Na lista atual</p>
        </div>
      </div>

      <FiltrosFila status={status} search={search} ordenar={ordenar} />

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {processos.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Nenhum processo encontrado.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Docs</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Prazo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {processos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{p.protocolo.slice(0, 12)}…</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.empresa.razaoSocial}</p>
                    <p className="text-xs text-gray-500">{p.empresa.cnpj}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{LABEL_TIPO_PROCESSO[p.tipo]}</td>
                  <td className="px-4 py-3 text-gray-600">{p.documentos.length}</td>
                  <td className="px-4 py-3">
                    <StatusProcessoBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.prazoAnalise
                      ? new Date(p.prazoAnalise).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/analista/processos/${p.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      Analisar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
