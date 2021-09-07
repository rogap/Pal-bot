/**
 * классы
 */


const CommandsManager = require('./CommandsManager')
const _local = process._local
const {config} = _local


module.exports = class Settings {
	constructor(data, type) {
		if (data.constructor === String) data = JSON.parse(data)
		if (!data.commands) data.commands = {}
		if (data.commands.constructor !== CommandsManager) data.commands = new CommandsManager(data.commands)

		// if (data.backgrounds && data.backgrounds.constructor === String) data.backgrounds = JSON.parse(data.backgrounds) // delete!!!

        this.id = data.id
		this.lang = data.lang
		this.timezone = isFinite(data.timezone) ? +data.timezone : undefined
		this.prefix = data.prefix
		this.backgrounds = data.backgrounds // delete!!!
		this.commands = data.commands
		if (data.only) this.only = data.only == '1' ? true : false
		this.params = data.params
		this.type = type
	}

	getProp() {
		return {
			lang: this.lang || config.lang,
			timezone: this.timezone || config.timezone,
			prefix: this.prefix || config.prefix,
			backgrounds: this.backgrounds || [...config.backgrounds], // delete!!!
			params: this.params || {}
		}
	}

	// добавляет дефолтные настройки если нет установленных
	addDefault() {
		this.lang = this.lang || config.lang
		this.timezone = this.timezone || config.timezone
		this.prefix = this.prefix || config.prefix
		this.backgrounds = this.backgrounds || [...config.backgrounds] // новый массив // delete!!!
		this.params = this.params || {}
		return this
	}

	async setParams(command, paramsName, value, userId) {
		const model = _local.models.userSettings
		const set = _local.userSettings.get(userId)

		if (set) { // если есть настройки пользователя (изменяем)
			if (!set.params[command]) set.params[command] = {}
			set.params[command][paramsName] = value

			this.params = set.params
			await _local.userSettings.set(userId, 'params', set.params)
			
			const find = await model.find({id: set.id})
			const data = find[0]
			if (!data) throw new Error('settings да ну бред'); // такого не может быть
			await model.findByIdAndUpdate(data._id, set)
			return this
		} else { // если нет настроек пользователя (создаем)
			const params = {}
			params[command] = {}
			params[command][paramsName] = value

			this.params = params
			_local.userSettings.add({id: userId, params})

			const save = await new model({
				id: userId,
				params
			})
			await save.save()
			return this
		}
	}
}