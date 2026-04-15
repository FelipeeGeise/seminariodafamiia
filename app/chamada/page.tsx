"use client";

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import styles from "./chamada.module.css";

// DEFINIÇÃO DE TIPO PARA O VERCEL NÃO RECLAMAR
interface Participante {
  id: number;
  nome: string;
  obreiro?: string;
  lideranca?: string;
  congregacao?: string; // Adicionado aqui para o TS reconhecer no card
}

export default function Chamadas() {
  const { pessoas, setPessoas, presencas, setPresencas, carregarDados } = useApp();
  
  const [evento, setEvento] = useState("");
  const [data, setData] = useState("");
  const [listaAberta, setListaAberta] = useState(false);

  // Estados para Modal de Exclusão
  const [modalAberto, setModalAberto] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  
  // Estado para Modal de Finalização
  const [modalFinalizarAberto, setModalFinalizarAberto] = useState(false);
  
  const [senha, setSenha] = useState("");
  const SENHA_ADMIN = "seminario";

  // --- CARREGA OS PARTICIPANTES ---
  useEffect(() => {
    async function carregarPessoas() {
      try {
        const response = await fetch("/api/participantes");
        if (response.ok) {
          const dados = await response.json();
          setPessoas(dados);
        }
      } catch (err) {
        console.error("Erro ao carregar lista:", err);
      }
    }
    carregarPessoas();
  }, [setPessoas]);

  const selecionarEvento = (nomeEvento: string) => setEvento(nomeEvento);

  const marcar = (id: number, status: "presente" | "faltou") => {
    const existe = presencas.find(p => p.pessoaId === id);
    if (!existe) {
      setPresencas([...presencas, { pessoaId: id, status }]);
    } else {
      setPresencas(presencas.map(p => p.pessoaId === id ? { ...p, status } : p));
    }
  };

  // --- LÓGICA DE EXCLUSÃO ---
  const abrirConfirmacao = (id: number) => {
    setIdParaExcluir(id);
    setModalAberto(true);
  };

  const confirmarExclusao = async () => {
    if (senha === SENHA_ADMIN) {
      if (idParaExcluir !== null) {
        try {
          const response = await fetch(`/api/participantes?id=${idParaExcluir}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Falha na exclusão");

          // CORREÇÃO: Usando a interface para o filtro de exclusão
          setPessoas(pessoas.filter((p: Participante) => p.id !== idParaExcluir));
          setPresencas(presencas.filter(p => p.pessoaId !== idParaExcluir));
          alert("Excluído com sucesso!");
        } catch (err) {
          console.error("Erro na exclusão:", err);
          alert("Erro ao excluir registro.");
        }
      }
      fecharModais();
    } else {
      alert("Senha incorreta!");
    }
  };

  // --- LÓGICA DE FINALIZAÇÃO ---
  const abrirFinalizacao = () => {
    if (!evento || !data) return alert("Selecione evento e data!");
    setModalFinalizarAberto(true);
  };

  const executarFinalizacao = async () => {
    if (senha !== SENHA_ADMIN) {
      alert("Senha incorreta!");
      return;
    }

    const listaCompleta = pessoas.map((p: Participante) => {
      const registro = presencas.find(pr => pr.pessoaId === p.id);
      return {
        pessoaId: p.id,
        status: registro ? registro.status : "faltou"
      };
    });

    try {
      const response = await fetch("/api/chamadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento, data, lista: listaCompleta }),
      });

      if (!response.ok) throw new Error("Erro ao salvar chamada");

      if (carregarDados) await carregarDados();
      
      setPresencas([]);
      setEvento("");
      setData("");
      setListaAberta(false);
      fecharModais();
      alert("Chamada finalizada com sucesso!");
    } catch (err) {
      console.error("Erro ao finalizar:", err);
      alert("Erro ao conectar com o banco de dados.");
    }
  };

  const fecharModais = () => {
    setModalAberto(false);
    setModalFinalizarAberto(false);
    setIdParaExcluir(null);
    setSenha("");
  };

  return (
    <div className={styles.container}>
      {/* MODAL DE EXCLUSÃO */}
      {modalAberto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirmar Exclusão</h3>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="Senha Admin" 
              className={styles.inputSenha} 
            />
            <button onClick={confirmarExclusao} className={styles.btnConfirmar}>Excluir</button>
            <button onClick={fecharModais} className={styles.btnCancelar}>Cancelar</button>
          </div>
        </div>
      )}

      {/* MODAL DE FINALIZAR CHAMADA */}
      {modalFinalizarAberto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirmar Chamada</h3>
            <p>Digite a senha para salvar a chamada de {evento}.</p>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="Senha Admin" 
              className={styles.inputSenha} 
            />
            <button onClick={executarFinalizacao} className={styles.btnConfirmar}>Confirmar</button>
            <button onClick={fecharModais} className={styles.btnCancelar}>Cancelar</button>
          </div>
        </div>
      )}

      {/* CONFIGURAÇÃO DO EVENTO */}
      <div className={styles.eventos}>
        <h2>Configurar Evento</h2>
        <div className={styles.botoes}>
          {["Ensaio", "Culto de Casais", "Seminário"].map(ev => (
            <button 
              key={ev} 
              className={`${styles.botaoEvento} ${evento === ev ? styles.selecionado : ""}`} 
              onClick={() => selecionarEvento(ev)}
            >
              {ev}
            </button>
          ))}
        </div>
        <input 
          type="date" 
          className={styles.inputData} 
          value={data} 
          onChange={e => setData(e.target.value)} 
        />
      </div>

      <div className={styles.wrapperLista}>
        <div 
          className={styles.headerAcordeon} 
          onClick={() => setListaAberta(!listaAberta)}
          style={{ 
            cursor: 'pointer', 
            padding: '15px', 
            background: 'var(--secondary-bg)', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}
        >
          <strong>{listaAberta ? "🔼 Fechar Lista" : "🔽 Abrir Lista de Chamada"}</strong>
          <span>{pessoas.length} Pessoas</span>
        </div>

        {listaAberta && (
          <div className={styles.corpoAcordeon}>
            {pessoas.length === 0 && <p style={{textAlign: 'center'}}>Nenhum cadastro encontrado.</p>}
            
            {pessoas.map((p: Participante) => { 
              const status = presencas.find(pr => pr.pessoaId === p.id)?.status;
              return (
                <div key={p.id} className={`${styles.card} ${status ? styles[status] : ""}`}>
                  <div className={styles.info}>
                    <strong>{p.nome}</strong>
                    {/* EXIBINDO A CONGREGAÇÃO NO CARD */}
                    <p style={{ color: "#06f7f3", fontWeight: "bold", fontSize: "0.85em", margin: "4px 0" }}>
                       {p.congregacao || "Sede"}
                    </p>
                    <p>{p.obreiro || "Membro"} | {p.lideranca || "Sem Função"}</p>
                  </div>
                  <div className={styles.checks}>
                    <button 
                      className={`${styles.btnCheck} ${status === "presente" ? styles.ativoP : ""}`}
                      onClick={() => marcar(p.id, "presente")}
                      type="button"
                    > P </button>
                    
                    <button 
                      className={`${styles.btnCheck} ${status === "faltou" ? styles.ativoF : ""}`}
                      onClick={() => marcar(p.id, "faltou")}
                      type="button"
                    > F </button>
                    
                    <button className={styles.excluir} onClick={() => abrirConfirmacao(p.id)}>🗑️</button>
                  </div>
                </div>
              );
            })}
            
          </div>
        )}
      </div>

      <button className={styles.buttonFinalizar} onClick={abrirFinalizacao}>
        Finalizar Chamada
      </button>
    </div>
  );
}