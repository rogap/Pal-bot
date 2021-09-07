/**
 * загружает карты чемпионов
 */


const _local = process._local
const {config, classes, models} = _local
const {CardsManager, Card} = classes
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const hirez = _local.hirez
        const cardsManager = new CardsManager()
        const getitemsALL = {}

        for (const lang in config.langs) {
            const langNum = config.langs[lang]
            const getitems = await hirez.getitems(langNum)
            if (!getitems.status) throw getitems

            getitemsALL[lang] = getitems.data.constructor == String ? JSON.parse(getitems.data) : getitems.data
        }

        for (let i = 0; i < getitemsALL.en.length; i++) {
            const item = getitemsALL.en[i]
            const id = item.champion_id

            if (!id) continue;

            const description = {}
            const deviceName = {}
            const shortDesc = {}

            // добавляем все переводы в обьект
            for (const lang in config.langs) {
                const champ = getitemsALL[lang].find(el => el.ItemId == item.ItemId)

                description[lang] = champ.Description
                deviceName[lang] = champ.DeviceName
                shortDesc[lang] = champ.ShortDesc
            }

            // заменяем начальные данные обьекта на все переводы
            item.Description = description
            item.DeviceName = deviceName
            item.ShortDesc = shortDesc

            const card = new Card(item) // создаем карту
            await card.loadImg() // загружаем картинку карты
            // if ( !cardsManager.add(card) ) console.log(`Карта уже существует:`, card.id)
            cardsManager.add(card) // добавляем в менеджер
        }

        _local.cards = cardsManager

        console.log(`\tКарты и леги чемпионов загруженны (${cardsManager.size}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки карт чемпионов ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();