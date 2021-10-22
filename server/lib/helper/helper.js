const config = require('../../config');
const logger = require(`${config.rootdir}/server/system/logger`);

const XLSX = require('xlsx');
const fse = require('fs-extra');
const util = require('util');
const mime = require('mime-types');
const path = require('path');

const statPromisify = util.promisify(fse.stat);

module.exports.readxlsx = async(path) => {
  try {
    workbook = XLSX.readFile(path);
          // console.log(workbook.SheetNames)
          if (workbook.SheetNames.indexOf('Data') < 0) throw 'xlsx dont have correct sheet';
          const excelProducts = XLSX.utils.sheet_to_json(workbook.Sheets['Data'], {
            raw: false,
            header: 1,
            dateNF: 'yyyy-mm-dd',
            blankrows: false,
          })
          return excelProducts;

  } catch(ex) {
    logger.error(ex);
    return null;
  }
}

module.exports.createxlsx = async(data) => {
  try {
    const wb = XLSX.utils.book_new();
    const ws_name = 'data';
    const ws_data = data;  
    const ws = XLSX.utils.json_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb,ws, ws_name);
    const filename = `${new Date().getTime()}.xlsx`;
    const filePath = `${config.rootdir}/export`;
    fse.ensureDirSync(filePath);
    XLSX.writeFile(wb, path.resolve(filePath, filename));
    return path.resolve(filePath, filename);
  } catch(ex) {
    logger.error(ex);
    return null;
  }
};

module.exports.sendFile = (res, filepath) => {
  statPromisify(filepath)
    .then(stats => {
      if(stats) {
        // console.log(stats)/
        const mimetype = mime.lookup(filepath);
        res.writeHead(200, {
          'Content-Type': mimetype,
          'Content-Length': stats.size
      });    
      // console.log(mimetype, stats.size);
      var readStream = fse.createReadStream(filepath);
      readStream.pipe(res);
      } else {
        logger.error('no stat');          
        return res.status(500).send({
          error: true,
          message: 'file not sent!!!'
        })  
      }
    })
    .catch(err => {
      logger.error('error @ file send', err);
      return res.status(500).send({
        error: true,
        message: 'file not sent!!!'
      })
    })
}