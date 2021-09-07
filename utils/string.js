/**
 * функции для работы со строками
 */


module.exports = {}


// вырезает начало строки, если она совпадает и возвращает результат
String.prototype.cut = function(text) {
	const reg = new RegExp(`^${text}`, 'i')
	return this.replace(reg, '')
}
Object.defineProperty(String.prototype, 'cut', {enumerable: false})


/**
 * вырезает префикс и команду из контента
 * @returns {String}
 */
String.prototype.cutPrefAndCom = function() {
	// return this.replace(/^[\!\$\%\^\&\*\-\_\=\+\/\?\.\,\|\`\~]{1}[a-zа-я]{1,30}/i, '').trim()
	return this.replace(/[\!\$\%\^\&\*\-\_\=\+\/\?\.\,\|\`\~a-zа-я]{1,30}/i, '').trim()
}
Object.defineProperty(String.prototype, 'cutPrefAndCom', {enumerable: false})


/**
 * вырезает упоминание подставляя туда id упомянутого (если есть)
 * @returns {String}
 */
String.prototype.mentionToId = function() {
	return this.replace(/\<\@!?([0-9]{18})\>/g, ' $1').trim()
}
Object.defineProperty(String.prototype, 'mentionToId', {enumerable: false})