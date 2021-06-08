/**
 * 
 */


const _local = process._local
const {classes} = _local
const {Button, ButtonsManager} = classes


module.exports = function(lang) {
    try {
        // 1 line
        const btn_set = new Button()
        .setLabel({ru: 'Настройки', en: 'Options'}[lang])
        .setStyle(1)
        .setId('set')

        const btn_menu = new Button()
        .setLabel({ru: 'Обновить', en: 'Update'}[lang])
        .setStyle(3)
        .setId('pal')

        const btn_site = new Button()
        .setLabel({ru: 'Сайт бота', en: 'Bot site'}[lang])
        .setURL('https://webmyself.ru/pal-bot/')

        const btn_discord = new Button()
        .setLabel({ru: 'Дискорд бота', en: 'Bot discord'}[lang])
        .setURL('https://discord.gg/C2phgzTxH9')

        // 2 line
        const btn_ss = new Button()
        .setLabel({ru: 'Статистика аккаунта', en: 'Accaunt stats'}[lang])
        .setStyle(1)
        .setId('ss')

        const btn_sp = new Button()
        .setLabel({ru: 'Статус в игре', en: 'Status in game'}[lang])
        .setStyle(1)
        .setId('sp')

        const btn_sf = new Button()
        .setLabel({ru: 'Друзья', en: 'Friends'}[lang])
        .setStyle(1)
        .setId('sf')
        .setDisabled(true)

        const btn_sb = new Button()
        .setLabel({ru: 'Заблокированные', en: 'Blocked'}[lang])
        .setStyle(1)
        .setId('sb')
        .setDisabled(true)

        // 3 line
        const btn_sh = new Button()
        .setLabel({ru: 'Матчи', en: 'Matches'}[lang])
        .setStyle(1)
        .setId('sh')
        
        const btn_st = new Button()
        .setLabel({ru: 'Чемпионы', en: 'Champions'}[lang])
        .setStyle(1)
        .setId('st')
        .setDisabled(true)
        
        const btn_sl = new Button()
        .setLabel({ru: 'Колоды', en: 'Decks'}[lang])
        .setStyle(1)
        .setId('sl')
        .setDisabled(true)

        return new ButtonsManager([
            [btn_set, btn_menu, btn_site, btn_discord],
            [btn_ss, btn_sp, btn_sf, btn_sb],
            [btn_sh, btn_st, btn_sl]
        ])
    } catch(err) {
        throw {
            err,
            err_msg: {
                ru: '',
                en: ''
            },
            log_msg: ''
        }
    }
}