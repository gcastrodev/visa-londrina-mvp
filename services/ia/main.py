import os
import httpx
import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="VISA Londrina – Serviço de IA",
    description="Valida documentos sanitários com OCR + IA + Java",
    version="0.1.0",
)

JAVA_SERVICE_URL = os.getenv("JAVA_SERVICE_URL", "http://localhost:8080")


class ValidacaoRequest(BaseModel):
    caminhoArquivo: str
    tipoDocumento: str


class ResultadoValidacao(BaseModel):
    valido: bool
    isUltimaVersao: Optional[bool] = None
    atividadeCompativel: Optional[bool] = None
    dataUltimaAlteracao: Optional[str] = None
    atividadeEncontrada: Optional[str] = None
    cnaeEncontrado: Optional[str] = None
    termosFarmaEncontrados: list[str] = []
    alertas: list[str] = []
    erros: list[str] = []


@app.get("/health")
async def health():
    return {"status": "ok", "servico": "ia"}


@app.post("/validar", response_model=ResultadoValidacao)
async def validar_documento(req: ValidacaoRequest):
    caminho = Path(req.caminhoArquivo)

    if not caminho.exists():
        raise HTTPException(status_code=404, detail=f"Arquivo não encontrado: {req.caminhoArquivo}")

    logger.info(f"Validando {req.tipoDocumento}: {caminho.name}")

    if req.tipoDocumento == "CONTRATO_SOCIAL":
        return await _validar_contrato_social_via_java(caminho)

    return ResultadoValidacao(
        valido=True,
        alertas=[f"Documento {req.tipoDocumento} recebido. Validação manual necessária."],
    )


async def _validar_contrato_social_via_java(caminho: Path) -> ResultadoValidacao:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            with open(caminho, "rb") as f:
                response = await client.post(
                    f"{JAVA_SERVICE_URL}/api/contrato-social/validar",
                    files={"arquivo": (caminho.name, f, "application/pdf")},
                )

        if response.status_code != 200:
            logger.error(f"Java retornou {response.status_code}: {response.text}")
            return ResultadoValidacao(
                valido=False,
                erros=[f"Serviço de validação retornou erro {response.status_code}"],
            )

        data = response.json()
        return ResultadoValidacao(**data)

    except httpx.ConnectError:
        logger.error("Não foi possível conectar ao serviço Java")
        return ResultadoValidacao(
            valido=False,
            erros=["Serviço de validação Java indisponível. Tente novamente mais tarde."],
        )
    except Exception as e:
        logger.exception(f"Erro inesperado na validação: {e}")
        return ResultadoValidacao(
            valido=False,
            erros=[f"Erro interno: {str(e)}"],
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
