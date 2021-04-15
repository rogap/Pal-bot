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
        require('./dataFromSite.js'), // связано с чемпионами, а так же настройками (и командами)
        require('./divisions.js'),
        require('./items.js'),
        require('./maps.js')
        // что если "связано с чемпионами" (картинки) загружать во время создания класса чемпиона (карт чемпиона и т.д.)
        // так же оно должно учесть и такой параметр как "lang" (можно только в тех функциях где он нужен)
    ])
    .then(() => {
        // когда загружены все данные чемпионов то можно создать их класс
        return resolve({status: true})
    })
    .catch(err => { // есть ли смысл в catch если тут делается просто проброс?
        return reject(err)
    })
})