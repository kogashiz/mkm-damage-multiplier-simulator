/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 開発環境での別ホスト/IPからのアクセスを許可
  // ローカル専用アドレスなのでアップロードしても大丈夫
  allowedDevOrigins: ['192.168.10.101'],
}

export default nextConfig
