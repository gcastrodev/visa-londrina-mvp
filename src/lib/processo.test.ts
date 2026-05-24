import { describe, expect, it } from "vitest";
import {
  documentosObrigatorios,
  podeEnviarProcesso,
  type DocumentoResumo,
} from "./processo";

function doc(tipo: DocumentoResumo["tipo"], status: DocumentoResumo["status"]): DocumentoResumo {
  return { tipo, status };
}

describe("documentosObrigatorios", () => {
  it("retorna checklist de licença inicial", () => {
    expect(documentosObrigatorios("LICENCA_INICIAL")).toEqual([
      "CONTRATO_SOCIAL",
      "CNPJ",
      "HABILITACAO_TECNICA",
      "COMPROVANTE_ENDERECO",
      "RG_CPF_RESPONSAVEL",
    ]);
  });

  it("retorna checklist menor para renovação", () => {
    expect(documentosObrigatorios("RENOVACAO")).toHaveLength(3);
  });
});

describe("podeEnviarProcesso", () => {
  it("permite envio quando todos os obrigatórios estão válidos", () => {
    const documentos = documentosObrigatorios("RENOVACAO").map((tipo) =>
      doc(tipo, "VALIDO")
    );

    expect(podeEnviarProcesso("RENOVACAO", documentos)).toEqual({ ok: true });
  });

  it("bloqueia quando falta documento obrigatório", () => {
    const result = podeEnviarProcesso("RENOVACAO", [
      doc("CONTRATO_SOCIAL", "VALIDO"),
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.erros.some((e) => e.includes("Falta enviar"))).toBe(true);
    }
  });

  it("bloqueia documento inválido", () => {
    const documentos = documentosObrigatorios("RENOVACAO").map((tipo) =>
      doc(tipo, tipo === "CONTRATO_SOCIAL" ? "INVALIDO" : "VALIDO")
    );

    const result = podeEnviarProcesso("RENOVACAO", documentos);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.erros).toContain("Documento inválido: Contrato Social");
    }
  });

  it("bloqueia documento aguardando validação", () => {
    const documentos = documentosObrigatorios("RENOVACAO").map((tipo) =>
      doc(tipo, tipo === "ALVARA_FUNCIONAMENTO" ? "AGUARDANDO_VALIDACAO" : "VALIDO")
    );

    const result = podeEnviarProcesso("RENOVACAO", documentos);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.erros).toContain(
        "Documento pendente de validação: Alvará de Funcionamento"
      );
    }
  });

  it("aceita substituição quando existe versão válida mais recente", () => {
    const result = podeEnviarProcesso("ALTERACAO_ATIVIDADE", [
      doc("CONTRATO_SOCIAL", "INVALIDO"),
      doc("CONTRATO_SOCIAL", "VALIDO"),
      doc("CNPJ", "VALIDO"),
    ]);

    expect(result).toEqual({ ok: true });
  });
});
