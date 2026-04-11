"use client";

import { useState, useMemo, useCallback } from "react";
import { useApp, type Pessoa } from "../context/AppContext";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const { pessoas, historico } = useApp();

  // Estados dos Filtros
  const [filtroObreiro, setFiltroObreiro] = useState("");
  const [filtroLideranca, setFiltroLideranca] = useState("");
  const [filtroMembro, setFiltroMembro] = useState(false);
  const [filtroCasal, setFiltroCasal] = useState(false);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroData, setFiltroData] = useState("");

  const [mostrarStatus, setMostrarStatus] = useState(false);

  // 1. FILTRAGEM DE PESSOAS (Base para o Dashboard)
  const pessoasFiltradas = useMemo(() => {
    return pessoas.filter(p => {
      if (filtroObreiro && p.obreiro !== filtroObreiro) return false;
      if (filtroLideranca && p.lideranca !== filtroLideranca) return false;
      if (filtroMembro && !p.membro) return false;
      if (filtroCasal && !p.casalArticulador) return false;
      return true;
    });
  }, [pessoas, filtroObreiro, filtroLideranca, filtroMembro, filtroCasal]);

  // 2. CÁLCULO DE PRESENÇA REATIVA
  const calcularPresencaReativa = useCallback(
    (p: Pessoa) => {
      const dataCadastro = new Date(p.dataCadastro);
      dataCadastro.setHours(0, 0, 0, 0);

      let eventosAlvo = historico.filter(h => {
        const dataEvento = new Date(h.data);
        dataEvento.setHours(0, 0, 0, 0);
        return dataEvento.getTime() >= dataCadastro.getTime();
      });

      if (filtroEvento) eventosAlvo = eventosAlvo.filter(h => h.evento === filtroEvento);
      if (filtroData) eventosAlvo = eventosAlvo.filter(h => h.data === filtroData);

      if (eventosAlvo.length === 0) return 0;

      const totalPresente = eventosAlvo.filter(h =>
        h.lista?.some(l => l.pessoaId === p.id && l.status === "presente")
      ).length;

      return Math.round((totalPresente / eventosAlvo.length) * 100);
    },
    [historico, filtroEvento, filtroData]
  );

  // 3. TOTALIZADORES (Só conta eventos que tenham pessoas que ainda existem no sistema)
  const eventosFiltradosCount = useMemo(() => {
    return historico.filter(h => {
      const bateEvento = filtroEvento ? h.evento === filtroEvento : true;
      const bateData = filtroData ? h.data === filtroData : true;
      const temPessoaAtiva = h.lista?.some(l => pessoas.some(p => p.id === l.pessoaId));
      return bateEvento && bateData && temPessoaAtiva;
    }).length;
  }, [historico, filtroEvento, filtroData, pessoas]);

  const presentesNaData = useMemo(() => {
    if (!filtroData) return "Selecione uma data";
    const diaAlvo = historico.find(h => h.data === filtroData);
    if (!diaAlvo) return 0;

    return diaAlvo.lista?.filter(l =>
      l.status === "presente" &&
      pessoasFiltradas.some(pf => pf.id === l.pessoaId)
    ).length || 0;
  }, [historico, filtroData, pessoasFiltradas]);

  // 4. MÉDIAS POR CATEGORIA (CORREÇÃO DE SEGREGRAÇÃO)
  const mediasPorCategoria = useMemo(() => {
    const obterMedia = (lista: Pessoa[]) => {
      if (lista.length === 0) return 0;
      const soma = lista.reduce((acc, p) => acc + calcularPresencaReativa(p), 0);
      return Math.round(soma / lista.length);
    };

    return {
      // Só entra se tiver cargo de obreiro preenchido
      obreiros: obterMedia(pessoasFiltradas.filter(p => p.obreiro && p.obreiro !== "")),
      // Só entra se tiver cargo de liderança preenchido
      liderancas: obterMedia(
        pessoasFiltradas.filter(p => p.lideranca && p.lideranca.trim() !== "")
      ),
      // Só entra se o campo booleano 'membro' for estritamente verdadeiro
      membros: obterMedia(pessoasFiltradas.filter(p => p.membro === true)),
      // Só entra se o campo booleano 'casalArticulador' for estritamente verdadeiro
      casais: obterMedia(pessoasFiltradas.filter(p => p.casalArticulador === true)),
    };
  }, [pessoasFiltradas, calcularPresencaReativa]);

  const porcentagemGeral = useMemo(() => {
    if (pessoasFiltradas.length === 0) return 0;
    const soma = Array.from(pessoasFiltradas).reduce((acc, p) => acc + calcularPresencaReativa(p), 0);
    return Math.round(soma / pessoasFiltradas.length);
  }, [pessoasFiltradas, calcularPresencaReativa]);

  // 5. REGRAS DE CORES
  const corBarra = (valor: number) => {
    if (valor <= 39) return styles.vermelho;
    if (valor <= 59) return styles.amarelo;
    return styles.verde;
  };

  const corTexto = (valor: number) => {
    if (valor <= 39) return "#dc2626";
    if (valor <= 59) return "#f59e0b";
    return "#16a34a";
  };

  return (
    <div className={styles.container}>
      {/* FILTROS */}
      <div className={styles.filtros}>
        <h2 className={styles.titulo}>Filtros</h2>
        <div className={styles.filtroLinha}>
          <select className={styles.input} value={filtroObreiro} onChange={e => setFiltroObreiro(e.target.value)}>
            <option value="">Todos os Obreiros</option>
            <option>Pastor</option>
            <option>Evangelista</option>
            <option>Presbítero</option>
            <option>Diácono</option>
            <option>Auxiliar de Trabalho</option>
            <option>Cooperador</option>
          </select>

          <select className={styles.input} value={filtroLideranca} onChange={e => setFiltroLideranca(e.target.value)}>
            <option value="">Todas as Lideranças</option>
            <option>Direção de Comissão</option>
            <option>Direção de Proati</option>
            <option>Direção de Campanha Evangelizadora</option>
            <option>Direção de Conjunto Musical</option>
            <option>Direção de Vocal</option>
            <option>Direção de União</option>
            <option>Direção do COI</option>
            <option>Direção de Grupo Jovem</option>
          </select>

          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={filtroMembro} onChange={() => setFiltroMembro(!filtroMembro)} /> Membro
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={filtroCasal} onChange={() => setFiltroCasal(!filtroCasal)} /> Casal
          </label>

          <select className={styles.input} value={filtroEvento} onChange={e => setFiltroEvento(e.target.value)}>
            <option value="">Todos os Eventos</option>
            <option>Ensaio</option>
            <option>Culto de Casais</option>
            <option>Seminário</option>
          </select>
          <input className={styles.input} type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} />
        </div>
      </div>

      {/* PRESENÇA POR CATEGORIA */}
      <div className={styles.resumoCategoria}>
        <h2 className={styles.titulo}>Presença por Categoria</h2>
        <div className={styles.resumoGrid}>
          {[
            { label: "Obreiros", valor: mediasPorCategoria.obreiros },
            { label: "Lideranças", valor: mediasPorCategoria.liderancas },
            { label: "Membros IEADPE", valor: mediasPorCategoria.membros },
            { label: "Casal Articulador", valor: mediasPorCategoria.casais }
          ].map((cat, idx) => (
            <div key={idx} className={styles.kpi}>
              <div className={styles.kpiLabel}>{cat.label}</div>
              <div className={styles.kpiValor} style={{ color: corTexto(cat.valor) }}>{cat.valor}%</div>
              <div className={styles.progressContainer}>
                <div className={`${styles.progressBar} ${corBarra(cat.valor)}`} style={{ width: `${cat.valor}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOTALIZADOR */}
      <div className={styles.resumo}>
        <h2 className={styles.titulo}>Totalizador</h2>
        <div className={styles.resumoGrid}>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Pessoas Filtradas</div><div className={styles.kpiValor}>{pessoasFiltradas.length}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Presentes na Data</div><div className={styles.kpiValor}>{presentesNaData}</div></div>
          <div className={styles.kpi}><div className={styles.kpiLabel}>Total de Eventos</div><div className={styles.kpiValor}>{eventosFiltradosCount}</div></div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Média Geral</div>
            <div className={styles.kpiValor} style={{ color: corTexto(porcentagemGeral) }}>{porcentagemGeral}%</div>
          </div>
        </div>
      </div>

      {/* STATUS INDIVIDUAL */}
      <div className={styles.listaDetalhada}>
        <h2 className={styles.titulo} onClick={() => setMostrarStatus(!mostrarStatus)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
          Status Individual {mostrarStatus ? "▲" : "▼"}
        </h2>
        {mostrarStatus && pessoasFiltradas.map(p => {
          const porcentagem = calcularPresencaReativa(p);
          return (
            <div key={p.id} className={styles.card}>
              <div className={styles.nome}>{p.nome}</div>
              <div className={styles.progressContainer}>
                <div className={`${styles.progressBar} ${corBarra(porcentagem)}`} style={{ width: `${porcentagem}%` }} />
              </div>
              <div className={styles.percentLabel}>Frequência: {porcentagem}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}