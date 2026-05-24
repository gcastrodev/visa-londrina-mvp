import {
  CHECKLIST_DOCUMENTOS,
  LABEL_TIPO_DOCUMENTO,
  type StatusDocumento,
  type TipoDocumento,
  type TipoProcesso,
} from "@/types";

export interface DocumentoResumo {
  tipo: TipoDocumento;
  status: StatusDocumento;
}

export function documentosObrigatorios(tipo: TipoProcesso): TipoDocumento[] {
  return CHECKLIST_DOCUMENTOS[tipo];
}

export function podeEnviarProcesso(
  tipo: TipoProcesso,
  documentos: DocumentoResumo[]
): { ok: true } | { ok: false; erros: string[] } {
  const obrigatorios = documentosObrigatorios(tipo);
  const erros: string[] = [];

  for (const tipoDoc of obrigatorios) {
    const docsDoTipo = documentos.filter((d) => d.tipo === tipoDoc);
    const label = LABEL_TIPO_DOCUMENTO[tipoDoc];

    if (docsDoTipo.length === 0) {
      erros.push(`Falta enviar: ${label}`);
      continue;
    }

    if (docsDoTipo.some((d) => d.status === "VALIDO")) continue;

    if (docsDoTipo.some((d) => d.status === "INVALIDO")) {
      erros.push(`Documento inválido: ${label}`);
    } else {
      erros.push(`Documento pendente de validação: ${label}`);
    }
  }

  if (erros.length > 0) return { ok: false, erros };
  return { ok: true };
}
