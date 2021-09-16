/**
 * классы
 */


const Settings = require('./Settings')
const fs = require('fs')
const { _local } = require('process')


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
		const settings = new Settings(data, this.type)
		settings.type = this.type
		// if (settings.id == '510112915907543042') console.log(settings.commands.list)

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
		const settings = this.#collection[id]
		if (!settings) return false
		// const set = JSON.parse(JSON.stringify(settings))
		return new Settings({...settings}, this.type)
		// return new Settings({
		// 	id: settings.id,
		// 	lang: settings.lang,
		// 	timezone: settings.timezone,
		// 	prefix: settings.prefix,
		// 	backgrounds: settings.backgrounds,
		// 	commands: settings.commands,
		// 	only: settings.only,
		// 	params: settings.params,
		// 	type: settings.type
		// }, this.type) // возвращаем всегда новый обьект!
	}

	async set(id, type, value) { // так мы берем всегда новый обьект настроек то для смены данных нужен такой метод
		const model = _local.models[this.type == 'user' ? 'userSettings' : 'guildSettings']
		// console.log('БЫЛО', this.#collection[id][type], value)
		if (!this.#collection[id]) {
			// console.log('save')
			this.#collection[id] = {}
			const newOpt = {id}
			newOpt[type] = value
			this.#collection[id][type] = value // меняем локально
			const save = await new model(newOpt)
			await save.save()
			// console.log(this.#collection[id])
		} else {
			// console.log('update', type, value)
			this.#collection[id][type] = value // меняем локально
			const newOpt = {}
			newOpt[type] = value
			await model.updateOne({id: id}, newOpt) // меняем в БД
			// console.log(this.#collection[id])
		}
	}

    each(callback) {
        // перебирает эллементы
        for (let key in this.#collection) {
            callback(key, new Settings({...this.#collection[key]}), this.type) // или поменять key и value местами???
        }
    }

	// загрузить выбранный файл в БД
	static async import(src, type) {
		const json = fs.readFileSync(src)
		const data = JSON.parse(json)

		const model = type == 'guild' ? _local.models.guildSettings : _local.models.userSettings
		for (let i = 0; i < data.length; i++) {
			const item = data[i]
			const save = await new model(item)
			await save.save()
		}
		return true
	}

	// сохранить
	async export(src, type) {}
}