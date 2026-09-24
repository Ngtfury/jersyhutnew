/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jleqlgqxheygghnrluvc.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'slqlcbunigxchefasznq.supabase.co',
      },
    ],
  },
};

export default nextConfig;
