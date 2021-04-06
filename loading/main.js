/**
 * основной файл-скрипт для загрузки всех в этой папке:
 * загружает все картинки, шрифты, данные с сайта
 */


const { registerFont } = require("canvas")
const path = require('path')
const pathToFont = path.join(__dirname, '..', 'font', 'GothamSSm-Bold.otf')
registerFont(pathToFont, { family: 'GothamSSm_Bold' }) // регистрируем шрифт


module.exports = new Promise((resolve, reject) => {
    Promise.all([ // что если через fs все скрипты получить
        require('./avatars.js'),
        require('./backgrounds.js'),
        require('./cardFrames.js'),
        require('./champions.js'),
        // require('./commands.js'),
        // require('./dataFromSite.js'),
        require('./divisions.js'),
        require('./items.js'),
        require('./legends.js'),
        require('./maps.js')
    ])
    .then(() => {
        return resolve({status: true})
    })
    .catch(err => { // есть ли смысл в catch если тут делается просто проброс?
        return reject(err)
    })
})