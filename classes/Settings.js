/**
 * классы
 */


const CommandsManager = require('./CommandsManager')
const _local = process._local
const {config} = _local


module.exports = class Settings {
	constructor(data) {
		if (data.constructor === String) data = JSON.parse(data)
		if (!data.commands) data.commands = {}
		if (data.commands.constructor !== CommandsManager) data.commands = new CommandsManager(data.commands)

		if (data.backgrounds && data.backgrounds.constructor === String) data.backgrounds = JSON.parse(data.backgrounds)

        this.id = data.id
		this.lang = data.lang || config.lang
		this.timezone = data.timezone != undefined ? +data.timezone : config.timezone
		this.prefix = data.prefix || config.prefix
		this.backgrounds = data.backgrounds || config.backgrounds
		this.commands = data.commands
		if (data.only) this.only = data.only == '1' ? true : false
	}

	getProp() {
		return {
			lang: this.lang,
			timezone: this.timezone,
			prefix: this.prefix,
			backgrounds: this.backgrounds,
		}
	}
}