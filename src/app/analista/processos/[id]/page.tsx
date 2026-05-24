import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnaliseActions } from "@/components/analista/AnaliseActions";
import { ResultadoIACard } from "@/components/analista/ResultadoIACard";
import { StatusDocumentoBadge, StatusProcessoBadge } from "@/components/StatusBadge";
import {
  LABEL_TIPO_DOCUMENTO,
  LABEL_TIPO_PROCESSO,
  type ResultadoValidacaoIA,
} from "@/types";

interface PageProps {
  params: { id: string };
}

export default async function AnalistaProcessoPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  if (session.user.role !== "ANALISTA" && session.user.role !== "ADMIN") {
    redirect("/requerente");
  }

  const processo = await prisma.processo.findUnique({
    where: { id: params.id },
    include: {
      empresa: { include: { user: { select: { nome: true, email: true } } } },
      documentos: { orderBy: { criadoEm: "asc" } },
      analista: { select: { nome: true, email: true } },
    },
  });

  if (!processo) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Link
        href="/analista"
        className="mb-4 inline-block text-sm text-emerald-700 hover:underline"
      >
        ← Fila de processos
      </Link>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {LABEL_TIPO_PROCESSO[processo.tipo]}
            </h2>
            <p className="mt-1 font-mono text-xs text-gray-500">{processo.protocolo}</p>
          </div>
          <StatusProcessoBadge status={processo.status} />
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Empresa</dt>
            <dd className="font-medium">{processo.empresa.razaoSocial}</dd>
          </div>
          <div>
            <dt className="text-gray-500">CNPJ</dt>
            <dd>{processo.empresa.cnpj}</dd>
          </div>
          <div>
            <dt className="text-gray-500">CNAE</dt>
            <dd>{processo.empresa.cnae}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Responsável</dt>
            <dd>
              {processo.empresa.user.nome}
              <span className="block text-xs text-gray-500">{processo.empresa.user.email}</span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Prazo de análise</dt>
            <dd>
              {processo.prazoAnalise
                ? new Date(processo.prazoAnalise).toLocaleDateString("pt-BR")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Analista responsável</dt>
            <dd>{processo.analista?.nome ?? "Não atribuído"}</dd>
          </div>
        </dl>

        {processo.observacoes && (
          <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Observações anteriores</p>
            <p className="mt-1 whitespace-pre-wrap">{processo.observacoes}</p>
          </div>
        )}

        {processo.riscoIA != null && (
          <p className="mt-3 text-sm text-gray-600">
            Score de risco IA:{" "}
            <span className="font-medium">{(processo.riscoIA * 100).toFixed(0)}%</span>
          </p>
        )}
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Documentos ({processo.documentos.length})
        </h3>
        {processo.documentos.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum documento enviado.</p>
        ) : (
          <ul className="space-y-3">
            {processo.documentos.map((doc) => {
              const resultado = doc.resultadoIA as ResultadoValidacaoIA | null;
              return (
                <li key={doc.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {LABEL_TIPO_DOCUMENTO[doc.tipo]}
                      </p>
                      <p className="text-xs text-gray-500">{doc.nomeArquivo}</p>
                      <p className="text-xs text-gray-400">
                        {(doc.tamanhoBytes / 1024).toFixed(0)} KB ·{" "}
                        {new Date(doc.criadoEm).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <StatusDocumentoBadge status={doc.status} />
                  </div>
                  {resultado && <ResultadoIACard resultado={resultado} />}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <AnaliseActions processoId={processo.id} statusAtual={processo.status} />
    </main>
  );
}
