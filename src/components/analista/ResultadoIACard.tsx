import type { ResultadoValidacaoIA } from "@/types";

export function ResultadoIACard({ resultado }: { resultado: ResultadoValidacaoIA }) {
  return (
    <div className="mt-2 rounded-md bg-gray-50 p-3 text-xs text-gray-700 space-y-2">
      <p>
        <span className="font-medium">Validação IA:</span>{" "}
        {resultado.valido ? (
          <span className="text-emerald-700">Válido</span>
        ) : (
          <span className="text-red-700">Inválido</span>
        )}
      </p>

      {resultado.atividadeEncontrada && (
        <p>
          <span className="font-medium">Atividade:</span> {resultado.atividadeEncontrada}
        </p>
      )}

      {resultado.cnaeEncontrado && (
        <p>
          <span className="font-medium">CNAE:</span> {resultado.cnaeEncontrado}
        </p>
      )}

      {resultado.termosFarmaEncontrados?.length > 0 && (
        <p>
          <span className="font-medium">Termos:</span>{" "}
          {resultado.termosFarmaEncontrados.join(", ")}
        </p>
      )}

      {resultado.alertas?.length > 0 && (
        <ul className="list-inside list-disc text-amber-800">
          {resultado.alertas.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      )}

      {resultado.erros?.length > 0 && (
        <ul className="list-inside list-disc text-red-700">
          {resultado.erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
