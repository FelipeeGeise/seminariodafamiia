import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// LISTAR PESSOAS
export async function GET() {
  try {
    const participantes = await prisma.pessoa.findMany({
      orderBy: { nome: 'asc' }
    });
    return NextResponse.json(participantes);
  } catch (error) {
    // CORREÇÃO: Registra o erro no log do servidor para não ficar variável morta
    console.error("Erro no GET /api/participantes:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}

// CADASTRAR PESSOA (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const novoParticipante = await prisma.pessoa.create({
      data: {
        nome: body.nome,
        obreiro: body.obreiro,
        lideranca: body.lideranca,
        membro: body.membro,
        casalArticulador: body.casalArticulador,
        congregacao: body.congregacao,
      },
    });
    return NextResponse.json(novoParticipante, { status: 201 });
  } catch (error) {
    console.error("Erro no POST /api/participantes:", error);
    return NextResponse.json({ error: "Erro ao salvar no banco" }, { status: 500 });
  }
}

// EXCLUIR PESSOA
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    await prisma.pessoa.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ message: "Excluído com sucesso" });
  } catch (error) {
    console.error("Erro no DELETE /api/participantes:", error);
    return NextResponse.json({ error: "Erro ao excluir" }, { status: 500 });
  }
}