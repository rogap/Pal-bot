/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


module.exports = Object.assign(
	require('./time.js'),
	require('./discord.js'),
	require('./helperSendSite.js')
)


// вырезает начало строки, если она совпадает и возвращает результат
String.prototype.cut = function(text) {
	const reg = new RegExp(`^${text}`, "i")
	return this.replace(reg, "")
}
Object.defineProperty(String.prototype, "cut", {enumerable: false})