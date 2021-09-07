/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


const fs = require('fs')
const path = require('path')
const _local = process._local


module.exports = Object.assign(
	require('./string'),
	require('./time.js'),
	require('./discord.js'),
	require('./helperSendSite.js'),
	{setSlashCommands, saveUserSettings, saveGuildSettings, saveUserNicnames}
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


/**
 * проверяет есть ли каждый переданный параметр в текущем массиве
 * @param {String} text 
 * @return {Boolean}
 */
Array.prototype.has = function(...list) {
	return list.every(text => {
		const lowerText = text.toLowerCase()
		return this.some(el => el.toLowerCase() == lowerText)
	})
}
Object.defineProperty(Array.prototype, 'has', {enumerable: false})





// изменение выдачи логов для удобства
console.logOrig = console.log // сохраняем оригинал
console.log = async function(...args) {
	try {
		const date = new Date().toText()
		// тут нужно записать это в файл логов
		const day = date.split(' ')[0]
		const p = path.join(_local.path, 'logs', day)
		console.logOrig(`|${date}|\t`, ...args)

		let formText = ''
		for (let i = 0; i < args.length; i ++) {
			const item = args[0]
			if (getRlyConstructor(item) == String) {
				formText += `|${date}|` + item + '\n'
			} else {
				formText += objToString(item, `|${date}|`) + '\n'
			}
		}

		await fs.appendFileSync(p, formText)
	} catch(err) {
		console.logOrig(err)
	}
}


function objToString(obj, prefix) {
	try {
		let srt = `${prefix}\t{\n`
		for (let key1 in obj) {
			const item1 = obj[key1]
			if (getRlyConstructor(item1) == Object) {
				// еще 1 цикл
				srt += `\t${key1}: {\n`
				for (let key2 in item1) {
					const item2 = item1[key2]
					if (getRlyConstructor(item2) == Object) {
						// еще 1 цикл
						srt += `\t\t${key1}: {\n`
						for (let key3 in item2) {
							const item3 = item2[key3]
							if (getRlyConstructor(item3) == Object) {
								// еще 1 цикл
								srt += `\t\t\t${key1}: {\n`
								for (let key4 in item3) {
									const item4 = item3[key4]
									if (getRlyConstructor(item4) == Object) {
										// все
										srt += `\t\t\t${key4}: "[object Object]",\n`
									} else if (getRlyConstructor(item4) == String) {
										srt += `\t\t\t\t${key4}: "${item4}",\n`
									} else if (getRlyConstructor(item4) == Function) {
										srt += `\t\t\t\t${key4}: "[Function]",\n`
									} else if (getRlyConstructor(item4) == Symbol) {
										srt += `\t\t\t\t${key4}: "[Symbol]",\n`
									} else {
										srt += `\t\t\t\t${key4}: ${item4},\n`
									}
								}
								srt = srt.slice(0, -2) + '\n\t\t\t},\n'
							} else if (getRlyConstructor(item3) == String) {
								srt += `\t\t\t${key3}: "${item3}",\n`
							} else if (getRlyConstructor(item3) == Function) {
								srt += `\t\t\t${key3}: "[Function]",\n`
							} else if (getRlyConstructor(item3) == Symbol) {
								srt += `\t\t\t${key3}: "[Symbol]",\n`
							} else {
								srt += `\t\t\t${key3}: ${item3},\n`
							}
						}
						srt = srt.slice(0, -2) + '\n\t\t},\n'
					} else if (getRlyConstructor(item2) == String) {
						srt += `\t\t${key2}: "${item2}",\n`
					} else if (getRlyConstructor(item2) == Function) {
						srt += `\t\t${key2}: "[Function]",\n`
					} else if (getRlyConstructor(item2) == Symbol) {
						srt += `\t\t${key2}: "[Symbol]",\n`
					} else {
						srt += `\t\t${key2}: ${item2},\n`
					}
				}
				srt = srt.slice(0, -2) + '\n\t},\n'
			} else if (getRlyConstructor(item1) == String) {
				srt += `\t${key1}: "${item1}",\n`
			} else if (getRlyConstructor(item1) == Function) {
				srt += `\t${key1}: "[Function]",\n`
			} else if (getRlyConstructor(item1) == Symbol) {
				srt += `\t${key1}: "[Symbol]",\n`
			} else {
				srt += `\t${key1}: ${item1},\n`
			}
		}
		return srt.slice(0, -2) + '\n}'
	} catch(err) {
		console.logOrig(err)
	}
}

function getRlyConstructor(item) {
	if (typeof item == 'symbol') {
		return Symbol
	}else if (typeof item == 'object') {
		if (item?.constructor == Array) return String
		return Object
	} else if (typeof item == 'function') {
		return Function
	} else {
		return String
	}
}


async function setSlashCommands() {
	try {
		const commandsList = []
		_local.commands.each(com => {
			if (!com.getSlash) return;
			const params = com.getSlash()
			commandsList.push(params)
		})

		await _local.client.application?.commands.set(commandsList)
		console.log(`\n\tВСЕ команды установленны!`)
	} catch(err) {
		console.log(err)
	}
}


async function saveUserSettings() {
	const data = await fs.readFileSync(path.join(_local.path, 'user_setting.json'))
	const arr = JSON.parse(data.toString())
	arr.forEach(el => {
		delete el.backgrounds
		if (el.commands) el.commands = JSON.parse(el.commands)
	})
	const model = _local.models.userSettings
	for (let i = 0; i < arr.length; i++) {
		const el = arr[i]
		const save = await new model(el)
		await save.save()
	}
	console.log('end')
}

async function saveGuildSettings() {
	const data = await fs.readFileSync(path.join(_local.path, 'guild_setting.json'))
	const arr = JSON.parse(data.toString())
	arr.forEach(el => {
		delete el.backgrounds
		if (el.commands) el.commands = JSON.parse(el.commands)
	})
	const model = _local.models.guildSettings
	for (let i = 0; i < arr.length; i++) {
		const el = arr[i]
		const save = await new model(el)
		await save.save()
	}
	console.log('end')
}

async function saveUserNicnames() {
	const data = await fs.readFileSync(path.join(_local.path, 'bot_me.json'))
	const data2 = data.toString().replace(/"playerId": "([\d]+)?",/g, '"playerId": "$1"')
	const arr = JSON.parse(data2)
	arr.forEach(el => {
		delete el.backgrounds
		if (el.commands) el.commands = JSON.parse(el.commands)
	})
	const model = _local.models.usersNicknames
	for (let i = 0; i < arr.length; i++) {
		const el = arr[i]
		const save = await new model(el)
		await save.save()
	}
	console.log('end')
}