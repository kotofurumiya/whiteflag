const path = require('path');

const mode = 'production';

function createConfig(entry, output, options) {
  const mode = 'mode' in options ? options.mode : 'development';
  const target = 'target' in options ? options.target : undefined;

  return {
    mode,
    entry,
    output,
    target,

    node: {
      __dirname: false
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader'
        }
      ]
    },

    resolve: {
      extensions: [
        '.ts', '.tsx', '.js', '.json'
      ]
    }
  }
}

const configMain = createConfig(
  './src/ts/main.ts',
  { filename: 'main.min.js', path: path.resolve('./src/js') },
  { mode, target: 'electron-main'}
);

const configIndex = createConfig(
  './src/ts/index.tsx',
  { filename: 'index.min.js', path: path.resolve('./src/js') },
  { mode, target: 'electron-renderer'}
);

const configRegister = createConfig(
  './src/ts/register.tsx',
  { filename: 'register.min.js', path: path.resolve('./src/js') },
  { mode, target: 'electron-renderer'}
);

const configLib = createConfig(
  './src/ts/lib/stump.ts',
  { filename: 'stump.js', path: path.resolve('./src/js'), libraryTarget: 'commonjs' },
  { mode, target: 'node' }
);

module.exports = [configMain, configIndex, configRegister, configLib];
