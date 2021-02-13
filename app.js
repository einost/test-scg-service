const Hapi = require('@hapi/hapi')
const { Utils } = require('test-scg-sdk')
const Config = require('./src/config')
const Constants = require('./src/constants')

const server = new Hapi.Server(Config.server.connection)

const init = async () => {
  await server.register(Config.server.registers)
  await server.start()
  await Config.database.connect(Constants.DB_URL)

  server.events.on('response', request => {
    Utils.Logger.eventLog(request)
  })
  server.auth.strategy('jwt', 'jwt', {
    key: Constants.SECRET_KEY,
    validate: async (decoded, request, h) => {
      const { vendingMachineId } = decoded
      if (!vendingMachineId) {
        return { isValid: false }
      } else {
        return { isValid: true }
      }
    }
  })
  server.auth.default('jwt')

  console.log(`Server running on port ${server.info.uri}`)
}

init()
