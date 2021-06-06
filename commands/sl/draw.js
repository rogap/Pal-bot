/**
 * Скрипт который только рисует указанную инфу в canvas и возвращает ее или ошибку
 */


const _local = process._local
const {config, classes} = _local
const {translate} = config
const {createCanvas } = require('canvas')
const {red, white, blue, black, purple, orange, green, yellow} = config.colors


/**
 * 
 * @param {*} body - 
 * @param {Object} prop - 
 */
module.exports = async function(loadout, champion, prop, last_update) {
    return new Promise(async (resolve, reject) => {
        try {
            const {lang, timezone, backgrounds} = prop
            const width = 1648
            const height = 660
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext('2d')

            const imgNum = Math.floor(Math.random() * backgrounds.length)
            const img = config.img.backgrounds[backgrounds[imgNum]] // случайный фон
            if ( img ) ctx.drawImage(img, 0, 0, width, height - 60) // рисуем

            // рисуем название колоды
            ctx.font = 'bold 50px GothamSSm_Bold'
            ctx.fillStyle = white
            ctx.textAlign = 'center'
            ctx.fillText(loadout.DeckName, width / 2, 70) // название колоды
            ctx.textAlign = 'start'
            ctx.font = 'bold 34px GothamSSm_Bold'

            ctx.fillStyle = black
            ctx.fillRect(0, height - 60, width, 60) // прямоугольник снизу
            const lastUpdate = last_update.updateToDate(timezone).toText()
            const nextUpdate = last_update.getNextUpdate('getplayerloadouts', timezone)
            const loadoutsUpdateText = `${translate.Loadouts[lang]}: ${lastUpdate} | ${translate.Update[lang]}: ${nextUpdate}`
            ctx.fillStyle = red
            ctx.fillText(loadoutsUpdateText, 20,  height - 20)
            ctx.textAlign = 'center'
            ctx.font = 'bold 16px GothamSSm_Bold'

            loadout.LoadoutItems.forEach(async (item, i) => {
                const card = champion.cards.getById(item.ItemId)
                // console.log(card)
                if (!card) return; // если карта не найдена то пропускаем ее

                // const cardImg = card.img
                const cardImg = await card.loadImg()
                if (cardImg) ctx.drawImage(cardImg, i * (10 + 314) + 48, 150, 256, 196) // рисуем картинки карт

                const cardFrames = config.img.cardFrames[item.Points - 1] // получаем картинку фрейма карты
                if (cardFrames) ctx.drawImage(cardFrames, i * (10 + 314) + 20, 100, 314, 479)

                //
                ctx.fillStyle = white
                // ctx.textAlign = 'center'
                ctx.fillText(card.name[lang], i * (10 + 314) + 178, 366)

                // рисуем описание карты
                ctx.fillStyle = black
                // ctx.textAlign = 'start'
                const description = card.getDescriptionLvl(item.Points, lang)
                const textArr = formProposals(description, 23)
                for (let k = 0; k < textArr.length; k++) {
                    ctx.fillText(textArr[k], i * (10 + 314) + 178, 20 * k + 410)
                }

                // откат карты
                if (card.recharge > 0) ctx.fillText(card.recharge, i * (10 + 314) + 178, 543)
            })

            return resolve({
                status: true,
                canvas
            })
        } catch(err) {
            if (err.err_msg !== undefined) return reject(err) // проброс ошибки если есть описание
            return reject({
                status: false,
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'Ошибка функции "sl.draw"'
            })
        }
    })
}


function formProposals(text, maxLen) { // возвращает массив, разделяет строку на части
	if (text.length <= 25) return [text]
	let newText = []
	let tempLen = maxLen
	let lastIndex = 0

	while (true) {
		const letter = text.slice(tempLen - 1, tempLen)
		if (!letter) {
			// если пусто, то вставляем оставшееся
			const g = text.slice(lastIndex, tempLen)
			if (g) newText.push( g )
			return newText
		} else if (letter !== ' ') { // если не пустая строка то пропускаем
			tempLen-- // сдвигаем влево поиск
			// если слово 25 символов?
		} else { // если пустая строка то нужно будет разбивать
			newText.push( text.slice(lastIndex, tempLen).trim() )
			lastIndex = tempLen
			tempLen += maxLen // продолжим поиски с того места где закончили + максимальная длина
		}
	}
}