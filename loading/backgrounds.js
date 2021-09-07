/**
 * загружает фоны для статистик
 */


const fs = require('fs')
const path = require('path')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const pathToBackgrounds = path.join(_local.path, 'img', 'backgrounds')
        const files = await fs.readdirSync(pathToBackgrounds)

        files.forEach(img => {
            const parse = path.parse(img)
            _local.config.img.backgrounds[parse.name] = path.join(pathToBackgrounds, img)
        })

        console.log(`\tФоны загруженны (${files.length}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки фонов ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();