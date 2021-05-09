/**
 * функции для работы со временем и датой
 */


const _local = process._local
const {config} = _local


module.exports = {}


/**
 * превращает last_update из БД в обьект Data, если уканаза зона то добавляет часы
 * @param {Number} timezone - временная зона (сколько часов будет добавленно)
 * @returns {Date}
 */
String.prototype.updateToDate = Number.prototype.updateToDate = function(timezone=0) {
    if ( !isFinite(+this) ) throw new TypeError('"this" должно быть числом.')
    if ( !isFinite(+timezone) ) throw new TypeError('"timezone" должно быть числом.')
	const repTimeUpdate = this.replace(/([0-9]{4})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})([0-9]{2})/, '$1,$2,$3,$4,$5,$6')
	const repTimeUpdateSplit = repTimeUpdate.split(",")
	repTimeUpdateSplit[1] -= 1 // фиксим месяц (для нас 1 это начало, а у кода 0 это начало месяца)
	return new Date( ...repTimeUpdateSplit ).addHours(timezone)
}
Object.defineProperty(String.prototype, "updateToDate", {enumerable: false})
Object.defineProperty(Number.prototype, "updateToDate", {enumerable: false})


/**
 * возвращает дату добавив в нее указанное кол-во часов
 * @param {Number} hours - кол-во часов которые нужно добавить в дату
 * @returns {Date}
 */
Date.prototype.addHours = function(hours=0) {
    if ( !isFinite(+hours) ) throw new TypeError('"hours" должно быть числом.')
	return new Date( +this + hours * 1000 * 60 * 60 )
}
Object.defineProperty(Date.prototype, "addHours", {enumerable: false})


/**
 * возвращает дату добавив в нее указанное кол-во минут
 * @param {Number} minutes - кол-во минут которые нужно добавить в дату
 * @returns {Date}
 */
Date.prototype.addMinutes = function(minutes=0) {
    if ( !isFinite(+minutes) ) throw new TypeError('"minutes" должно быть числом.')
	return new Date( +this + minutes * 1000 * 60 )
}
Object.defineProperty(Date.prototype, "addMinutes", {enumerable: false})


/**
 * возвращает дату добавив в нее указанное кол-во секунд
 * @param {Number} seconds - кол-во секунд которые нужно добавить в дату
 * @returns {Date}
 */
Date.prototype.addSeconds = function(seconds=0) {
    if ( !isFinite(+seconds) ) throw new TypeError('"seconds" должно быть числом.')
	return new Date( +this + seconds * 1000 )
}
Object.defineProperty(Date.prototype, "addSeconds", {enumerable: false})


/**
 * превращаем время(число, полная дата) в текстовый вид
 * @returns {String}
 */
Date.prototype.toText = function() {
	const year = this.getFullYear().fixNumTime()
	const mounth = (this.getMonth() + 1).fixNumTime()
	const day = this.getDate().fixNumTime()
	const hours = this.getHours().fixNumTime()
	const minutes = this.getMinutes().fixNumTime()
	const seconds = this.getSeconds().fixNumTime()
	return `${day}.${mounth}.${year} ${hours}:${minutes}:${seconds}`
}
Object.defineProperty(Date.prototype, "toText", {enumerable: false})


/**
 * делает число 1 как 01
 * @returns {String}
 */
String.prototype.fixNumTime = Number.prototype.fixNumTime = function() {
    if ( !isFinite(+this) ) throw new TypeError('"this" должно быть числом.')
	return this > 9 ? this + '' : "0" + this
}
Object.defineProperty(String.prototype, "fixNumTime", {enumerable: false})
Object.defineProperty(Number.prototype, "fixNumTime", {enumerable: false})


/**
 * получает время следующего обновления
 * @param {String} type 
 * @param {Number} timezone 
 * @returns {String}
 */
String.prototype.getNextUpdate = Number.prototype.getNextUpdate = function(type, timezone=0) {
    if ( !isFinite(+this) ) throw new TypeError('"this" должно быть числом.')
	return this.updateToDate(timezone).addSeconds(config.timeLimit[type]).toText()
}
Object.defineProperty(String.prototype, "getNextUpdate", {enumerable: false})
Object.defineProperty(Number.prototype, "getNextUpdate", {enumerable: false})