/**
 * классы
 */


const Button = require('./Button.js')


module.exports = class ButtonsManager {
    constructor(data) {
        this.components = []

        if (data) {
            if (data.constructor === Button) {
                this.components.push({
                    type: 1,
                    components: [data]
                })
            } else if (data.constructor === Array && data[0].constructor === Button) {
                if ( data.length > 5 ) throw new Error('Не может быть более 5 кнопок в строке.')
                this.components.push({
                    type: 1,
                    components: data
                })
            } else if (data.constructor === Array && data[0].constructor === Array && data[0][0].constructor === Button) {
                if ( data.length > 4 ) throw new Error('Не может быть более 4 строк.')

                data.forEach(listButtons => {
                    if ( listButtons.length > 5 ) throw new Error('Не может быть более 5 кнопок в строке.')
                    this.components.push({
                        type: 1,
                        components: listButtons
                    })
                })
            } else {
                throw new Error('Введены не корректные данные.')
            }
        }
    }

    static cutId(id, cutId) {
        return id.replace(new RegExp(`_?${cutId}_?`, 'i'), '_')
    }

    static parse(components, callback) {
        const lines = []
        components.forEach(btnLine => {
            const line = []
            btnLine.components.forEach(btn => {
                callback(btn)
                line.push( new Button(btn) )
            })
            lines.push(line)
        })

        return lines
    }

    get() {
        return this.components
    }
}