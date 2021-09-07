# Pal-bot

[RU README](https://github.com/rogap/Pal-bot/blob/master/README_RU.md)

Discord bot for issuing statistics on the Paladins game.

[Add](https://discordapp.com/oauth2/authorize?client_id=626327927050600448&permissions=2147534912&scope=bot%20applications.commands) to Discord server.

Visit our [Discord server](https://discord.gg/C2phgzTxH9) - there you can always quickly find out about upcoming updates, report bugs or get other help/information.

You can also run the bot yourself by following the [Instructions](#installation)

You can get detailed information about the commands by using the command `hh`, example: `!hh ss`

## Commands

* [hh](#hh)
* [me](#me)
* [pal](#pal)
* [set](#set)
* [se](#se)
* [ss](#ss)
* [sh](#sh)
* [sm](#sm)
* [sp](#sp)
* [st](#st)
* [sc](#sc)
* [sl](#sl)
* [sf](#sc)

### hh

Sends a list of commands to the DM

### me

Allows you to save your nickname for substituting it into teams automatically

### pal

Opens the main menu with the buttons

### set

Settings

### se

Search for players among all platforms

### ss

Account statistics

### sh

Player's Match History

### sm

Information about the last or specific match

### sp

Player status in the game

### st

Top Account Champions

### sc

Championship statistics

### sl

Account Decks

### sf

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

## Original Authors

* [rogup](https://github.com/rogap)

## Contacts

* [Discord](https://discord.gg/C2phgzTxH9)