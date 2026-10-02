/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,

    webpack: (config, { webpack }) => {
        config.plugins.push(
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery",
            })
        );

        return config;
    },

    serverExternalPackages: ["@sparticuz/chromium"],

    async redirects() {
        return [
            {
                source: "/annadanam",
                destination: "/AnnaDaan",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
