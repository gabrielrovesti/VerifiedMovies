import HtmlWebpackPlugin from 'html-webpack-plugin';
import { join } from 'path';
import { Configuration } from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

const config: Configuration = {
  mode: 'development',
  entry: './src/ui/index.tsx',
  output: {
    filename: 'bundle.js',
    path: join(__dirname, '/../dist'),
  },
  devtool: 'source-map',
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/ui/app.ejs',
      meta: {
        viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(css)$/,
        use: [
          {
            loader: 'style-loader', // creates style nodes from JS strings
          },
          {
            loader: 'css-loader', // translates CSS into CommonJS
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js\.map$/, loader: 'source-map-loader' },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.build.json',
          projectReferences: true,
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    fallback: {
      fs: false, // remove this line if you don't need to polyfill the 'fs' module
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
      zlib: require.resolve('browserify-zlib'),
      constants: require.resolve('constants-browserify'),
    },
  },
};

const devServerConfig = {
  port: 3000,
  compress: true,
  historyApiFallback: true,
};

const mergedConfig = { ...config, devServer: devServerConfig };

export default mergedConfig;