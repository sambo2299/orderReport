const logger = require("./system/logger")

const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const cors = require('cors');

const config = require('./config');
const routes = require('./routes');
const dbconnection = require('./system/database');

const app = express();
const renderFile = ejs.renderFile;

app.use(express.static(path.resolve(__dirname, '../client/order-report/build')));
app.set('views', path.resolve(__dirname, '../client/order-report/build'));
app.engine('html', renderFile);
app.set('view engine', 'html');
app.use(cors({origin: "*"}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = config.port;

routes(app);

const createServer  = () => {
    app.listen( port, () => {
        logger.info(`server started at http://localhost:${ config.port }`)
    });
};

const connectionDb = async() => {
    try {
        const dbconnResp =  await dbconnection.connectdb();        
        if(!dbconnResp) throw "error in db connection!!!!!!!"   
        // console.log("dbconnResp")
        // console.log(dbconnResp)     
        createServer();
        return;
    } catch(ex) {
        logger.error('db connection error');
        return;
    }
}
connectionDb();