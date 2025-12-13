export default {
  parallel: 2,
  format: [
    "html:reports/cucumber-report.html",
    "json:reports/cucumber-report.json",
    "junit:reports/cucumber-report.xml"
  ],
  formatOptions: {
    pretty: true,
    duration: true,
    snippetInterface: "async-await",
    colorsEnabled: true
  },
  require: [
    "./support/world.js",
    "./support/hooks.js",
    "./steps/**/*.js"
  ],
  paths: [
    "./features/**/*.feature"
  ],
  retry: 0,
  timeout: 15000,
  colors: true,
  names: ["login"],
  // tags: "@login or @playwright",
  worldParameters: {}
};