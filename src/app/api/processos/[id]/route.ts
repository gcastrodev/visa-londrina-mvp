import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const paramsSchema = z.object({
  id: z.string().cuid(),
});

export async function GET(
  _request: NextRequest,
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

  const isAnalista =
    session.user.role === "ANALISTA" || session.user.role === "ADMIN";

  const processo = await prisma.processo.findFirst({
    where: isAnalista
      ? { id: params.id }
      : { id: params.id, empresa: { user: { email: session.user.email } } },
    include: {
      empresa: true,
      analista: { select: { id: true, nome: true, email: true } },
      documentos: true,
      notificacoes: { orderBy: { enviadaEm: "desc" } },
    },
  });

  if (!processo) {
    return NextResponse.json({ erro: "Processo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ data: processo });
}
