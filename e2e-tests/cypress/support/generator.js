const faker = require('faker')
const { v4: uuidv4 } = require('uuid')
const moment = require('moment')
const monthsDe = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthsEnShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
function generateExpertNames(expertCount, domain = 'mail.com') {
  let expertData = []
  for (let i = 0; i < expertCount; i++) {
    const firstName = generateFirstName()
    const lastName = generateLastName()

    expertData.push({
      firstName: firstName,
      lastName: lastName,
      originalName: `${firstName} ${lastName}`,
      email: firstName + lastName + '@' + domain
    })
  }
  return expertData
}

function getCurrentTime () {
  var timeNow = moment().format('HH:mm'),
  timeMinusOne = moment().subtract(1, 'minutes').format('HH:mm'),
  timeMinusTwo = moment().subtract(2, 'minutes').format('HH:mm'),
  timeMinusThree = moment().subtract(3, 'minutes').format('HH:mm'),
  timeMinusTFour = moment().subtract(4, 'minutes').format('HH:mm'),
  timeMinusTFive = moment().subtract(5, 'minutes').format('HH:mm'),
  timePlusOne = moment().add(1, 'minutes').format('HH:mm'),
  timePlusTwo = moment().add(2, 'minutes').format('HH:mm'),
  timePlusTwo = moment().add(3, 'minutes').format('HH:mm')
   
   return [timeNow, timeMinusOne, timeMinusTwo, timeMinusThree, timeMinusTFour, timeMinusTFive,timePlusOne, timePlusTwo]
}

function generateTestName() {
  let name = Math.round(new Date().getTime() / 1000)
  return 'QAU' + name
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

function startTimeForTomorrowSlotAvailability() {
  let tomorrow = new Date()
  tomorrow.setDate(new Date().getDate() + 1)
  tomorrow.setMinutes(0)
  tomorrow.setSeconds(0)
  return tomorrow.getTime()
}

function convertDateToFormat(date, format) {
  return moment(date).format(format)
}

function endTimeForTomorrowSlotAvailability() {
  let tomorrow = new Date()
  tomorrow.setDate(new Date().getDate() + 1)
  tomorrow.setMinutes(30)
  tomorrow.setSeconds(0)
  return tomorrow.getTime()
}

function startTimeForRescheduleSlot() {
  let tomorrow = new Date()
  tomorrow.setDate(new Date().getDate() + 2)
  tomorrow.setMinutes(0)
  tomorrow.setSeconds(0)
  return tomorrow.getTime()
}

function endTimeForRescheduleSlot() {
  let tomorrow = new Date()
  tomorrow.setDate(new Date().getDate() + 2)
  tomorrow.setMinutes(30)
  tomorrow.setSeconds(0)
  return tomorrow.getTime()
}

function endTimeForRescheduleSlotOfOneHour() {
  let tomorrow = new Date()
  tomorrow.setDate(new Date().getDate() + 2)
  tomorrow.setMinutes(60)
  tomorrow.setSeconds(0)
  return tomorrow.getTime()
}

function returnDateForAvailableSlot(datefromAPIResponse) {
  let date1 = new Date(datefromAPIResponse)
  let date2 = date1.toString()
  return date2.substring(4, 10)
}

function returnTimeForAvailableSlot(datefromAPIResponse) {
  let date1 = new Date(datefromAPIResponse)
  let date2 = date1.toString()
  return date2.substring(16, 21)
}

function returnDateinDDMMYYYYFormat(datefromAPIResponse) {
  let date1 = new Date(datefromAPIResponse)
  return (
    (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate()) +
    '-' +
    (date1.getMonth() + 1 < 10
      ? '0' + (date1.getMonth() + 1)
      : date1.getMonth() + 1) +
    '-' +
    date1.getFullYear()
  )
}

function returnDateWithoutMonth(datefromAPIResponse) {
  let date1 = new Date(datefromAPIResponse)
  let date2 = date1.toString()
  let date3 = date2.substring(8, 10)
  return date3.replace(/^0+/, '')
}

function generateUniqueIDForClient() {
  return uuidv4()
}

function generateUniqueIDForExpert() {
  return uuidv4()
}

function generateUniqueIDForScheduleSlot() {
  return uuidv4()
}

function generateLastName() {
  return faker.name.lastName()
}

function generateFirstName() {
  return faker.name.firstName()
}

function generateCurrentMonthYear() {
  let date = new Date()
  let n1 = date.getFullYear()
  let n2 = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
  return n2 + '-' + n1
}

function generateCurrentYear() {
  let date = new Date()
  return date.getFullYear()
}

function generateCurrentQuarter() {
  let date = new Date()
  let quarter = [1, 2, 3, 4]
  return quarter[Math.floor(date.getMonth() / 3)]
}

function generateAccountCode() {
  let number1 = faker.random.number()
  let number2 = number1.toString()
  return number2.substring(0, 3)
}

function generatePhoneNumber() {
  return faker.phone.phoneNumber('0165#######')
}

function generateCurrentMonth() {
  var d = new Date();
  return monthsEn[d.getMonth()]
}

function generateMonthforRescheduleSlot(rescheduleSlot) {
  var d = new Date(rescheduleSlot);
  return (monthsDe[d.getMonth()] + ' ' + d.getDate())
}

function returnDateinYYYYMMDDFormat() {
  let date1 = new Date()
  return (
    date1.getFullYear() +
    '-' +
    (date1.getMonth() + 1 < 10
      ? '0' + (date1.getMonth() + 1)
      : date1.getMonth() + 1) +
    '-' +
    (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate())
  )
}

function returnNextMonthDateinYYYYMMDDFormat() {
  let date1 = new Date()
  let month = (date1.getMonth() + 2 < 10
    ? '0' + (date1.getMonth() + 2)
    : date1.getMonth() + 2)
  let year = date1.getFullYear()
  let day = (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate())
  if (month > 12) {
    month = month - 12
    year = year + 1
  }

  return (year + '-' + month + '-' + day)
}

function returnFirstDateOfCurrentMonth() {
  let date1 = new Date()
  return (
    date1.getFullYear() +
    '-' +
    (date1.getMonth() + 1 < 10
      ? '0' + (date1.getMonth() + 1)
      : date1.getMonth() + 1) +
    '-01'
  )
}

function returnDateinYYYYMMFormat() {
  let date1 = new Date()
  return (
    date1.getFullYear() +
    '-' +
    (date1.getMonth() + 1 < 10
      ? '0' + (date1.getMonth() + 1)
      : date1.getMonth() + 1)
  )
}

function returnTime(timeStamp) {
  var ts = new Date(timeStamp);

  return ts.getHours() + ':' + ts.getMinutes()
}

function returnDayDate(timeStamp) {
  var ts = new Date(timeStamp);

  return dayEn[ts.getDay()] + ', ' + ts.getDate()
}

function returnMonth(timeStamp) {
  var ts = new Date(timeStamp);

  return monthsEn[ts.getMonth()]
}

function returnMonthDD(timeStamp) {
  var ts = new Date(timeStamp);
  var date

  if (ts.getDate().toString().length < 2) {
    date = '0' + ts.getDate()
  } else {
    date = ts.getDate()
  }

  return monthsEnShort[ts.getMonth()] + ' ' + date
}

function generateCurrentYearMonth() {
  let date = new Date()
  let n1 = date.getFullYear()
  let n2 = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)
  return n1 + '-' + n2
}

function generateYesterdayDate() {
  var date = new Date();
  var date1 = new Date(date.setDate(date.getDate() - 1));
  return (date1.getFullYear() +
    '-' +
    (date1.getMonth() + 1 < 10
      ? '0' + (date1.getMonth() + 1)
      : date1.getMonth() + 1) +
    '-' +
    (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate())
  )
}

function generateDateAddMinutesLater(minutes) {
  return moment().add(minutes, 'm').startOf('second').toISOString()
}

function generateTodayDate() {
  var date = new Date();
  return (
    (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
  )
}

function generateLastMonthYear() {
  let date = new Date()
  let n1 = date.getFullYear()
  let n2 = date.getMonth() < 9 ? '0' + (date.getMonth()) : (date.getMonth())
  return n1 + '-' + n2
}

function generateMonthnameDDYYYY() {
  let date = new Date();
  let list = date.toUTCString().split(" ")
  return list[2] + " " + list[1] + ", " + date.getFullYear();

}

function todayDateinDDMMYYYYFormat() {
  let date1 = new Date()
  return (
    (date1.getDate() < 10 ? '0' + date1.getDate() : date1.getDate()) +
    '-' +
    (date1.getMonth() + 1 < 10
      ? '0' + (date1.getMonth() + 1)
      : date1.getMonth() + 1) +
    '-' +
    date1.getFullYear()
  )
}

module.exports = {
  generateTestName,
  getRandomInt,
  generateLastName,
  generateFirstName,
  startTimeForTomorrowSlotAvailability,
  generateUniqueIDForClient,
  generateUniqueIDForExpert,
  endTimeForTomorrowSlotAvailability,
  returnDateForAvailableSlot,
  returnTimeForAvailableSlot,
  returnDateinDDMMYYYYFormat,
  returnTime,
  returnDayDate,
  returnMonth,
  returnMonthDD,
  generateUniqueIDForScheduleSlot,
  returnDateWithoutMonth,
  startTimeForRescheduleSlot,
  convertDateToFormat,
  endTimeForRescheduleSlot,
  endTimeForRescheduleSlotOfOneHour,
  generateCurrentMonthYear,
  generateCurrentYear,
  generateCurrentQuarter,
  generateCurrentMonth,
  generateAccountCode,
  generatePhoneNumber,
  getCurrentTime,
  returnDateinYYYYMMDDFormat,
  returnNextMonthDateinYYYYMMDDFormat,
  returnFirstDateOfCurrentMonth,
  returnDateinYYYYMMFormat,
  generateCurrentYearMonth,
  generateYesterdayDate,
  generateTodayDate,
  generateLastMonthYear,
  generateDateAddMinutesLater,
  generateMonthnameDDYYYY,
  todayDateinDDMMYYYYFormat,
  generateMonthforRescheduleSlot,
  generateExpertNames
}
