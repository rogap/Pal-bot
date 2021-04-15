const CommandsManager = require('./CommandsManager')
const _local = process._local
const {config} = _local


module.exports = class Settings {
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

	static parse(obj) {
		// приводит обьект настроек в используемый вид (после получения из БД)
		delete obj.count
		obj.commands = new CommandsManager( JSON.parse(obj.commands) )
		obj.backgrounds = JSON.parse(obj.backgrounds)
		return obj
	}

	add(el, parse=false) {
		// добавляет эллемент в коллекцию
		if (parse) {
			el = Settings.parse(el)
		} else {
			el.commands = new CommandsManager(el.commands)
		}

		el.lang = el.lang || config.lang
		el.timezone = el.timezone || config.timezone
		el.prefix = el.prefix || config.prefix
		el.backgrounds = el.backgrounds || config.backgrounds

		this.#collection[el.id] = el
		this.size++
		return this
	}

	addArr(elArr, parse=true) {
		elArr.forEach(el => {
			this.add(el, parse)
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