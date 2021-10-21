const express = require("express");

const BalanceController =  require("./order.controller");

const BalanceRouter = express.Router();
  
BalanceRouter.route('/')
.get( BalanceController.getAllOrder)
.post(BalanceController.importOrder);

module.exports = BalanceRouter;
