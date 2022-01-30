/**
 * подключается к БД
 * регистрируем модели и схемы
 */


const mongoose = require('mongoose')
const {Schema, model} = mongoose
const _local = process._local
const {config} = _local
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        await mongoose.connect(`mongodb://${config.database.host}:${config.database.port}/${config.database.name}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })

        // const db = mongoose.connection
        // console.log(db)

        // сравнение статистик progress
        const commandProgress = new Schema({
            discordId: {type: String, required: true, unique: true},
            accauntId: {type: Number},
            stats: {type: Object},
            champions: {type: Array},
            date: {type: String} // время добавления
        })
        _local.models.commandProgress = model('commandProgress', commandProgress)

        // статистика команд
        const commandsStats = new Schema({
            servers: {type: Number},
            users: {type: Number},
            usedCommands: {type: Number},
            commandsStats: {type: Object},
            // limitAPI: {type: Number},
            timeWork: {type: Number},
            date: {type: String}
        })
        _local.models.commandsStats = model('commandsStats', commandsStats)

        // сохраненные ники пользователей
        const usersNicknames = new Schema({
            id: {type: String, required: true, unique: true},
            name: {type: String, default: null}, // ник в игре
            playerId: {type: Number, default: null} // id в игре
        })
        _local.models.usersNicknames = model('usersNicknames', usersNicknames)

        // настройки серверов
        const guildSettings = new Schema({
            id: {type: String, required: true, unique: true},
            lang: {type: String, default: null},
            timezone: {type: String, default: null},
            prefix: {type: String, default: null},
            commands: {type: Object, default: null}
        })
        _local.models.guildSettings = model('guildSettings', guildSettings)

        // настройки пользователей
        const userSettings = new Schema({
            id: {type: String, required: true, unique: true},
            lang: {type: String, default: null},
            timezone: {type: String, default: null},
            prefix: {type: String, default: null},
            commands: {type: Object, default: null},
            only: {type: Boolean, default: false},
            params: {type: Object, default: {}}
        })
        _local.models.userSettings = model('userSettings', userSettings)

        // session
        const session = new Schema({
            id: {type: String, required: true},
            timestamp: {type: Number, required: true}
        })
        _local.models.session = model('session', session)

        // getchampions (чемпионы и их описание)
        const getchampions = new Schema({
            data: {type: Array},
            lang: {type: Number, unique: true, required: true},
            lastUpdate: {type: String}
        })
        _local.models.getchampions = model('getchampions', getchampions)

        // getitems (предметы и карты)
        const getitems = new Schema({
            data: {type: Array},
            lang: {type: Number, unique: true, required: true},
            lastUpdate: {type: String}
        })
        _local.models.getitems = model('getitems', getitems)

        // searchplayers
        const searchplayers = new Schema({
            data: {type: Array},
            name: {type: String},
            lastUpdate: {type: String}
        })
        _local.models.searchplayers = model('searchplayers', searchplayers)

        // getplayer
        const getplayer = new Schema({
            data: {type: Array},
            id: {type: Number},
            name: {type: String},
            lastUpdate: {type: String}
        })
        _local.models.getplayer = model('getplayer', getplayer)

        // getplayeridbyportaluserid
        // const getplayeridbyportaluserid = new Schema({
        //     id: {type: Number},
        //     name: {type: String},
        //     portalId: {type: String},
        //     portalUserId: {type: String}, // уникальный
        //     privacyFlag: {type: String},
        //     lastUpdate: {type: String}
        // })
        // _local.models.getplayeridbyportaluserid = model('getplayeridbyportaluserid', getplayeridbyportaluserid)

        // getplayeridinfoforxboxandswitch

        // getchampionranks
        const getchampionranks = new Schema({
            data: {type: Array},
            id: {type: Number},
            lastUpdate: {type: String}
        })
        _local.models.getchampionranks = model('getchampionranks', getchampionranks)

        // getplayerloadouts
        const getplayerloadouts = new Schema({
            data: {type: Array},
            id: {type: Number},
            lastUpdate: {type: String}
        })
        _local.models.getplayerloadouts = model('getplayerloadouts', getplayerloadouts)

        // getplayerstatus
        const getplayerstatus = new Schema({
            data: {type: Array},
            id: {type: Number},
            lastUpdate: {type: String}
        })
        _local.models.getplayerstatus = model('getplayerstatus', getplayerstatus)

        // getmatchplayerdetails
        const getmatchplayerdetails = new Schema({
            data: {type: Array},
            id: {type: Number},
            lastUpdate: {type: String}
        })
        _local.models.getmatchplayerdetails = model('getmatchplayerdetails', getmatchplayerdetails)

        // getmatchhistory
        const getmatchhistory = new Schema({
            data: {type: Array},
            id: {type: Number},
            lastUpdate: {type: String}
        })
        _local.models.getmatchhistory = model('getmatchhistory', getmatchhistory)

        // getmatchdetails
        const getmatchdetails = new Schema({
            data: {type: Array},
            id: {type: Number},
            lastUpdate: {type: String}
        })
        _local.models.getmatchdetails = model('getmatchdetails', getmatchdetails)

        // getfriends
        const getfriends = new Schema({
            data: {type: Array},
            id: {type: Number},
            lastUpdate: {type: String}
        })
        _local.models.getfriends = model('getfriends', getfriends)

        // getdataused

        // const test = new _local.models.usersNicknames({
        //     id: '510112915907543042',
        //     name: 'mutu',
        //     id: 342553
        // })
        // await test.save()

        // const find = await _local.models.usersNicknames.find({id: '510112915907543042'})
        // console.log(find)

        console.log(`\tУспешное подключение к БД (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка в подключении к БД ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();