/**
 * классы
 */


module.exports = class Button {
    constructor(style) {
        if (style && style.constructor === String) this.setStyle(style)
        if (style && style.constructor === Object) this.resolve(style)
        this.type = 2
    }

    resolve(obj) {
        if (obj.style) this.style = obj.style
        if (obj.label) this.label = obj.label
        if (obj.disabled) this.disabled = obj.disabled
        if (obj.custom_id) this.custom_id = obj.custom_id
        if (obj.emoji) this.emoji = obj.emoji
    }

    static styleType = {
        primary: 1,
        secondary: 2,
        success: 3,
        danger: 4,
        link: 5
    }
    
    setStyle(style) {
        this.style = isFinite(style) ? parseInt(style) : this.constructor.styleType[style]
        return this
    }

    setLabel(label) {
        this.label = label
        return this
    }

    setEmoji(obj) {
        this.emoji = obj
        return this
    }

    setId(custom_id) {
        this.custom_id = custom_id
        return this
    }

    setURL(url) {
        this.url = url
        this.style = 5 // у url не должен быть задан custom_id
        return this
    }

    setDisabled(bool=false) {
        this.disabled = Boolean(bool)
        return this
    }
}