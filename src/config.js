const routes = require('../routes')
const hapiAuth = require('hapi-auth-jwt2')
const inert = require('@hapi/inert')

const server = {
  connection: {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 7000,
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
    {
      plugin: require('hapi-geo-locate'),
      options: {
        enabledByDefault: true
      }
    }
  ]
}

module.exports = {
  server
}
