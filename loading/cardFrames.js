/**
 * загружает фреймы карт (персонажей)
 */


const fs = require('fs')
const path = require('path')
const _local = process._local
const timeStart = new Date() // время старта загрузки
    

module.exports = (async () => {
    try {
        const pathToFrames = path.join(_local.path, 'img', 'card frames')
        const files = await fs.readdirSync(pathToFrames)
        _local.config.img.cardFrames = files.map(img => path.join(pathToFrames, img))

        console.log(`\tФреймы карт загруженны (${files.length}) (${new Date - timeStart}ms)`)
        return {status: true}
    } catch(err) {
        console.log('\n ~ Ошибка загрузки фреймов карт ~\n')
        if (err.err_msg !== undefined) throw err // проброс ошибки если есть описание
        return {
            status: false,
            err
        }
    }
})();