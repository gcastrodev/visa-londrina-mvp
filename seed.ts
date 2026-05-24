// prisma/seed.ts
// Popula o banco com usuários iniciais para desenvolvimento

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Analista VISA
  const analista = await prisma.user.upsert({
    where: { email: "analista@visa.londrina.pr.gov.br" },
    update: {},
    create: {
      email: "analista@visa.londrina.pr.gov.br",
      nome: "Dr. Carlos Analista",
      senha: await hash("analista123", 10),
      role: "ANALISTA",
    },
  });
  console.log("✅ Analista criado:", analista.email);

  // Requerente (Farmácia)
  const requerente = await prisma.user.upsert({
    where: { email: "farmaciavida@exemplo.com" },
    update: {},
    create: {
      email: "farmaciavida@exemplo.com",
      nome: "Ana Paula Silva",
      senha: await hash("requerente123", 10),
      role: "REQUERENTE",
      empresa: {
        create: {
          razaoSocial: "Farmácia Vida Manipulação Ltda",
          cnpj: "12.345.678/0001-90",
          cnae: "4771-7/01",
          email: "contato@farmaciavidalondrina.com.br",
          telefone: "(43) 99999-8888",
        },
      },
    },
  });
  console.log("✅ Requerente criado:", requerente.email);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@visa.londrina.pr.gov.br" },
    update: {},
    create: {
      email: "admin@visa.londrina.pr.gov.br",
      nome: "Administrador VISA",
      senha: await hash("admin123", 10),
      role: "ADMIN",
    },
  });
  console.log("✅ Admin criado:", admin.email);

  console.log("\n🎉 Seed concluído!");
  console.log("\nCredenciais de acesso:");
  console.log("  Analista: analista@visa.londrina.pr.gov.br / analista123");
  console.log("  Requerente: farmaciavida@exemplo.com / requerente123");
  console.log("  Admin: admin@visa.londrina.pr.gov.br / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
