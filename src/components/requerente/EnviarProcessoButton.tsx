"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EnviarProcessoButtonProps {
  processoId: string;
  podeEnviar: boolean;
}

export function EnviarProcessoButton({ processoId, podeEnviar }: EnviarProcessoButtonProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [detalhes, setDetalhes] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  async function handleEnviar() {
    if (!confirm("Confirma o envio do processo para análise da VISA?")) return;

    setErro(null);
    setDetalhes([]);
    setCarregando(true);

    const res = await fetch(`/api/processos/${processoId}/enviar`, {
      method: "POST",
    });

    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Não foi possível enviar");
      setDetalhes(json.detalhes ?? []);
      return;
    }

    setSucesso(true);
    router.refresh();
  }

  if (sucesso) {
    return (
      <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Processo enviado com sucesso. Aguarde a análise da VISA.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="font-medium text-gray-900">Enviar para análise</h3>
      <p className="mt-1 text-sm text-gray-600">
        Envie todos os documentos obrigatórios antes de submeter o processo.
      </p>

      {erro && (
        <div role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{erro}</p>
          {detalhes.length > 0 && (
            <ul className="mt-2 list-inside list-disc">
              {detalhes.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleEnviar}
        disabled={!podeEnviar || carregando}
        className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {carregando ? "Enviando..." : "Enviar processo"}
      </button>
    </div>
  );
}
