"use strict";

module.exports = {
	desc: "Live reloads modules.",
	usage: "<area>, silent",
	aliases: ["reload", "rl"],
	adminOnly: true,
	async process(message, args) {
		let silent;
		if (args[0]) silent = true;
		console.log(`${Tools.discordText()}Hot-patching ${silent ? "(silently)".grey : ""}...`);
		console.log(`${Tools.discordText()}--------------`);
		Tools.uncacheDir("discord/");
		Tools.uncacheDir("sources/");

		global.Storage = require("../../../sources/storage.js");
		Storage.importDatabases();
		global.Tools = require("../../../sources/tools.js");

		global.DiscordMessageParser = require("../../messageParser.js");
		global.discordMessageParser = new DiscordMessageParser();
		discordMessageParser.init(true);

		global.DiscordCommandHandler = require("../../commandHandler.js");
		global.discordCommandHandler = new DiscordCommandHandler();
		discordCommandHandler.init(true);

		if (!silent) {
			return message.channel.send("Hotpatch completed!");
		} else {
			try {
				return message.delete();
			} catch (e) {
				return console.log(e);
			}
		}
	},
};
