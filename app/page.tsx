"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Definimos o tipo exatamente como o Prisma retorna
type Aviso = {
  id: string; // O Prisma gera ID, usamos aqui como key
  texto: string;
  imagem?: string;
  cor: string;
  bg: string;
  data: string;
};

export default function Home() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [loading, setLoading] = useState(true);

  // --- BUSCAR DADOS DO BANCO ---
  useEffect(() => {
    async function carregarAvisos() {
      try {
        const response = await fetch("/api/avisos");
        if (response.ok) {
          const dados = await response.json();
          setAvisos(dados);
        }
      } catch (err) {
        console.error("Erro ao carregar avisos na Home:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarAvisos();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "80px 20px",
          color: "#f9fafb",
          textAlign: "center",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        <p>Carregando avisos edificantes...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "100px 20px 20px", // 👈 CORREÇÃO PRINCIPAL (topo no mobile)
        maxWidth: "1000px",
        margin: "0 auto",
        minHeight: "100vh", // 👈 garante altura correta
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          color: "#06f7f3",
          textAlign: "center",
          marginBottom: 30,
          lineHeight: "1.3",
        }}
      >
        Bem-vindos à Equipe de Casais! <br />
        <span style={{ fontSize: "0.6em", color: "#a0aec0" }}>
          Juntos, edificando lares sobre a Rocha.
        </span>
      </h1>

      {avisos.length === 0 ? (
        <p
          style={{
            marginTop: 20,
            color: "#a0aec0",
            textAlign: "center",
          }}
        >
          Nenhum aviso disponível no momento.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {avisos.map((aviso) => (
            <div
              key={aviso.id}
              style={{
                padding: 20,
                borderRadius: 12,
                background: aviso.bg,
                color: aviso.cor,
                fontSize: 18,
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "0.3s",
              }}
            >
              <p
                style={{
                  fontWeight: "600",
                  marginBottom: 15,
                  lineHeight: "1.5",
                }}
              >
                {aviso.texto}
              </p>

              {aviso.imagem && (
                <div
                  style={{
                    marginTop: 15,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={aviso.imagem}
                    alt="Imagem do aviso"
                    width={800}
                    height={450}
                    style={{
                      width: "100%",
                      height: "auto",
                      display: "block",
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  marginTop: 15,
                  textAlign: "right",
                  opacity: 0.8,
                }}
              >
                <small style={{ fontSize: 12 }}>
                  Publicado em: {aviso.data}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}