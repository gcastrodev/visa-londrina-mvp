import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validarDocumentoComIA } from "@/lib/ia-validacao";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { TipoDocumento } from "@/types";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const MIME_ACEITOS = ["application/pdf", "image/jpeg", "image/png"];

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const bodySchema = z.object({
  tipoDocumento: z.enum([
    "CONTRATO_SOCIAL",
    "ALVARA_FUNCIONAMENTO",
    "HABILITACAO_TECNICA",
    "COMPROVANTE_ENDERECO",
    "CNPJ",
    "RG_CPF_RESPONSAVEL",
    "OUTROS",
  ]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ erro: "ID de processo inválido" }, { status: 400 });
  }

  const processo = await prisma.processo.findFirst({
    where: {
      id: params.id,
      empresa: { user: { email: session.user.email! } },
    },
  });

  if (!processo) {
    return NextResponse.json({ erro: "Processo não encontrado" }, { status: 404 });
  }

  if (!["RASCUNHO", "PENDENTE_DOCUMENTOS"].includes(processo.status)) {
    return NextResponse.json(
      { erro: "Não é possível adicionar documentos a este processo no status atual" },
      { status: 422 }
    );
  }

  const formData = await request.formData();
  const arquivo = formData.get("arquivo") as File | null;
  const tipoRaw = formData.get("tipoDocumento") as string | null;

  if (!arquivo) {
    return NextResponse.json({ erro: "Arquivo não enviado" }, { status: 400 });
  }

  const bodyParsed = bodySchema.safeParse({ tipoDocumento: tipoRaw });
  if (!bodyParsed.success) {
    return NextResponse.json(
      { erro: "Tipo de documento inválido", detalhes: bodyParsed.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  if (arquivo.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ erro: "Arquivo maior que 20MB não é permitido" }, { status: 400 });
  }

  if (!MIME_ACEITOS.includes(arquivo.type)) {
    return NextResponse.json(
      { erro: "Tipo de arquivo não aceito. Use PDF, JPEG ou PNG" },
      { status: 400 }
    );
  }

  const uploadDir = path.join(process.cwd(), "uploads", params.id);
  await mkdir(uploadDir, { recursive: true });

  const ext = arquivo.name.split(".").pop();
  const nomeUnico = `${bodyParsed.data.tipoDocumento}_${Date.now()}.${ext}`;
  const caminhoArquivo = path.join(uploadDir, nomeUnico);

  const bytes = await arquivo.arrayBuffer();
  await writeFile(caminhoArquivo, Buffer.from(bytes));

  const documento = await prisma.documento.create({
    data: {
      tipo: bodyParsed.data.tipoDocumento as TipoDocumento,
      status: "AGUARDANDO_VALIDACAO",
      nomeArquivo: arquivo.name,
      caminhoArquivo,
      tamanhoBytes: arquivo.size,
      mimeType: arquivo.type,
      processoId: params.id,
    },
  });

  void validarDocumentoComIA(documento.id, caminhoArquivo, bodyParsed.data.tipoDocumento);

  return NextResponse.json({ data: documento }, { status: 201 });
}
