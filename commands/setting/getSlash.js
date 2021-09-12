/**
 * функция возвращающая обьект слеш-команды
 */


const _local = process._local


module.exports = () => {
    return {
        name: 'setting',
        description: 'your settings',
        options: [
            {
                name: 'for',
                description: 'setting for...',
                type: 3,
                required: true,
                choices: [
                    {
                        name: 'user',
                        value: 'user'
                    },
                    {
                        name: 'guild',
                        value: 'guild'
                    }
                ]
            },
            {
                name: 'lang',
                description: 'set lang',
                type: 3,
                choices: [
                    {
                        name: 'en',
                        value: 'en'
                    },
                    {
                        name: 'ru',
                        value: 'ru'
                    }
                ]
            },
            {
                name: 'timezone',
                description: 'set timezone',
                type: 3,
                choices: [
                    {
                        name: 'auto',
                        value: 'auto'
                    },
                    {
                        name: '0',
                        value: '0'
                    },
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
                    },
                    {
                        name: '7',
                        value: '7'
                    },
                    {
                        name: '8',
                        value: '8'
                    },
                    {
                        name: '9',
                        value: '9'
                    },
                    {
                        name: '10',
                        value: '10'
                    },
                    {
                        name: '11',
                        value: '11'
                    },
                    {
                        name: '12',
                        value: '12'
                    },
                    {
                        name: '13',
                        value: '13'
                    },
                    {
                        name: '14',
                        value: '14'
                    },
                    {
                        name: '15',
                        value: '15'
                    },
                    {
                        name: '16',
                        value: '16'
                    },
                    {
                        name: '17',
                        value: '17'
                    },
                    {
                        name: '18',
                        value: '18'
                    },
                    {
                        name: '19',
                        value: '19'
                    },
                    {
                        name: '20',
                        value: '20'
                    },
                    {
                        name: '21',
                        value: '21'
                    },
                    {
                        name: '22',
                        value: '22'
                    },
                    {
                        name: '23',
                        value: '23'
                    }
                ]
            }
        ]
    }
}