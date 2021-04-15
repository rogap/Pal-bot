/**
 * запуск бота
 */


const {Client} = require('discord.js')
const client = new Client()
const path = require('path')
const config = require("./config/main.js")

// обьект бота, в начале launched = false (все обработчики на паузе)
const _local = { client, config, commands: [], launched: false, timeStart: new Date() }
// champions, userSettings, guildsSettings
process._local = _local // для передачи данных между скриптами

_local.classes = require(path.join(__dirname, 'classes', 'main.js'))

const utils = require("./utils/main.js")
_local.utils = utils

require(path.join(__dirname, 'loading', 'main.js'))
.then(res => {
    console.log(res)
    // console.log(_local.config.img)
})
.catch(err => {
    console.log(err)
})