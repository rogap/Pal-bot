module.exports = class Settings {
	#collection = {}

	constructor(type) {
		this.type = type
	}

	static parse(obj) {
		// приводит обьект настроек в используемый вид (после поулчения из БД)
		delete obj.count
		obj.commands = JSON.parse(obj.commands)
		obj.backgrounds = JSON.parse(obj.backgrounds)
		return obj
	}

	add(el, parse=false) {
		// добавляет эллемент в коллекцию
		if (parse) el = Settings.parse(el)
		this.#collection[el.id] = el
	}

	addArr(elArr, parse=false) {
		elArr.forEach(el => {
			this.add(el, parse)
		})
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