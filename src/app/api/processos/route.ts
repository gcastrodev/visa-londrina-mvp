import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const querySchema = z.object({
  status: z.string().optional(),
  tipo: z.string().optional(),
  search: z.string().optional(),
  ordenar: z.enum(["riscoIA", "criadoEm", "prazoAnalise"]).optional().default("riscoIA"),
  page: z.coerce.number().min(1).optional().default(1),
  perPage: z.coerce.number().min(1).max(50).optional().default(20),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(searchParams));

  if (session.user.role === "REQUERENTE") {
    const empresa = await prisma.empresa.findFirst({
      where: { user: { email: session.user.email } },
    });

    if (!empresa) {
      return NextResponse.json(
        { erro: "Empresa não cadastrada. Complete seu perfil primeiro." },
        { status: 422 }
      );
    }

    const where: Record<string, unknown> = { empresaId: empresa.id };
    if (query.status) where.status = query.status;
    if (query.tipo) where.tipo = query.tipo;

    const [processos, total] = await Promise.all([
      prisma.processo.findMany({
        where,
        orderBy: { criadoEm: "desc" },
        skip: (query.page - 1) * query.perPage,
        take: query.perPage,
        include: {
          empresa: true,
          documentos: { select: { id: true, tipo: true, status: true } },
        },
      }),
      prisma.processo.count({ where }),
    ]);

    return NextResponse.json({
      data: processos,
      total,
      page: query.page,
      perPage: query.perPage,
    });
  }

  if (session.user.role !== "ANALISTA" && session.user.role !== "ADMIN") {
    return NextResponse.json({ erro: "Permissão negada" }, { status: 403 });
  }

  const where: Record<string, unknown> = {};

  if (query.status) where.status = query.status;
  if (query.tipo) where.tipo = query.tipo;
  if (query.search) {
    where.OR = [
      { protocolo: { contains: query.search, mode: "insensitive" } },
      { empresa: { razaoSocial: { contains: query.search, mode: "insensitive" } } },
      { empresa: { cnpj: { contains: query.search } } },
    ];
  }

  const orderBy: Record<string, string> = {};
  if (query.ordenar === "riscoIA") orderBy.riscoIA = "desc";
  else if (query.ordenar === "criadoEm") orderBy.criadoEm = "desc";
  else if (query.ordenar === "prazoAnalise") orderBy.prazoAnalise = "asc";

  const [processos, total] = await Promise.all([
    prisma.processo.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
      include: {
        empresa: true,
        analista: { select: { id: true, nome: true, email: true } },
        documentos: { select: { id: true, tipo: true, status: true } },
        _count: { select: { notificacoes: true } },
      },
    }),
    prisma.processo.count({ where }),
  ]);

  return NextResponse.json({
    data: processos,
    total,
    page: query.page,
    perPage: query.perPage,
  });
}

const createSchema = z.object({
  tipo: z.enum([
    "LICENCA_INICIAL",
    "RENOVACAO",
    "ALTERACAO_ATIVIDADE",
    "ALTERACAO_RESPONSAVEL",
  ]),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const empresa = await prisma.empresa.findFirst({
    where: { user: { email: session.user.email } },
  });

  if (!empresa) {
    return NextResponse.json(
      { erro: "Empresa não cadastrada. Complete seu perfil primeiro." },
      { status: 422 }
    );
  }

  const body = createSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { erro: "Dados inválidos", detalhes: body.error.issues.map((i) => i.message) },
      { status: 400 }
    );
  }

  const prazoAnalise = new Date();
  prazoAnalise.setDate(prazoAnalise.getDate() + 14);

  const processo = await prisma.processo.create({
    data: {
      tipo: body.data.tipo,
      status: "RASCUNHO",
      empresaId: empresa.id,
      prazoAnalise,
    },
    include: { empresa: true, documentos: true },
  });

  return NextResponse.json({ data: processo }, { status: 201 });
}
