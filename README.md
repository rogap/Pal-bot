# Pal-bot

Бот выдачи статистики по игре Paladins.

[Веб-страница](https://webmyself.ru/pal-bot/) бота. 
[Добавить](https://discordapp.com/oauth2/authorize?client_id=626327927050600448&permissions=247872&scope=bot) бота на сервер.

Заходите на наш [Discord-сервер](https://discord.gg/RG9WQtP) - там всегда можно быстро узнать о предстоящих обновлениях, сообщить об ошибках или получить другую помощь/информацию.

## Commands

* [!hh](#hh)
* [!palbot](#palbot)
* [!online](#online)
* [!me](#me)
* [!ss](#ss)
* [!sh](#sh)
* [!sl](#sl)
* [!sm](#sm)
* [!sp](#sp)
* [!sc](#sc)
* [!st](#st)

## Descriptions

### !hh

`!hh [Команда]` - Выводит список команд или подробности команды, если она указана. Пример: `!hh !me`.

### !palbot

Отправляет в ЛС ссылку на сервер бота. Можно **!pal-bot**, **!palbot**.

### !online

Выводит кол-во игроков онлайн в игре (данные Steam). Можно **!online**, **!онлайн**.

### !me

`!me [Ник]` - Сохраняет ваш никнейм для автоматической подстановки его в другие команды. Пример: `!me mutu`. Выгода: `!ss`. Можно не писать свой ник в команды, можно так же: `!ss me`. Сохранение ника позволяет другим игрокам узнать ваш ник, например: `!ss @Pal-bot#9412` проверит есть ли сохраненный никнейм у этого пользователя и если он есть то выдаст результат подставив этот никнейм. Можно использовать и id пользователя дискорда вместо упоминаний, например: `!ss 510112915907543042`. Если написать команду `!me` без аргументов, то она выведет ваш сохраненный никнейм.

### !ss

`!ss [Ник]` - Выводит общую статистику аккаунта. Параметры: `ник игрока`.

### !sh

`!sh [Ник, страница]` - Выводит последние 10 матчей указанного игрока. Параметры: `ник игрока`.

### !sl

`!sl [Ник, имя чемпиона, номер колоды]` - Выводит колоды игрока указанного чемпиона. Параметры: `ник игрока`, `имя чемпиона`, `номер колоды`. Номер колоды можно не указывать, если у него одна колода или если вы хотите увидеть список колод. Пример: `!sl mutu androxus 1` - покажет колоду, если она есть. `!sl mutu androxus` - покажет список колод, либо колоду если она одна.

### !sm

`!sm [id или Ник, Порядок матча, если указан ник]` - Выводит подробности матча по id матча или по нику игрока. Параметры: `id матча ИЛИ ник игрока`, `если указан ник то можно указать номер матча 1-20`. Пример: `!sm mutu` - выведет последний матч. `!sm mutu 2` - выведет предпоследний матч. `!sm 912107733` - покажет указанный матч. Помните что можно комбинировать с __!me__, например: `!sm me 2` или `!sm @Pal-bot#9412`.

### !sp

`!sp [Ник]` - Проверяет онлайн статус игрока и выводит матч, если он в матче. В матче показывается уровень персонажей, аккаунтов и ранги игроков. Параметры: `ник игрока`.

### !sc

`!sc [Ник, Чемпион]` - Выводит статистику указанного чемпиона. Параметры: `ник игрока`, `имя чемпиона`. Пример: `!sc mutu androxus`.

### !st

`!st [Ник, Тип сортировки]` - Выводит топ чемпионов с возможностью сортировки (lvl, winrate, time, kda). Можно **!st**, **!топ**.

## Original Authors

* Владислав Алексеев ([rogup](https://github.com/rogap))

## Contacts

* [Discord](https://discord.gg/RG9WQtP)

## License

### Pal-bot

(The MIT License)

Copyright (c) 2019 rogap

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### node-canvas

See [license](https://github.com/Automattic/node-canvas/blob/master/Readme.md#license)
