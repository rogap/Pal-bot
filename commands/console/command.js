/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */

const path = require('path/posix')




module.exports = async (message, settings, command, contentParams) => {
    try {
        const _local = process._local
        const {client, config, champions, usersSettings, guildsSettings, commands, utils} = _local
        const {sendToChannel, sendToUser, superSendToChannel, superSendToUser, deleteFromChannel} = utils

        function createHeapSnapshot() {
            const fs = require('fs')
            const v8 = require('v8')
            const snapshotStream = v8.getHeapSnapshot()
            // It's important that the filename end with `.heapsnapshot`,
            // otherwise Chrome DevTools won't open it.
            const fileName = `${Date.now()}.heapsnapshot`
            const fileStream = fs.createWriteStream(fileName)
            snapshotStream.pipe(fileStream)

            snapshotStream.on('error', console.log)
            snapshotStream.on('end', async () => {
                await message.reply({
                    content: `snapshot is create (${fileName})`,
                    // files: [{
                    //     attachment: path.join(_local.path, fileName),
                    //     name: fileName
                    // }]
                })
            })
        }

        return eval(contentParams)
    } catch(err) {
        console.log(JSON.stringify(err))
        console.log(`\nCONSOLE Ошибка выполнения CONSOLE:\n\n${contentParams}\n\nEND\n`)
        console.log(err)
    }
}