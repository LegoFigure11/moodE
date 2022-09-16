"use strict";

let listen = false;

bot.on("connecting", (async (address, port) => {
	console.log(`${Tools.twitchText()}Connecting to ${`${address}:${port}`.cyan}`);
}));

bot.on("logon", (async () => {
	console.log(`${Tools.twitchText()}Logging in...`);
}));

bot.on("connected", (async (address, port) => {
	console.log(`${Tools.twitchText()}Logged in and connected!`);

	global.TwitchCommandHandler = require("./commandHandler.js");
	global.twitchCommandHandler = new TwitchCommandHandler();
	await twitchCommandHandler.init();

	/*global.TwitchMessageParser = require("./messageParser.js");
	global.twitchMessageParser = new TwitchMessageParser();
	await twitchMessageParser.init();*/

	// From https://github.com/sirDonovan/Cassius/blob/master/app.js#L46
	let pluginsList;
	const plugins = fs.readdirSync(path.resolve(`${__dirname}/plugins`));
	for (let i = 0, len = plugins.length; i < len; i++) {
		const fileName = plugins[i];
		if (!fileName.endsWith(".js")) continue;
		if (!pluginsList) pluginsList = [];
		const file = require(`./plugins/${fileName}`);
		if (file.name && !file.disabled) {
			global[`twitch-${file.name}`] = file;
			if (typeof file.onLoad === "function") file.onLoad();
		}
		pluginsList.push(file);
	}

	global.TwitchPlugins = pluginsList;

	listen = true;
}));

bot.on("join", (channel, username, self) => {
	if (!self) return;
	console.log(`${Tools.twitchText()}Joined channel: ${channel.green}`);
});

/*bot.on("raw_message", (messageCloned, message) => {
	console.log(message.raw);
});*/


bot.on("message", (async (channel, user, message, self) => {
	if (!listen) return;
	/*console.log(channel);
	console.log(user);
	console.log(message);
	console.log(self);*/
	if (self) return;

	if (message.startsWith(twitchConfig.commandCharacter) || message.startsWith("!")) {
		resolveMessage(channel, user, message, self);
	}
}));

bot.connect();


async function resolveMessage(channel, user, message, self) {
	const cmd = Tools.toId(message.slice(1).split(" ", 1)[0]);
	let args = message.slice(cmd.length + 1).split(",");
	args = args.map(element => element.trim());

	if (cmd === "help") return twitchCommandHandler.helpCommand(message, channel, user, self);

	twitchCommandHandler.executeCommand(message, channel, user, self);
}
