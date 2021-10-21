
const winston =require('winston');
const path = require('path');
const fse = require("fs-extra");

const logfilePath = path.resolve(__dirname, '../../../', 'log');

fse.ensureDirSync(logfilePath);

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

winston.addColors(colors)
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `{"timestamp": "${info.timestamp}", "level":  "${info.level}", "message": "${info.message}"}`,
  ),
)

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: `${logfilePath}/error.log`,
    level: 'error',
  }),
  new winston.transports.File({ filename: `${logfilePath}/all.log` }),
]

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
})

module.exports = Logger;