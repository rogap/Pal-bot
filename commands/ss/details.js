const _local = process._local
const {config} = _local


module.exports = function(settings, command) {
    const {commands, lang, prefix} = settings
    const comSs = prefix + command.possibly[0]
    // const comMe = prefix + commands.getByName('me').possibly[0]
    const comMe = prefix + 'me' // временно так, пока нет команды "me"

    return {
        embed: {
            ru: {
                title: `\`${command.name}\` - ${command.info.ru}\nПримеры:`,
                fields: [
                    {
                        name: `${comSs}:`,
                        value: `\`\`\`cs\nИспользует ваш сохраненный никнейм.\n[Если вы его записывали командой "${comMe}"].\`\`\``
                    },
                    {
                        name: `${comSs} me:`,
                        value: `\`\`\`cs\nРаботает аналогично "${comSs}".\`\`\``
                    },
                    {
                        name: `${comSs} @DiscordUser:`,
                        value: `\`\`\`cs\nИспользует сохраненный никнейм того кого вы упомянули.\n[Если он записывал свой никнейм командой "${comMe}"].\`\`\``
                    },
                    {
                        name: `${comSs} 510112915907543042:`,
                        value: `\`\`\`cs\nИспользует сохраненный никнейм того чей Discord Id вы указали.\n[Если он записывал свой никнейм командой "${comMe}"].\`\`\``
                    },
                    {
                        name: `${comSs} 4734793:`,
                        value: `\`\`\`cs\nВыводит статистику указанного Id игрока.\n[Лучший способ].\`\`\``
                    },
                    {
                        name: `${comSs} tetrisplayer:`,
                        value: `\`\`\`cs\nВыводит статистику указанного никнейма.\n[Только ПК].\`\`\``
                    }
                ],
                footer: {
                    icon_url: config.emptyIcon,
                    text: config.copyText
                }
            },
            en: {
                title: `\`${command.name}\` - ${command.info.en}\nExamples:`,
                fields: [
                    {
                        name: `${comSs}:`,
                        value: `\`\`\`cs\nUses your saved nickname.\n[If you recorded it with the command "${comMe}"].\`\`\``
                    },
                    {
                        name: `${comSs} me:`,
                        value: `\`\`\`cs\nWorks similarly "${comSs}".\`\`\``
                    },
                    {
                        name: `${comSs} @DiscordUser:`,
                        value: `\`\`\`cs\nUses the saved nickname of the one you mentioned.\n[If he wrote down his nickname with the command "${comMe}"].\`\`\``
                    },
                    {
                        name: `${comSs} 510112915907543042:`,
                        value: `\`\`\`cs\nUses the saved nickname of the one whose Discord Id you specified.\n[If he wrote down his nickname with the command "${comMe}"].\`\`\``
                    },
                    {
                        name: `${comSs} 4734793:`,
                        value: `\`\`\`cs\nDisplays statistics for the specified player Id.\n[The best way].\`\`\``
                    },
                    {
                        name: `${comSs} tetrisplayer:`,
                        value: `\`\`\`cs\nDisplays statistics for the specified nickname.\n[PC only].\`\`\``
                    }
                ],
                footer: {
                    icon_url: config.emptyIcon,
                    text: config.copyText
                }
            }
        }[lang]
    }
}