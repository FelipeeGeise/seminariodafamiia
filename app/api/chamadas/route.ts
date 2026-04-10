import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Definimos o formato do objeto de presença que vem do front-end
interface PresencaInput {
  pessoaId: number;
  status: "presente" | "faltou";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { evento, data, lista }: { evento: string; data: string; lista: PresencaInput[] } = body;

    const novaChamada = await prisma.historicoChamada.create({
      data: {
        evento,
        data: new Date(data),
        presencas: {
          create: lista.map((p: PresencaInput) => ({
            pessoaId: p.pessoaId,
            status: p.status,
          })),
        },
      },
      include: { presencas: true }
    });

    return NextResponse.json(novaChamada, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
    return NextResponse.json({ error: "Erro ao salvar chamada" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const historico = await prisma.historicoChamada.findMany({
      include: { 
        presencas: {
          include: { pessoa: true }
        } 
      },
      orderBy: { data: 'desc' }
    });
    return NextResponse.json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json({ error: "Erro ao carregar histórico" }, { status: 500 });
  }
}