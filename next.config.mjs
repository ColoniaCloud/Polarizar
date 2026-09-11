const nextConfig = {
  reactStrictMode: true,
  // Acota los workers de generación estática del build. El default de Next sale
  // de os.cpus(), y el hosting compartido reporta 64 núcleos que la cuenta no
  // puede usar: cada build levantaba 63 procesos contra un techo de 200 para
  // toda la cuenta. Mismo valor que crm-polarizados y kristall-web.
  experimental: { cpus: 4 },
};

export default nextConfig;
