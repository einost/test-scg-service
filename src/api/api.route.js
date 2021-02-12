const Controller = require('./api.controller')

const routes = [
  {
    method: 'POST',
    path: '/api/vending-machine/payment',
    config: Controller.vendingMachinePayment
  }
]

module.exports = routes
