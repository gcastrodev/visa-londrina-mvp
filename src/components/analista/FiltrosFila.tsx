import Link from "next/link";
import { LABEL_STATUS, type StatusProcesso } from "@/types";

const STATUS_FILTRO: StatusProcesso[] = [
  "ENVIADO",
  "EM_ANALISE",
  "PENDENTE_DOCUMENTOS",
  "APROVADO",
  "REPROVADO",
];

interface FiltrosFilaProps {
  status?: string;
  search?: string;
  ordenar?: string;
}

export function FiltrosFila({ status, search, ordenar = "criadoEm" }: FiltrosFilaProps) {
  return (
    <form
      action="/analista"
      method="get"
      className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="search" className="mb-1 block text-xs font-medium text-gray-600">
          Buscar
        </label>
        <input
          id="search"
          name="search"
          type="search"
          defaultValue={search}
          placeholder="Protocolo, razão social ou CNPJ"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-xs font-medium text-gray-600">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-44"
        >
          <option value="">Todos</option>
          {STATUS_FILTRO.map((s) => (
            <option key={s} value={s}>
              {LABEL_STATUS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ordenar" className="mb-1 block text-xs font-medium text-gray-600">
          Ordenar
        </label>
        <select
          id="ordenar"
          name="ordenar"
          defaultValue={ordenar}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:w-40"
        >
          <option value="criadoEm">Mais recentes</option>
          <option value="prazoAnalise">Prazo de análise</option>
          <option value="riscoIA">Maior risco IA</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
      >
        Filtrar
      </button>

      {(status || search) && (
        <Link
          href="/analista"
          className="rounded-md border border-gray-300 px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-50"
        >
          Limpar
        </Link>
      )}
    </form>
  );
}
