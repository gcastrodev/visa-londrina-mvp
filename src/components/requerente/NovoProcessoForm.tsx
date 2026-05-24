"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LABEL_TIPO_PROCESSO, type TipoProcesso } from "@/types";

const TIPOS = Object.keys(LABEL_TIPO_PROCESSO) as TipoProcesso[];

export function NovoProcessoForm() {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoProcesso>("LICENCA_INICIAL");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const res = await fetch("/api/processos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });

    const json = await res.json();
    setCarregando(false);

    if (!res.ok) {
      setErro(json.erro ?? "Erro ao criar processo");
      return;
    }

    router.push(`/requerente/processos/${json.data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <div>
        <label htmlFor="tipo" className="mb-1 block text-sm font-medium text-gray-700">
          Tipo de solicitação
        </label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoProcesso)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        >
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {LABEL_TIPO_PROCESSO[t]}
            </option>
          ))}
        </select>
      </div>

      {erro && (
        <p role="alert" className="text-sm text-red-600">
          {erro}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={carregando}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {carregando ? "Criando..." : "Criar processo"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
