const Hapi = require('@hapi/hapi')
const Config = require('./src/config')

const server = new Hapi.Server(Config.server.connection)

const init = async () => {
  await server.register(Config.server.registers)
  await server.start()

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.SECRET_KEY,
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
