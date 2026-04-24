/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: [
    'mineflayer',
    'minecraft-protocol',
    'prismarine-physics',
    'prismarine-entity',
    'prismarine-block',
    'prismarine-chunk',
    'prismarine-world',
    'prismarine-biome',
    'prismarine-nbt',
    'prismarine-item',
    'prismarine-windows',
    'prismarine-recipe',
    'prismarine-chat',
    'minecraft-data',
  ],
}

export default nextConfig
