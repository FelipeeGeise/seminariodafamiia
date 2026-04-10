import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Busca todos os casais cadastrados
    // Incluímos a formatação da data de cadastro para evitar erros de fuso horário no front
    const pessoasBrutas = await prisma.pessoa.findMany({
      orderBy: { nome: 'asc' }
    });

    const pessoasFormatadas = pessoasBrutas.map(p => ({
      ...p,
      // Garante que a data de cadastro seja apenas YYYY-MM-DD para o JS comparar certo
      dataCadastro: p.dataCadastro.toISOString().split('T')[0]
    }));

    // 2. Busca todo o histórico de chamadas
    const chamadas = await prisma.historicoChamada.findMany({
      include: {
        presencas: true, 
      },
      orderBy: { data: 'desc' }
    });

    // 3. Formata o histórico exatamente como o Dashboard espera (usando 'lista')
    // Dentro da sua API (GET)
const historicoFormatado = chamadas.map(chamada => ({
  id: chamada.id,
  evento: chamada.evento,
  data: chamada.data.toISOString().split('T')[0],
  // Filtramos a lista para incluir apenas presenças de IDs que estão na lista de pessoas atual
  lista: chamada.presencas
    .filter(p => pessoasBrutas.some(pessoa => pessoa.id === p.pessoaId)) 
    .map(p => ({
      pessoaId: p.pessoaId,
      status: p.status
    }))
})).filter(h => h.lista.length > 0); // Remove o evento do histórico se não sobrar ninguém nele

    // 4. RETORNO CORRIGIDO
    // Para o seu Dashboard não ficar em 0%, precisamos enviar os dados 
    // de forma que o seu Contexto (AppContext) saiba onde colocar cada lista.
    return NextResponse.json({
      pessoas: pessoasFormatadas,
      historico: historicoFormatado
    });

  } catch (error) {
    console.error("Erro ao carregar dados do Dashboard:", error);
    return NextResponse.json({ error: "Erro ao carregar estatísticas" }, { status: 500 });
  }
}