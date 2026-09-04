import Navigation from '../components/Navigation';

/** El sitio de comunidad: todo lo que no es la página pública de un taller. */
export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    // `sitio-legacy` acota los estilos viejos de globals.css a estas paginas.
    // Sin eso se filtraban a la pagina publica del taller y la rompian.
    <div className="sitio-legacy">
      <Navigation />
      {children}
    </div>
  );
}
