"use strict";

module.exports = {
	desc: "Live reloads modules.",
	usage: "<area>, silent",
	aliases: ["reload", "rl"],
	developerOnly: true,
	async process(args, channel, user, self) {
		let silent;
		if (args[0]) silent = true;
		console.log(`${Tools.twitchText()}Hot-patching ${silent ? "(silently)".grey : ""}...`);
		console.log(`${Tools.twitchText()}--------------`);

		for (const plugin of TwitchPlugins) {
			if (typeof plugin.onEnd === "function") {
				console.log(`${Tools.twitchText()}Unloading ${plugin.name.cyan} module...`);
				plugin.onEnd();
			}
		}

		Tools.uncacheDir("twitch/");
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
				global[`twitch-${file.name}`] = file;
				if (typeof file.onLoad === "function") file.onLoad();
			}
			pluginsList.push(file);
		}

		global.TwitchPlugins = pluginsList;

		/*global.DiscordMessageParser = require("../../messageParser.js");
		global.discordMessageParser = new DiscordMessageParser();
		discordMessageParser.init(true);*/

		global.TwitchCommandHandler = require("../../commandHandler.js");
		global.twitchCommandHandler = new TwitchCommandHandler();
		twitchCommandHandler.init(true);

		if (!silent) {
			return user["message-type"] === "whisper" ? bot.whisper(user.username, "Hotpatch completed!") : bot.say(channel, "Hotpatch completed!");
		}
	},
};
