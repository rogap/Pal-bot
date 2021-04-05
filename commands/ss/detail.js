module.exports = function(_prop) {
    const {commands, lang, prefix} = _prop
    const comSsNotPrefix = commands.getCommand("ss").commands[0]
    const comSs = prefix + comSsNotPrefix
    const comMe = commands.getCommand("me").commands[0]

    const langTextFields = [
        {
            ru: `Использует ваш сохраненный никнейм.\n[Если вы его записывали командой "${comMe}"].`,
            en: `Uses your saved nickname.\n[If you recorded it with the command "${comMe}"].`
        },
        {
            ru: `Работает аналогично "${comSs}".`,
            en: `Works similarly "${comSs}".`
        },
        {
            ru: `Использует сохраненный никнейм того кого вы упомянули.\n[Если он записывал свой никнейм командой "${comMe}"].`,
            en: `Uses the saved nickname of the one you mentioned.\n[If he wrote down his nickname with the command "${comMe}"].`
        },
        {
            ru: `Использует сохраненный никнейм того чей Discord Id вы указали.\n[Если он записывал свой никнейм командой "${comMe}"].`,
            en: `Uses the saved nickname of the one whose Discord Id you specified.\n[If he wrote down his nickname with the command "${comMe}"].`
        },
        {
            ru: `Выводит статистику указанного Id игрока.\n[Лучший способ].`,
            en: `Displays statistics for the specified player Id.\n[The best way].`
        },
        {
            ru: `Выводит статистику указанного никнейма.\n[Только ПК].`,
            en: `Displays statistics for the specified nickname.\n[PC only].`
        }
    ]

    return {
        title: `${comSsNotPrefix} - ${commands.getCommand("ss").info(_prop)}`,
        fields: [
            {
                name: `${comSs}:`,
                value: `\`\`\`cs\n${langTextFields[0][lang]}\`\`\``
            },
            {
                name: `${comSs} me:`,
                value: `\`\`\`cs\n${langTextFields[1][lang]}\`\`\``
            },
            {
                name: `${comSs} @DiscordUser:`,
                value: `\`\`\`cs\n${langTextFields[2][lang]}\`\`\``
            },
            {
                name: `${comSs} 510112915907543042:`,
                value: `\`\`\`cs\n${langTextFields[3][lang]}\`\`\``
            },
            {
                name: `${comSs} 4734793:`,
                value: `\`\`\`cs\n${langTextFields[4][lang]}\`\`\``
            },
            {
                name: `${comSs} tetrisplayer:`,
                value: `\`\`\`cs\n${langTextFields[5][lang]}\`\`\``
            }
        ],
        footer: {
            icon_url: config.botIcon,
            text: `© 2019 Pal-Bot`
        }
    }
}