"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

// --- Tipos permanecem iguais ---
export type Pessoa = {
  id: number;
  nome: string;
  obreiro: string;
  lideranca: string;
  membro: boolean;
  casalArticulador: boolean;
  congregacao: string;
  dataCadastro: string; 
};

export type Presenca = {
  pessoaId: number;
  status: "presente" | "faltou";
};

export type HistoricoChamada = {
  id: string;
  data: string;
  evento: string;
  lista: Presenca[];
};

type AppContextType = {
  pessoas: Pessoa[];
  setPessoas: React.Dispatch<React.SetStateAction<Pessoa[]>>;
  presencas: Presenca[];
  setPresencas: React.Dispatch<React.SetStateAction<Presenca[]>>;
  historico: HistoricoChamada[];
  setHistorico: React.Dispatch<React.SetStateAction<HistoricoChamada[]>>;
  carregarDados: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [historico, setHistorico] = useState<HistoricoChamada[]>([]);
  const [presencas, setPresencas] = useState<Presenca[]>([]);

  // 1. Usamos useCallback para que a função não mude a cada renderização
  const carregarDados = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) throw new Error("Falha na rede");
      
      const dados = await response.json();
      
      // O React lida melhor com múltiplos sets se eles vierem de um await
      setPessoas(dados.pessoas || []);
      setHistorico(dados.historico || []);
    } catch (error) {
      console.error("Erro ao sincronizar com o banco:", error);
    }
  }, []);

  // 2. O useEffect agora chama a função de forma segura
  useEffect(() => {
    let isMounted = true; // Evita atualizar estado se o componente for desmontado

    const fetchData = async () => {
      if (isMounted) {
        await carregarDados();
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [carregarDados]);

  return (
    <AppContext.Provider value={{ 
      pessoas, 
      setPessoas, 
      presencas, 
      setPresencas, 
      historico, 
      setHistorico,
      carregarDados 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp deve ser usado dentro do AppProvider");
  return context;
};