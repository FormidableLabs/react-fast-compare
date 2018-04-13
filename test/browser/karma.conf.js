'use strict';

const path = require('path');

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
            include: path.resolve(__dirname),
            loader: 'babel-loader',
            options: {
              presets: ['babel-preset-env']
            }
          }
        ]
      }
    },
    exclude: [],
    port: 8080,
    logLevel: config.LOG_INFO,
    colors: true,
    autoWatch: false,
    // Run a customized instance of headless chrome for dev + Travis CI.
    browsers: ['ChromeHeadlessCustom'],
    customLaunchers: {
      ChromeHeadlessCustom: {
        base: 'ChromeHeadless',
        // --no-sandbox for https://github.com/travis-ci/docs-travis-ci-com/pull/1671/files
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