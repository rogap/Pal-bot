/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


// const fs = require('fs')
// const path = require('path')
// const { _local } = require('process')


module.exports = {
    Command: require('./Command.js'),
    CommandsManager: require('./CommandsManager.js'),
    Settings: require('./Settings.js'),
    SettingsManager: require('./SettingsManager.js'),
    Champion: require('./Champion.js'),
    ChampionsManager: require('./ChampionsManager.js'),
    ChampionsStats: require('./ChampionsStats.js'),
    AbstractChampion: require('./AbstractChampion.js'),
    CardsManager: require('./CardsManager.js'),
    Card: require('./Card.js'),
    Details: require('./Details.js'),
    Hirez: require('./Hirez.js'),
    API: require('./API.js')
}


// module.exports = new Promise((resolve, reject) => {
//     fs.readdir(__dirname, (err, files) => {
//         if (err) return reject(err)
//         files = files.filter(file => file != 'main.js')

//         files.forEach(file => {
//             const name = path.parse(file).name
//             _local.classes[name] = require(`./${file}`)
//         })

//         return resolve({status: true})
//     })
// })