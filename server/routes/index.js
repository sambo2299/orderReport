const OrderRouter = require('../controller/OrderController');

const routes = (app) => {
  app.use('/api/order', OrderRouter)
  
  app.get('/', (req, res) => {
    res.render('index')
  })
}

module.exports = routes;
