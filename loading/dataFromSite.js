/**
 * загружает данные с сайта:
 * настройки дискорд серверов и пользователей,
 * данные чемпионов
 */


const _local = process._local
const {config, utils} = _local
const {Settings, ChampionsManager, Champion, CardsManager, Card} =_local.classes
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
			// console.log(getchampions.ru.json) // массив обьектов базовых данных о чемпионах

            if ( !championsCard.status ) return reject(championsCard)
			// console.log(championsCard.ru) // обьект содержащий в качестве ключей id чемпионов и содержит в себе массив всех карт этого чемпиона

			// создаем класс менеджера чемпионов (чемпиона, менеджера карт)
			const CHAMPIONS = await creatingChampions(getchampions, championsCard)
			_local.champions = CHAMPIONS
			console.log(`Чемпионы и их данные загруженны (${CHAMPIONS.size})`)
			// console.log(CHAMPIONS.getByName('androxus'))
			// console.log(CHAMPIONS.getById('2438').cards)

            if ( !guildSettings.status ) return reject(guildSettings)
            // console.log(guildSettings)
			_local.guildsSettings = new Settings('guilds', guildSettings.json)
			console.log(_local.guildsSettings)

            if ( !userSettings.status ) return reject(userSettings)
            // console.log(userSettings)
			_local.userSettings = new Settings('users', userSettings.json)
			console.log(_local.userSettings)
			// console.log( _local.userSettings.get('510112915907543042').commands )
			return;

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




async function creatingChampions(championsInfo, championsCards) {
	const CHAMPIONS = new ChampionsManager()
	// championsInfo.ru.json
	for (const championId in championsCards.ru) {
		const championCardsRU = championsCards.ru[championId]
		const championCardsEN = championsCards.en[championId]
		const championInfoRU = championsInfo.ru.json.find(champ => champ.id == championId)
		const championInfoEN = championsInfo.en.json.find(champ => champ.id == championId)

		const CARDS = new CardsManager()
		// перебираем карты, создаем их и добавляем в менеджер
		for (let i = 0; i < championCardsRU.length; i++) {
			const cardRU = championCardsRU[i]
			const cardEN = championCardsEN.find(card => card.card_id1 == cardRU.card_id1)

			const cardDescription = {
				ru: cardRU.card_description,
				en: cardEN.card_description
			}, cardName = {
				ru: cardRU.card_name,
				en: cardEN.card_name
			}

			cardRU.card_description = cardDescription
			cardRU.card_name = cardName
			const CARD = new Card(cardRU)
			await CARD.loadImg() // загружаем картинку карты
			CARDS.add(CARD)
		}

		const uniteObj = {
			Lore: {
				ru: championInfoRU.Lore,
				en: championInfoEN.Lore
			},
			Name: {
				ru: championInfoRU.Name,
				en: championInfoEN.Name
			},
			Roles: {
				ru: championInfoRU.Roles,
				en: championInfoEN.Roles
			},
			Title: {
				ru: championInfoRU.Title,
				en: championInfoEN.Title
			},
			Pantheon: {
				ru: championInfoRU.Pantheon,
				en: championInfoEN.Pantheon
			},
			...formAbility(championInfoRU, championInfoEN)
		}

		championInfoRU.Cards = CARDS

		for (let i = 0; i < 5; i++) {
			delete championInfoRU[`Ability${i+1}`]
			delete championInfoRU[`AbilityId${i+1}`]
			delete championInfoRU[`abilityDescription${i+1}`]
			delete championInfoRU[`ChampionAbility${i+1}`]
		}

		const CHAMPION = new Champion( Object.assign(championInfoRU, uniteObj) )
		await CHAMPION.loadIcon() // загружаем иконку чемпиона
		CHAMPIONS.add(CHAMPION)
	}
	return CHAMPIONS
}


// вспомогательная функция для формирования обьекта способностей чемпиона
function formAbility(ru, en) {
	const obj = {}
	for (let i = 0; i < 5; i++) {
		const key = `Ability_${i+1}`
		obj[key] = {
			Summary: {
				ru: ru[key].Summary,
				en: en[key].Summary
			},
			Description: {
				ru: ru[key].Description,
				en: en[key].Description
			},
			Id: ru[key].Id,
			damageType: ru[key].damageType,
			rechargeSeconds: ru[key].rechargeSeconds
		}
	}
	return obj
}






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