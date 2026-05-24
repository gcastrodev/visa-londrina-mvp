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

    if (docsDoTipo.length === 0) {
      erros.push(`Falta enviar: ${LABEL_TIPO_DOCUMENTO[tipoDoc]}`);
      continue;
    }

    const temInvalido = docsDoTipo.some((d) => d.status === "INVALIDO");

    if (temInvalido) {
      erros.push(`Documento inválido: ${LABEL_TIPO_DOCUMENTO[tipoDoc]}`);
    }
  }

  if (erros.length > 0) return { ok: false, erros };
  return { ok: true };
}
