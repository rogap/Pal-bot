/**
 * загружает фоны для статистик
 */


const fs = require('fs')
const path = require('path')
const { loadImage } = require('canvas')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToBackgrounds = path.join(__dirname, '..', 'img', 'backgrounds')
    fs.readdir(pathToBackgrounds, (err, files) => {
        if (err) return reject(err)

        const backgroundList = []
        files.forEach(background => {
            backgroundList.push( loadImage(path.join(pathToBackgrounds, background)) )
        })

        Promise.all(backgroundList)
        .then(backgroundsImgs => {
            backgroundsImgs.forEach(background => {
                const match = background.src.match(/(?<name>[a-z0-9\- ]+)\.(png|gif|jpg)/i)
                if ( !match ) return console.log(`Ошибка регулярного выражения loadBackgrounds (1)`, background)
                const groups = match.groups
                if ( !groups ) return console.log(`Ошибка регулярного выражения loadBackgrounds (2)`, background)
                const name = groups.name
                if ( !name ) return console.log(`Ошибка регулярного выражения loadBackgrounds (3)`, background)

                _local.config.img.backgrounds[name] = background
            })

            console.log(`Фоны загруженны (${backgroundsImgs.length}) (${new Date - timeStart}ms)`)
            return resolve({status: true})
        })
        .catch(err => {
            return reject(err)
        })
    })
})