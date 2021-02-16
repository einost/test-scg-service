const Controller = require('./api.controller')

const routes = [
  {
    method: 'POST',
    path: '/api/admin/login',
    config: Controller.adminLogin
  },
  {
    method: 'POST',
    path: '/api/auth/refresh-token',
    config: Controller.refreshToken
  },
  {
    method: 'POST',
    path: '/api/vending-machine/payment',
    config: Controller.vendingMachinePayment
  },
  {
    method: 'GET',
    path: '/api/vending-machine/get-list',
    config: Controller.getVendingMachineList
  },
  {
    method: 'POST',
    path: '/api/vending-machine/get-stock-list',
    config: Controller.getStockList
  },
  // {
  //   method: 'GET',
  //   path: '/api/vending-machine/auto-create',
  //   config: Controller.autoCreateVendingMachine
  // },
  // {
  //   method: 'GET',
  //   path: '/api/product/auto-create',
  //   config: Controller.autoCreateProduct
  // },
  // {
  //   method: 'POST',
  //   path: '/api/admin/create',
  //   config: Controller.createAdmin
  // }
]

module.exports = routes
