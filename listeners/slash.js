/**
 * обработчик slash команд
 */


const _local = process._local
const {Discord, client, config, utils, classes, commandsUsed} = _local
const {MessageActionRow, MessageButton, MessageSelectMenu} = Discord
const {sendToChannel} = utils


client.on('interactionCreate', async interaction => {
    try {
        if (!_local.launched) return; // если бот не запущен до конца
        if (interaction.user.bot) return; // пропускаем ботов
        if (!interaction.isCommand()) return;
        console.log('slash', interaction.commandName, interaction.options)

        const authorId = interaction.user.id
        const settings = Discord.Message.prototype.getSettings.call(interaction, authorId)
        const command = settings.commands.getBySlashName(interaction.commandName, interaction.options._group, interaction.options._subcommand)

        if (!command || !command.slash) return;

        await interaction.deferReply()
        const res = await command.slash(interaction, settings, command)

        // увеличиваем число использований команды, только удачные и не админские
        await command.used()
        console.log(`Команда slash (${command.name}) успешно выполнена (<@${authorId}>).`)
    } catch(err) {
        console.log(err)
        const authorId = interaction.user.id
        const settings = Discord.Message.prototype.getSettings.call(interaction, authorId) // получаем обьект настроек для текущего пользователя
        const {lang} = settings
        try {
            // создаем кнопку меню и кнопку помощи
            const buttonsLine_1 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setURL(config.discordInvate)
                .setLabel({en: 'Help', ru: 'Помощь'}[lang])
                .setStyle('LINK')
            )

            const errText = err.err_msg || {ru: 'Неизвестная ошибка...', en: 'Unknown error...'}

            await interaction.editReply({
                content: `:warning::warning::warning: \`\`\`fix\n${errText[lang]}\`\`\``,
                components: [buttonsLine_1]
            })
        } catch(err2) {
            console.log('\nОШИБКА ОТПРАВКИ error-slash СООБЩЕНИЯ:\n')
            console.log(JSON.stringify(err2))
        }

        if (err && err.log_msg) { // отправка логов на сервер бота (уведомления)
            try {
                if (err?.err) console.log(JSON.stringify(err.err))
                await sendToChannel(config.chLog, err.log_msg)
            } catch(err3) {
                console.log('\nОШИБКА ОТПРАВКИ ЛОГОВ НА СЕРВЕР БОТА:\n')
                console.log(err3)
            }
        }
    }
})