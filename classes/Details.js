/**
 * упрощает создание функции details для команд
 */


const _local = process._local
const {config} = _local


module.exports = class Details {
    constructor() {
        for (let lang in config.langs) {
            this[lang] = {
                embed: {
                    title: '',
                    fields: [],
                    footer: {
                        icon_url: config.emptyIcon,
                        text: config.copyText
                    }
                }
            }
        }
    }

    setTitle(lang, title) {
        this[lang].embed.title = title
        return this
    }

    setFields(lang, field) {
        field.value = `\`\`\`cs\n${field.value}\`\`\``
        this[lang].embed.fields.push(field)
        return this
    }
}