/**
 * основной файл-скрипт для загрузки всех в этой папке
 */


module.exports = Object.assign(
	require('./string'),
	require('./time.js'),
	require('./discord.js'),
	require('./helperSendSite.js')
)