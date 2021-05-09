/**
 * загружает иконки дивизионов
 */


const fs = require('fs')
const path = require('path')
const { loadImage } = require('canvas')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToDivisions = path.join(__dirname, '..', 'img', 'divisions')
    fs.readdir(pathToDivisions, (err, files) => {
        if (err) return reject(err)

        const divisionList = []
        files.forEach(division => {
            divisionList.push( loadImage(path.join(pathToDivisions, division)) )
        })

        Promise.all(divisionList)
        .then(divisionsImgs => {
            divisionsImgs.forEach(division => {
                const match = division.src.match(/(?<num>\d+)\.(png|gif|jpg)/i)
                if ( !match ) return console.log(`Ошибка регулярного выражения loadDivisions (1)`, division)
                const groups = match.groups
                if ( !groups ) return console.log(`Ошибка регулярного выражения loadDivisions (2)`, division)
                const num = groups.num
                if ( !num ) return console.log(`Ошибка регулярного выражения loadDivisions (3)`, division)

                _local.config.img.divisions[num] = division
            })

            console.log(`Дивизионы загруженны (${divisionsImgs.length}) (${new Date - timeStart}ms)`)
            return resolve({status: true})
        })
        .catch(err => {
            return reject(err)
        })
    })
})