import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

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
        fotoUrl: body.fotoUrl || null,
        fotoConjugeUrl: body.fotoUrlConjuge || null, // Alinhado com o frontend
        fotoCasamentoUrl: body.fotoUrlCasamento || null, // Alinhado com o frontend
      },
    });
    return NextResponse.json(novoNiver);
  } catch { // <--- SEM (error) AQUI
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

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
      if (p.dataNascimento?.includes(dataRef)) {
        aniversariantes.push({ 
          nome: p.nome, 
          tipo: p.genero, 
          dataOriginal: p.dataNascimento, 
          fotoUrl: p.fotoUrl 
        });
      }
      // 2. Aniversário do Cônjuge
      if (p.dataNascConjuge?.includes(dataRef)) {
        aniversariantes.push({ 
          nome: p.nomeConjuge, 
          tipo: p.genero === "homem" ? "mulher" : "homem", 
          dataOriginal: p.dataNascConjuge, 
          fotoUrl: p.fotoConjugeUrl 
        });
      }
      // 3. Aniversário de Casamento
      if (p.dataCasamento?.includes(dataRef)) {
        aniversariantes.push({ 
          nome: `${p.nome} & ${p.nomeConjuge}`, 
          tipo: "casamento", 
          dataOriginal: p.dataCasamento, 
          fotoUrl: p.fotoCasamentoUrl 
        });
      }
    }
    return NextResponse.json(aniversariantes);
  } catch { // <--- SEM (error) AQUI TAMBÉM
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}