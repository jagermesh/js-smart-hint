import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const baseConfig = {
  mode: 'production',
  entry: path.resolve(__dirname, 'src/smart-hint.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'SmartHint',
      type: 'umd',
      export: 'default',
    },
    globalObject: 'this',
  },
  devtool: 'source-map',
};

const unminified = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: 'smart-hint.js',
  },
  optimization: {
    minimize: false,
  },
};

const minified = {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    filename: 'smart-hint.min.js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
};

export default [unminified, minified];
