const logger = require('../system/logger');

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
let file =  path.join(__dirname, `../../env/${process.env.NODE_ENV}.env`);
console.log(file);
if (!fs.existsSync(path.resolve(file))) {
  file = path.join(__dirname, '../../env/dev.env');
}
dotenv.config({
  path: file,
  debug: false
})

const config = {  
  node_env: process.env.NODE_ENV,
  rootdir: path.resolve(__dirname, '../../'),
  port: process.env.PORT || 8080,
  database: {
    name: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }
}

console.log(config);

module.exports = config;