const user = require('./userRoutes.js')
const setor = require('./setorRoutes.js')
const painel = require('./painelRoutes.js')
const senha = require('./senhaRoutes.js')
const admin = require('./adminRoutes.js')
const ubs = require('./ubsRoutes.js')
const video = require('./videoRoutes.js')

const routes = (app) => {
  app.use('/ubs', ubs)
  app.use('/admin', admin)
  app.use('/user', user)
  app.use('/setor', setor)
  app.use('/:ubs/senha', senha)
  app.use('/painel', painel)
  app.use('/video', video)
  app.use('/', painel)
}

module.exports = routes;
