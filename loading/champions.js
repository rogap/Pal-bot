/**
 * загружает данные чемпионов
 */


const _local = process._local
const {config, classes, models} = _local
const {ChampionsManager, Champion} = classes
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const hirez = _local.hirez
        const championsManager = new ChampionsManager()
        const getchampionsALL = {}

        for (const lang in config.langs) {
            const langNum = config.langs[lang]
            const getchampions = await hirez.getchampions(langNum)
            if (!getchampions.status) throw getchampions

            getchampionsALL[lang] = getchampions.data.constructor == String ? JSON.parse(getchampions.data) : getchampions.data
        }

        for (let i = 0; i < getchampionsALL.en.length; i++) {
            const champData = getchampionsALL.en[i]

            const lore = {}
            const name = {}
            const roles = {}
            const title = {}

            // добавляем все переводы в обьект
            for (const lang in config.langs) {
                const champ = getchampionsALL[lang].find(el => el.id == champData.id)

                lore[lang] = champ.Lore
                name[lang] = champ.Name
                roles[lang] = ChampionsManager.getRole(champ.Roles)
                title[lang] = champ.Title

                // lore[lang] = getchampionsALL[lang][i].Lore
                // name[lang] = getchampionsALL[lang][i].Name
                // roles[lang] = ChampionsManager.getRole(getchampionsALL[lang][i].Roles)
                // title[lang] = getchampionsALL[lang][i].Title
            }

            // заменяем начальные данные обьекта на все переводы
            champData.Lore = lore
            champData.Name = name
            champData.Roles = roles
            champData.Title = title

            const champion = new Champion(champData) // создаем чемпиона
            await champion.loadIcon() // загружаем иконку чемпиона
            await champion.loadAliases() // загружаем псевдонимы чемпиона
            championsManager.add(champion) // добавляем в менеджер
        }

        _local.champions = championsManager

        console.log(`\tЧемпионы загруженны (${championsManager.size}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки чемпионов ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();