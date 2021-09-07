/**
 * загружает игровые аватарки
 */


const fs = require('fs')
const path = require('path')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const pathToAvatars = path.join(_local.path, 'img', 'avatars')
        const files = await fs.readdirSync(pathToAvatars)

        files.forEach(avatar => {
            const match = avatar.match(/(?<num>\d+)\.(png|gif|jpg)/i)
            if ( !match ) return console.log(`Ошибка регулярного выражения loadAvatars (1)`, avatar)
            const groups = match.groups
            if ( !groups ) return console.log(`Ошибка регулярного выражения loadAvatars (2)`, avatar)
            const num = groups.num
            if ( !num ) return console.log(`Ошибка регулярного выражения loadAvatars (3)`, avatar)

            _local.config.img.avatars[num] = path.join(pathToAvatars, avatar)
        })

        console.log(`\tАватары загруженны (${files.length}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки аватаров ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();