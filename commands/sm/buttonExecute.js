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

            const searchMatchId = customIdList.find(el => /^match([0-9]+)$/i.test(el)) || ''
            const matchId = searchMatchId.replace(/^match([0-9]+)$/i, '$1')

            if (!matchId || !isFinite(matchId)) return reject({
                err_msg: {
                    ru: 'ID матча не был найден.',
                    en: 'The match ID was not found.'
                }
            })

            const body = await command.getStats(owner, matchId)
            const {getmatchdetails} = body
            const match = getmatchdetails.json
            const draw = await command.draw(body, prop)
            if (!draw.status) return reject(draw)

            const canvas = draw.canvas
            const buffer = canvas.toBuffer('image/png') // buffer image
            const news = config.news[lang]

            const showOldStatsText = {
                ru: '__**Вам будут показаны данные последнего удачного запроса.**__',
                en: '__**You will be shown the details of the last successful request.**__'
            }

            const replayOldText = body.getmatchdetails.old ?
                    `${body.getmatchdetails.new.err_msg[lang]}\n${showOldStatsText[lang]}\n` : ''

            const matchInfoText = customIdList.has('ch-full') ? // если вывести подробную инфу
                match.map((pl, i) => `${i+1}. [${pl.Reference_Name}](${pl.playerName})<id ${pl.playerId}> ` +
                    `[${config.platforms[pl.playerPortalId]}](${pl.playerPortalUserId})`).join('\n') :
                match.map((pl, i) => `${i+1}. [${pl.Reference_Name}](${pl.playerName})<id ${pl.playerId}>`).join('\n')

            const matchInfo = `\`\`\`md\n[]()<id ${draw.matchId}>\n\n${matchInfoText}\`\`\``

            let pageNum = null
            const comp = data.message.components
            const prevButtons = ButtonsManager.parse(comp, btn => {
                const cusIdList = btn.custom_id.split('_')
                if (/ch-page[1-5]/.test(btn.custom_id) && btn.disabled) pageNum = btn.custom_id.replace(/(.+)?ch-page([1-5])(.+)?/, '$2')

                if (/match[0-9]+/.test(btn.custom_id)) {
                    if (cusIdList.has('ch-full') && !customIdList.has('ch-full')) {
                        btn.custom_id = ButtonsManager.cutId(btn.custom_id, 'ch-full')
                    } else if (!cusIdList.has('ch-full') && customIdList.has('ch-full')) {
                        btn.custom_id += '_ch-full'
                    }
                }

                if (cusIdList.has(`match${matchId}`)) {
                    btn.disabled = true
                    btn.style = 3
                } else if (btn.disabled && /match[0-9]+/.test(btn.custom_id)) {
                    delete btn.disabled
                    btn.style = 1
                }
            })
            prevButtons.splice(-1) // удаляем последнюю линию (где кнопка меню)

            const btn_update = new Button()
            .setLabel({ru: 'Назад', en: 'Back'}[lang])
            .setStyle(4)
            .setId(`sh_ch-page${pageNum}`)

            const btn_menu = new Button()
            .setLabel({ru: 'Меню', en: 'Menu'}[lang])
            .setStyle(4)
            .setId('pal')

            const btn_ch_full_label = customIdList.has('ch-full') ? 
                {ru: 'Доп инф (ВКЛ)', en: 'Add info (ON)'} :
                {ru: 'Доп инф (ВЫКЛ)', en: 'Add info (OFF)'}
            const btn_ch_full_style = customIdList.has('ch-full') ? 3 : 2
            const btn_ch_full_id = customIdList.has('ch-full') ? `sm_match${matchId}` : `sm_match${matchId}_ch-full`
            const btn_ch_full = new Button()
            .setLabel(btn_ch_full_label[lang])
            .setStyle(btn_ch_full_style)
            .setId(btn_ch_full_id)

            prevButtons.push([btn_update, btn_menu, btn_ch_full])
            const buttonList = new ButtonsManager(prevButtons)

            // отправляем картинку на канал сервера что бы потом можно было взять ее url
            // да, да, вот так тупо приходится делать, дискорд не позволяет редачить файлы, но можно редачить ссылки
            const messImg = await sendToChannel(config.chImg, {files: [buffer]})
            const attachment = messImg.attachments.last()
            const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

            const sendResult = await message.edit({
                content: `${news}${replayOldText}<@${owner}>${matchInfo}`,
                components: buttonList.get(),
                embed: {
                    description: `||${hideInfo}||`,
                    color: '2F3136',
                    image: {
                        url: attachment.url
                    }
                }
            })
            return resolve({status: 1, name: 'sm', message: sendResult})
        } catch(err) {
            if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'sm.buttonExecute'
            })
        }
    })
}