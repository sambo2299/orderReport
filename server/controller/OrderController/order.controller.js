const config = require('../../config');
const logger = require(`${config.rootdir}/server/system/logger`);

// const XLSX = require('xlsx');
const moment = require('moment');
// const fse = require('fs-extra');
// const path = require('path');

const dbQuery = require('../../system/database');
const helperLib = require('../../lib/helper/helper')
const fileUploadHelperLib = require('../../lib/helper/fileUploadLib')

const columnsReference = {
  'Date': 'date',
  'Order Number': 'orderNumber',
  'Product': 'product',
  'Brand': 'brand',
  'Rate': 'rate',
  'Quantity': 'quantity',
  'Gross Amount': 'grossAmount',
  'Location': 'location',
}

module.exports.getAllOrder = async (req, res) => {
  const startDate = req.query.from ? req.query.from : null;
  const endDate = req.query.to ? req.query.to : null;
  const download = req.query.download ? true : false;
  const page = req.query.page ? req.query.page : 1;
  const limit = req.query.limit ? req.query.limit : 10;
  const skip = req.query.page ? ((parseInt(req.query.page) -1) * limit): 0;

  console.log(startDate, endDate, limit, skip, download);
  let getQuery = `SELECT 
  DATE_FORMAT(date, "%Y-%m-%d") as Date,
  orderNumber as 'Order Number',
  product as Product,
  brand as Brand,
  rate as Rate,
  quantity as Quantity,
  grossAmount as 'Gross Amount',
  location as Location  
  FROM orders`;
  let condition = '';
  try {
    if(startDate) {
      if(moment(startDate).isValid()) {
        condition = `where date >= '${moment(startDate).format("yy-MM-DD")}'`;
      } else {
        return res.status('from date is not in valid format!!!');
      }
    }
    if(endDate) {
      if(moment(endDate).isValid()) {
        console.log(condition)
        condition =   `${(condition.length > 0 ? condition + ' and': 'where')} date <= '${moment(endDate).format("yy-MM-DD")}'`;
      } else {
        return res.status('to date is not in valid format!!!');
      }
    }

  } catch (ex) {
    console.log('--------')
    logger.error(ex);
    console.log('--------')
    return res.status(500).send('invalid date')
  }
  if(condition.length > 0) {
    getQuery = `${getQuery} ${condition}`
  }
  if(!download) {
    getQuery = `${getQuery} limit ${limit} offset ${skip}`
  }
  console.log(getQuery);
  const response = await dbQuery.dbquery(getQuery);
  const datas = response[0];
  // res.send({
  //   message: 'recored fetched',
  //   datas
  // });
  // res.send(await insertOrders([]));/
  if(!download)  {
     let totalQuery = `SELECT COUNT(*) as count FROM orders`;
     if(condition.length > 0) {
       totalQuery = `${totalQuery} ${condition}`;       
     }
     console.log(totalQuery)
     const totalresp = await dbQuery.dbquery(totalQuery);
    //  console.log(total[0]);
     let count;
     if(totalresp){
       count = totalresp[0][0].count;
     }
    return res.status(200).send({
      message: 'orders fetched',
      count,
      datas,
    })

  }
  try {
    const filecreated = await helperLib.createxlsx(datas);
    if(!filecreated) throw 'file not created!!!';
    return helperLib.sendFile(res, filecreated); 
  } catch(ex) {
    logger.error(ex);
    res.status(500).send({
      message: 'error at file export'
    })
  }  
}

const insertOrders = async (orders) => {
  const values = [
    ['1101', "acer", "acer microphonse for laptops", 35000, 40, 35000 * 40, 'nepal', "2021-10-19"],
    ['1301', "hp", "hp microphonse for laptops", 45000, 40, 45000 * 40, 'nepal', "2021-11-19"],
  ]
  const query = `insert into orders (orderNumber,brand,product,rate,quantity,grossAmount,location,date) VALUES ?`;
  //  const query = `insert into orders (orderNumber,brand,product,rate,quantity,grossAmount,location,date) values (1111,'dell','dell laptop',100,4,400,'Nepal',"2021-10-19")`; 
  const response = await dbQuery.dbquery(query, values);
  console.log(response);
  return response;
}

/**
 * import order from xls or xlsx 
*/
module.exports.importOrder = async (req, res) => {
  fileUploadHelperLib.upload(req, res, async (err) => {
    if (err || !req.file) {
      logger.error(err);
      res.status(500).send({
        message: err ? err : 'file not uploaded'
      });
    } else {
      // console.log(req.file)
      try {
        // workbook = XLSX.readFile(req.file.path);
        // // console.log(workbook.SheetNames)
        // if (workbook.SheetNames.indexOf('Data') < 0) throw 'xlsx dont have correct sheet';
        // const excelProducts = XLSX.utils.sheet_to_json(workbook.Sheets['Data'], {
        //   raw: false,
        //   header: 1,
        //   dateNF: 'yyyy-mm-dd',
        //   blankrows: false,
        // })
        const excelProducts = await helperLib.readxlsx(req.file.path);
        const firstrow = excelProducts[0];
        excelProducts.shift();
        const fields = '';
        // console.log(firstrow);
        for (let i = 0; i < firstrow.length; i++) {
          firstrow[i] = `${columnsReference[firstrow[i].trim()]} `
        }
        const query = `insert into orders (${firstrow.join(',')}) values ?`;
        logger.info(query);
        await dbQuery.dbquery(query, excelProducts);
        // const response = await readExcel(path);
      } catch (ex) {
        logger.error(ex)
        return res.status(500).send(ex);
      }
      res.status(200).send({

        message: "order imported"
      });
    }
  })
}