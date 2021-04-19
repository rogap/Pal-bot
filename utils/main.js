/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


module.exports = Object.assign(
	require('./discord.js'),
	require('./helperSendSite.js')
)






/**
 * приводит имя чемпиона в стандартизированный вид для нас
 * @returns 
 */
String.prototype.normalizeChampName = function() {
	return this.replace(/[-`' ]+/g, "").toLowerCase()
}
Object.defineProperty(String.prototype, "normalizeChampName", {enumerable: false})



// вырезает начало строки, если она совпадает и возвращает результат
String.prototype.cut = function(text) {
	const reg = new RegExp(`^${text}`, "i")
	return this.replace(reg, "")
}
Object.defineProperty(String.prototype, "cut", {enumerable: false})