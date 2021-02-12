const Validation = require('./api.validation')
const Boom = require('@hapi/boom')

const vendingMachinePayment = {
  auth: false,
  ...Validation.vendingMachinePayment,
  handler: async (request) => {
    try {
      return {
        statusCode: 200,
        data: request.payload
      }
    } catch (error) {
      console.log(error)
      return Boom.badImplementation()
    }
  }
}

module.exports = {
  vendingMachinePayment
}