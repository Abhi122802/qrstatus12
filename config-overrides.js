const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url")
    });
    config.resolve.fallback = fallback;
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: require.resolve('process/browser'),
            Buffer: ['buffer', 'Buffer'],
        }),
    ]);
    // This will ignore the source map warnings from the html5-qrcode library.
    config.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
            return warning.module && warning.module.resource.includes("html5-qrcode") && warning.details && warning.details.includes("source-map-loader");
        },
    ];
    return config;
}