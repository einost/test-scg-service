const routes = require('./routes')
const hapiAuth = require('hapi-auth-jwt2')
const inert = require('@hapi/inert')
const vision = require('@hapi/vision')
const mongoose = require('mongoose')
const Constants = require('./constants')

const server = {
  connection: {
    host: Constants.HOST || 'localhost',
    port: Constants.PORT || 8001,
    routes: {
      cors: {
        origin: ['*'],
        credentials: true,
        additionalHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Request-Method', 'Access-Control-Allow-Methods']
      },
      validate: {}
    },
    mime: {
      override: {
        'application/json': {
          charset: 'UTF-8',
          compressible: false
        }
      }
    }
  },
  registers: [
    routes,
    hapiAuth,
    inert,
    vision
  ]
}

const database = {
  connect: async (dbAddress) => {
    try {
      await mongoose.connect(dbAddress, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      })
      console.log(`DB connected on ${dbAddress}`)
    } catch (error) {
      console.log(error)
    }
  },
  close: async () => {
    try {
      await mongoose.connection.close()
      console.log(`DB disconnected`)
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = {
  server,
  database
}
