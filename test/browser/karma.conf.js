'use strict';

const path = require('path');
const webpack = require('webpack');

// **Debugging Help**
// We normally dislike commented out code, but as Karma doesn't easily produce
// a bundle, debugging bundle errors is a pain.
// To help with this, uncomment this plugin to write out all Karma webpack
// assets like `test/browser/index.js` to disk as `~/Desktops/test-browser-index.js`
// and then inspect the failing lines you need.
//
// Add the plugin into config for `webpack` below with:
// ```
// plugins: [
//   new WriteAssetPlugin()
// ]
// ```
//
// const fs = require('fs').promises;
// const os = require('os');
//
// class WriteAssetPlugin {
//   apply(compiler) {
//     compiler.hooks.emit.tapPromise("WriteAssetPlugin", this.writeAsset.bind(this));
//   }
//
//   async writeAsset(compiler) {
//     const { assets } = compiler;
//
//    await Promise.all(Object.entries(assets).map(async ([file, src]) => {
//      const outFile = path.join(os.homedir(), "Desktop", file.split(path.sep).join("-"));
//      await fs.writeFile(outFile, src.source());
//    }));
//   }
// }

module.exports = function(config) {
  config.set({
    basePath: '../..',
    frameworks: ['mocha'],
    files: [
      'test/browser/index.js'
    ],
    preprocessors: {
      'test/browser/index.js': ['webpack']
    },
    webpack: {
      mode: 'development',
      // Normally, would follow this guide for source maps:
      // https://github.com/webpack-contrib/karma-webpack#source-maps
      // Unfortunately, karma-webpack doesn't work with source maps w/ babel.
      // https://github.com/webpack-contrib/karma-webpack/issues/176
      devtool: false,
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: 'pre',
            // Includes the vendored `fast-deep-equal` tests in `test/fixtures`.
            include: [
              path.resolve(__dirname, '..')
            ],
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        ]
      },
      plugins: [
        new webpack.ProvidePlugin({
          assert: 'assert',
          process: 'process'
        })
      ]
    },
    exclude: [],
    port: 8080,
    logLevel: config.LOG_INFO,
    colors: true,
    autoWatch: false,
    // Run a customized instance of headless chrome for dev + CI.
    browsers: ['ChromeHeadlessCustom'],
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        // --no-sandbox: Chrome's sandbox can't start in some CI containers.
        flags: ['--no-sandbox']
      }
    },
    reporters: ['mocha'/* TODO, 'coverage'*/],
    browserNoActivityTimeout: 60000,
    plugins: [
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-safari-launcher',
      //'karma-coverage',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-webpack'
    ],
    coverageReporter: {
      type: 'text'
    },
    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },
    captureTimeout: 100000,
    singleRun: true
  });
};