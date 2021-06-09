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
            let status = 2
            const {owner, params} = hideObjInfo
            const guild = message.guild

            let content = ''
            const buttons = []
            if (!customIdList.length) {
                // предлагаем выбор того что можно изменить

                defaultButtons(buttons, guild, owner, settings.lang)
                const news = config.news[settings.lang]
                content = `${news}<@${owner}>`

            } else if (customIdList.has('lang', 'ru')) {
                // меняем язык на русский

                // применяем изменения локально
                const SETTINGS = await setSettings(command, 'user', 'lang', 'ru', owner, owner)
                settings = SETTINGS.get(owner) // получаем новые настройки, что бы сразу ответить на измененном языке

                defaultButtons(buttons, guild, owner, settings.lang)
                const news = config.news[settings.lang]
                content = `${news}<@${owner}>`
                content += {
                    ru: '\n :white_check_mark: Язык был успешно изменен.',
                    en: '\n :white_check_mark: The language was successfully changed.'
                }[settings.lang]

                status = 1

            } else if (customIdList.has('lang', 'en')) {
                // меняем язык на английский

                // применяем изменения локально
                const SETTINGS = await setSettings(command, 'user', 'lang', 'en', owner, owner)
                settings = SETTINGS.get(owner) // получаем новые настройки, что бы сразу ответить на измененном языке

                defaultButtons(buttons, guild, owner, settings.lang)
                const news = config.news[settings.lang]
                content = `${news}<@${owner}>`
                content += {
                    ru: '\n :white_check_mark: Язык был успешно изменен.',
                    en: '\n :white_check_mark: The language was successfully changed.'
                }[settings.lang]

                status = 1

            } else if (customIdList.has('lang', 'ru', 'server')) {
                // меняем язык сервера на русский

                if (!guild) reject({
                    err_msg: {
                        ru: '',
                        en: ''
                    }
                })

                // применяем изменения локально
                const SETTINGS = await setSettings(command, 'server', 'lang', 'ru', owner, guild.id)
                settings = SETTINGS.get(owner) // получаем новые настройки, что бы сразу ответить на измененном языке

                defaultButtons(buttons, guild, owner, settings.lang)
                const news = config.news[settings.lang]
                content = `${news}<@${owner}>`
                content += {
                    ru: '\n :white_check_mark: Язык был успешно изменен.',
                    en: '\n :white_check_mark: The language was successfully changed.'
                }[settings.lang]

                status = 1

            } else if (customIdList.has('lang', 'en', 'server')) {
                // меняем язык сервера на английский

                if (!guild) reject({
                    err_msg: {
                        ru: '',
                        en: ''
                    }
                })

                // применяем изменения локально
                const SETTINGS = await setSettings(command, 'server', 'lang', 'en', owner, guild.id)
                settings = SETTINGS.get(owner) // получаем новые настройки, что бы сразу ответить на измененном языке

                defaultButtons(buttons, guild, owner, settings.lang)
                const news = config.news[settings.lang]
                content = `${news}<@${owner}>`
                content += {
                    ru: '\n :white_check_mark: Язык был успешно изменен.',
                    en: '\n :white_check_mark: The language was successfully changed.'
                }[settings.lang]

                status = 1

            } else if (customIdList.has('timezone')) {
                //
            } else if (customIdList.has('background')) {
                //
            } else {
                // err
            }

            const buttonList = new ButtonsManager(buttons)
            const hideInfo = stegcloak.hide(JSON.stringify(hideObjInfo), config.stegPass, config.stegText)

            const sendResult = await message.edit({
                content,
                components: buttonList.get(),
                embed: {
                    description: `||${hideInfo}||`,
                    color: '2F3136'
                }
            })
            return resolve({status, name: 'set', message: sendResult})
        } catch(err) {
            if (err && (err.err_msg !== undefined || err.log_msg !== undefined)) return reject(err)
            return reject({
                err,
                err_msg: {
                    ru: 'Что-то пошло не так... Попробуйте снова или сообщите об этой ошибке создателю бота.',
                    en: 'Something went wrong... Try again or report this error to the bot creator.'
                },
                log_msg: 'set.buttonExecute'
            })
        }
    })
}


function setSettings(command, setFor, typeValue, setValue, owner, setId) {
    return new Promise(async (resolve, reject) => {
        const body = await command.setData(owner, {
            typeFor: setFor,
            id: setId,
            typeValue,
            value: setValue
        })
        // console.log(body)

        if (!body.status) return reject(body)

        const SETTINGS = setFor === 'guild' ? _local.guildsSettings : _local.usersSettings
        const getSettings = SETTINGS.get(setId)

        // если их нет то создаем
        if (!getSettings) {
            const newSettingsData = { // создаем обьект с дефолтными настройками
                id: setId,
                lang: config.lang,
                timezone: config.timezone,
                prefix: config.prefix,
                backgrounds: config.backgrounds
            }
            newSettingsData[typeValue] = setValue // применяем новые
            SETTINGS.add(newSettingsData) // записываем в менеджер
        } else {
            // иначе применяем новые
            // getSettings[typeValue] = setValue
            SETTINGS.set(setId, typeValue, setValue)
        }
        return resolve(SETTINGS)
    })
}


function defaultButtons(buttons, guild, owner, lang) {
    const isOwner = guild ? guild.owner ? guild.owner.id == owner : false : false

    const btn_langServerRU = new Button()
    .setLabel({ru: 'Server RU', en: 'Server RU'}[lang])
    .setStyle(1)
    .setId('set_lang_server_ru')
    .setDisabled(!isOwner)

    const btn_langServerEN = new Button()
    .setLabel({ru: 'Server EN', en: 'Server EN'}[lang])
    .setStyle(1)
    .setId('set_lang_server_en')
    .setDisabled(!isOwner)

    const btn_langRU = new Button()
    .setLabel({ru: 'Me RU', en: 'Me RU'}[lang])
    .setStyle(1)
    .setId('set_lang_ru')

    const btn_langEN = new Button()
    .setLabel({ru: 'Me EN', en: 'Me EN'}[lang])
    .setStyle(1)
    .setId('set_lang_en')

    const btn_timezone = new Button()
    .setLabel({ru: 'Часовой пояс', en: 'Time zone'}[lang])
    .setStyle(1)
    .setId('set_timezone')
    .setDisabled(true)

    const btn_background = new Button()
    .setLabel({ru: 'Изменить фон', en: 'Change background'}[lang])
    .setStyle(1)
    .setId('set_background')
    .setDisabled(true)

    const btn_menu = new Button()
    .setLabel({ru: 'Меню', en: 'Menu'}[lang])
    .setStyle(4)
    .setId('pal')

    buttons.push([btn_langServerRU, btn_langServerEN, btn_langRU, btn_langEN])
    buttons.push([btn_timezone, btn_background])
    buttons.push([btn_menu])
}