import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { podeEnviarProcesso } from "@/lib/processo";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  if (session.user.role !== "REQUERENTE") {
    return NextResponse.json({ erro: "Permissão negada" }, { status: 403 });
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
    include: { documentos: true },
  });

  if (!processo) {
    return NextResponse.json({ erro: "Processo não encontrado" }, { status: 404 });
  }

  if (!["RASCUNHO", "PENDENTE_DOCUMENTOS"].includes(processo.status)) {
    return NextResponse.json(
      { erro: "Este processo não pode ser enviado no status atual" },
      { status: 422 }
    );
  }

  const validacao = podeEnviarProcesso(processo.tipo, processo.documentos);
  if (!validacao.ok) {
    return NextResponse.json(
      {
        erro: "Checklist incompleto ou documentos pendentes de validação",
        detalhes: validacao.erros,
      },
      { status: 422 }
    );
  }

  const updated = await prisma.processo.update({
    where: { id: params.id },
    data: { status: "ENVIADO" },
    include: {
      empresa: true,
      documentos: true,
    },
  });

  return NextResponse.json({
    data: updated,
    message: "Processo enviado com sucesso",
  });
}
