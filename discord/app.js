"use strict";

const discordConfig = require("./config.json");
const utilities = require("./utilities.js");

let listen = false;

client.on("ready", (async () => {
	const guilds = client.guilds.cache.map(g => g.id);
	for (const id of guilds) {
		const name = client.guilds.cache.get(id).name;
		await utilities.checkForDb(id, `{"name":"${name}", "config":{}}`, name);
		const db = Storage.getDatabase(id);
		if (!db.config.botRanks) {
			utilities.buildDb(id, name);
		}
	}

	try {
		fs.accessSync(path.resolve(__dirname, "./twitchMonitor.js"));
		const twitchMonitor = require("./twitchMonitor.js");
		console.log(`${discordText}Loading ${"TwitchMonitor".cyan}...`);
		twitchMonitor.monitorTwitch();
		console.log(`${discordText}${"TwitchMonitor".cyan} loaded!`);
	} catch (e) {}

	global.DiscordMessageParser = require("./messageParser.js");
	global.discordMessageParser = new DiscordMessageParser();
	await discordMessageParser.init();

	global.DiscordCommandHandler = require("./commandHandler.js");
	global.discordCommandHandler = new DiscordCommandHandler();
	await discordCommandHandler.init();

	console.log(`${discordText}--------------`);
	console.log(`${discordText}${"Ready!".green}`);
	console.log(`${discordText}--------------`);
	listen = true;
}));

client.on("guildCreate", guild => {
	const name = guild.name;
	const id = guild.id;
	utilities.checkForDb(id, `{"name":"${name}", "config":{}}`, name);
	utilities.buildDb(id, name);
	for (const command of discordCommandHandler.commands) {
		utilities.populateDb(id, command.name, command.isNSFW ? "NSFW" : false);
	}
});

client.on("message", message => {
	if (!listen) return;
	if (message.author.bot) return; // Don't respond to bots

	if (message.content.startsWith(discordConfig.commandCharacter)) {
		resolveMessage(message);
	} else if (message.channel.type !== "dm") {
		discordMessageParser.process(message);
	}
});

client.on("messageDelete", async (message) => {
	if (!listen) return;
	const db = Storage.getDatabase(message.guild.id);
	if (!db.config.logger || !db.config.logger.logDeletes || !db.config.logger.deletesChannel) return;
	let entry;
	let user;
	if (message.guild.me.hasPermission("VIEW_AUDIT_LOG")) {
		entry = await message.guild.fetchAuditLogs({type: "MESSAGE_DELETE"}).then(audit => audit.entries.first());
		if (entry.createdTimestamp > (Date.now() - 5000)) user = utilities.parseUserId(entry.executor.id);
	}
	if (db.config.logger.ignoreChar && message.content.startsWith(db.config.logger.ignoreChar) && db.config.logger.ignoreChan && db.config.logger.ignoreChan.includes(message.channel.id)) return;
	let descText = "A message was deleted.";
	const embed = {
		color: message.guild.members.cache.get(client.user.id).displayColor,
		timestamp: new Date(),
		fields: [
			{name: "Author", value: `${message.author}`, inline: true},
			{name: "Channel", value: `${message.channel}`, inline: true},
			{name: "Message", value: `${message.content || "{embed}"}`, inline: true},
		],
		footer: {
			icon_url: client.user.avatarURL(),
			text: "moodE",
		},
	};
	if (user) descText = `A message was deleted by ${user.tag}.`;
	client.channels.cache.get(db.config.logger.deletesChannel).send(descText, {embed});
});

// Legacy Support
client.on("raw", async (event) => {
	if (!listen) return;
	if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(event.t)) return;
	const channel = client.channels.get(event.d.channel_id);
	channel.fetchMessage(event.d.message_id).then(msg => {
		const user = msg.guild.members.get(event.d.user_id);

		if (msg.author.id === client.user.id) {
			const regex = `\\*\\*"(.+)?(?="\\*\\*)`;
			const role = msg.content.match(regex)[1];

			if (user.id !== client.user.id) {
				const roleObj = msg.guild.roles.find(r => r.name === role);
				const memberObj = msg.guild.members.get(user.id);

				if (event.t === "MESSAGE_REACTION_ADD") {
					memberObj.addRole(roleObj);
					console.log(`${roleObj.name} added to ${memberObj.user.username}`);
				} else {
					memberObj.removeRole(roleObj);
					console.log(`${roleObj.name} removed from ${memberObj.user.username}`);
				}
			}
		}
	});
});

client.on("disconnect", (errMsg, code) => {
	console.log(`${discordText}Bot disconnected with code ${code} for reason: ${errMsg}`);
	client.connect();
});

client.login(discordConfig.token);

async function resolveMessage(message) {
	const cmd = Tools.toId(message.content.slice(1).split(" ", 1)[0]);
	let args = message.content.slice(cmd.length + 1).split(",");
	args = args.map(element => element.trim());

	if (cmd === "help") return discordCommandHandler.helpCommand(args, message);

	discordCommandHandler.executeCommand(cmd, message, args);
}
