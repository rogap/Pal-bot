/**
 * загружает фреймы карт (персонажей)
 */


const fs = require('fs')
const path = require('path')
const { loadImage } = require('canvas')
const _local = process._local
const timeStart = new Date() // время старта загрузки
    

module.exports = new Promise((resolve, reject) => {
    const pathToFrames = path.join(__dirname, '..', 'img', 'card frames')
    fs.readdir(pathToFrames, (err, files) => {
        if (err) return reject(err)

        const cardFrameList = []
        files.forEach(cardFrame => {
            cardFrameList.push( loadImage(path.join(pathToFrames, cardFrame)) )
        })

        Promise.all(cardFrameList)
        .then(cardFramesImgs => {
            cardFramesImgs.forEach(cardFrame => {
                const match = cardFrame.src.match(/(?<num>\d+)\.(png|gif|jpg)/i)
                if ( !match ) return console.log(`Ошибка регулярного выражения loadCardFrames (1)`, cardFrame)
                const groups = match.groups
                if ( !groups ) return console.log(`Ошибка регулярного выражения loadCardFrames (2)`, cardFrame)
                const num = groups.num
                if ( !num ) return console.log(`Ошибка регулярного выражения loadCardFrames (3)`, cardFrame)

                _local.config.img.cardFrames.push(cardFrame)
            })

            console.log(`Фреймы карт загруженны (${cardFramesImgs.length}) (${new Date - timeStart}ms)`)
            return resolve({status: true})
        })
        .catch(err => {
            return reject(err)
        })
    })
})