# Pal-bot

Бот выдачи статистики по игре Paladins и...

## Comands

PR| Команда    | Описание
--|------------|-----------
! |hh          | Выводит список команд
! |инфо        | Выводит способ связи с создателем
! |всего       | Выводит информацию о том на скольки серверах находится бот и сколько всего пользователей на них
! |онлайн      | Выводит информацию об онлайне на текущем сервере, а так же "кто во что играет"
! |me          | Если передан параметр `name` (`!me mutu`), то этот никнейм сохраняется для вас и будет использован по дефолту при вызове других команд. То есть можно будет не указывать никнейм после команды. Например `!ss` подставит сохраненный никнейм, анологично `!ss mutu`. Если команда вызвана без аргументов (`!me`), то выводит сохраненный никнейм. **Внимание!** для guru лучше указывать ник вместе с id профиля, например `!me 3368378-Mutu`
! |ss          | Выводит компактную статистику с playpaladins
! |sh          | Выводит историю матчей с playpaladins
! |sg          | Выводит компактную статистику с guru
! |sf          | Выводит полную статистику с guru
! |sr          | Выводит статистику ранкеда с guru
! |аватар      | Выводит ссылку на аватар указанного пользователя. Можно указывать как упоминание, как никнейм с тегом, как id пользователя. Пример: `!аватар 626327927050600448`, `!аватар @Pal-bot#9412 ` (можно и без `@`). Выводит аватар только тех кто есть на сервере!
! |вики        | Осуществляет поиск по русской википедии и возвращает первый результат (кирилица)
! |viki        | Осуществляет поиск по английской википедии и возвращает первый результат (латиница)
! |смс         | Отправляет сообщение в вк на указанный id, Пример: `!смс 519849434 test`. Работает только с id!
! |переписка   | Выводит последние 10 сообщений из вк (бота). Не отображает медиа (фото, видео, голосовые, стикеры и т.д.)

## Original Authors

  - Владислав Алексеев ([rogup](https://github.com/rogap))

## Contacts

  - [Discord](https://discord.gg/RG9WQtP)

## License

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
