const Router = require('koa-router')
const Orders = require('../models/orders')
const { convert } = require('../lib/exchangeRates')
const config = require('../config')

const router = new Router()
const ordersTemplate = orders =>
  orders.map(order => `
    <div style="width: 100%; overflow: hidden;">
      <div style="width: 50px; float: left;">${order.ID}</div>
      <div style="width: 100px; float: left;"><a href="/order/${order.locator}">${order.locator}</a></div>
      <div style="width: 100px; float: left;">${order.date_insert.toLocaleDateString()}</div>
      <div style="width: 100px; float: left;">${order.price}</div>
      <div style="width: 50px; float: left;">${order.currency}</div>
      <div style="width: 50px; float: left;">${order.passengers_count}</div>
      <div style="width: 100px; float: left;">${order.price_rub}</div>
    </div>`).join('')

const orderDetailsTemplate = order =>
  '<a href="/orders">< К списку</a><hr/>' +
  order.map(row => `
    <div style="width: 100%; overflow: hidden;">
      <div style="width: 50px; float: left;">${row.order_id}</div>
      <div style="width: 100px; float: left;">${row.locator}</div>
      <div style="width: 100px; float: left;">${row.name_second}</div>
      <div style="width: 100px; float: left;">${row.name_first}</div>
    </div>`).join('')

router
  .get('/orders', async ctx => {
    const orders = await Orders.getOrders()

    const data = await Promise.all(orders.map(async order => {
      order.price_rub = order.currency !== 'RUB'
        ? await convert(order.date_insert, order.price, order.currency)
        : order.price

      return order
    }))

    ctx.body = config.app.useTemplates ? ordersTemplate(data) : data
  })
  .get('/order/:locator', async ctx => {
    const data = await Orders.getOrderDetails(ctx.params.locator)

    ctx.body = config.app.useTemplates ? orderDetailsTemplate(data) : data
  })

module.exports = router.routes()
