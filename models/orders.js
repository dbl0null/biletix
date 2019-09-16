const db = require('../lib/db')

const queries = {
  // Номер заказа | Локатор | дата последнего обновлениЯ | стоимость в рублях | стоимость в валюте заказа | Количество пассажиров
  getOrders: `SELECT
                orders.ID,
                orders.locator,
                orders.date_insert,
                orders.price,
                orders.currency,
                COALESCE(count(order_passengers.order_id), 0) AS passengers_count
            FROM orders LEFT JOIN order_passengers ON orders.id = order_passengers.order_id
            GROUP BY orders.id
            ORDER BY orders.ID DESC`,

  // Номер заказа | Локатор | фамилия | Имя
  getOrderDetails: `SELECT
                order_passengers.order_id,
                orders.locator,
                order_passengers.name_second,
                order_passengers.name_first
            FROM order_passengers JOIN orders ON orders.ID = order_passengers.order_id
            WHERE locator = ?`
}

async function getOrders () {
  return (await db.query(queries.getOrders))[0]
}

async function getOrderDetails (locator) {
  return (await db.query(queries.getOrderDetails, locator))[0]
}

module.exports = { getOrders, getOrderDetails }
