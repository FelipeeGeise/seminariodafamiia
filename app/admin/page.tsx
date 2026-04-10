"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./admin.module.css";
import Image from "next/image";

// Interface para garantir que os dados sigam o padrão correto
type Aviso = {
  id: string;
  texto: string;
  imagem: string;
  cor: string;
  bg: string;
  data: string;
};

export default function Admin() {
  // Estado para armazenar a lista vinda do banco
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  
  // Estados do formulário
  const [texto, setTexto] = useState("");
  const [imagem, setImagem] = useState("");
  const [preview, setPreview] = useState("");
  const [cor, setCor] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  
  // Estados de controle de UI
  const [loading, setLoading] = useState(false);

  // --- BUSCAR AVISOS (API) ---
  const carregarAvisos = useCallback(async () => {
    try {
      const response = await fetch("/api/avisos");
      if (response.ok) {
        const dados = await response.json();
        setAvisos(dados);
      }
    } catch (err) {
      console.error("Erro ao carregar avisos:", err);
    }
  }, []);

  useEffect(() => {
    carregarAvisos();
  }, [carregarAvisos]);

  // --- UPLOAD DE IMAGEM (Conversão para Base64) ---
  const handleImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (opcional: evitar arquivos maiores que 2MB para Base64)
    if (file.size > 2 * 1024 * 1024) {
      return alert("A imagem é muito grande! Escolha uma de até 2MB.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagem(base64);
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // --- SALVAR AVISO NO BANCO ---
  const salvarAviso = async () => {
    if (!texto.trim()) return alert("Por favor, digite um texto para o aviso.");
    
    setLoading(true);
    const novoAviso = {
      texto,
      imagem,
      cor,
      bg,
      data: new Date().toLocaleString("pt-BR"),
    };

    try {
      const response = await fetch("/api/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoAviso),
      });

      if (!response.ok) throw new Error("Erro ao salvar no banco");

      alert("Aviso publicado com sucesso!");
      
      // Limpar formulário
      setTexto("");
      setImagem("");
      setPreview("");
      setCor("#000000");
      setBg("#ffffff");
      
      // Atualizar lista
      carregarAvisos();
    } catch (err) {
      console.error("Falha ao salvar:", err);
      alert("Erro ao salvar o aviso. Verifique a conexão com o banco.");
    } finally {
      setLoading(false);
    }
  };

  // --- EXCLUIR AVISO ---
  const excluirAviso = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este aviso da Home?")) return;

    try {
      const response = await fetch(`/api/avisos?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAvisos((prev) => prev.filter((av) => av.id !== id));
      } else {
        throw new Error("Erro na exclusão");
      }
    } catch (err) {
      console.error("Erro ao excluir:", err);
      alert("Não foi possível excluir o aviso.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Controle</h1>
        <p className={styles.description}>Gerencie os avisos e comunicados do Seminário.</p>
      </header>

      {/* SEÇÃO DE CRIAÇÃO */}
      <section className={styles.formCard}>
        <h2 className={styles.subtitle}>Novo Comunicado</h2>
        
        <textarea
          className={styles.textarea}
          placeholder="Escreva aqui a mensagem para os casais..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <div className={styles.uploadArea}>
          <label className={styles.label}>Foto do Evento (Opcional)</label>
          <input 
            className={styles.input} 
            type="file" 
            accept="image/*" 
            onChange={handleImagem} 
          />
        </div>

        {preview && (
          <div className={styles.previewContainer}>
            <p className={styles.label}>Visualização da Imagem:</p>
            <Image 
              src={preview} 
              alt="Preview" 
              width={400} 
              height={250} 
              className={styles.previewImage} 
            />
          </div>
        )}

        <div className={styles.customization}>
          <div className={styles.colorPicker}>
            <label className={styles.label}>Cor da Letra</label>
            <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} />
          </div>
          <div className={styles.colorPicker}>
            <label className={styles.label}>Cor do Fundo</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
          </div>
        </div>

        <button 
          onClick={salvarAviso} 
          disabled={loading} 
          className={styles.btnSubmit}
        >
          {loading ? "Processando..." : "Publicar Agora"}
        </button>
      </section>

      {/* SEÇÃO DE GERENCIAMENTO */}
      <section className={styles.listaSection}>
        <h2 className={styles.subtitle}>Avisos Ativos</h2>
        
        <div className={styles.gridAvisos}>
          {avisos.length === 0 && !loading && (
            <p className={styles.emptyMsg}>Nenhum aviso publicado no momento.</p>
          )}

          {avisos.map((aviso) => (
            <div 
              key={aviso.id} 
              className={styles.avisoItem} 
              style={{ backgroundColor: aviso.bg, color: aviso.cor }}
            >
              <div className={styles.avisoContent}>
                <p className={styles.avisoTexto}>{aviso.texto}</p>
                {aviso.imagem && (
                  <Image 
                    src={aviso.imagem} 
                    alt="Imagem do aviso" 
                    width={300} 
                    height={200} 
                    className={styles.avisoImg} 
                  />
                )}
                <span className={styles.avisoData}>{aviso.data}</span>
              </div>
              
              <button 
                className={styles.btnDelete} 
                onClick={() => excluirAviso(aviso.id)}
                title="Remover aviso"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}