/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = function(message, hideObjInfo, customIdCommand, settings, command, data) {
    return Promise(async (resolve, reject) => {
        try {
            const {owner, params} = hideObjInfo
            const prop = settings.getProp()
            const {lang} = prop

            // отправляем картинку на канал сервера что бы потом можно было взять ее url
            // да, да, вот так тупо приходится делать, дискорд не позволяет редачить файлы, но можно редачить ссылки
            // const messImg = await sendToChannel(config.chImg, {files: [buffer]})
            // const attachment = messImg.attachments.last()

            // const sendResult = await message.edit({
            //     content: `${news}${replayOldText}${playerInfo}<@${owner}>`,
            //     components: buttonList.get(),
            //     embed: {
            //         description: `||${hideInfo}||`,
            //         color: '2F3136',
            //         image: {
            //             url: attachment.url
            //         }
            //     }
            // })
            // return resolve(sendResult)
        } catch(err) {
            // if (err && err.err_msg !== undefined) return reject(err)
            if (err && err.log_msg !== undefined) return reject(err)
            return reject({
                err,
                // err_msg: {
                //     ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                //     en: 'Something went wrong... Try again or report this error to the bot creator.'
                // },
                log_msg: 'pal.buttonExecute'
            })
        }
    })
}