const Orders = require('../models/orders')
const { convert } = require('../lib/exchangeRates')

module.exports = {
  getOrders: async ctx => {
    const orders = await Orders.getOrders()

    ctx.body = orders.map(order => {
      order.price_rub = order.currency !== 'RUB'
        ? convert(order.date_insert, order.price, order.currency)
        : order.price
    })
  },
  getOrderDetails: async ctx => ctx.body = await Orders.getOrderDetails(ctx.params.locator)
}
