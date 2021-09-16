/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {Discord, client, config} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord


/**
 * 
 * @param {String} userId - id написавшего / нажавшего
 * @param {Object} settings 
 * @param {String} setFor - server / user
 * @param {String} setId - serverId / userId
 * @returns {Object}
 */
module.exports = async (userId, guildId, settings, nameOrId, setFor, setId, optLang, optTimezone) => {
    try {
        let {lang} = settings
        const news = config.news[lang]

        const hideInfoParams = nameOrId || 'me'
        const hideInfo = [{name: 'owner', value: `<@${userId}>`, inline: true}, {name: 'for', value: hideInfoParams, inline: true}]
        const isAdministrator = await isAdmin(userId, guildId)

        const optionsTimezone = [{
            label: 'auto',
            description: 'auto',
            value: 'auto'
        }]
        for (let i = 0; i < 24; i++) {
            const num = i + ''
            optionsTimezone.push({
                label: num,
                description: num,
                value: num
            })
        }

        const buttonsLine_2 = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('setting_timezone_server')
                .setPlaceholder({en: 'Select a time zone for the server', ru: 'Выбрать временную зону для сервера'}[lang])
                .addOptions(optionsTimezone)
                .setDisabled(!isAdministrator)
        )

        const buttonsLine_3 = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('setting_timezone_user')
                .setPlaceholder({en: 'Choose a time zone for yourself', ru: 'Выбрать временную зону для себя'}[lang])
                .addOptions(optionsTimezone)
        )

        const buttonsLine_4 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('menu')
            .setLabel({en: 'Menu', ru: 'Меню'}[lang])
            .setStyle('DANGER')
        )

        // если для сервера то проверяем является ли пользователь владельцем указанного сервера
        if (setFor == 'server' && !isAdministrator) {
            const serverSetting = _local.guildSettings.get(guildId) || {}
            const userSetting = _local.userSettings.get(userId) || {}

            const buttonsLine_1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('setting_lang_server_en')
                .setLabel({en: 'Server lang to EN', ru: 'Язык сервера на EN'}[lang])
                .setStyle(serverSetting.lang == 'en' ? 'SUCCESS' : 'PRIMARY')
                .setDisabled(!isAdministrator)
            )
            .addComponents(
                new MessageButton()
                .setCustomId('setting_lang_server_ru')
                .setLabel({en: 'Server lang to RU', ru: 'Язык сервера на RU'}[lang])
                .setStyle(serverSetting.lang == 'ru' ? 'SUCCESS' : 'PRIMARY')
                .setDisabled(!isAdministrator)
            )
            .addComponents(
                new MessageButton()
                .setCustomId('setting_lang_user_en')
                .setLabel({en: 'My lang EN', ru: 'Мой язык EN'}[lang])
                .setStyle(userSetting.lang == 'en' ? 'SUCCESS' : 'PRIMARY')
            )
            .addComponents(
                new MessageButton()
                .setCustomId('setting_lang_user_ru')
                .setLabel({en: 'My lang RU', ru: 'Мой язык RU'}[lang])
                .setStyle(userSetting.lang == 'ru' ? 'SUCCESS' : 'PRIMARY')
            )

            return {
                content: `:warning::warning::warning: \`\`\`fix\n${{
                    ru: 'У вас нет прав администратора для изменения этих настроек.',
                    en: 'You do not have administrator rights to change these settings.'
                }[lang]}\`\`\``,
                components: [buttonsLine_1, buttonsLine_2, buttonsLine_3, buttonsLine_4],
                embeds: [{
                    color: '2F3136',
                    fields: hideInfo
                }]
            }
        }

        // console.log(`setFor: ${setFor}; setId: ${setId}; typeValue: ${typeValue}; setValue: ${setValue}`)
        // применяем значения
        if (optLang) await _local[setFor == 'user' ? 'userSettings' : 'guildSettings'].set(setId, 'lang', optLang)
        if (optLang && setFor == 'user') lang = optLang
        if (optTimezone) await _local[setFor == 'user' ? 'userSettings' : 'guildSettings'].set(setId, 'timezone', optTimezone)
        // if (setValue) await _local[setFor == 'user' ? 'userSettings' : 'guildSettings'].set(setId, typeValue, setValue)

        const serverSetting = _local.guildSettings.get(guildId) || {}
        const userSetting = _local.userSettings.get(userId) || {}

        const statusMess = (optLang || optTimezone) ? `:white_check_mark::white_check_mark::white_check_mark: \`\`\`yaml\n${{
            en: 'Settings have been successfully applied.',
            ru: 'Настройки успешно применены.'
        }[lang]}\`\`\`` : ''

        const buttonsLine_1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('setting_lang_server_en')
            .setLabel({en: 'Server lang to EN', ru: 'Язык сервера на EN'}[lang])
            .setStyle(serverSetting.lang == 'en' ? 'SUCCESS' : 'PRIMARY')
            .setDisabled(!isAdministrator)
        )
        .addComponents(
            new MessageButton()
            .setCustomId('setting_lang_server_ru')
            .setLabel({en: 'Server lang to RU', ru: 'Язык сервера на RU'}[lang])
            .setStyle(serverSetting.lang == 'ru' ? 'SUCCESS' : 'PRIMARY')
            .setDisabled(!isAdministrator)
        )
        .addComponents(
            new MessageButton()
            .setCustomId('setting_lang_user_en')
            .setLabel({en: 'My lang EN', ru: 'Мой язык EN'}[lang])
            .setStyle(userSetting.lang == 'en' ? 'SUCCESS' : 'PRIMARY')
        )
        .addComponents(
            new MessageButton()
            .setCustomId('setting_lang_user_ru')
            .setLabel({en: 'My lang RU', ru: 'Мой язык RU'}[lang])
            .setStyle(userSetting.lang == 'ru' ? 'SUCCESS' : 'PRIMARY')
        )

        return {
            content: `${news}\n${statusMess}`,
            components: [buttonsLine_1, buttonsLine_2, buttonsLine_3, buttonsLine_4],
            embeds: [{
                color: '2F3136',
                fields: hideInfo
            }]
        }
    } catch(err) {
        if (err && err.err_msg !== undefined) throw err
        throw {
            err,
            err_msg: {
                ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                en: 'Something went wrong... Try again or report this error to the bot creator.'
            },
            log_msg: 'set.execute'
        }
    }
}


async function isAdmin(userId, guildId) {
    if (!guildId) return true
    const guild = await client.guilds.fetch(guildId)
    if (!guild) return false
    const member = await guild.members.fetch(userId)
    return member.permissions.has('ADMINISTRATOR')
}