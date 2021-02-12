const Joi = require('joi')

const getVendingMachineList = {
  validate: {
    options: {
      allowUnknown: true
    },
    query: Joi.object({
      page: Joi.number().required(),
      limit: Joi.number().max(100).required()
    })
  }
}

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
  getVendingMachineList,
  vendingMachinePayment
}