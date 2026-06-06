/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Solo imágenes locales en producción del MVP. Si se necesita un
    // host externo (CDN), agrégalo a remotePatterns.
    remotePatterns: [],
  },

  // Endurece headers básicos del servidor de Next.
  poweredByHeader: false,

  experimental: {
    // sharp se carga server-side. Lo marcamos como externo para que
    // Next no intente bundlear el binario nativo dentro de las server actions.
    serverComponentsExternalPackages: ["sharp", "@prisma/client", "bcryptjs"],
  },
};

export default nextConfig;
