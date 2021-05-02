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