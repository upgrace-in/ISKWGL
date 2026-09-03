/** @type {import('next').NextConfig} */
import webpack from "webpack"
const nextConfig = {
    reactStrictMode: false,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.plugins.push(
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery",
            }));
        return config;
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
        serverComponentsExternalPackages: ['@sparticuz/chromium'],
    },
    async redirects() {
        return [
        {
            source: '/annadanam',
            destination: '/AnnaDaan',
            permanent: true, // Use true for 308 (permanent), false for 307 (temporary)
        },
        ];
    },
}

export default nextConfig;
