/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


module.exports = Object.assign(
	require('./string'),
	require('./time.js'),
	require('./discord.js'),
	require('./helperSendSite.js')
)


Object.prototype.find = function(callback) {
    for (let key in this) {
        const value = this[key]
        const res = callback(key, value)
        if (res) return res
    }
}
Object.defineProperty(Object.prototype, 'find', {enumerable: false})


Array.prototype.filterRemove = function(callback) {
    const removedItems = [] // удаленные эллементы
	for (let i = 0; i < this.length; i++) {
		const item = this[i]
		if (!callback(item, i)) {
			removedItems.push( this.splice(i, 1)[0] )
			i--
		}
	}
    return removedItems
}
Object.defineProperty(Array.prototype, 'filterRemove', {enumerable: false})


/**
 * расставляет точки в числе
 */
String.prototype.goDot = Number.prototype.goDot = function() {
	return (this + '').split('').reverse().join('').match(/\d{1,3}/g).reverse().map(n => n.split('').reverse().join('')).join('.') // lol
}
Object.defineProperty(String.prototype, 'goDot', {enumerable: false})
Object.defineProperty(Number.prototype, 'goDot', {enumerable: false})





// изменение выдачи логов для удобства
console.logOrig = console.log // сохраняем оригинал
console.log = function(...args) {
    return this.logOrig(`~time/${new Date().toText()}/\t`, ...args)
}