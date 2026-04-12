"use client";

import { useState } from "react";
import { useApp } from "../context/AppContext";
import styles from "./cadastro.module.css";

export default function Cadastro() {
  const { pessoas, setPessoas } = useApp();

  const [nome, setNome] = useState("");
  const [obreiro, setObreiro] = useState("");
  const [lideranca, setLideranca] = useState("");
  const [membro, setMembro] = useState(false);
  const [casalArticulador, setCasalArticulador] = useState(false);
  const [congregacao, setCongregacao] = useState("");

  // ESTADOS DO MODAL
  const [showModal, setShowModal] = useState(false);
  const [senhaAdmin, setSenhaAdmin] = useState("");

  // FUNÇÃO QUE ABRE O MODAL
  const abrirModalConfirmacao = () => {
    if (!nome) return alert("Digite o nome");
    setShowModal(true);
  };

  const handleCadastro = async () => {
    // SENHA DEFINIDA (Altere para a senha que desejar)
    const SENHA_CORRETA = "seminario"; 

    if (senhaAdmin !== SENHA_CORRETA) {
      return alert("Senha administrativa incorreta!");
    }

    const novaPessoa = {
      nome,
      obreiro: obreiro || "",
      lideranca: lideranca || "",
      membro,
      casalArticulador,
      congregacao: congregacao || "Sede",
    };

    try {
      const response = await fetch("/api/participantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaPessoa),
      });

      if (!response.ok) throw new Error("Erro ao salvar no banco");

      const pessoaSalva = await response.json();

      setPessoas([...pessoas, pessoaSalva]);

      // LIMPA TUDO E FECHA MODAL
      setNome("");
      setObreiro("");
      setLideranca("");
      setMembro(false);
      setCasalArticulador(false);
      setCongregacao("");
      setSenhaAdmin("");
      setShowModal(false);

      alert("Cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao conectar com o banco.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Cadastro dos Casais</h1>
      <div className={styles.form}>
        <label className={styles.label}>Nome Completo</label>
        <input className={styles.input} type="text" value={nome} onChange={(e) => setNome(e.target.value)} />

        <label className={styles.label}>Obreiros</label>
        <select className={styles.select} value={obreiro} onChange={(e) => setObreiro(e.target.value)}>
          <option value="">Selecione</option>
          <option>Pastor</option>
          <option>Evangelista</option>
          <option>Presbítero</option>
          <option>Diácono</option>
          <option>Auxiliar Oficial</option>
          <option>Auxiliar Local</option>
          <option>Cooperador</option>
        </select>

        <label className={styles.label}>Liderança</label>
        <select className={styles.select} value={lideranca} onChange={(e) => setLideranca(e.target.value)}>
          <option value="">Selecione</option>
          <option>Direção de Comissão</option>
          <option>Direção de Proati</option>
          <option>Direção de Campanha Evangelizadora</option>
          <option>Direção de Conjunto Musical</option>
          <option>Direção de Vocal</option>
          <option>Direção de União</option>
          <option>Direção do COI</option>
          <option>Direção de Grupo Jovem</option>
        </select>

        <label className={styles.label}>Congregação</label>
        <select className={styles.select} value={congregacao} onChange={(e) => setCongregacao(e.target.value)}>
          <option value="">Selecione</option>
          <option>Candelária 01</option>
          <option>Candelária 02</option>
          <option>Candelária 03</option>
          <option>Novo Horizonte</option>
          <option>Terminal Barra de Jangada</option>
          <option>Sítio do Fogo</option>
          <option>Sítio Barra de Jangada</option>
          <option>Jardim Feliz</option>
          <option>Rua Arapoti</option>
          <option>Guaiamum</option>
          <option>Barra de Jangada Celpe</option>
        </select>

        <div className={styles.checkbox}>
          <label><input type="checkbox" checked={membro} onChange={() => setMembro(!membro)} /> Membro da IEADPE</label>
          <label><input type="checkbox" checked={casalArticulador} onChange={() => setCasalArticulador(!casalArticulador)} /> Casal Articulador</label>
        </div>

        {/* BOTÃO CHAMA O MODAL PRIMEIRO */}
        <button className={styles.button} onClick={abrirModalConfirmacao}>Cadastrar</button>
      </div>

      {/* MODAL DE SENHA */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Acesso Restrito</h3>
            <p>Digite a senha para autorizar o cadastro de <strong>{nome}</strong></p>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Senha do Administrador"
              value={senhaAdmin}
              onChange={(e) => setSenhaAdmin(e.target.value)}
              autoFocus
            />
            <div className={styles.modalButtons}>
              <button className={styles.btnCancel} onClick={() => setShowModal(false)}>Cancelar</button>
              <button className={styles.btnConfirm} onClick={handleCadastro}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}