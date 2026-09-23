/**
 * Cuánto viven en el navegador los archivos de `public/`.
 *
 * **Por qué hace falta.** Next sirve `public/` con `cache-control: max-age=0`,
 * y medido contra producción este hosting tampoco responde 304: se le manda
 * el `ETag` correcto en `If-None-Match` y devuelve 200 con el cuerpo entero.
 * O sea que sin esto, cada visita vuelve a bajar los íconos, la tipografía y
 * los fondos — más de 250 KB — aunque no haya cambiado nada. Casi todo el
 * tráfico de estas páginas llega por WhatsApp, o sea celular con datos.
 *
 * **Por qué no un año.** Los archivos de `public/` no llevan hash en el
 * nombre, así que `immutable` a un año significa que cambiar un ícono deja a
 * medio mundo viendo el viejo hasta que limpie la caché.
 * `stale-while-revalidate` corta ese nudo: el archivo se sirve de caché al
 * instante, y pasado el día el navegador igual lo muestra pero pide la
 * versión nueva por atrás para la próxima. La desactualización máxima pasa
 * a ser un día más una visita, en vez de un año.
 *
 * **Si agregás un archivo a `public/`**, ponelo adentro de una de estas
 * carpetas o sumalo acá: si no, se sigue bajando entero en cada visita.
 */
const UN_DIA = 60 * 60 * 24;
const CACHE_ESTATICOS = `public, max-age=${UN_DIA}, stale-while-revalidate=${UN_DIA * 30}`;

const RUTAS_ESTATICAS = [
  '/iconos/:ruta*',
  '/fonts/:ruta*',
  '/cat/:ruta*',
  '/lineas.png',
  '/lineas.svg',
  '/logo-kristall.png',
  '/logo-stiker.png',
];

const nextConfig = {
  reactStrictMode: true,
  // Solo estas rutas: los propios de Next (`/_next/static/*`) ya salen con
  // `immutable` a un año porque sí llevan hash en el nombre, y pisarlos con
  // un día sería empeorarlos.
  async headers() {
    return RUTAS_ESTATICAS.map((source) => ({
      source,
      headers: [{ key: 'Cache-Control', value: CACHE_ESTATICOS }],
    }));
  },
  // Acota los workers de generación estática del build. El default de Next sale
  // de os.cpus(), y el hosting compartido reporta 64 núcleos que la cuenta no
  // puede usar: cada build levantaba 63 procesos contra un techo de 200 para
  // toda la cuenta. Mismo valor que crm-polarizados y kristall-web.
  experimental: { cpus: 4 },
};

export default nextConfig;
