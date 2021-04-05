/**
 * загружает легендарки
 */


const fs = require('fs')
const path = require('path')
const { loadImage } = require('canvas')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToLegends = path.join(__dirname, '..', 'img', 'legends')
    fs.readdir(pathToLegends, (err, files) => {
        if (err) return reject(err)

        const legendList = []
        files.forEach(legend => {
            legendList.push( loadImage(path.join(pathToLegends, legend)) )
        })

        Promise.all(legendList)
        .then(legendsImgs => {
            legendsImgs.forEach(legend => {
                const match = legend.src.match(/(?<num>\d+)\.(png|gif|jpg)/i)
                if ( !match ) return console.log(`Ошибка регулярного выражения loadLegends (1)`, legend)
                const groups = match.groups
                if ( !groups ) return console.log(`Ошибка регулярного выражения loadLegends (2)`, legend)
                const num = groups.num
                if ( !num ) return console.log(`Ошибка регулярного выражения loadLegends (3)`, legend)

                _local.config.img.legends[num] = legend
            })

            console.log(`Легендарки загруженны (${legendsImgs.length}) (${new Date - timeStart}ms)`)
            return resolve({status: true})
        })
        .catch(err => {
            return reject(err)
        })
    })
})