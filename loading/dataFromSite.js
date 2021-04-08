/**
 * загружает данные с сайта:
 * настройки дискорд серверов и пользователей,
 * данные чемпионов
 */


const _local = process._local
const {config, utils} = _local
const {Settings} =_local.classes
const {sendSite, formHiRezFunc} = utils
const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const formSend = formHiRezFunc('botSettings')
    sendSite( formSend )
    .then(async (res) => {
        try {
            // console.log(res.body)
            const body = res.body
            if ( !body || typeof(body) == 'string' ) console.log('body:', body)
            const {getchampions, championsCard, guildSettings, userSettings, timeLimit} = body

            if ( !getchampions.status ) return reject(getchampions)
			// console.log(getchampions)
            config.champions = getchampions // _local.champions = {ru, en}

            if ( !championsCard.status ) return reject(championsCard)
			// console.log(championsCard.ru)
            config.championsCard = championsCard // delete

            if ( !guildSettings.status ) return reject(guildSettings)
            // console.log(guildSettings)
			config.guildSettings = new Settings('guild').addArr(guildSettings.json, true)

            if ( !userSettings.status ) return reject(userSettings)
            // console.log(userSettings)
			config.userSettings = new Settings('user').addArr(userSettings.json, true)
			return;

			// возмоно стоит создать еще класс для карт чемпиона?

            config.timeLimit = timeLimit // лимиты обновлений статистики

            addPropAllCommands() // добавляем свойства загруженным командам (и нехватающие функции)
            // console.log(guildSettings.json)
            // console.log(userSettings.json)

            console.log(`Данные с сайта успешно загруженны (${new Date - timeStart}ms)`)
            return resolve({status: true})
        } catch(err) {
            return reject({status: false, err})
        }
        
    })
})


// добавляет всем командам свойства (и юзеры и сервера)
function addPropAllCommands() {
	for (let guildId in config.guildSettings) {
		if ( guildId == 'size' ) continue // пропускаем size
		const guild = config.guildSettings[guildId]

		if ( guild.backgrounds ) guild.backgrounds = JSON.parse(guild.backgrounds)

		const guildCom = guild.commands
		guild.commands = typeof(guildCom) == 'string' ? JSON.parse(guildCom) : guildCom
		if ( !guild.commands ) continue
		addPropCommand(guild.commands, guildId)
	}

	for (let userId in config.userSettings) {
		if ( userId == 'size' ) continue // пропускаем size
		const user = config.userSettings[userId]

		if ( user.backgrounds ) user.backgrounds = JSON.parse(user.backgrounds)

		const userCom = user.commands
		user.commands = typeof(userCom) == 'string' ? JSON.parse(userCom) : userCom
		if ( !user.commands ) continue
		addPropCommand(user.commands, userId)
	}
}


// добавляет нехватающие свойства команде
function addPropCommand(commands, id) {
	const isOwner = id.isOwner()
	for (let i = 0; i < commands.length; i++) {
		const command = commands[0]
		if ( command.owner && !isOwner ) continue // команды админа только админу добавляем

		const com = _local.commands.find(com => com.name == command.name)
		if ( !com ) {
			// если команда не найдена то показываем ошибку и удаляем команду
			console.log(`команда '${command.name}' не найдена у ${id}`)
			commands.splice(i, 1)
			i--
			continue
		}

		for (key in com) {
			if ( key == 'name' || key == 'commands' ) continue // не добавляем эти ключи так как они уже есть
			command[key] = com[key]
		}
	}

	addDefaultCommands(commands)
	commands.sort((a, b) => a.order - b.order) // сортируем команды
}


// добавляет недостающие команды
function addDefaultCommands(commands) {
	const filter = _local.commands.filter(command => {
		return !commands.find(com => com.name == command.name)
	})

	commands.unite(filter)
}