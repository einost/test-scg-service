const glob = require('glob')

exports.plugin = {
  name: 'routers',
  version: '1.0.0',
  register: (server) => {
    const files = glob.sync('./src/api/*.route.js', {
      absolute: true
    })
    files.map((file) => {
      console.log('file', file)
      const routes = require(file)
      routes.forEach((route) => console.log(route.method + ' ' + route.path))
      server.route(routes)
    })
  }
}
