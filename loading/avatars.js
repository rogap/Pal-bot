/**
 * загружает игровые аватарки
 */


const fs = require('fs')
const path = require('path')
// const { loadImage } = require('canvas')
const _local = process._local
// const timeStart = new Date() // время старта загрузки


module.exports = new Promise((resolve, reject) => {
    const pathToAvatars = path.join(__dirname, '..', 'img', 'avatars')
    fs.readdir(pathToAvatars, (err, files) => {
        if (err) return reject(err)

        // const avatarList = []
        files.forEach(avatar => {
            // avatarList.push( loadImage(path.join(pathToAvatars, avatar)) )
            const match = avatar.match(/(?<num>\d+)\.(png|gif|jpg)/i)
            if ( !match ) return console.log(`Ошибка регулярного выражения loadAvatars (1)`, avatar)
            const groups = match.groups
            if ( !groups ) return console.log(`Ошибка регулярного выражения loadAvatars (2)`, avatar)
            const num = groups.num
            if ( !num ) return console.log(`Ошибка регулярного выражения loadAvatars (3)`, avatar)

            _local.config.img.avatars[num] = path.join(pathToAvatars, avatar)
        })

        return resolve({status: true})

        // Promise.all(avatarList)
        // .then(avatarsImgs => {
        //     avatarsImgs.forEach(avatar => {
        //         const match = avatar.src.match(/(?<num>\d+)\.(png|gif|jpg)/i)
        //         if ( !match ) return console.log(`Ошибка регулярного выражения loadAvatars (1)`, avatar)
        //         const groups = match.groups
        //         if ( !groups ) return console.log(`Ошибка регулярного выражения loadAvatars (2)`, avatar)
        //         const num = groups.num
        //         if ( !num ) return console.log(`Ошибка регулярного выражения loadAvatars (3)`, avatar)

        //         _local.config.img.avatars[num] = avatar
        //     })

        //     console.log(`Аватары загруженны (${avatarsImgs.length}) (${new Date - timeStart}ms)`)
        //     return resolve({status: true})
        // })
        // .catch(err => {
        //     return reject(err)
        // })
    })
})