/**
 * загружает иконки чемпионов
 */


const fs = require('fs')
const path = require('path')
const { loadImage } = require('canvas')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToChampions = path.join(__dirname, '..', 'img', 'champions')
    fs.readdir(pathToChampions, (err, files) => {
        if (err) return reject(err)

        const championList = []
        files.forEach(champion => {
            championList.push( loadImage(path.join(pathToChampions, champion)) )
        })

        Promise.all(championList)
        .then(championsImgs => {
            championsImgs.forEach(champion => {
                const match = champion.src.match(/(?<championName>[a-z]+['` -]{0,3}[a-z]+)\.jpg/i)
                if ( !match ) return console.log(`Ошибка регулярного выражения loadChampions (1)`, champion)
                const groups = match.groups
                if ( !groups ) return console.log(`Ошибка регулярного выражения loadChampions (2)`, champion)
                const championName = groups.championName.normalizeChampName()
                if ( !championName ) return console.log(`Ошибка регулярного выражения loadChampions (3)`, champion)

                _local.config.img.champions[championName] = champion
            })

            console.log(`Чемпионы загруженны (${championsImgs.length}) (${new Date - timeStart}ms)`)
            return resolve({status: true})
        })
        .catch(err => {
            return reject(err)
        })
    })
})