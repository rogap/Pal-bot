/**
 * загружает данные с сайта:
 * настройки дискорд серверов и пользователей,
 * данные чемпионов
 */


const _local = process._local
const {config, utils} = _local
const {SettingsManager, ChampionsManager, Champion, CardsManager, Card} =_local.classes
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
			// console.log(CHAMPIONS.getByAliases('androxus'))
			// console.log(CHAMPIONS.getById('2438').cards)

            if ( !guildSettings.status ) return reject(guildSettings)
            // console.log(guildSettings)
			_local.guildsSettings = new SettingsManager('guilds', guildSettings.json)
			console.log(_local.guildsSettings)

            if ( !userSettings.status ) return reject(userSettings)
            // console.log(userSettings)
			_local.usersSettings = new SettingsManager('users', userSettings.json)
			console.log(_local.usersSettings)
			// console.log( _local.usersSettings.get('510112915907543042').commands )

            config.timeLimit = timeLimit // лимиты обновлений статистики

            console.log(`Данные с сайта успешно загруженны (${new Date - timeStart}ms)`)
            return resolve({status: true})
        } catch(err) {
            return reject({status: false, err})
        }
        
    })
})


async function creatingChampions(championsInfo, championsCards) {
	const CHAMPIONS = new ChampionsManager()

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
				ru: championInfoRU.Roles.replace(/^paladins /i, '').replace(/[ ]/ig, '').trim().toLowerCase(),
				en: championInfoEN.Roles.replace(/^paladins /i, '').replace(/[ ]/ig, '').trim().toLowerCase()
			},
			Title: {
				ru: championInfoRU.Title,
				en: championInfoEN.Title
			},
			Pantheon: {
				ru: championInfoRU.Pantheon,
				en: championInfoEN.Pantheon
			},
			ability: formAbility(championInfoRU, championInfoEN)
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
		await CHAMPION.loadAliases() // загружаем превдонимы чемпионов (альтернативные имена)
		CHAMPIONS.add(CHAMPION)
	}
	return CHAMPIONS
}


// вспомогательная функция для формирования обьекта способностей чемпиона
function formAbility(ru, en) {
	const obj = {}
	for (let i = 0; i < 5; i++) {
		const key = `Ability_${i+1}`
		obj[i + 1] = {
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