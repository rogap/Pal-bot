/**
 * упрощает создание функции details для команд
 */


const _local = process._local
const {config} = _local


module.exports = class Details {
    constructor(command) {
        // перебираем все поддерживаемые языки
        for (let lang in config.langs) {
            this[lang] = {
                embed: {
                    title: `\`${command.name}\` - ${command.info[lang]}`,
                    fields: [],
                    footer: {
                        icon_url: config.emptyIcon,
                        text: config.copyText
                    }
                }
            }
        }
    }

    setDescription(params) {
        for (let lang in config.langs) {
            const valueList = [
                {ru: 'Формат команды:', en: ''}[lang],
                params[lang],
                {ru: 'Опции параметров:', en: ''}[lang],
                {ru: '[?] "Не обязательный параметр (но написать следующий параметр пропустив этот нельзя)"', en: ''}[lang],
                {ru: '[^] "Параметр можно менять местами с другими такими же параметрами"', en: ''}[lang],
                {ru: `[*] "Указывает что этот параметр может принудительно пропустить первый параметр"`, en: ``}[lang],
                {ru: 'Описание параметров:', en: ''}[lang]
            ]
            this[lang].embed.description = `\`\`\`cs\n${valueList.join('\n')}\`\`\``
        }
        return this
    }

    setFields(params) {
        for (let lang in config.langs) {
            const name = params.name[lang]
            const valueList = params.value[lang]
            this[lang].embed.fields.push({
                name,
                value: `\`\`\`css\n${valueList.join('\n')}\`\`\``
            })
        }
        return this
    }

    setExample(...exampleList) {
        for (let lang in config.langs) {
            this[lang].embed.fields.push({
                name: {ru: 'Примеры', en: 'Examples'}[lang],
                value: `\`\`\`fix\n${exampleList.join('\n')}\`\`\``
            })
        }
        return this
    }
}