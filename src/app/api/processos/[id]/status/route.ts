import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

const statusSchema = z.object({
  status: z.enum([
    "RASCUNHO",
    "ENVIADO",
    "EM_ANALISE",
    "PENDENTE_DOCUMENTOS",
    "APROVADO",
    "REPROVADO",
  ]),
  observacoes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  if (session.user.role !== "ANALISTA" && session.user.role !== "ADMIN") {
    return NextResponse.json({ erro: "Permissão negada" }, { status: 403 });
  }

  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ erro: "ID de processo inválido" }, { status: 400 });
  }

  const body = statusSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { erro: "Dados inválidos", detalhes: body.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const processo = await prisma.processo.findUnique({ where: { id: params.id } });
  if (!processo) {
    return NextResponse.json({ erro: "Processo não encontrado" }, { status: 404 });
  }

  const updated = await prisma.processo.update({
    where: { id: params.id },
    data: {
      status: body.data.status,
      observacoes: body.data.observacoes,
      analistaId: session.user.id,
    },
    include: {
      empresa: true,
      analista: { select: { id: true, nome: true, email: true } },
      documentos: true,
    },
  });

  return NextResponse.json({ data: updated });
}
