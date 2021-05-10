/**
 * помощник в переводе слов, предложений, ошибок
 * ключи в обьекте создаются с большой буквы !!!
 * цикл в функции добавит ключи капсом и с маленькой буквы, при этом поменяв и их значения таким же образом
 * разделение слов в ключе обьекта делается чертой снизу "_" !!!
 */


module.exports = (function() {
    // было бы не плохо разгруппировать это (пробелами с комантами)
    const words = {
        Position: {ru: 'Позиция', en: 'Position'},
        Tp: {ru: 'От', en: 'Tp'},
        Rank: {ru: 'Ранг', en: 'Rank'},
        Winrate: {ru: 'Винрейт', en: 'Winrate'},
        Losses: {ru: 'Поражений', en: 'Losses'},
        Loss: {ru: 'Поражение', en: 'Loss'},
        Wins: {ru: 'Побед', en: 'Wins'},
        Win: {ru: 'Победа', en: 'Win'},
        Ranked: {ru: 'Ранкед', en: 'Ranked'},
        Assists: {ru: 'Помощи', en: 'Assists'},
        Deaths: {ru: 'Смертей', en: 'Deaths'},
        Kills: {ru: 'Убийств', en: 'Kills'},
        Total: {ru: 'Всего', en: 'Total'},
        Title: {ru: 'Титул', en: 'Title'},
        Client: {ru: 'Клиент', en: 'Client'},
        Last_login: {ru: 'Последний вход', en: 'Last login'},
        Played: {ru: 'Сыграно', en: 'Played'},
        Created: {ru: 'Создан', en: 'Created'},
        Level: {ru: 'Уровень', en: 'Level'},
        Account: {ru: 'Аккаунт', en: 'Account'},
        Update: {ru: 'Обновится', en: 'Update'},
        Champions: {ru: 'Чемпионы', en: 'Champions'},
        Champion: {ru: 'Чемпион', en: 'Champion'},
        Timezone: {ru: 'Часовой пояс', en: 'Timezone'},
        Sponsor: {ru: 'Спонсор', en: 'Sponsor'},
        Favorite_champions: {ru: 'Любимые чемпионы', en: 'Favorite champions'},
        Roles: {ru: 'Роли', en: 'Roles'},
        Role: {ru: 'Роль', en: 'Role'},
        Damage: {ru: 'Урон', en: 'Damage'},
        Defense: {ru: 'Защита', en: 'Defense'},
        Healing: {ru: 'Лечение', en: 'Healing'},
        Dmg_taken: {ru: 'Получено', en: 'Dmg taken'},
        Obj_assist: {ru: 'Цель', en: 'Obj assist'},
        Items: {ru: 'Предметы', en: 'Items'},
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
        Matchhistory: {ru: 'История матчей', en: 'Match history'},
        Loadouts: {ru: 'Колоды', en: 'Loadouts'},
        Matches: {ru: 'Матчи', en: 'Matches'},
        Match_id: {ru: 'Id матча', en: 'Match id'},
        Region: {ru: 'Регион', en: 'Region'},
        Minutes: {ru: 'Минуты', en: 'Minutes'},
        Score: {ru: 'Счет', en: 'Score'},
        Team: {ru: 'Команда', en: 'Team'},
        Bans: {ru: 'Баны', en: 'Bans'},
        Player: {ru: 'Игрок', en: 'Player'},
        Party: {ru: 'Пати', en: 'Party'},
        Credits: {ru: 'Кредиты', en: 'Credits'},
        K_D_A: {ru: 'К/Д/А', en: 'K/D/A'},
        Kda: {ru: 'Усп', en: 'Kda'}, // Убийства Смерти Помощь - мб есть смысл писать так
        Map: {ru: 'Карта', en: 'Map'},
        Nickname: {ru: 'Ник', en: 'Nickname'},
        Health: {ru: 'Жизни', en: 'Health'},
        Speed: {ru: 'Скорость', en: 'Speed'}
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