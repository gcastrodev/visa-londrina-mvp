import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ResultadoValidacaoIA } from "@/types";

const RESULTADO_MOCK: ResultadoValidacaoIA = {
  valido: true,
  isUltimaVersao: true,
  atividadeCompativel: true,
  dataUltimaAlteracao: null,
  atividadeEncontrada: null,
  cnaeEncontrado: null,
  termosFarmaEncontrados: [],
  alertas: ["Validação simulada (IA_MOCK=true). Use serviços reais em produção."],
  erros: [],
};

export function iaMockAtivo(): boolean {
  return process.env.IA_MOCK === "true";
}

export async function validarDocumentoComIA(
  documentoId: string,
  caminhoArquivo: string,
  tipo: string
): Promise<void> {
  if (iaMockAtivo()) {
    await prisma.documento.update({
      where: { id: documentoId },
      data: {
        status: "VALIDO",
        resultadoIA: RESULTADO_MOCK as unknown as Prisma.InputJsonValue,
      },
    });
    return;
  }

  try {
    const iaUrl = process.env.IA_SERVICE_URL ?? "http://localhost:8000";
    const res = await fetch(`${iaUrl}/validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caminhoArquivo, tipoDocumento: tipo }),
    });

    if (!res.ok) throw new Error(`IA retornou ${res.status}`);

    const resultadoIA = (await res.json()) as ResultadoValidacaoIA;
    const statusDocumento = resultadoIA.valido ? "VALIDO" : "INVALIDO";

    await prisma.documento.update({
      where: { id: documentoId },
      data: {
        status: statusDocumento,
        resultadoIA: resultadoIA as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (err) {
    console.error("[IA Validation] Erro:", err);
    await prisma.documento.update({
      where: { id: documentoId },
      data: { status: "PENDENTE" },
    });
  }
}
