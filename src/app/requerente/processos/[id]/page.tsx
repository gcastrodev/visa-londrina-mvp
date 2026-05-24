import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { documentosObrigatorios, podeEnviarProcesso } from "@/lib/processo";
import { StatusProcessoBadge } from "@/components/StatusBadge";
import { DocumentoUpload } from "@/components/requerente/DocumentoUpload";
import { EnviarProcessoButton } from "@/components/requerente/EnviarProcessoButton";
import { LABEL_TIPO_PROCESSO } from "@/types";

interface PageProps {
  params: { id: string };
}

export default async function ProcessoDetalhePage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/auth/login");

  const processo = await prisma.processo.findFirst({
    where: {
      id: params.id,
      empresa: { user: { email: session.user.email } },
    },
    include: {
      empresa: true,
      documentos: true,
    },
  });

  if (!processo) notFound();

  const podeEditar = ["RASCUNHO", "PENDENTE_DOCUMENTOS"].includes(processo.status);
  const checklist = documentosObrigatorios(processo.tipo);
  const validacaoEnvio = podeEnviarProcesso(processo.tipo, processo.documentos);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link
        href="/requerente"
        className="mb-4 inline-block text-sm text-emerald-700 hover:underline"
      >
        ← Meus processos
      </Link>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {LABEL_TIPO_PROCESSO[processo.tipo]}
            </h2>
            <p className="mt-1 font-mono text-xs text-gray-500">{processo.protocolo}</p>
            <p className="mt-1 text-sm text-gray-600">{processo.empresa.razaoSocial}</p>
          </div>
          <StatusProcessoBadge status={processo.status} />
        </div>
      </div>

      <section className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Documentos obrigatórios
        </h3>
        <ul className="space-y-3">
          {checklist.map((tipo) => (
            <DocumentoUpload
              key={tipo}
              processoId={processo.id}
              tipoDocumento={tipo}
              documentos={processo.documentos}
              podeEditar={podeEditar}
            />
          ))}
        </ul>
      </section>

      {podeEditar && (
        <EnviarProcessoButton
          processoId={processo.id}
          podeEnviar={validacaoEnvio.ok}
        />
      )}

      {!podeEditar && processo.status === "ENVIADO" && (
        <p className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Processo enviado. Acompanhe o status pela VISA.
        </p>
      )}
    </main>
  );
}
