/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    const {champions} = _local
    const {supports, frontlines, damages, flanks} = champions.championsByRole

    const supList = supports.map(ch => ({name: ch.name.en, value: ch.name.en}))
    const frontList = frontlines.map(ch => ({name: ch.name.en, value: ch.name.en}))
    const dmgList = damages.map(ch => ({name: ch.name.en, value: ch.name.en}))
    const flankList = flanks.map(ch => ({name: ch.name.en, value: ch.name.en}))

    return {
        name: 'lodouts',
        description: 'show the decks of champions',
        type: 1,
        options: [
            {
                name: 'nickname',
                description: 'nickname or id',
                type: 3
            },
            {
                name: 'number',
                description: 'number of decks',
                type: 3,
                choices: [
                    {
                        name: '1',
                        value: '1'
                    },
                    {
                        name: '2',
                        value: '2'
                    },
                    {
                        name: '3',
                        value: '3'
                    },
                    {
                        name: '4',
                        value: '4'
                    },
                    {
                        name: '5',
                        value: '5'
                    },
                    {
                        name: '6',
                        value: '6'
                    }
                ]
            },
            {
                name: 'support',
                description: 'select champions-support for decks',
                type: 3,
                choices: supList
            },
            {
                name: 'frontline',
                description: 'select champions-frontline for decks',
                type: 3,
                choices: frontList
            },
            {
                name: 'flank',
                description: 'select champions-flank for decks',
                type: 3,
                choices: flankList
            },
            {
                name: 'damage',
                description: 'select champions-damage for decks',
                type: 3,
                choices: dmgList
            }
        ]
    }
}