const Boom = require('@hapi/boom')
const { DB } = require('test-scg-sdk')
const Validation = require('./api.validation')

const getVendingMachineList = {
  auth: false,
  ...Validation.getVendingMachineList,
  handler: async (request) => {
    try {
      const {
        page,
        limit
      } = request.query
      const vendingMachineList = await DB.VendingMachine.getList({}, page, limit)
      return {
        statusCode: 200,
        data: vendingMachineList
      }
    } catch (error) {
      console.log(error)
      return Boom.badImplementation()
    }
  }
}

const vendingMachinePayment = {
  auth: false,
  ...Validation.vendingMachinePayment,
  handler: async (request) => {
    try {
      // const { vendingMachineId } = request.auth.credentials
      const {
        vendingMachineId,
        productId
      } = request.payload
      const vendingMachine = await DB.VendingMachine.findById(vendingMachineId)
      if (!vendingMachine) {
        return Boom.notFound(`Not found vending machine by ${vendingMachineId}`)
      }
      const product = await DB.Product.findById(productId)
      if (!product) {
        return Boom.notFound(`Not found vending machine by ${productId}`)
      }
      /** 
       * ====================================
       * ========== Payement Logic ==========
       * ====================================
       * 
       * ...do something
       * 
       */
      const stock = await DB.Stock.find({
        vendingMachineId,
        productId
      })
      if (stock.length) {

      }
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

const autoCreateVendingMachine = {
  auth: false,
  handler: async (request) => {
    try {
      let i = 10
      while (i > 0) {
        const machineType = [
          'FOOD',
          'DRINK',
          'SNACK'
        ]
        const data = {
          statusId: 1,
          machineType: machineType[Math.floor(Math.random() * (3 - 0)) + 0],
          lat: (Math.random() * (12 - 14) + 14).toFixed(7) * 1,
          lng: (Math.random() * (99 - 101) + 101).toFixed(7) * 1,
          Address: `${Math.floor(Math.random() * (99 - 1)) + 1}/${Math.floor(Math.random() * (99 - 1)) + 1}`,
          province: 'กรุงเทพมหานคร',
          district: 'ดอนเมือง',
          subDistrict: 'ดอนเมือง',
          zipCode: '10210'
        }
        console.log(data)
        const test = await DB.VendingMachine.create(data)
        console.log(test)
        i--
      }
      return {
        statusCode: 200,
        data: 'success'
      }
    } catch (error) {
      console.log(error)
      return Boom.badImplementation()
    }
  }
}

module.exports = {
  getVendingMachineList,
  vendingMachinePayment,
  autoCreateVendingMachine
}