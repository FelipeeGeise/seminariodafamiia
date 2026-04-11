import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Pessoa } from '@prisma/client';

export async function GET() {
  try {
    const pessoasBrutas: Pessoa[] = await prisma.pessoa.findMany({
      orderBy: { nome: 'asc' }
    });

    const pessoasFormatadas = pessoasBrutas.map((p) => ({
      ...p,
      dataCadastro: p.dataCadastro.toISOString().split('T')[0]
    }));

    const chamadas = await prisma.historicoChamada.findMany({
      include: {
        presencas: true
      },
      orderBy: { data: 'desc' }
    });

    const historicoFormatado = chamadas
      .map((chamada) => ({
        id: chamada.id,
        evento: chamada.evento,
        data: chamada.data.toISOString().split('T')[0],

        lista: chamada.presencas
          .filter((p) =>
            pessoasBrutas.some(
              (pessoa) => pessoa.id === p.pessoaId
            )
          )
          .map((p) => ({
            pessoaId: p.pessoaId,
            status: p.status
          }))
      }))
      .filter((h) => h.lista.length > 0);

    return NextResponse.json({
      pessoas: pessoasFormatadas,
      historico: historicoFormatado
    });

  } catch (error) {
    console.error('Erro ao carregar dados do Dashboard:', error);

    return NextResponse.json(
      { error: 'Erro ao carregar estatísticas' },
      { status: 500 }
    );
  }
}