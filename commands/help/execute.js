/**
 * функция которая выполняет комнаду принимая данные
 */


const _local = process._local
const path = require('path')
const {Discord, config} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


module.exports = async (userId, settings, contentParams) => {
    try {
        const {lang, commands} = settings
        let nameOrId = contentParams || userId
        const news = config.news[lang]
        if (nameOrId && nameOrId.mentionToId) nameOrId = nameOrId.mentionToId()

        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: nameOrId, inline: true}]

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
            .setEmoji('<:menu:943824092635758632>')
        )
        .addComponents(
            new MessageButton()
            .setURL(config.discordInvate)
            .setLabel({en: 'Join bot server', ru: 'Посетить сервер бота'}[lang])
            .setStyle('LINK')
        )

        const pageListOpt = []
        commands.each((com, i) => {
            if (com.owner) return;
            const cObj = {
                label: com.name,
                description: com.info[lang],
                value: com.name
            }
            if (com.emoji) cObj.emoji = com.emoji
            pageListOpt.push(cObj)
        })
        const buttonsLine_2 = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('help')
                .setPlaceholder({en: 'Select a command for help', ru: 'Выберите команду для справки'}[lang])
                .addOptions(pageListOpt)
        )

        return {
            content: `${news}`,
            components: [buttonsLine_1, buttonsLine_2],
            embeds: [{
                color: '2F3136',
                fields: hideInfo
            }],
            files: [path.join(_local.path, 'video', 'help.mp4')]
        }
    } catch(err) {
        console.log(JSON.stringify(err))
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'help.execute'
        }
    }
}