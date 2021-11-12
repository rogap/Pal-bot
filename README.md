# Pal-bot

[RU README](https://github.com/rogap/Pal-bot/blob/master/README_RU.md)

Discord bot for issuing statistics on the Paladins game.

[Add](https://discordapp.com/oauth2/authorize?client_id=626327927050600448&permissions=2147534912&scope=bot%20applications.commands) to Discord server.

Visit our [Discord server](https://discord.gg/C2phgzTxH9) - there you can always quickly find out about upcoming updates, report bugs or get other help/information.

You can also run the bot yourself by following the [Instructions](#installation)

You can get detailed information about the commands by using the command `hh`, example: `!hh ss`

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

Sends a list of commands to the DM

### me

Allows you to save your nickname for substituting it into teams automatically

### menu

Opens the main menu with the buttons

### setting

Settings

### search

Search for players among all platforms

### stats

Account statistics

### history

Player's Match History

### last

Information about the last or specific match

### current

Player status in the game

### champions

Top Account Champions

### champion

Championship statistics

### deck

Account Decks

### friends

Friends of the account

## installation

* Clone the repository and install all the dependencies
* For correct operation, you will need to additionally install `pm2` - `sudo npm install pm2@latest -g`
* And also MongoDB - `sudo apt update` and then `sudo apt install -y mongodb`
* Create an empty `logs` folder in the root folder, if it is not there
* Create a file `.env` and write the following settings there, substituting their values together with zeros:
```
DISCORDTOKEN=00000000000000000000000000000000000000000000000000000000000
STEAMKEY=0000000000000000000000000000000
DEVID=0000
AUTHKEY=0000000000000000000000000000000
DBNAME=admin
DBHOST=localhost
DBPORT=27017
```
* When the bot is already running, enter the command in the chat `!con _local.utils.setSlashCommands()` to register slash commands globally. Please note that you will need to change the creator's ID in the config.
* Updating data about champions and items is done by the team: `!con _local.utils.updateChampionsAndItems()`,

## Original Authors

* [rogup](https://github.com/rogap)

## Contacts

* [Discord](https://discord.gg/C2phgzTxH9)