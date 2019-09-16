const soap = require('soap')
const Cache = require('lru-cache')

const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL'
const cache = new Cache({ max: 100, max_age: 24 * 1000 * 60 * 60 })

/**
 * converts date to 'YYYY-MM-dd' format
 * @param {Date} date
 * @returns {string}
 */
function dateToString (date) {
  return date.toISOString().split('T')[0]
}

/**
 * multiplies value by rate and correctly rounds result to specified number of digits
 * (one does not simply round money in js :) )
 * @param {number|string} value
 * @param {number|string} rate
 * @param {number} digits
 * @returns {number}
 */
function convertCurrency (value, rate = 1, digits = 2) {
  const number = Number(value) * Math.pow(10, digits) * Number(rate)
  const rounded = Math.round(number)
  const result = Math.abs(number) % 1 === 0.5
    ? (rounded % 2 === 0
      ? rounded
      : rounded - 1)
    : rounded

  return result / Math.pow(10, digits)
}

/**
 * fetches exchange rates from cbr.ru (cached)
 * @param {string} onDate
 * @returns {Promise<*>}
 */
async function getRates (onDate) {
  let rates = cache.get(onDate)

  if (!rates) {
    let cbrRates = await soap.createClientAsync(url)
      .then(client => client.GetCursOnDateAsync({ 'On_date': onDate }))
      .then(result => result[0].GetCursOnDateResult.diffgram.ValuteData.ValuteCursOnDate)

    rates = cbrRates.reduce((acc, val) => {
      acc[val.VchCode] = Number(val.Vcurs)
      return acc
    }, { 'RUR': 1.00 })

    cache.set(onDate, rates)
  }

  return rates
}

/**
 * converts value from specified currency to RUB with historical exchange rate
 * @param {Date} dateTime
 * @param {number|string}value
 * @param {string} currency
 * @returns {Promise<number>}
 */
async function convert (dateTime, value, currency = 'USD') {
  const rates = await getRates(dateToString(dateTime))
  const rate = rates[currency] || 1

  return convertCurrency(value, rate)
}

module.exports = { convert, convertCurrency }

async function main () {
  console.log(await convert('2019-09-03', 26.12))
  console.log(await convert('2019-09-03', 52.10))
  console.log(await convert('2019-09-04', 52.10))
  console.log(await convert('2019-09-04', 11.50))
  console.log(await convert('2019-09-04', 11.51))
  console.log(await convert('2019-09-04', 12.51))
  console.log(await convert('2019-09-04', 13.51))
  console.log(await convert('2019-09-04', 14.51))
  console.log(await convert('2019-09-04', 15.51))
  console.log(await convert('2019-09-05', 11.50))
}

if (require.main === module) {
  main().then(() => {}).catch(e => console.error(e))
}
