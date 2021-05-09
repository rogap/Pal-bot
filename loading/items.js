/**
 * загружает иконки закупа
 */


const fs = require('fs')
const path = require('path')
const { loadImage } = require('canvas')
const _local = process._local
const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToItems = path.join(__dirname, '..', 'img', 'items')
    fs.readdir(pathToItems, (err, files) => {
        if (err) return reject(err)

        const itemList = []
        files.forEach(item => {
            itemList.push( loadImage(path.join(pathToItems, item)) )
        })

        Promise.all(itemList)
        .then(itemsImgs => {
            itemsImgs.forEach(item => {
                const match = item.src.match(/(?<itemName>[a-z ]+)\.jpg/i)
                if ( !match ) return console.log(`Ошибка регулярного выражения loadItems (1)`, item)
                const groups = match.groups
                if ( !groups ) return console.log(`Ошибка регулярного выражения loadItems (2)`, item)
                const itemName = groups.itemName
                if ( !itemName ) return console.log(`Ошибка регулярного выражения loadItems (3)`, item)

                _local.config.img.items[itemName] = item
            })

            console.log(`Items загруженны (${itemsImgs.length}) (${new Date - timeStart}ms)`)
            return resolve({status: true})
        })
        .catch(err => {
            return reject(err)
        })
    })
})