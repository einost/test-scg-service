const Joi = require('joi')

const vendingMachinePayment = {
  validate: {
    options: {
      allowUnknown: true
    },
    payload: Joi.object({
      vendingMachineId: Joi.string().required(),
      productId: Joi.string().required()
    })
  }
}

module.exports = {
  vendingMachinePayment
}