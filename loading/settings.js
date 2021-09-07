/**
 * загружает настройки серверов и пользователей
 */


const _local = process._local
const {models, classes} = _local
const {SettingsManager} = classes
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const modelGuild = models.guildSettings
        const guildsData = await modelGuild.find()
        _local.guildSettings = new SettingsManager('guilds', guildsData)

        const modelUser = models.userSettings
        const usersData = await modelUser.find()
        _local.userSettings = new SettingsManager('user', usersData)

        console.log(`\tНастройки пользователей (${_local.userSettings.size}) и серверов (${_local.guildSettings.size}) загруженны (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки настроек ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();