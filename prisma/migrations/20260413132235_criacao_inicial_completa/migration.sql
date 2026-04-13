-- CreateTable
CREATE TABLE "Pessoa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "obreiro" TEXT NOT NULL,
    "lideranca" TEXT NOT NULL,
    "membro" BOOLEAN NOT NULL DEFAULT true,
    "casalArticulador" BOOLEAN NOT NULL DEFAULT false,
    "congregacao" TEXT NOT NULL,
    "dataCadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoricoChamada" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evento" TEXT NOT NULL,

    CONSTRAINT "HistoricoChamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presenca" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "pessoaId" INTEGER NOT NULL,
    "historicoId" TEXT NOT NULL,

    CONSTRAINT "Presenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "imagem" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#000000',
    "bg" TEXT NOT NULL DEFAULT '#ffffff',
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Aniversario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TEXT NOT NULL,
    "genero" TEXT NOT NULL,
    "nomeConjuge" TEXT,
    "dataNascConjuge" TEXT,
    "dataCasamento" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aniversario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_historicoId_fkey" FOREIGN KEY ("historicoId") REFERENCES "HistoricoChamada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presenca" ADD CONSTRAINT "Presenca_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
