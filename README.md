# moodE
![https://github.com/LegoFigure11/moodE/actions](https://github.com/LegoFigure11/moodE/workflows/Node.js%20CI/badge.svg)

## About

moodE is a competitive Pokémon-focused chat bot for Discord, Pokemon Showdown, ~~and Twitch~~, written in nodejs. It is based on [JsKingBoo](https://github.com/JsKingBoo)'s [SableyeBot](https://github.com/JsKingBoo/SableyeBot3/), [DragonWhale](https://github.com/DragonWhale)'s [BattleSpotBot](https://github.com/DragonWhale/BattleSpotBot), and [sirDonovan](https://github.com/sirDonovan/)'s [Lanette](https://github.com/sirDonovan/Lanette) and [Cassius](https://github.com/sirDonovan/Cassius). It parses data from [pokemon-showdown](https://github.com/smogon/pokemon-showdown), and some of the commands use code from there.

## Installation

**Note:** All of the below steps assume you have [Node.js](https://nodejs.org/) v12.x or later installed on your computer!

1. Obtain a copy of moodE

*If you're reading this outside of GitHub, you've probably already done this!*

Click the green button on the top right of the page if you're viewing this in GitHub, and either "Open in Desktop" (recommended if you already have GitHub Desktop installed), or "Download ZIP" (pokemon-showdown databases will not auto update if you do this!).

Alternatively, you can clone it from the command line, if you have git installed:

    git clone https://github.com/LegoFigure11/moodE.git

2. Install dependencies

Open a command prompt/terminal and navigate to the folder where your copy of moodE is (replace `path/to/moodE` with the file path of your download):

     cd /path/to/moodE

From here, install the dependencies from `package.json` (you can ignore the warnings about discordjs requiring peer dependencies, you don't need those for this bot):

     npm install

(Append `--save-dev` to the end if you plan on developing/contributing to the bot.)

3. Set up config files

Currently, Discord and Pokemon Showdown are supported by this bot (Twitch is in the works!).

3a. The configuration file for discord is found in `/discord/config.json`, and you will need to create this file by copying `/discord/config-example.json` and renaming it to `config.json`. You will then need to edit this file to include your [bot token](https://www.writebots.com/discord-bot-token/), amongst other things.

| Field | Value | Description |
| -----:|:------|-------------|
| token | "string" | Bot access token, required to log in. |
| owner | "string" | Bot owner's discord User ID |
| commandCharacter | "string" | The character that the bot will use to recognise commands. |
| admin | ["array", "of", "strings"] | A list of discord User IDs that will have access to admin/development commands (eg eval, kill) in all servers the bot is in. |
| elevated | ["array", "of", "strings"] | A list of discord User IDs that will have access to certain restricted-access commands (eg addotherfc) in all servers the bot is in. |
| defaultGen | number (1-8) | The default generation to run Dex commands with, if none is specified. |
| successEmoji (optional) | "<:string:emojiID>" | Emoji that the bot will use as a success symbol in all servers. See `/assets/greentick.png` for an example. You can upload this image as an emoji to any server that the bot is in, as bot accounts have Nitro by default. |
| failureEmoji (optional) | "<:string:emojiID>" | Emoji that the bot will use as an error symbol in all servers. See `/assets/redcross.png` for an example. You can upload this image as an emoji to any server that the bot is in, as bot accounts have Nitro by default.|

Some additional configuration can be done in `/moode.js` and command-specific configuration can be done later (once the bot is running).

3b. The configuration file for Pokemon Showdown is found in `/showdown/config.json`, and you will need to create this file by copying `/showdown/config-example.json` and renaming it to `config.json`. You will then need to edit this file to contain your bot's login details, amongst other things.

| Field | Value | Description |
| -----:|:------|-------------|
| username | "string" | The username of the bot account. |
| password | "string" | The password of the bot account. |
| developers | ["array", "of", "strings"] | A list of the users who will have access to all commands. |
| tournaments | ["array", "of", "strings"] | A list of the rooms in which tournament parsing is enabled. |
| rooms | ["array", "of", "strings"] | A list of the rooms for the bot to join. |
| commandCharacter | "string" | The character that the bot will use to recognise commands. |
| allowMail | boolean | Toggles enabling mail commands. |
| server | "string" | Server for the bot to join (leave this out of your config file to connect to main). |

4. Starting up the bot

If you've done all of the above, you're ready to go! Simply run:

     node moode.js

and the bot should start.

5. Additional configuration

[To Be Completed]

---

## Credits

This bot builds upon the work of and wouldn't be possible without:

* Quinton Lee ([sirDonovan](https://github.com/sirDonovan/))
* [JsKingBoo](https://github.com/JsKingBoo)
* [DragonWhale](https://github.com/DragonWhale)
* [tmagicturtle](https://github.com/tmagicturtle/)
* Guangcong Luo ([Zarel](https://github.com/Zarel)) and [contributors](https://github.com/smogon/pokemon-showdown/graphs/contributors)

And, of course, my amazing [direct contributors](https://github.com/LegoFigure11/moodE/graphs/contributors)!

Additionally, I would like to thank the following people for their translation work (currently used in `/showdown/commands/chinese`):

* [bobochan](https://www.smogon.com/forums/members/271968/) and [others](https://pastebin.com/raw/WLHef9D7)

## License

This software is distributed under the MIT license. For more details, see the `LICENSE` file.
