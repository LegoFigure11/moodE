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

		for (const plugin of DiscordPlugins) {
			if (typeof plugin.onEnd === "function") {
				console.log(`${Tools.discordText()}Unloading ${plugin.name.cyan} module...`);
				plugin.onEnd();
			}
		}

		Tools.uncacheDir("discord/");
		Tools.uncacheDir("sources/");

		global.Storage = require("../../../sources/storage.js");
		Storage.importDatabases();
		global.Tools = require("../../../sources/tools.js");

		// From https://github.com/sirDonovan/Cassius/blob/master/app.js#L46
		let pluginsList;
		const plugins = fs.readdirSync(path.resolve(`${__dirname}/../../plugins`));
		for (let i = 0, len = plugins.length; i < len; i++) {
			const fileName = plugins[i];
			if (!fileName.endsWith(".js")) continue;
			if (!pluginsList) pluginsList = [];
			const file = require(`../../plugins/${fileName}`);
			if (file.name && !file.disabled) {
				global[file.name] = file;
				if (typeof file.onLoad === "function") file.onLoad();
			}
			pluginsList.push(file);
		}

		global.DiscordPlugins = pluginsList;

		global.DiscordEditRules = require("../../editRules.js");
		global.discordEditRules = new DiscordEditRules();
		await discordEditRules.init(true);

		global.DiscordMessageParser = require("../../messageParser.js");
		global.discordMessageParser = new DiscordMessageParser();
		discordMessageParser.init(true);

		global.DiscordCommandHandler = require("../../commandHandler.js");
		global.discordCommandHandler = new DiscordCommandHandler();
		discordCommandHandler.init(true);

		global.DiscordReactionHandler = require("../../reactionHandler.js");
		global.discordReactionHandler = new DiscordReactionHandler();
		await discordReactionHandler.init(true);

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
