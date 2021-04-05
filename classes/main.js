/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


// const fs = require('fs')
const path = require('path')
// const { _local } = require('process')


module.exports = {
    Command: require(path.join(__dirname, 'Command.js'))
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