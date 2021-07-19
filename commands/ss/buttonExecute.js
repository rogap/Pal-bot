/**
 * функция которая выполняет комнаду и отправляет результат пользователю (кнопки)
 */


const _local = process._local
const {client, config, classes, stegcloak, utils} = _local
const {Button, ButtonsManager} = classes
const {sendToChannel} = utils


module.exports = function(message, hideObjInfo, customIdList, settings, command, data) {
    return new Promise(async (resolve, reject) => {
        try {
            const {owner, params} = hideObjInfo
            const prop = settings.getProp()
            const {lang} = prop

            const body = await command.getStats(owner, params)
            const draw = await command.draw(body, prop) // рисуем
            if (!draw.status) return reject(draw)

            const canvas = draw.canvas
            const buffer = canvas.toBuffer('image/png') // buffer image

            const showOldStatsText = {
                ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                en: '__**You will be shown the details of the last successful request.**__'
            }

            const replayOldText = body.getplayer.old ?
                    `${body.getplayer.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` :
                body.getchampionranks.old ?
                    `${body.getchampionranks.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

            const playerInfo = `\`\`\`md\n[${draw.name}](${draw.id})\`\`\``

            const btn_update = new Button()
            .setLabel({ru: 'Обновить', en: 'Update'}[lang])
            .setStyle(3)
            .setId('ss')

            const btn_menu = new Button()
            .setLabel({ru: 'Меню', en: 'Menu'}[lang])
            .setStyle(4)
            .setId('pal')

            const buttonList = new ButtonsManager([btn_update, btn_menu])
            const news = config.news[lang]
            const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

            // отправляем картинку на канал сервера что бы потом можно было взять ее url
            // да, да, вот так тупо приходится делать, дискорд не позволяет редачить файлы, но можно редачить ссылки
            const messImg = await sendToChannel(config.chImg, {files: [buffer]})
            const attachment = messImg.attachments.last()

            const sendResult = await message.edit({
                content: `${news}${replayOldText}${playerInfo}<@${owner}>`,
                components: buttonList.get(),
                embed: {
                    description: `||${hideInfo}||`,
                    color: '2F3136',
                    image: {
                        url: attachment.url
                    }
                }
            })
            return resolve({status: 1, name: 'ss', message: sendResult})
        } catch(err) {
            if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'ss.buttonExecute'
            })
        }
    })
}