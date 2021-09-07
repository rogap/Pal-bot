/**
 * загружает иконки дивизионов
 */


const fs = require('fs')
const path = require('path')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const pathToDivisions = path.join(_local.path, 'img', 'divisions')
        const files = await fs.readdirSync(pathToDivisions)

        files.forEach(img => {
            const parse = path.parse(img)
            _local.config.img.divisions[parse.name] = path.join(pathToDivisions, img)
        })

        console.log(`\tДивизионы загруженны (${files.length}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки дивизионов ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();