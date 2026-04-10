import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Certifique-se que o caminho está correto

export async function GET() {
  try {
    const avisos = await prisma.aviso.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(avisos, { status: 200 });
  } catch (err) {
    // Usando 'err' para logar o erro no servidor e limpar o aviso do ESLint
    console.error("Erro ao buscar avisos no Prisma:", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar avisos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { texto, imagem, cor, bg, data } = body;

    if (!texto) {
      return NextResponse.json(
        { error: "O campo texto é obrigatório" },
        { status: 400 }
      );
    }

    const novoAviso = await prisma.aviso.create({
      data: {
        texto,
        imagem: imagem || "",
        cor: cor || "#000000",
        bg: bg || "#ffffff",
        data: data || new Date().toLocaleString("pt-BR"),
      },
    });

    return NextResponse.json(novoAviso, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar aviso no Prisma:", err);
    return NextResponse.json(
      { error: "Erro ao salvar o comunicado" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "O ID do aviso é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.aviso.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Aviso removido com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir aviso no Prisma:", err);
    return NextResponse.json(
      { error: "Não foi possível excluir o aviso" },
      { status: 500 }
    );
  }
}