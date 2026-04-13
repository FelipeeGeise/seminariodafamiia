import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

// SALVAR NOVO ANIVERSÁRIO
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const novoNiver = await prisma.aniversario.create({
      data: {
        nome: body.nome,
        dataNascimento: body.dataNascimento,
        genero: body.genero,
        nomeConjuge: body.nomeConjuge || null,
        dataNascConjuge: body.dataNascConjuge || null,
        dataCasamento: body.dataCasamento || null,
      },
    });
    return NextResponse.json(novoNiver);
  } catch {
    console.error("Erro ao salvar dados no Prisma");
    return NextResponse.json({ error: "Erro ao salvar dados" }, { status: 500 });
  }
}

// BUSCAR ANIVERSARIANTES DE HOJE
export async function GET() {
  try {
    const hoje = new Date();
    const diaHoje = String(hoje.getDate()).padStart(2, '0');
    const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
    const dataRef = `-${mesHoje}-${diaHoje}`;

    const todos = await prisma.aniversario.findMany();

    const aniversariantes = [];

    for (const p of todos) {
      // 1. Aniversário do Titular
      if (p.dataNascimento.includes(dataRef)) {
        aniversariantes.push({ 
          nome: p.nome, 
          tipo: p.genero as "homem" | "mulher",
          dataOriginal: p.dataNascimento // Enviando a data para o cálculo de idade
        });
      }
      
      // 2. Aniversário do Cônjuge
      if (p.dataNascConjuge && p.dataNascConjuge.includes(dataRef)) {
        aniversariantes.push({ 
          nome: p.nomeConjuge as string, 
          tipo: p.genero === "homem" ? "mulher" : "homem",
          dataOriginal: p.dataNascConjuge // Enviando a data para o cálculo de idade
        });
      }
      
      // 3. Aniversário de Casamento
      if (p.dataCasamento && p.dataCasamento.includes(dataRef)) {
        aniversariantes.push({ 
          nome: `${p.nome} & ${p.nomeConjuge}`, 
          tipo: "casamento" as const,
          dataOriginal: p.dataCasamento // Enviando a data para o cálculo de anos de casado
        });
      }
    }

    return NextResponse.json(aniversariantes);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}