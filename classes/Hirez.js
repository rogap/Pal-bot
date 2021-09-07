/**
 * классы
 */


const moment = require("moment")
const md5 = require("md5")
const randomUseragent = require('random-useragent')

const _local = process._local
const {config, utils, models} = _local
const {sendSite} = utils

// https://docs.google.com/document/d/1OFS-3ocSx-1Rvg4afAnEHlT3917MAK_6eJTR6rzr-BM/edit#


module.exports = class Hirez {
	#id; #key;
	constructor(id, key) {
		this.#id = id
		this.#key = key
        this.url = 'https://api.paladins.com/paladinsapi.svc/'

        // записываем загружаемые данные
        this.session = _local.session
        this.timeStartSession = _local.session.timestamp || 0
	}

    // создает новую сессию
	async createSession() {
        try {
            console.log('\n !!! создаем сессию\n')
            const timestamp = moment().utc().format("YYYYMMDDHHmmss")
            const signature = md5( this.#id + "createsession" + this.#key + timestamp )
            const urlCreateSession = `${this.url}createsessionJson/${this.#id}/${signature}/${timestamp}`
            const response = await sendSite({
                url: urlCreateSession,
                json: true,
                method: 'GET',
                headers: {
                    'User-Agent': randomUseragent.getRandom(),
                    'Content-Type': 'application/json',
                    'X-Powered-By': 'bacon',
                    'Connection': 'keep-alive',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/jpg,*/*;q=0.8'
                }
            })

            const timestampUpdate = +timestamp.updateToDate()
            const body =  response.body
            // console.log(body)
            const ret_msg = body.ret_msg
            if (ret_msg !== "Approved") return reject(ret_msg)

            const session = {
                _id: this.session._id,
                id: body.session_id,
                timestamp: timestampUpdate
            }
            // console.log(session)
            this.session = session
            // console.log(this.session)
            // console.log('end', timestampUpdate)
            this.timeStartSession = timestampUpdate

            const saveSession = await this.saveSession()
            if (!saveSession.status) {
                // можно сообщить на канале что не удалось сохранить сессию
                console.log(saveSession)
                console.log(' - НЕ УДАЛОСЬ СОХРАНИТЬ СЕССИЮ')
            }

            return {
                data: session,
                status: true
            }
        } catch(err) {
            return {
                err,
                err_msg: {
                    ru: 'Ошибка создания сессии.',
                    en: 'Error creating the session.'
                },
                log_msg: 'hi-rez api.createSession',
                status: false
            }
        }
	}

    // првоеряет сессию по времени
	async testSession() { // проверяет валидность сессии, если не валидна то создает новую
        try {
            const newdate = new Date().utc()
			const checkTime = newdate - 840000 < this.timeStartSession // 900000
			console.log(`Минут с последнего теста сессии: ${(newdate - this.timeStartSession) / 60000}`)
			if (checkTime) return {status: true, data: this.session}
			// console.log("время вышло, мы проверим валидность сессии и если она 'не катит' то создадим новую")

            console.log('Сессия не прошла тест - создаем')
			const cheateSession = await this.createSession()
            if (!cheateSession.status) throw cheateSession.err

			// this.session = cheateSession.data // уже было записано при создании
            return {
                data: cheateSession.data,
                status: true
            }
        } catch(err) {
            return {
                err,
                err_msg: {
                    ru: 'Ошибка при тестировании сессии.',
                    en: 'Error when testing the session.'
                },
                log_msg: 'hi-rez api.testSession',
                status: false
            }
        }
	}

    // выполняет запрос статистики к хайрезам
	async ex(format, ...params) {
		console.log(`ex: ${format}`, params)
        try {
			if (!format) return {status: false, err: 'Не указан формат'}

            // сделать проверку параметров всех! (не должны содержать запрещенные символы)

            const checkSession = await this.testSession()
            if (!checkSession.status) throw checkSession

            const timestamp = moment().utc().format("YYYYMMDDHHmmss")
            const signature = md5( this.#id + format + this.#key + timestamp )
            const strParams = params.length > 0 ? `/${params.join("/")}` : ''
            const url = `${this.url}${format}Json/${this.#id}/${signature}/${this.session.id}/${timestamp}${strParams}`

            const response = await sendSite({url, json:true})
            const body = response.body
            // console.log(body)

            if (body.constructor === String) return {
                status: false,
                err: body,
                err_msg: {
                    ru: 'Ошибка запроса.',
                    en: 'Request error.'
                }
            }

            // если пустые данные
            if (body.constructor === Array && !body.length) return {
                status: true,
                data: body
            }

            // если сессия устарела то получаем новую
            if (body[0].ret_msg == 'Invalid session id.') {
                console.log('\n !!! сессия устарела\n')
                this.timeStartSession = 0
                return await this.ex(format, ...params)
            }

            this.timeStartSession = +new Date().utc()
            this.session.timestamp = +timestamp.updateToDate()

            // сохраняем сессию в файл (изменяем)
            const saveSession = await this.saveSession()
            if (!saveSession.status) {
                // можно сообщить на канале что не удалось сохранить сессию
                console.log(saveSession)
                console.log(' - НЕ УДАЛОСЬ СОХРАНИТЬ СЕССИЮ')
            }

            return {
                data: body,
                lastUpdate: +timestamp.updateToDate(),
                status: true
            }
        } catch(err) {
            return {
                err,
                err_msg: {
                    ru: 'Ошибка получения данных.',
                    en: 'Error receiving data.'
                },
                log_msg: 'hi-rez api.ex',
                status: false
            }
        }
	}

    // записывает сессию в БД
    async saveSession() {
        console.log('saveSession (DB)')
        try {
            const model = models.session
            const _id = this.session._id
            if (_id) {
                // update
                await model.findByIdAndUpdate(_id, this.session)
            } else {
                // save
                await (await new model(this.session)).save()
            }

            return {status: true, data: this.session}
        } catch(err) {
            return {
                err,
                err_msg: {
                    ru: 'Не удалось сохранить сессию в БД.',
                    en: 'The session could not be saved.'
                },
                log_msg: 'hi-rez api.saveSession',
                status: false
            }
        }
    }
}