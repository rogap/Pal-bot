# Pal-bot

Дискорд бот выдачи статистики по игре Paladins.

[Добавить](https://discordapp.com/oauth2/authorize?client_id=626327927050600448&permissions=2147534912&scope=bot%20applications.commands) бота на сервер.

Заходите на наш [Discord-сервер](https://discord.gg/C2phgzTxH9) - там всегда можно быстро узнать о предстоящих обновлениях, сообщить об ошибках или получить другую помощь/информацию.

Вы так же можете сами запустить бота следуя [Инструкции](#installation)

Подробную информацию о командах вы можете получить использовав команду `hh`, например: `!hh ss`

## Commands

* [help](#help)
* [me](#me)
* [menu](#menu)
* [setting](#setting)
* [search](#search)
* [stats](#stats)
* [history](#history)
* [last](#last)
* [current](#current)
* [champions](#champions)
* [champion](#champion)
* [deck](#deck)
* [friends](#friends)

### help

Отправляет список команд в ЛС

### me

Позволяет сохранить свой ник для подстановки его в команды автоматически

### menu

Вызывает главное меню с кнопками

### setting

Настройки

### search

Поиск игроков среди всех платформ

### stats

Статистика аккаунта

### progress

Сравнивает текущую статистику игрока с сохраненной.

### history

История матчей игрока

### last

Информация о последнем или конкретном матче

### current

Статус игркоа в игре

### champions

Топ чемпионов аккаунта

### champion

Статистика чемпиона

### deck

Колоды аккаунта

### friends

Друзья аккаунта

## installation

Установку стоит производить только если вы хотите получить своего собственного бота.
Вы можете пользоваться уже существующим ботом не производя установки.

* Клонируйте репозиторий и установите все зависимости
* Для корректной работы вам понадобится дополнительно установить `pm2` - `sudo npm install pm2@latest -g`
* А так же MongoDB - `sudo apt update` а затем `sudo apt install -y mongodb`
* Создайте пустую папку `logs` в корневой папке, если ее там нет
* Измените id создателя https://github.com/rogap/Pal-bot/blob/master/config/main.js#L103
* Создайте файл `.env` и запишите туда следующие настройки подставив вместе нулей свои значения:
```
DISCORDTOKEN=00000000000000000000000000000000000000000000000000000000000
STEAMKEY=0000000000000000000000000000000
DEVID=0000
AUTHKEY=0000000000000000000000000000000
DBNAME=admin
DBHOST=localhost
DBPORT=27017
```
* Когда бот будет уже запущен введите в чат команду `!con _local.utils.setSlashCommands()` для регистрации слеш команд глобально. Учтите что нужно будет сменить ID создателя в конфинге.
* Обновление данных о чемпионах и предметах делается командой: `!con _local.utils.updateChampionsAndItems()`,

## Original Authors

* [rogup](https://github.com/rogap)

## Contacts

* [Discord](https://discord.gg/C2phgzTxH9)
