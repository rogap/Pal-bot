/**
 * абстрактный класс используемый только в наследовании
 */


 module.exports = class AbstractChampion {
    static nameNormalize(name) {
        return name.replace(/[-`' ]+/g, "").toLowerCase()
    }

    static nameFirstBig(name) {
        // делает первую букву большой и убирает лишние символы (включая пробелы)
        name = name.replace(/[-`' ]+/g, "")
        return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase()
    }
 }