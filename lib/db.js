const config = require('../config')
const mysql = require('mysql2/promise')

const poolConfig = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
  debug: config.db.debug
}

const pool = mysql.createPool(poolConfig)

module.exports = pool
