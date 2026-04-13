"use client";

import Link from "next/link";
import styles from "./header.module.css";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Aniversariante {
  nome: string;
  tipo: "homem" | "mulher" | "casamento";
  dataOriginal?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // ESTADOS DE INTERFACE
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [niverOpen, setNiverOpen] = useState(false);
  const [abaNiver, setAbaNiver] = useState<"cadastrar" | "parabens">("parabens");
  const [aniversariantesHoje, setAniversariantesHoje] = useState<Aniversariante[]>([]);
  const [senha, setSenha] = useState("");
  
  // ESTADO DE SEGURANÇA PARA CADASTRO
  const [senhaCadastro, setSenhaCadastro] = useState("");
  const [acessoCadastrado, setAcessoCadastrado] = useState(false);

  // ESTADOS DO FORMULÁRIO
  const [nome, setNome] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [genero, setGenero] = useState<"homem" | "mulher">("homem");
  const [nomeConjuge, setNomeConjuge] = useState("");
  const [dataNascConjuge, setDataNascConjuge] = useState("");
  const [dataCasamento, setDataCasamento] = useState("");

  const calcularAnos = (dataString?: string) => {
    if (!dataString) return "";
    const hoje = new Date();
    const dataRef = new Date(dataString);
    let anos = hoje.getFullYear() - dataRef.getFullYear();
    const m = hoje.getMonth() - dataRef.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < dataRef.getDate())) {
      anos--;
    }
    return anos;
  };

  const buscarAniversariantes = useCallback(async () => {
    try {
      const res = await fetch("/api/aniversariantes");
      if (res.ok) {
        const dados = await res.json();
        setAniversariantesHoje(dados);
      }
    } catch (err) {
      console.error("Erro ao buscar aniversários:", err);
    }
  }, []);

  useEffect(() => {
    const carregarInicial = async () => {
      await buscarAniversariantes();
    };
    carregarInicial();
  }, [buscarAniversariantes]);

  const abrirModalNiver = () => {
    setNiverOpen(true);
    setMenuOpen(false);
    setAcessoCadastrado(false); // Reseta o acesso ao fechar/abrir
    setSenhaCadastro("");
    buscarAniversariantes();
  };

  const verificarSenhaCadastro = () => {
    if (senhaCadastro === "seminariodecasal") {
      setAcessoCadastrado(true);
    } else {
      alert("Senha incorreta!");
    }
  };

  const handleSalvar = async () => {
    if (!nome || !dataNasc) {
      return alert("Por favor, preencha ao menos o seu nome e data de nascimento.");
    }

    const payload = { nome, dataNascimento: dataNasc, genero, nomeConjuge, dataNascConjuge, dataCasamento };

    try {
      const res = await fetch("/api/aniversariantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Dados salvos com sucesso!");
        setNome(""); setDataNasc(""); setNomeConjuge(""); setDataNascConjuge(""); setDataCasamento("");
        setAbaNiver("parabens");
        setAcessoCadastrado(false);
        buscarAniversariantes();
      }
    } catch {
      alert("Erro de conexão.");
    }
  };

  const entrarAdmin = () => {
    if (senha === "seminariodecasal") {
      setAdminOpen(false); setSenha("");
      router.push("/admin");
    } else {
      alert("Senha incorreta");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.left}>
          <Image src="/ieadpe-a36.png" alt="a36" width={70} height={50} />
          <h1>Seminário da Família da Área 36</h1>
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <Link href="/" className={pathname === "/" ? styles.active : ""} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/cadastro" className={pathname === "/cadastro" ? styles.active : ""} onClick={() => setMenuOpen(false)}>Cadastro</Link>
          <Link href="/chamada" className={pathname === "/chamada" ? styles.active : ""} onClick={() => setMenuOpen(false)}>Chamada</Link>
          <Link href="/dashboard" className={pathname === "/dashboard" ? styles.active : ""} onClick={() => setMenuOpen(false)}>Dashboard</Link>
          
          <span className={styles.link} onClick={abrirModalNiver}>
            Aniversários 
            {aniversariantesHoje.length > 0 && <span className={styles.badge}>{aniversariantesHoje.length}</span>}
          </span>

          <span className={styles.link} onClick={() => { setAdminOpen(true); setMenuOpen(false); }}>
            Administrador
          </span>
        </nav>

        <div className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
          <span></span><span></span><span></span>
        </div>
      </header>

      {niverOpen && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} ${styles.modalLargo}`}>
            <div className={styles.tabs}>
              <button type="button" className={abaNiver === "parabens" ? styles.tabActive : styles.tabInativa} onClick={() => setAbaNiver("parabens")}>Parabéns 🎊</button>
              <button type="button" className={abaNiver === "cadastrar" ? styles.tabActive : styles.tabInativa} onClick={() => setAbaNiver("cadastrar")}>Cadastrar</button>
            </div>

            {abaNiver === "cadastrar" ? (
              !acessoCadastrado ? (
                /* DIV DE PROTEÇÃO POR SENHA */
                <div className={styles.formNiver} style={{ textAlign: "center", padding: "40px 20px" }}>
                  <h3>Acesso Restrito</h3>
                  <p>Digite a senha para cadastrar:</p>
                  <input 
                    type="password" 
                    value={senhaCadastro} 
                    onChange={(e) => setSenhaCadastro(e.target.value)}
                    placeholder="Senha de controle"
                    style={{ margin: "10px 0", padding: "10px", width: "100%", borderRadius: "8px", border: "1px solid #ccc" }}
                  />
                  <button type="button" onClick={verificarSenhaCadastro} className={styles.btnSalvar}>Liberar Acesso</button>
                </div>
              ) : (
                /* FORMULÁRIO LIBERADO */
                <div className={styles.formNiver}>
                  <h3>Cadastrar Datas Especiais</h3>
                  <label>Nome: <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} /></label>
                  <label>Nascimento: <input type="date" value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} /></label>
                  <label>Gênero: 
                    <select value={genero} onChange={(e) => setGenero(e.target.value as "homem" | "mulher")}>
                      <option value="homem">Homem</option>
                      <option value="mulher">Mulher</option>
                    </select>
                  </label>
                  <hr className={styles.divisor} />
                  <label>Cônjuge: <input type="text" value={nomeConjuge} onChange={(e) => setNomeConjuge(e.target.value)} /></label>
                  <label>Nascimento Cônjuge: <input type="date" value={dataNascConjuge} onChange={(e) => setDataNascConjuge(e.target.value)} /></label>
                  <hr className={styles.divisor} />
                  <label>Data de Casamento: <input type="date" value={dataCasamento} onChange={(e) => setDataCasamento(e.target.value)} /></label>
                  <button type="button" onClick={handleSalvar} className={styles.btnSalvar}>Salvar Datas</button>
                </div>
              )
            ) : (
              <div className={styles.listaParabens}>
                {aniversariantesHoje.length === 0 ? <p style={{textAlign: "center", padding: "20px"}}>Nenhum aniversariante hoje. 🎈</p> : 
                  aniversariantesHoje.map((niver, index) => {
                    const anos = calcularAnos(niver.dataOriginal);
                    return (
                      <div key={index} className={`${styles.cardNiver} ${niver.tipo === "mulher" ? styles.rosa : niver.tipo === "homem" ? styles.azul : styles.dourado}`}>
                        <span>🎂</span>
                        <p>
                          {niver.tipo === "casamento" 
                            ? `Feliz Aniversário de Casamento! Parabéns ${niver.nome} pelos seus ${anos} anos de união!` 
                            : `Parabéns ${niver.nome} pelos seus ${anos} anos de vida!`}
                        </p>
                      </div>
                    );
                  })
                }
              </div>
            )}
            <button type="button" className={styles.btnFechar} onClick={() => setNiverOpen(false)}>Sair</button>
          </div>
        </div>
      )}

      {adminOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.formNiver}>
                <h2>Administrador</h2>
                <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
                <button type="button" onClick={entrarAdmin} className={styles.btnSalvar}>Entrar</button>
                <button type="button" className={styles.btnFechar} style={{margin: "10px 0 0 0"}} onClick={() => setAdminOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}