/**
 * функция которая выполняет комнаду и отправляет результат пользователю
 */


const _local = process._local
const {config, classes} = _local
const {Details} = classes


module.exports = function(message, settings, command, contentParams) {
    return new Promise((resolve, reject) => {
        const userId = message.author.id
        const {lang} = settings

        return reject({
            err_msg: {
                ru: 'Команда в разработке.',
                en: 'The team is in development.'
            }
        })

        // Queue	"Team Deathmatch" | Queue	"Onslaught"
        const gameModeTypes = {
            ranked: ['ranked', 'ранкед'],
            siege: ['siege', 'казуал', 'обычка'],
            deathmatch: ['tdm', 'тдм', 'deathmatch'],
            onslaught: ['onslaught', 'натиск']
        }
        const params = contentParams.split(' ')
        const {nameOrId, champOrType1, champOrType2} = params // champOrType может быть любой порядок

        //

        command.getStats(userId, nameOrId)
    })
}