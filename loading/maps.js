/**
 * загружает игровые карты (локации)
 */


const fs = require('fs')
const path = require('path')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const pathToMaps = path.join(_local.path, 'img', 'maps')
        const files = await fs.readdirSync(pathToMaps)

        files.forEach(img => {
            const parse = path.parse(img)
            _local.config.img.maps[parse.name] = path.join(pathToMaps, img)
        })

        console.log(`\tКарты загруженны (${files.length}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки карт местности ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();