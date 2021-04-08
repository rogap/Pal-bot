/**
 * основной файл-скрипт для загрузки всех в этой папке:
 * загружает все картинки, шрифты, данные с сайта
 */


const { registerFont } = require("canvas")
const path = require('path')
const pathToFont = path.join(__dirname, '..', 'font', 'GothamSSm-Bold.otf')
registerFont(pathToFont, { family: 'GothamSSm_Bold' }) // регистрируем шрифт


module.exports = new Promise((resolve, reject) => {
    Promise.all([ // что если через fs все скрипты получить
        require('./avatars.js'),
        require('./backgrounds.js'),
        require('./cardFrames.js'),
        require('./champions.js'),
        // require('./commands.js'),
        require('./dataFromSite.js'),
        require('./divisions.js'),
        require('./items.js'),
        require('./legends.js'),
        require('./maps.js')
    ])
    .then(() => {
        // когда загружены все данные чемпионов то можно создать их класс
        return resolve({status: true})
    })
    .catch(err => { // есть ли смысл в catch если тут делается просто проброс?
        return reject(err)
    })
})


/*[{ // champion
    id,
    Cons,
    Lore,
    Name,
    Pros,
    Type,
    Roles,
    Speed,
    Title,
    Health,
    ret_msg,
    Ability1,
    Ability2,
    Ability3,
    Ability4,
    Ability5,
    Pantheon,
    Ability_1: {
        Id,
        URL,
        Summary,
        damageType,
        Description,
        rechargeSeconds
    },
    Ability_2: {
        Id,
        URL,
        Summary,
        damageType,
        Description,
        rechargeSeconds
    },
    Ability_3: {
        Id,
        URL,
        Summary,
        damageType,
        Description,
        rechargeSeconds
    },
    Ability_4: {
        Id,
        URL,
        Summary,
        damageType,
        Description,
        rechargeSeconds
    },
    Ability_5: {
        Id,
        URL,
        Summary,
        damageType,
        Description,
        rechargeSeconds
    },
    AbilityId1,
    AbilityId2,
    AbilityId3,
    AbilityId4,
    AbilityId5,
    Name_English,
    OnFreeRotation,
    latestChampion,
    ChampionCard_URL,
    ChampionIcon_URL,
    abilityDescription1,
    abilityDescription2,
    abilityDescription3,
    abilityDescription4,
    abilityDescription5,
    ChampionAbility1_URL,
    ChampionAbility2_URL,
    ChampionAbility3_URL,
    ChampionAbility4_URL,
    ChampionAbility5_URL,
    OnFreeWeeklyRotation,
    Cards: [ // список всех карт
        {
            rank,
            rarity,
            ret_msg,
            card_id1,
            card_id2,
            card_name,
            exclusive,
            champion_id,
            champion_name,
            active_flag_lti,
            card_description,
            championCard_URL,
            championIcon_URL,
            recharge_seconds,
            card_name_english,
            championTalent_URL,
            active_flag_activation_schedule,
            imgData
        }
    ],
    imgData
}]
*/

class CardsManager {
    #cards

    constructor() {}

    get legendary() {
        // возвращает легендарные карты
    }

    get common() {
        // возвращает обычные карты
    }
}

class Card {
    #data

    constructor(card) {
        this.#data = card
    }

    get championId() {}

    get championName() {}

    get img() {}
}