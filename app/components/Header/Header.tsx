"use client";

import Link from "next/link";
import styles from "./header.module.css";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // MENU MOBILE
  const [menuOpen, setMenuOpen] = useState(false);

  // MODAL ADMIN
  const [adminOpen, setAdminOpen] = useState(false);

  const [senha, setSenha] = useState("");

  const isActive = (path: string) => pathname === path;

  const entrarAdmin = () => {
    if (senha === "seminariodecasal") {
      setAdminOpen(false);
      setSenha("");
      router.push("/admin");
    } else {
      alert("Senha incorreta");
    }
  };

  return (
    <>
      <header className={styles.header}>
        {/* LOGO */}
        <div className={styles.left}>
          <Image src="/ieadpe-a36.png" alt="a36" width={70} height={50} />
          <h1>Seminário da Família da Área 36</h1>
        </div>

        {/* MENU */}
        <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          
          <div className={styles.mobileLogo}>
            <Image src="/ieadpe-a36.png" alt="a36" width={70} height={50} />
            <h1>Seminário da Família da Área 36</h1>
          </div>

          <Link
            href="/"
            className={isActive("/") ? styles.active : ""}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/cadastro"
            className={isActive("/cadastro") ? styles.active : ""}
            onClick={() => setMenuOpen(false)}
          >
            Cadastro
          </Link>

          <Link
            href="/chamada"
            className={isActive("/chamada") ? styles.active : ""}
            onClick={() => setMenuOpen(false)}
          >
            Chamada
          </Link>

          <Link
            href="/dashboard"
            className={isActive("/dashboard") ? styles.active : ""}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>

          {/* ADMIN */}
          <span
            className={styles.link}
            onClick={() => {
              setAdminOpen(true);
              setMenuOpen(false);
            }}
          >
            Administrador
          </span>
        </nav>

        {/* HAMBURGUER */}
        <div
          className={styles.menuToggle}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* MODAL ADMIN */}
      {adminOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Administrador</h2>

            <input
              type="password"
              placeholder="Digite a senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={styles.input}
            />

            <button onClick={entrarAdmin}>Entrar</button>

            <button onClick={() => setAdminOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}