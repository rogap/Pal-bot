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
        name: 'champion', // st
        description: 'champion statistic',
        type: 1,
        options: [
            {
                name: 'nickname',
                description: 'nickname or id',
                type: 3
            },
            {
                name: 'support',
                description: 'select champions-support for statistic',
                type: 3,
                choices: supList
            },
            {
                name: 'frontline',
                description: 'select champions-frontline for statistic',
                type: 3,
                choices: frontList
            },
            {
                name: 'flank',
                description: 'select champions-flank for statistic',
                type: 3,
                choices: flankList
            },
            {
                name: 'damage',
                description: 'select champions-damage for statistic',
                type: 3,
                choices: dmgList
            }
        ]
    }
}