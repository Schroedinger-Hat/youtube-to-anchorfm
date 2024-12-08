const log4js = require('log4js');
const path = require('node:path');

const LOGS_LOCATION = './logs';
const LOG_FILE = 'logs.log';

function configureLogger() {
  log4js.configure({
    appenders: {
      stdout: { type: 'stdout', layout: { type: 'dummy' } },
      file: { type: 'file', filename: path.join(LOGS_LOCATION, LOG_FILE) },
    },
    categories: { default: { appenders: ['stdout', 'file'], level: 'info' } },
  });
}

function getLogger() {
  return log4js.getLogger('default');
}

function shutdownLogger(cb) {
  log4js.shutdown(cb);
}

module.exports = {
  configureLogger,
  getLogger,
  shutdownLogger,
  LOGS_LOCATION,
};
