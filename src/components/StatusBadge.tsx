import type { StatusDocumento, StatusProcesso } from "@/types";
import { LABEL_STATUS, LABEL_STATUS_DOCUMENTO } from "@/types";

const STATUS_PROCESSO_STYLES: Record<StatusProcesso, string> = {
  RASCUNHO: "bg-gray-100 text-gray-700",
  ENVIADO: "bg-blue-100 text-blue-800",
  EM_ANALISE: "bg-amber-100 text-amber-800",
  PENDENTE_DOCUMENTOS: "bg-orange-100 text-orange-800",
  APROVADO: "bg-emerald-100 text-emerald-800",
  REPROVADO: "bg-red-100 text-red-800",
};

const STATUS_DOC_STYLES: Record<StatusDocumento, string> = {
  PENDENTE: "bg-gray-100 text-gray-600",
  AGUARDANDO_VALIDACAO: "bg-amber-100 text-amber-800",
  VALIDO: "bg-emerald-100 text-emerald-800",
  INVALIDO: "bg-red-100 text-red-800",
  EXPIRADO: "bg-orange-100 text-orange-800",
};

export function StatusProcessoBadge({ status }: { status: StatusProcesso }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_PROCESSO_STYLES[status]}`}
    >
      {LABEL_STATUS[status]}
    </span>
  );
}

export function StatusDocumentoBadge({ status }: { status: StatusDocumento }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_DOC_STYLES[status]}`}
    >
      {LABEL_STATUS_DOCUMENTO[status]}
    </span>
  );
}
