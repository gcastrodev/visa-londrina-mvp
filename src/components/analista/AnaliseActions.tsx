"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StatusProcesso } from "@/types";
import { LABEL_STATUS } from "@/types";

const ACOES: { status: StatusProcesso; label: string; style: string }[] = [
  { status: "EM_ANALISE", label: "Iniciar análise", style: "border-amber-300 text-amber-800 hover:bg-amber-50" },
  { status: "APROVADO", label: "Aprovar", style: "bg-emerald-700 text-white hover:bg-emerald-800" },
  { status: "REPROVADO", label: "Reprovar", style: "bg-red-700 text-white hover:bg-red-800" },
  {
    status: "PENDENTE_DOCUMENTOS",
    label: "Solicitar documentos",
    style: "border-orange-300 text-orange-800 hover:bg-orange-50",
  },
];

interface AnaliseActionsProps {
  processoId: string;
  statusAtual: StatusProcesso;
}

export function AnaliseActions({ processoId, statusAtual }: AnaliseActionsProps) {
  const router = useRouter();
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<StatusProcesso | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const finalizado = statusAtual === "APROVADO" || statusAtual === "REPROVADO";

  async function atualizarStatus(novoStatus: StatusProcesso) {
    const labels: Partial<Record<StatusProcesso, string>> = {
      APROVADO: "aprovar",
      REPROVADO: "reprovar",
      PENDENTE_DOCUMENTOS: "solicitar documentos adicionais",
      EM_ANALISE: "iniciar a análise de",
    };

    if (
      novoStatus !== "EM_ANALISE" &&
      !confirm(`Confirma ${labels[novoStatus]} este processo?`)
    ) {
      return;
    }

    setErro(null);
    setSucesso(null);
    setCarregando(novoStatus);

    const res = await fetch(`/api/processos/${processoId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: novoStatus,
        observacoes: observacoes.trim() || undefined,
      }),
    });

    const json = await res.json();
    setCarregando(null);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao atualizar status");
      return;
    }

    setSucesso(`Status atualizado para "${LABEL_STATUS[novoStatus]}".`);
    router.refresh();
  }

  if (finalizado) {
    return (
      <p className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Este processo já foi finalizado ({LABEL_STATUS[statusAtual]}).
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h3 className="font-medium text-gray-900">Decisão do analista</h3>

      <div>
        <label htmlFor="observacoes" className="mb-1 block text-sm text-gray-600">
          Observações (opcional)
        </label>
        <textarea
          id="observacoes"
          rows={3}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Registre orientações ou motivo da decisão..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="text-sm text-emerald-700">{sucesso}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {ACOES.map((acao) => {
          if (acao.status === "EM_ANALISE" && statusAtual === "EM_ANALISE") return null;
          if (acao.status === "EM_ANALISE" && !["ENVIADO", "PENDENTE_DOCUMENTOS"].includes(statusAtual)) {
            return null;
          }

          const isPrimary = acao.status === "APROVADO" || acao.status === "REPROVADO";
          return (
            <button
              key={acao.status}
              type="button"
              disabled={!!carregando}
              onClick={() => atualizarStatus(acao.status)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium border disabled:opacity-50 ${
                isPrimary ? acao.style : `border ${acao.style}`
              }`}
            >
              {carregando === acao.status ? "Salvando..." : acao.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
