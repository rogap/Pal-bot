/**
 * загружает иконки закупа
 */


const fs = require('fs')
const path = require('path')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = (async () => {
    try {
        const pathToItems = path.join(_local.path, 'img', 'items')
        const files = await fs.readdirSync(pathToItems)

        files.forEach(img => {
            const parse = path.parse(img)
            _local.config.img.items[parse.name] = path.join(pathToItems, img)
        })

        console.log(`\tItems загруженны (${files.length}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки предметов ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();