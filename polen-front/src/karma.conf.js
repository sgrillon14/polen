// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-junit-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../coverage/polen'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    junitReporter: {
      outputDir: 'reports/'
    },
    reporters: ['progress', 'kjhtml', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome', 'ChromeHeadless', 'ChromeHeadlessNoSandbox', 'ChromeNoSandbox'],
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    customLaunchers:
      {
        ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags:
            ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
        },
        ChromeNoSandbox: {
          base: 'Chrome',
          flags:
            ['--no-sandbox', '--disable-setuid-sandbox']
        }
      },
    singleRun: false
  });
};
