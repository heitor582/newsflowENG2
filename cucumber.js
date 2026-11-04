const base = {
  paths: ['features/*.feature'],
  require: ['features/support/**/*.js', 'features/step_definitions/**/*.js'],
  publish: false,
  strict: true
};
module.exports = {
  default: { ...base, format: ['progress', 'html:relatorios/cucumber-report.html', 'json:relatorios/cucumber-report.json'] },
  verificacao: { ...base, format: ['summary'] }
};
