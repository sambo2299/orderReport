const logger = require('../logger');
const config = require('../../config')

const mysql = require('mysql2');

let connection;
const connectdb = () => new Promise(async (resolve, reject) => {
  try {
    // mysql.createConnection()
    connection =  await mysql.createConnection({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.name
    });
    connection.connect( async err =>{
      if (err) {
          logger.error('Error connecting: ' + err.stack);
          reject('Error connecting: ' + err.stack);
      }
      // await dbquery(`CREATE DATABASE IF NOT EXISTS \`${config.database.name}\`;`);    
      let createTableOrder = `create table if not exists orders (
        id int not null primary key AUTO_INCREMENT,
        orderNumber varchar(255) not null,
        brand varchar(255),
        product varchar(255),
        rate float,
        quantity int,
        grossAmount float,
        location nvarchar(255),
        date date
        )`;  
    try {
        // const tableResponse = await dbquery(createTableOrder);
        // if(!tableResponse){
        //   throw 'error at table create';
        // }    
      logger.info(`db connected`);
      resolve(connection);
    } catch(ex) {
      logger.error(ex);
      reject(ex);
    }
    });
  } catch(ex) {
    logger.error(ex);
    reject(ex);
  }  
});

const dbquery = async(sqlquery, values)  => {  
  try {
    return await connection.promise().query(sqlquery, [values]);
    // return await connection.execute(sqlquery, values);   
  } catch(ex) {
    logger.error("query error")
    logger.error("ex"+ ex);
    return null
  }
};

module.exports = {
  connectdb,
   dbquery
}

