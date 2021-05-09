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
	return this.replace(/^[\!\$\%\^\&\*\-\_\=\+\/\?\.\,\|\`\~]{1}[a-zа-я]{1,30}/i, '').trim()
}
Object.defineProperty(String.prototype, 'cutPrefAndCom', {enumerable: false})


/**
 * проверяет, есть ли упоминание пользователя (или discordId) в строке (в начале)
 * @returns {String}
 */
String.prototype.getMention = function() {
	const hasId = this.match(/(\<\@\!(?<id1>[0-9]{18})\>)|^(?<id2>[0-9]{18}) .?/)
	if (hasId === null) return false
	return hasId.groups.id1 || hasId.groups.id2
}
Object.defineProperty(String.prototype, 'getMention', {enumerable: false})


/**
 * вырещает упоминание подставляя туда id упомянутого (если есть)
 * @returns {String}
 */
String.prototype.mentionToId = function() {
	const mention = this.getMention()
	if (!mention) return this
	// const reg = new RegExp(`/^(\<\@\!${mention}\>/`)
	return this.replace(/(\<\@\![0-9]{18}\>)/, mention)
}
Object.defineProperty(String.prototype, 'mentionToId', {enumerable: false})