"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusDocumentoBadge } from "@/components/StatusBadge";
import type { StatusDocumento, TipoDocumento } from "@/types";
import { LABEL_TIPO_DOCUMENTO } from "@/types";

interface DocumentoExistente {
  id: string;
  tipo: TipoDocumento;
  status: StatusDocumento;
  nomeArquivo: string;
}

interface DocumentoUploadProps {
  processoId: string;
  tipoDocumento: TipoDocumento;
  documentos: DocumentoExistente[];
  podeEditar: boolean;
}

export function DocumentoUpload({
  processoId,
  tipoDocumento,
  documentos,
  podeEditar,
}: DocumentoUploadProps) {
  const router = useRouter();
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const docsDoTipo = documentos.filter((d) => d.tipo === tipoDocumento);
  const ultimo = docsDoTipo[docsDoTipo.length - 1];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!arquivo) return;

    setErro(null);
    setCarregando(true);

    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("tipoDocumento", tipoDocumento);

    const res = await fetch(`/api/processos/${processoId}/documentos`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao enviar arquivo");
      return;
    }

    setArquivo(null);
    router.refresh();
  }

  return (
    <li className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{LABEL_TIPO_DOCUMENTO[tipoDocumento]}</p>
          {ultimo && (
            <p className="mt-1 text-xs text-gray-500 truncate max-w-xs">{ultimo.nomeArquivo}</p>
          )}
        </div>
        {ultimo ? (
          <StatusDocumentoBadge status={ultimo.status} />
        ) : (
          <span className="text-xs text-gray-400">Não enviado</span>
        )}
      </div>

      {podeEditar && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-800"
          />
          <button
            type="submit"
            disabled={!arquivo || carregando}
            className="shrink-0 rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {carregando ? "Enviando..." : ultimo ? "Substituir" : "Enviar"}
          </button>
        </form>
      )}

      {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
    </li>
  );
}
