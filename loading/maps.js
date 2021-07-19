/**
 * загружает игровые карты (локации)
 */


const fs = require('fs')
const path = require('path')
// const { loadImage } = require('canvas')
const _local = process._local
// const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToMaps = path.join(__dirname, '..', 'img', 'maps')
    fs.readdir(pathToMaps, (err, files) => {
        if (err) return reject(err)
        _local.config.img.maps = []

        // const mapList = []
        files.forEach(map => {
            // mapList.push( loadImage(path.join(pathToMaps, map)) )

            const match = map.match(/(?<mapName>[a-z ]+)\.png/i)
            if ( !match ) return console.log(`Ошибка регулярного выражения loadMaps (1)`, map)
            const groups = match.groups
            if ( !groups ) return console.log(`Ошибка регулярного выражения loadMaps (2)`, map)
            const mapName = groups.mapName
            if ( !mapName ) return console.log(`Ошибка регулярного выражения loadMaps (3)`, map)

            _local.config.img.maps.push({
                name: mapName,
                path: path.join(pathToMaps, map)
            })
        })

        return resolve({status: true})

        // Promise.all(mapList)
        // .then(mapsImgs => {
        //     mapsImgs.forEach(map => {
        //         const match = map.src.match(/(?<mapName>[a-z ]+)\.png/i)
        //         if ( !match ) return console.log(`Ошибка регулярного выражения loadMaps (1)`, map)
        //         const groups = match.groups
        //         if ( !groups ) return console.log(`Ошибка регулярного выражения loadMaps (2)`, map)
        //         const mapName = groups.mapName
        //         if ( !mapName ) return console.log(`Ошибка регулярного выражения loadMaps (3)`, map)

        //         _local.config.img.maps[mapName] = map
        //     })

        //     console.log(`Карты загруженны (${mapsImgs.length}) (${new Date - timeStart}ms)`)
        //     return resolve({status: true})
        // })
        // .catch(err => {
        //     return reject(err)
        // })
    })
})