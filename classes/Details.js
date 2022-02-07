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
                embeds: [{
                    title: `\`${command.name}\` - ${command.info[lang]}`,
                    fields: [],
                    color: '2F3136',
                    footer: {
                        icon_url: config.emptyIcon,
                        text: config.copyText
                    }
                }]
            }
        }
    }

    setDescription(params) {
        for (let lang in config.langs) {
            const valueList = [
                {ru: 'Формат команды:', en: 'Command format:'}[lang],
                params[lang],
                {ru: 'Опции параметров:', en: 'Parameter Options'}[lang],
                {ru: '[?] "Не обязательный параметр (но написать следующий параметр пропустив этот нельзя)"',
                    en: `[?] "Optional parameter (but you can\'t write the next parameter without skipping this one)"`}[lang],
                {ru: '[^] "Параметр можно менять местами с другими такими же параметрами"',
                    en: '[^] "The parameter can be swapped with other similar parameters"'}[lang],
                // {ru: `[*] "Указывает что этот параметр может принудительно пропустить первый параметр"`,
                    // en: `Specifies that this parameter can force the first parameter to be skipped`}[lang],
                {ru: 'Описание параметров:', en: 'Description of parameters'}[lang]
            ]
            this[lang].embeds[0].description = `\`\`\`cs\n${valueList.join('\n')}\`\`\``
        }
        return this
    }

    setFields(params) {
        for (let lang in config.langs) {
            const name = params.name[lang]
            const valueList = params.value[lang]
            this[lang].embeds[0].fields.push({
                name,
                value: `\`\`\`css\n${valueList.join('\n')}\`\`\``
            })
        }
        return this
    }

    setExample(...exampleList) {
        for (let lang in config.langs) {
            this[lang].embeds[0].fields.push({
                name: {ru: 'Примеры', en: 'Examples'}[lang],
                value: `\`\`\`fix\n${exampleList.join('\n')}\`\`\``
            })
        }
        return this
    }
}