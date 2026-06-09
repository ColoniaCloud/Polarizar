'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './Navigation.module.css';

export default function Navigation() {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setExpandedMenu(expandedMenu === menu ? null : menu);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Polarizar
        </Link>

        <div className={styles.menu}>
          <Link href="/" className={styles.link}>
            Inicio
          </Link>

          <div className={styles.dropdown}>
            <button
              className={styles.dropdownToggle}
              onClick={() => toggleMenu('instaladores')}
            >
              Instaladores
              <span className={styles.arrow}>▼</span>
            </button>
            {expandedMenu === 'instaladores' && (
              <div className={styles.dropdownMenu}>
                <Link href="/instaladores" className={styles.dropdownLink}>
                  Inicio Instaladores
                </Link>
                <Link href="/instaladores/red-de-instaladores" className={styles.dropdownLink}>
                  Red de Instaladores
                </Link>
                <Link href="/instaladores/red-de-instaladores/encontra-un-instalador" className={styles.dropdownLink}>
                  Encontrar Instalador
                </Link>
                <Link href="/instaladores/red-de-instaladores/dejar-reseña" className={styles.dropdownLink}>
                  Dejar Reseña
                </Link>
                <Link href="/instaladores/beneficios" className={styles.dropdownLink}>
                  Beneficios
                </Link>
                <Link href="/instaladores/registrarse" className={styles.dropdownLink}>
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          <Link href="/productos-recomendados" className={styles.link}>
            Productos
          </Link>

          <div className={styles.dropdown}>
            <button
              className={styles.dropdownToggle}
              onClick={() => toggleMenu('garantias')}
            >
              Garantías
              <span className={styles.arrow}>▼</span>
            </button>
            {expandedMenu === 'garantias' && (
              <div className={styles.dropdownMenu}>
                <Link href="/garantias" className={styles.dropdownLink}>
                  Inicio Garantías
                </Link>
                <Link href="/garantias/activar" className={styles.dropdownLink}>
                  Activar Garantía
                </Link>
                <Link href="/garantias/activacion-talleres" className={styles.dropdownLink}>
                  Activación en Talleres
                </Link>
                <Link href="/garantias/consultar-estado" className={styles.dropdownLink}>
                  Consultar Estado
                </Link>
                <Link href="/garantias/activar-reclamo" className={styles.dropdownLink}>
                  Activar Reclamo
                </Link>
              </div>
            )}
          </div>

          <Link href="/introduccion-al-polarizado" className={styles.link}>
            Aprende
          </Link>

          <div className={styles.dropdown}>
            <button
              className={styles.dropdownToggle}
              onClick={() => toggleMenu('miCuenta')}
            >
              Mi Cuenta
              <span className={styles.arrow}>▼</span>
            </button>
            {expandedMenu === 'miCuenta' && (
              <div className={styles.dropdownMenu}>
                <div className={styles.submenu}>
                  <p className={styles.submenuTitle}>Instalador</p>
                  <Link href="/mi-cuenta/instalador" className={styles.dropdownLink}>
                    Panel
                  </Link>
                  <Link href="/mi-cuenta/instalador/perfil" className={styles.dropdownLink}>
                    Perfil
                  </Link>
                  <Link href="/mi-cuenta/instalador/editar-perfil" className={styles.dropdownLink}>
                    Editar Perfil
                  </Link>
                  <Link href="/mi-cuenta/instalador/web-admin" className={styles.dropdownLink}>
                    Web Admin
                  </Link>
                  <Link href="/mi-cuenta/instalador/catalogo-admin" className={styles.dropdownLink}>
                    Catálogo
                  </Link>
                  <Link href="/mi-cuenta/instalador/configuracion" className={styles.dropdownLink}>
                    Configuración
                  </Link>
                </div>
                <div className={styles.submenu}>
                  <p className={styles.submenuTitle}>Cliente</p>
                  <Link href="/mi-cuenta/cliente" className={styles.dropdownLink}>
                    Panel
                  </Link>
                  <Link href="/mi-cuenta/cliente/perfil" className={styles.dropdownLink}>
                    Perfil
                  </Link>
                  <Link href="/mi-cuenta/cliente/mis-reseñas" className={styles.dropdownLink}>
                    Mis Reseñas
                  </Link>
                  <Link href="/mi-cuenta/cliente/editar-perfil" className={styles.dropdownLink}>
                    Editar Perfil
                  </Link>
                  <Link href="/mi-cuenta/cliente/beneficios" className={styles.dropdownLink}>
                    Beneficios
                  </Link>
                  <Link href="/mi-cuenta/cliente/historial" className={styles.dropdownLink}>
                    Historial
                  </Link>
                  <Link href="/mi-cuenta/cliente/configuracion" className={styles.dropdownLink}>
                    Configuración
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/dashboard" className={`${styles.link} ${styles.adminLink}`}>
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
