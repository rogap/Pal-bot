/**
 * помощник в переводе слов, предложений, ошибок
 * ключи в обьекте создаются с большой буквы !!!
 * цикл в функции добавит ключи капсом и с маленькой буквы, при этом поменяв и их значения таким же образом
 * разделение слов в ключе обьекта делается чертой снизу "_" !!!
 */


module.exports = (function() {
    const words = {
        Position: {ru: 'Позиция', en: 'Position'},
        Tp: {ru: 'От', en: 'Tp'},
        Rank: {ru: 'Ранг', en: 'Rank'},
        Winrate: {ru: 'Винрейт', en: 'Winrate'},
        Losses: {ru: 'Поражений', en: 'Losses'},
        Wins: {ru: 'Побед', en: 'Wins'},
        Ranked: {ru: 'Ранкед', en: 'Ranked'},
        Assists: {ru: 'Ассистов', en: 'Assists'},
        Deaths: {ru: 'Смертей', en: 'Deaths'},
        Kills: {ru: 'Убийств', en: 'Kills'},
        Total: {ru: 'Всего', en: 'Total'},
        Title: {ru: 'Титул', en: 'Title'},
        Client: {ru: 'Клиент', en: 'Client'},
        Last_login: {ru: 'Последний вход', en: 'Last login'},
        Played: {ru: 'Сыграно', en: 'Played'},
        Created: {ru: 'Создан', en: 'Created'},
        Level: {ru: 'Уровень', en: 'Level'},
        Accaunt: {ru: 'Аккаунт', en: 'Accaunt'},
        Update: {ru: 'Обновится', en: 'Update'},
        Champions: {ru: 'Чемпионы', en: 'Champions'},
        Timezone: {ru: 'Часовой пояс', en: 'Timezone'},
        Sponsor: {ru: 'Спонсор', en: 'Sponsor'},
        Favorite_champions: {ru: 'Любимые чемпионы', en: 'Favorite champions'},
        Roles: {ru: 'Роли', en: 'Roles'},
        Damage: {ru: 'Урон', en: 'Damage'},
        Tank: {ru: 'Танк', en: 'Tank'},
        Flank: {ru: 'Фланг', en: 'Flank'},
        Heal: {ru: 'Хилл', en: 'Heal'},
        Support: {ru: 'Саппорт', en: 'Support'},
        Bot_site: {ru: 'Сайт бота', en: 'Bot site'},
        Prefix: {ru: 'Префикс', en: 'Prefix'},
        Commands: {ru: 'Команды', en: 'Commands'},
        Bot_creator: {ru: 'Создатель бота', en: 'Bot creator'},
        On_server: {ru: 'На сервере', en: 'On server'},
        Your_settings: {ru: 'Ваши настройки', en: 'Your settings'},
        Example: {ru: 'Пример', en: 'Example'},
        Matchhistory: {ru: 'История матчей', en: 'Matchhistory'},
        Matches: {ru: 'Матчи', en: 'Matches'}
    }
 
    for (let key in words) {
        const value = words[key]
        const {ru, en} = value

        words[ key.toUpperCase() ] = {
            ru: ru.toUpperCase(),
            en: en.toUpperCase()
        }

        words[ key.toLowerCase() ] = {
            ru: ru.toLowerCase(),
            en: en.toLowerCase()
        }
    }
    return words
})();