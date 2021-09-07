/**
 * классы
 */


const _local = process._local
const {config, models} = _local

// https://docs.google.com/document/d/1OFS-3ocSx-1Rvg4afAnEHlT3917MAK_6eJTR6rzr-BM/edit#


// основные функции для запросы статы у хайрезов (главные, движ)
module.exports = class API {
    #api;
    constructor(devId, authKey) {
        // const api = this.#api = new Hirez(devId, authKey)
        // this.ex = api.ex.bind(api)
        this.#api = new _local.classes.Hirez(devId, authKey)
    }

    // лимиты обновлений функций
    static limits = config.timeLimit

    async getchampions(lang=1) {
        const model = models.getchampions
        const data = await model.find({lang})

        if (data.length > 1) console.log('КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ ЧЕМПИОНОВ (getchampions)')
        const getchampions = data[0]
        if (getchampions) getchampions.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getchampions && getchampions.lastUpdate.checkTime('getchampions')) return getchampions

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getchampions', lang)
        if (!newData.status) throw newData

        // если getchampions был, то обновим данные, если нет, то сохраним
        if (getchampions) {
            await model.findByIdAndUpdate(getchampions._id, {
                data: newData.data,
                lastUpdate: newData.lastUpdate,
                // lang // язык обновлять не нужно
            })
        } else {
            const save = await new model({
                data: newData.data,
                lastUpdate: newData.lastUpdate,
                lang
            })
            await save.save()
        }

        return newData
    }

    async getitems(lang=1) {
        const model = models.getitems
        const data = await model.find({lang})

        if (data.length > 1) console.log('КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ ЧЕМПИОНОВ (getitems)')
        const getitems = data[0]
        if (getitems) getitems.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getitems && getitems.lastUpdate.checkTime('getitems')) return getitems

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getitems', lang)
        if (!newData.status) throw newData

        // если getitems был, то обновим данные, если нет, то сохраним
        if (getitems) {
            await model.findByIdAndUpdate(getitems._id, {
                data: newData.data,
                lastUpdate: newData.lastUpdate,
                // lang // язык обновлять не нужно
            })
        } else {
            const save = await new model({
                data: newData.data,
                lastUpdate: newData.lastUpdate,
                lang
            })
            await save.save()
        }

        return newData
    }

    async searchplayers(name) {
        const model = models.searchplayers
        const data = await model.find({name})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (searchplayers) ${name}`)
        const searchplayers = data[0]
        if (searchplayers) searchplayers.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (searchplayers && searchplayers.lastUpdate.checkTime('searchplayers')) return searchplayers

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('searchplayers', name)
        if (!newData.status) throw newData

        if (!newData?.data[0]) {
            if (searchplayers) {
                return {
                    data: searchplayers.data,
                    lastUpdate: searchplayers.lastUpdate,
                    name: searchplayers.name,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если searchplayers был, то обновим данные, если нет, то сохраним
        const saveObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate,
            name
        }
        if (searchplayers) {
            await model.findByIdAndUpdate(searchplayers._id, saveObj)
        } else {
            const save = await new model(saveObj)
            await save.save()
        }

        return newData
    }
    
    async getplayer(nameOrId) {
        const model = models.getplayer
        const isID = isFinite(nameOrId)
        const findObj = {}
        const typeValue = isID ? 'id' : 'name'
        findObj[typeValue] = isID ? nameOrId : {$regex: new RegExp(nameOrId, 'i')} // lovercase
        const data = await model.find(findObj)

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getplayer) ${nameOrId}`)
        const getplayer = data[0]
        if (getplayer) getplayer.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getplayer?.lastUpdate.checkTime('getplayer')) return getplayer

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getplayer', nameOrId)
        if (!newData.status) throw newData

        if (!newData?.data[0]?.Id) {
            if (getplayer) {
                return {
                    data: getplayer.data,
                    lastUpdate: getplayer.lastUpdate,
                    name: getplayer.name,
                    id: getplayer.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getplayer был, то обновим данные, если нет, то сохраним
        const updateObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate
        }
        const name = updateObj.data[0].hz_player_name || updateObj.data[0].hz_gamer_tag || (typeValue == 'name' ? nameOrId : null)
        const id = updateObj.data[0].Id || (typeValue == 'id' ? nameOrId : null)
        if (name) updateObj.name = name
        if (id) updateObj.id = id

        if (getplayer) {
            await model.findByIdAndUpdate(getplayer._id, updateObj)
        } else {
            const save = await new model(updateObj)
            await save.save()
        }

        return newData
    }

    // getplayeridbyportaluserid

    // getplayeridinfoforxboxandswitch
    
    async getchampionranks(id) {
        const model = models.getchampionranks
        const data = await model.find({id})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getchampionranks) ${id}`)
        const getchampionranks = data[0]
        if (getchampionranks) getchampionranks.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getchampionranks && getchampionranks.lastUpdate.checkTime('getchampionranks')) return getchampionranks

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getchampionranks', id)
        if (!newData.status) throw newData

        if (!newData?.data[0]) {
            if (getchampionranks) {
                return {
                    data: getchampionranks.data,
                    lastUpdate: getchampionranks.lastUpdate,
                    name: getchampionranks.name,
                    id: getchampionranks.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getchampionranks был, то обновим данные, если нет, то сохраним
        const saveObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate,
            id
        }
        if (getchampionranks) {
            await model.findByIdAndUpdate(getchampionranks._id, saveObj)
        } else {
            const save = await new model(saveObj)
            await save.save()
        }

        return newData
    }

    async getplayerloadouts(id, langSearch=1) {
        const model = models.getplayerloadouts
        const data = await model.find({id})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getplayerloadouts) ${id}`)
        const getplayerloadouts = data[0]
        if (getplayerloadouts) getplayerloadouts.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getplayerloadouts && getplayerloadouts.lastUpdate.checkTime('getplayerloadouts')) return getplayerloadouts

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getplayerloadouts', id, langSearch)
        if (!newData.status) throw newData

        if (!newData?.data[0] || !newData?.data[0]?.ChampionName) {
            if (getplayerloadouts) {
                return {
                    data: getplayerloadouts.data,
                    lastUpdate: getplayerloadouts.lastUpdate,
                    name: getplayerloadouts.name,
                    id: getplayerloadouts.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getplayerloadouts был, то обновим данные, если нет, то сохраним
        const saveObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate,
            id
        }
        if (getplayerloadouts) {
            await model.findByIdAndUpdate(getplayerloadouts._id, saveObj)
        } else {
            const save = await new model(saveObj)
            await save.save()
        }

        return newData
    }

    async getplayerstatus(playerId) {
        const model = models.getplayerstatus
        const data = await model.find({id: playerId})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getplayerstatus) ${playerId}`)
        const getplayerstatus = data[0]
        if (getplayerstatus) getplayerstatus.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getplayerstatus?.lastUpdate.checkTime('getplayerstatus')) return getplayerstatus

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getplayerstatus', playerId)
        if (!newData.status) throw newData

        if (!newData?.data[0]) {
            if (getplayerstatus) {
                return {
                    data: getplayerstatus.data,
                    lastUpdate: getplayerstatus.lastUpdate,
                    name: getplayerstatus.name,
                    id: getplayerstatus.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getplayerstatus был, то обновим данные, если нет, то сохраним
        const updateObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate
        }

        if (getplayerstatus) {
            await model.findByIdAndUpdate(getplayerstatus._id, updateObj)
        } else {
            updateObj.id = playerId
            const save = await new model(updateObj)
            await save.save()
        }

        return newData
    }

    async getmatchplayerdetails(id) {
        const model = models.getmatchplayerdetails
        const data = await model.find({id})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getmatchplayerdetails) ${id}`)
        const getmatchplayerdetails = data[0]
        if (getmatchplayerdetails) getmatchplayerdetails.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getmatchplayerdetails && getmatchplayerdetails.lastUpdate.checkTime('getmatchplayerdetails')) return getmatchplayerdetails

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getmatchplayerdetails', id)
        if (!newData.status) throw newData

        if (!newData?.data[0]) {
            if (getmatchplayerdetails) {
                return {
                    data: getmatchplayerdetails.data,
                    lastUpdate: getmatchplayerdetails.lastUpdate,
                    name: getmatchplayerdetails.name,
                    id: getmatchplayerdetails.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getmatchplayerdetails был, то обновим данные, если нет, то сохраним
        const saveObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate,
            id
        }
        if (getmatchplayerdetails) {
            await model.findByIdAndUpdate(getmatchplayerdetails._id, saveObj)
        } else {
            const save = await new model(saveObj)
            await save.save()
        }

        return newData
    }

    async getmatchhistory(id) {
        const model = models.getmatchhistory
        const data = await model.find({id})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getmatchhistory) ${id}`)
        const getmatchhistory = data[0]
        if (getmatchhistory) getmatchhistory.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getmatchhistory && getmatchhistory.lastUpdate.checkTime('getmatchhistory')) return getmatchhistory

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getmatchhistory', id)
        if (!newData.status) throw newData

        if (!newData?.data[0] || newData?.data[0]?.ret_msg) {
            if (getmatchhistory) {
                return {
                    data: getmatchhistory.data,
                    lastUpdate: getmatchhistory.lastUpdate,
                    name: getmatchhistory.name,
                    id: getmatchhistory.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getmatchhistory был, то обновим данные, если нет, то сохраним
        const saveObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate,
            id
        }
        if (getmatchhistory) {
            await model.findByIdAndUpdate(getmatchhistory._id, saveObj)
        } else {
            const save = await new model(saveObj)
            await save.save()
        }

        return newData
    }

    async getmatchdetails(id) {
        const model = models.getmatchdetails
        const data = await model.find({id})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getmatchdetails) ${id}`)
        const getmatchdetails = data[0]
        if (getmatchdetails) getmatchdetails.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getmatchdetails && getmatchdetails.lastUpdate.checkTime('getmatchdetails')) return getmatchdetails

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getmatchdetails', id)
        if (!newData.status) throw newData

        if (!newData?.data[0]) {
            if (getmatchdetails) {
                return {
                    data: getmatchdetails.data,
                    lastUpdate: getmatchdetails.lastUpdate,
                    name: getmatchdetails.name,
                    id: getmatchdetails.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getmatchdetails был, то обновим данные, если нет, то сохраним
        const saveObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate,
            id
        }
        if (getmatchdetails) {
            await model.findByIdAndUpdate(getmatchdetails._id, saveObj)
        } else {
            const save = await new model(saveObj)
            await save.save()
        }

        return newData
    }

    async getfriends(id) {
        const model = models.getfriends
        const data = await model.find({id})

        if (data.length > 1) console.log(`КАКОГОТО ХРЕНА БОЛЕЕ 1 СТАТЫ (getfriends) ${id}`)
        const getfriends = data[0]
        if (getfriends) getfriends.status = true

        // если есть данные то проверим их корректность по времени и если норм от вернем их
        if (getfriends && getfriends.lastUpdate.checkTime('getfriends')) return getfriends

        // если данных нет то запросим у хайрезов
        const newData = await this.#api.ex('getfriends', id)
        if (!newData.status) throw newData

        if (!newData?.data[0]) {
            if (getfriends) {
                return {
                    data: getfriends.data,
                    lastUpdate: getfriends.lastUpdate,
                    name: getfriends.name,
                    id: getfriends.id,
                    status: true,
                    old: true
                }
            }
            return newData // если аккаунт скрыт то просто возвращаем данные не записывая в БД
        }

        // если getfriends был, то обновим данные, если нет, то сохраним
        const saveObj = {
            data: newData.data,
            lastUpdate: newData.lastUpdate,
            id
        }
        if (getfriends) {
            await model.findByIdAndUpdate(getfriends._id, saveObj)
        } else {
            const save = await new model(saveObj)
            await save.save()
        }

        return newData
    }

    // async getdataused() {}
}