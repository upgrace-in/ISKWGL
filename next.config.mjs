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
    },
}

export default nextConfig;
