const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    http: require.resolve("stream-http"),
    https: require.resolve("https-browserify"),
    os: require.resolve("os-browserify"),
    url: require.resolve("url"),
    zlib: require.resolve("browserify-zlib"),
    fs: require.resolve("graceful-fs"),
    constants: require.resolve('constants-browserify'),
  };
  
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
    new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
      const mod = resource.request.replace(/^node:/, "");
      switch (mod) {
        case "fs/promises":
          resource.request = "graceful-fs";
          break;
        default:
          throw new Error(`Not found ${mod}`);
      }
    }),
  ]);
  
  config.ignoreWarnings = [/Failed to parse source map/];
  
  config.module.rules.push({
    test: /\.(js|mjs|jsx)$/,
    enforce: "pre",
    loader: require.resolve("source-map-loader"),
  });
  
  return config;
};
