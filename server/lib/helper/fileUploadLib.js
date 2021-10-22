const config = require('../../config');
const logger = require(`${config.rootdir}/server/system/logger`);

const multer = require('multer');
const {existsSync, ensureDirSync} = require('fs-extra');


const allowedMimes = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

const storage = multer.diskStorage({
  // multers disk storage settings
  destination(req, file, cb) {    
      const client_id = req.headers.client_id;
      if (!existsSync(`${config.rootdir}/uploads`)) {
        ensureDirSync(`${config.rootdir}/uploads`);
      }     
      cb(null, `${config.rootdir}/uploads`); 
  },
  filename(req, file, cb) {
    const datetimestamp = Date.now();
    cb(
      null,
      `${file.fieldname}-${datetimestamp}.${
        file.originalname.split(".")[file.originalname.split(".").length - 1]
      }`
    );
  }
});

module.exports.upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('Uploading==>', file.mimetype);
    if(allowedMimes.indexOf(file.mimetype) > -1) {
      return cb(null, file);
    }
    return cb("File not supported", null);
  }
}).single('file');