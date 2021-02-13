const Boom = require('@hapi/boom')
const { DB } = require('test-scg-sdk')
const Validation = require('./api.validation')

const getVendingMachineList = {
  auth: false, // for dev
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
  auth: false, // for dev
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
      let stock = await DB.Stock.findOne({
        vendingMachineId,
        productId
      })
      if (stock) {
        stock = await DB.Stock.update(stock._id, { quantity: stock.quantity - 1 }) 
      }
      const stockList = await DB.stock.find({ _id: stock._id })
      return {
        statusCode: 200,
        data: stockList
      }
    } catch (error) {
      console.log(error)
      return Boom.badImplementation()
    }
  }
}

const autoCreateVendingMachine = {
  auth: false, // for dev
  // ...Validation.autoCreateVendingMachine,
  handler: async (request) => {
    try {
      const vendingMachineList = []
      let i = 10
      while (i > 0) {
        const machineType = [
          'DRINK',
          'FOOD',
          'SNACK'
        ]
        const data = {
          statusId: 1,
          // machineType: machineType[Math.floor(Math.random() * (3 - 0)) + 0],
          machineType: machineType[0],
          lat: (Math.random() * (12 - 14) + 14).toFixed(7) * 1,
          lng: (Math.random() * (99 - 101) + 101).toFixed(7) * 1,
          Address: `${Math.floor(Math.random() * (99 - 1)) + 1}/${Math.floor(Math.random() * (99 - 1)) + 1}`,
          province: 'กรุงเทพมหานคร',
          district: 'ดอนเมือง',
          subDistrict: 'ดอนเมือง',
          zipCode: '10210'
        }
        const vendingMachine = await DB.VendingMachine.create(data)
        vendingMachineList.push(vendingMachine)
      }
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

const autoCreateProduct = {
  auth: false, // for dev
  // ...Validation.autoCreateProduct,
  handler: async (request) => {
    try {
      const productName = [
        { name: 'Green Tea (ชาเขียว)', price: 50 },
        { name: 'Thai Tea (ชานม)', price: 50 },
        { name: 'Apple Tea (ชาแอปเปิล)', price: 50 },
        { name: 'Jusmine Tea (ชามะลิ)', price: 50 },
        { name: 'Camomine Tea (ชาดอกคาร์โมมายด์)', price: 50 },
        { name: 'Berry Tea (ชาเบอร์รี่)', price: 50 },
        { name: 'Passion Fruit Mango Tea (ชามะม่วงเสารส)', price: 50 },
        { name: 'Earl Grey Tea (ชาเอิลเกรย์)', price: 50 },
        { name: 'Lipton Tea (ชาลิปตัน)', price: 50 },
        { name: 'Espresso Hot (เอสเพรสโซ)', price: 50 },
        { name: 'Americano (อเมริกาโน่)', price: 50 },
        { name: 'Cappucino (คาปูชิโน)', price: 50 },
        { name: 'Latte (ลาเต้)', price: 50 },
        { name: 'Mocha (มอคคา)', price: 50 },
        { name: 'macchito (แมคเคียโต)', price: 50 },
        { name: 'Cocoa (โกโก้)', price: 50 },
        { name: 'Milk (นม)', price: 50 },
        { name: 'Pepsi (เป๊ปซี่)', price: 20 },
        { name: 'sprite (สไปร์ท)', price: 20 },
        { name: 'Orange Mirinda (น้ำส้ม)', price: 20 },
        { name: 'Green Mirinda (น้ำเขียว)', price: 20 },
        { name: 'Mineral Water (น้ำแร่)', price: 20 },
        { name: 'Orange Juice (น้ำส้ม)', price: 60 },
        { name: 'Apple Juice (น้ำแอปเปิล)', price: 60 },
        { name: 'Grap Juice (น้ำองุ่น)', price: 60 },
        { name: 'Rassberry Juice (น้ำราสเบอร์รี่)', price: 60 },
        { name: 'Pineapple Juice (น้ำสับปะรด)', price: 60 },
        { name: 'Strawberry Juice (น้ำสตอเบอร์รี่)', price: 60 },
        { name: 'Mango Juice (น้ำมะม่วง)', price: 60 },
        { name: 'Passion Fruit (น้ำเสาวรส)', price: 60 }
      ]
      const productList = productName.map(async item => {
        const data = {
          productCode: Math.floor(Math.random() * 90000) + 10000,
          name: item.name,
          price: item.price
        }
        return await DB.Product.create(data)
      })
      await Promise.all(productList)
      return {
        statusCode: 200,
        data: productList
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

  // ===== for dev =====
  autoCreateVendingMachine,
  autoCreateProduct,
  // ===== for dev =====
}