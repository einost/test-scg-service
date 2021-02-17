const _ = require('underscore')
const Boom = require('@hapi/boom')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
const {
  Constants: {
    AdminRole,
    VendingMachineStatus
  },
  DB: {
    Admin,
    VendingMachine,
    Product,
    Stock
  },
  Utils: {
    Email
  }
} = require('test-scg-sdk')
const Constants = require('../constants')
const Validation = require('./api.validation')

const adminLogin = {
  auth: false,
  ...Validation.login,
  handler: async (request, h) => {
    try {
      const {
        email,
        password
      } = request.payload
      const admin = await Admin.findOne({ email })
      if (!admin) {
        return Boom.badRequest('user not exists')
      }
      const isMatch = bcrypt.compareSync(password, admin.password)
      if (!isMatch) {
        return Boom.badRequest('invalid password')
      }
      const testScgToken = JWT.sign({ email }, Constants.SECRET_KEY, { expiresIn: Constants.TOKEN_EXPIRE })
      const testScgRefreshToken = JWT.sign({ email }, Constants.SECRET_KEY, { expiresIn: Constants.REFRESH_TOKEN_EXPIRE })
      return {
        statusCode: 200,
        data: {
          testScgToken,
          testScgRefreshToken
        }
      }
    } catch (error) {
      console.log(error)
      return Boom.badImplementation()
    }
  }
}

const refreshToken = {
  auth: false,
  handler: async (request, h) => {
    try {
      const { authorization } = request.headers
      const decoded = JWT.verify(authorization, Constants.SECRET_KEY)
      const { 
        vendingMachineId, 
        email
      } = decoded
      if (vendingMachineId || email) {
        const testScgToken = JWT.sign({ email }, Constants.SECRET_KEY, { expiresIn: Constants.TOKEN_EXPIRE })
        const testScgRefreshToken = JWT.sign({ email }, Constants.SECRET_KEY, { expiresIn: Constants.REFRESH_TOKEN_EXPIRE })
        return {
          statusCode: 200,
          data: {
            testScgToken,
            testScgRefreshToken
          }
        }
      }
      return Boom.unauthorized()
    } catch (error) {
      console.log(error)
      return Boom.unauthorized(error)
    }
  }
}

const getVendingMachineList = {
  ...Validation.getVendingMachineList,
  handler: async (request) => {
    try {
      const {
        page,
        limit
      } = request.query
      const vendingMachineList = await VendingMachine.getList({}, page, limit)
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

const getStockList = {
  ...Validation.getStockList,
  handler: async (request) => {
    try {
      const { vendingMachineId } = request.payload
      const stockList = await Stock.find({ vendingMachineId })
      if (stockList.length === 0) {
        return Boom.notFound(`not found stock of vending machine by ${vendingMachineId}`)
      }
      let allQuantity = 0
      stockList.map(item => {
        allQuantity += item.quantity || 0
      })
      return {
        statusCode: 200,
        data: {
          stockList,
          quantity: allQuantity
        }
      }
    } catch (error) {
      console.log(error)
      return Boom.badImplementation()
    }
  }
}

const vendingMachinePayment = {
  ...Validation.vendingMachinePayment,
  handler: async (request) => {
    try {
      const { vendingMachineId } = request.auth.credentials
      const { productId } = request.payload
      let vendingMachine = await VendingMachine.findById(vendingMachineId)
      if (!vendingMachine) {
        return Boom.notFound(`not found vending machine by ${vendingMachineId}`)
      }
      const product = await Product.findById(productId)
      if (!product) {
        return Boom.notFound(`not found vending machine by ${productId}`)
      }
      let stock = await Stock.findOne({
        vendingMachineId,
        productId
      })
      let stock = await Stock.findOne({
        vendingMachineId,
        productId
      })
      if (stock) {
        if (stock.quantity <= 0) {
          return Boom.badData('product out of stock')
        }
        stock = await Stock.update(stock._id, { quantity: stock.quantity - 1 })
        /** 
        * ====================================
        * ========== Payement Logic ==========
        * ====================================
        * 
        * ...do something
        * 
        */
      }
      const stockList = await Stock.find({ vendingMachineId })
      let allQuantity = 0
      stockList.map(item => {
        allQuantity += item.quantity || 0
      })
      // allQuantity = 9 // for dev
      let mailUrl
      if (allQuantity < 10) {
        vendingMachine = await VendingMachine.update(vendingMachineId, { statusId: VendingMachineStatus.NEAR_OFFLINE })
        const admin = await Admin.find({
          role: AdminRole.BRONZE
        })
        if (admin.length) {
          const mailFrom = Constants.MAIL.FROM
          const mailTo = admin.map(item => item.email)
          const subject = `สินค้าใกล้จะหมด!!! [รหัสเครื่อง: ${vendingMachineId}]`
          const html = `
            <div>
              <p>เรียนเจ้าหน้าที่ทุกท่าน</p>
              <p>ขอแจ้งให้ทราบว่าขณะนี้สินค้าจากเครื่องจำหน่ายสินค้าอัตโนมัติใกล้จะหมดแล้ว</p>
              <div>
                <p style="margin: 0;"><b>id:</b> ${vendingMachine._id}</p>
                <p style="margin: 0;"><b>type:</b> ${vendingMachine.machineType}</p>
                <p style="margin: 0;"><b>quantity:</b> ${allQuantity}</p>
                <p style="margin: 0;"><b>address:</b> ${vendingMachine.address} ${vendingMachine.subDistrict} ${vendingMachine.district} ${vendingMachine.province} ${vendingMachine.zipCode}</p>
                <p style="margin: 0;"><b>location:</b> <a href="https://maps.google.com/?q=${vendingMachine.lat},${vendingMachine.lng}" target="_blank">คลิก</p>
              </div>
            </div>
          `
          mailUrl = await Email.send({
            from: mailFrom,
            to: mailTo,
            subject,
            html
          })
        }
      }
      const vendingMachineStatus = _.invert(VendingMachineStatus)[vendingMachine.statusId]
      return {
        statusCode: 200,
        data: {
          mailUrl,
          vendingMachineStatus: vendingMachineStatus,
          quantity: allQuantity,
          message: 'Success'
        }
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
          address: `${Math.floor(Math.random() * (99 - 1)) + 1}/${Math.floor(Math.random() * (99 - 1)) + 1}`,
          province: 'กรุงเทพมหานคร',
          district: 'ดอนเมือง',
          subDistrict: 'ดอนเมือง',
          zipCode: '10210'
        }
        const vendingMachine = await VendingMachine.create(data)
        vendingMachineList.push(vendingMachine)
        i--
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
        return await Product.create(data)
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

const createStock = {
  auth: false, // for dev
  // ...Validation.createStock,
  handler: async (request) => {
    try {
      const { vendingMachineId } = request.payload
      const productIdList = [
        '6027a937b016aa04bcb21506',
        '6027a937b016aa04bcb21507',
        '6027a937b016aa04bcb21508',
        '6027a937b016aa04bcb21509',
        '6027a937b016aa04bcb2150a'
      ]
      const stockList = await Promise.all(
        productIdList.map(async item => {
          const data = {
            vendingMachineId,
            productId: item,
            quantity: Math.floor(Math.random() * (11 - 5)) + 5
          }
          return await Stock.create(data)
        })
      )
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

const createAdmin = {
  auth: false,
  // ...Validation.createAdmin,
  handler: async (request) => {
    try {
      const {
        // email,
        password,
        // firstName,
        // lastName,
        // role
      } = request.payload
      const hashPassword = bcrypt.hashSync(password, 10)
      await Admin.create({
        ...request.payload,
        password: hashPassword
      })
      // non_scoobydoo@hotmail.com
      // 12345678
      // GOLD 99

      // nonscoobydoo@gmail.com
      // 12345678
      // BRONZE 0
      return {
        statusCode: 200,
        data: {
          message: 'Success'
        }
      }
    } catch (error) {
      console.log(error)
      return Boom.badImplementation()
    }
  }
}

module.exports = {
  adminLogin,
  refreshToken,

  getVendingMachineList,
  getStockList,
  vendingMachinePayment,

  // ===== for dev =====
  autoCreateVendingMachine,
  autoCreateProduct,
  createStock,
  createAdmin
  // ===== for dev =====
}