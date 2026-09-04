import Card from '../components/Card';

export default function HomePage() {
  return (
    <main>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Bienvenido a Polarizar</h1>
        <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '2rem' }}>
          Soluciones innovadoras en polarizado de vidrios para vehículos
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <Card
          title="🔍 Encuentra un Instalador"
          description="Locatea el instalador más cercano a tu zona"
          href="/instaladores/red-de-instaladores/encontra-un-instalador"
        />
        <Card
          title="💎 Productos Recomendados"
          description="Descubre nuestras mejores opciones"
          href="/productos-recomendados"
        />
        <Card
          title="✅ Garantías"
          description="Protege tu compra con nuestras garantías"
          href="/garantias"
        />
        <Card
          title="📚 Aprende sobre Polarizado"
          description="Conoce los beneficios del polarizado"
          href="/introduccion-al-polarizado"
        />
        <Card
          title="👤 Mi Cuenta"
          description="Accede a tu perfil y configuración"
          href="/mi-cuenta/cliente"
        />
        <Card
          title="🏢 Sé un Instalador"
          description="Únete a nuestra red de instaladores"
          href="/instaladores/registrarse"
        />
      </div>
    </main>
  );
}
