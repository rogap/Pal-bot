/**
 * классы
 */


const Settings = require('./Settings')


module.exports = class SettingsManager {
	#collection = {}

	constructor(type, item, parse) {
		this.type = type
		this.size = 0

		if (item) {
			if (item.constructor == Array) {
				this.addArr(item, parse)
			} else {
				this.add(item, parse)
			}
		}
	}

	add(data) {
		// добавляет эллемент в коллекцию
		const settings = new Settings(data)
		settings.type = this.type

		this.#collection[settings.id] = settings
		this.size++
		return this
	}

	addArr(dataArr, parse=true) {
		dataArr.forEach(data => {
			this.add(data, parse)
		})
		return this
	}

	get(id) {
		return this.#collection[id]
	}

    each(callback) {
        // перебирает эллементы
        for (let key in this.#collection) {
            callback(key, this.#collection[key]) // или поменять key и value местами???
        }
    }
}