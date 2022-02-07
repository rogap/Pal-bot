/**
 * функции для работы со строками
 */


module.exports = {}


// вырезает начало строки, если она совпадает и возвращает результат
String.prototype.cut = function(text) {
	const index = this.indexOf(text)
	if (index == -1) return this // если нет искомого
	return this.slice(0, index) + this.slice(index + text.length)
}
Object.defineProperty(String.prototype, 'cut', {enumerable: false})


/**
 * выполняет парсинг контента из сообщения и возвращает параметры команды
 * @param {Boolean} owner - является ли команда админ командой
 * @returns {String}
 */
 String.prototype.parseContent = function(owner=false) {
	const text = this.mentionToId() // заменяем упоминания на id упоминающих, если таковы есть
	.cutPrefAndCom() // выезает префикс и команду
	.toString().replace(/[ ]+/g, ' ') // убираем двойные пробелы (и более)
	if (owner) return text // если команда для админа то ей вырезать спец символы не нужно
	return text.replace(/[\`\~\!\@\#\$\%\^\&\*\(\)\=\+\[\]\{\}\;\:\'\"\\\|\?\/\.\>\,\<]/g, '')
}
Object.defineProperty(String.prototype, 'parseContent', {enumerable: false})


/**
 * вырезает префикс и команду из контента
 * @returns {String}
 */
String.prototype.cutPrefAndCom = function() {
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