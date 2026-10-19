import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ingresar al panel' };

/**
 * Login al Panel de Cliente e Instalador. El panel vive en kristallfilm.com/cliente
 * y la sesión es de ese dominio: este formulario postea directo a
 * kristall-web (`/api/portal/auth/login-externo`), que valida contra el CRM,
 * deja la cookie y redirige al panel. Si algo falla, vuelve acá con `?error=`.
 *
 * Es un <form> común a propósito, sin JavaScript: la contraseña no pasa por el
 * servidor de polariz.ar ni hace falta abrir CORS en la API del portal.
 * kristall-web solo acepta este post si viene de polariz.ar (ver la ruta).
 */
const PANEL = (process.env.KRISTALL_WEB_URL || 'https://kristallfilm.com').replace(/\/$/, '');

const ERRORES: Record<string, string> = {
  credenciales:
    'Email o contraseña incorrectos. Si nunca creaste tu contraseña, activá tu cuenta.',
  intentos: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
  datos: 'Completá tu email y tu contraseña.',
  conexion: 'No pudimos conectar con el panel. Probá de nuevo en un rato.',
};

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const mensaje = error ? ERRORES[error] ?? ERRORES.conexion : undefined;

  return (
    <main>
      <div className="mx-auto w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="!text-2xl font-semibold">Ingresar al panel</h1>
        <p className="mb-6 text-sm">
          Para clientes e instaladores de Kristall: compras, stock, garantías y tu taller.
        </p>

        {mensaje && (
          <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm !text-red-800">
            {mensaje}
          </p>
        )}

        <form method="post" action={`${PANEL}/api/portal/auth/login-externo`} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="tu@empresa.com"
              className="rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-gray-900 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Contraseña
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-gray-900 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
          >
            Ingresar
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <a href={`${PANEL}/cliente/recuperar`} className="underline">
            Olvidé mi contraseña
          </a>
          <span>
            ¿Primera vez?{' '}
            <a href={`${PANEL}/cliente/activar`} className="underline">
              Activá tu cuenta
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}
