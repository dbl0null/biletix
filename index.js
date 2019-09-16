const Koa = require('koa')
const Router = require('koa-router')

const error = require('./middleware/error')
const orders = require('./routes/orders')

const config = require('./config')

const app = new Koa()
const router = Router()

app.use(error)
app.use(orders).use(router.allowedMethods())

const port = config.server.port || 3000

app.listen(port, () => console.log(`listening on ${port}`))
