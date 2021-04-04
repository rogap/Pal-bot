/**
 * Скрипт который только рисует указанную инфу в canvas и возвращает ее или ошибку
 */


const _local = process._local
const { config, translate, utils } = _local
const { formHiRezFunc, sendSite, checkSelectPlayer, getChampion, sendError, sendLog, fixNaN, parseExp } = utils
const { createCanvas } = require('canvas')
const { red, white, blue, black, purple, orange, green, yellow } = config.colors


/**
 * 
 * @param {String} lang - 
 * @param {*} timezone - 
 * @param {Array} backgrounds - 
 * @param {Object} player - 
 * @param {Array} champions - 
 */
module.exports = function({lang, timezone, backgrounds, player, champions}) {
    // функция должна тупо рисовать, не проверяя есть ли какие там значения (ну разве что те которых может не быть - по типу аватарки или титула)
    // так то player тоже Array, но мы будем выбирать сами ведь он должен быть 1 или 0 (был как-то баг где возвращало несколько)
    // какие данные нужны для рисования?
    // какая очередность рисования?

    /**
     * для рисования нужны параметры:
     * _prop (lang, timezone, backgrounds)
     */
}