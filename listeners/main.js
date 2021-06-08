/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


module.exports = (function() {
    try {
        require('./guildCreate.js')
        require('./guildDelete.js')
        require('./ready.js')
        require('./message.js')
        require('./button.js')
        console.log('Обработчики успешно загружены.')
        return true
    } catch(err) {
        console.log('Ошибка загрузки слушателей:')
        console.log(err)
        return false
    }
})();