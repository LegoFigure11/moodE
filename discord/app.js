"use strict";

const path = require("path");

const discordConfig = require("./config.json");
const utilities = require("./utilities.js");

// Prevent handlers from firing before client is ready
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

	global.DiscordCommandHandler = require("./commandHandler.js");
	global.discordCommandHandler = new DiscordCommandHandler();
	await discordCommandHandler.init();

	global.DiscordEditRules = require("./editRules.js");
	global.discordEditRules = new DiscordEditRules();
	await discordEditRules.init();

	global.DiscordMessageParser = require("./messageParser.js");
	global.discordMessageParser = new DiscordMessageParser();
	await discordMessageParser.init();

	global.DiscordReactionHandler = require("./reactionHandler.js");
	global.discordReactionHandler = new DiscordReactionHandler();
	await discordReactionHandler.init();

	// From https://github.com/sirDonovan/Cassius/blob/master/app.js#L46
	let pluginsList;
	const plugins = fs.readdirSync(path.resolve(`${__dirname}/plugins`));
	for (let i = 0, len = plugins.length; i < len; i++) {
		const fileName = plugins[i];
		if (!fileName.endsWith(".js")) continue;
		if (!pluginsList) pluginsList = [];
		const file = require(`./plugins/${fileName}`);
		if (file.name && !file.disabled) {
			global[file.name] = file;
			if (typeof file.onLoad === "function") file.onLoad();
		}
		pluginsList.push(file);
	}

	global.DiscordPlugins = pluginsList;

	console.log(`${Tools.discordText()}--------------`);
	console.log(`${Tools.discordText()}${"Ready!".green}`);
	console.log(`${Tools.discordText()}--------------`);

	if (discordConfig.logChannel) {
		client.channels.cache.get(discordConfig.logChannel).send(`Bot online! ${discordConfig.commandCharacter === "~" ? "(Local)" : "(Production)"} | Discord: ${runDiscord} | PS: ${runShowdown}`);
	}

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

client.on("message", async (message) => {
	if (!listen) return;

	if (message.author.id === client.user.id) return; // Don't respond to self

	if (message.channel.type !== "dm") {
		message = await discordMessageParser.process(message);
	}

	// Messages can be deleted by messageParser rules, don't process commands containing banned words or messages that have been otherwise deleted
	if (message.deleted) return;

	if (message.author.bot) return; // Don't respond to bots

	if (message.content.startsWith(discordConfig.commandCharacter)) {
		resolveMessage(message);
	}
});

client.on("messageDeleteBulk", async (messages) => {
	if (!listen) return;

	/*for (const msg of messages) {
		let message = msg[1];

		if (message.partial) {
			try {
				message = await message.fetch();
			} catch (e) {
				console.log(`${Tools.discordText()}Unable to retreive a deleted message! ${(`(ID: ${message.id})`).grey}`);
				continue;
			}
		}

		const db = Storage.getDatabase(message.guild.id);
		if (!db.config.logger || !db.config.logger.logDeletes || !db.config.logger.deletesChannel) return;
		if (db.config.logger.ignoreChar && message.content.startsWith(db.config.logger.ignoreChar) && db.config.logger.ignoreChan && db.config.logger.ignoreChan.includes(message.channel.id)) return;

		let entry;
		let user;
		if (message.guild.me.hasPermission("VIEW_AUDIT_LOG")) {
			entry = await message.guild.fetchAuditLogs({type: "MESSAGE_DELETE"}).then(audit => audit.entries.first());
			if (entry && entry.createdTimestamp > (Date.now() - 5000)) user = utilities.parseUserId(entry.executor.id);
		}
		let attachmentNum = 0;
		const attachments = [];
		for (const attachment of message.attachments) {
			attachments.push(attachment[1].url);
			attachmentNum += 1;
		}
		let descText = "A message was deleted.";
		const embed = {
			color: message.guild.members.cache.get(client.user.id).displayColor,
			timestamp: new Date(),
			fields: [
				{name: "Author", value: `${message.author}`, inline: true},
				{name: "Channel", value: `${message.channel}`, inline: true},
				{name: "Message", value: `${message.content || "(none)"}`, inline: true},
			],
			footer: {
				icon_url: client.user.avatarURL(),
				text: "moodE",
			},
		};
		if (attachmentNum > 0) embed.fields.push({name: "Attachments", value: `${attachmentNum}`, inline: true});
		if (user) descText = `A message was deleted by ${user.tag}.`;
		client.channels.cache.get(db.config.logger.deletesChannel).send(descText, {embed: embed});
		if (attachmentNum > 0) client.channels.cache.get(db.config.logger.deletesChannel).send("Attachments:", {files: attachments});
	}*/
	const message = messages[0];
	const db = Storage.getDatabase(message.guild.id);
	if (!db.config.logger || !db.config.logger.logDeletes || !db.config.logger.deletesChannel) return;
	if (db.config.logger.ignoreChar && message.content.startsWith(db.config.logger.ignoreChar) && db.config.logger.ignoreChan && db.config.logger.ignoreChan.includes(message.channel.id)) return;

	let entry;
	let user;
	if (message.guild.me.hasPermission("VIEW_AUDIT_LOG")) {
		entry = await message.guild.fetchAuditLogs({type: "MESSAGE_DELETE"}).then(audit => audit.entries.first());
		if (entry && entry.createdTimestamp > (Date.now() - 5000)) user = utilities.parseUserId(entry.executor.id);
	}
	let descText = "Several messages were deleted.";
	const embed = {
		color: message.guild.members.cache.get(client.user.id).displayColor,
		timestamp: new Date(),
		fields: [
			{name: "Number", value: messages.size, inline: true},
			{name: "Channel", value: `${message.channel}`, inline: true},
		],
		footer: {
			icon_url: client.user.avatarURL(),
			text: "moodE",
		},
	};
	if (user) descText = `Several messages were deleted by ${user.tag}.`;
	client.channels.cache.get(db.config.logger.deletesChannel).send(descText, {embed: embed});
});

client.on("messageDelete", async (message) => {
	if (!listen) return;

	if (message.partial) {
		try {
			message = await message.fetch();
		} catch (e) {
			return console.log(`${Tools.discordText()}Unable to retreive a deleted message! ${(`(ID: ${message.id})`).grey}`);
		}
	}

	const db = Storage.getDatabase(message.guild.id);
	if (!db.config.logger || !db.config.logger.logDeletes || !db.config.logger.deletesChannel) return;
	if (db.config.logger.ignoreChar && message.content.startsWith(db.config.logger.ignoreChar) && db.config.logger.ignoreChan && db.config.logger.ignoreChan.includes(message.channel.id)) return;

	let entry;
	let user;
	if (message.guild.me.hasPermission("VIEW_AUDIT_LOG")) {
		entry = await message.guild.fetchAuditLogs({type: "MESSAGE_DELETE"}).then(audit => audit.entries.first());
		if (entry && entry.createdTimestamp > (Date.now() - 5000)) user = utilities.parseUserId(entry.executor.id);
	}
	let attachmentNum = 0;
	const attachments = [];
	for (const attachment of message.attachments) {
		attachments.push(attachment[1].url);
		attachmentNum += 1;
	}
	let descText = "A message was deleted.";
	const embed = {
		color: message.guild.members.cache.get(client.user.id).displayColor,
		timestamp: new Date(),
		fields: [
			{name: "Author", value: `${message.author}`, inline: true},
			{name: "Channel", value: `${message.channel}`, inline: true},
			{name: "Message", value: `${message.content || "(none)"}`, inline: true},
		],
		footer: {
			icon_url: client.user.avatarURL(),
			text: "moodE",
		},
	};
	if (attachmentNum > 0) embed.fields.push({name: "Attachments", value: `${attachmentNum}`, inline: true});
	if (user) descText = `A message was deleted by ${user.tag}.`;
	client.channels.cache.get(db.config.logger.deletesChannel).send(descText, {embed: embed});
	if (attachmentNum > 0) client.channels.cache.get(db.config.logger.deletesChannel).send("Attachments:", {files: attachments});
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
	if (!listen) return;
	if (oldMessage.partial || newMessage.partial) {
		oldMessage = await oldMessage.fetch();
		newMessage = await newMessage.fetch();
	}
	if (newMessage.author.bot) return; // Don't log bot edits
	// Run rules on edits
	if (oldMessage.channel.type !== "dm") {
		discordEditRules.process(oldMessage, newMessage);
	}

	const db = Storage.getDatabase(oldMessage.guild.id);
	if (!db.config.logger || !db.config.logger.logEdits || !db.config.logger.editsChannel) return;
	if (db.config.logger.ignoreChan && db.config.logger.ignoreChan.includes(oldMessage.channel.id)) return;
	if (oldMessage.content === newMessage.content) return;
	const descText = "A message was edited.";
	const embed = {
		color: oldMessage.guild.members.cache.get(client.user.id).displayColor,
		timestamp: new Date(),
		fields: [
			{name: "Author", value: `${oldMessage.author}`, inline: true},
			{name: "Channel", value: `${oldMessage.channel}`, inline: true},
			{name: "Link", value: `[Click me!](${oldMessage.url})`, inline: true},
			{name: "Old Message", value: `${oldMessage.content || "{embed}"}`, inline: true},
			{name: "New Message", value: `${newMessage.content || "{embed}"}`, inline: true},
		],
		footer: {
			icon_url: client.user.avatarURL(),
			text: "moodE",
		},
	};
	client.channels.cache.get(db.config.logger.editsChannel).send(descText, {embed});
});

client.on("messageReactionAdd", async (reaction, user) => {
	if (!listen) return;

	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (e) {
			return console.log(`${Tools.discordText()}Unable to retrieve reaction! ${(`(ID: ${reaction.message.id})`).grey}`);
		}
	}

	discordReactionHandler.process(reaction, user, "Add");
});

client.on("messageReactionRemove", async (reaction, user) => {
	if (!listen) return;

	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (e) {
			return console.log(`${Tools.discordText()}Unable to retrieve reaction! ${(`(ID: ${reaction.message.id})`).grey}`);
		}
	}

	discordReactionHandler.process(reaction, user, "Remove");
});

client.on("disconnect", (errMsg, code) => {
	console.log(`${Tools.discordText()}Bot disconnected with code ${code} for reason: ${errMsg}`);
	client.connect();
});

client.login(discordConfig.token);

async function resolveMessage(message) {
	const cmd = Tools.toId(message.content.slice(1).split(" ", 1)[0]);
	let args = message.content.slice(cmd.length + 1).split(",");
	args = args.map(element => element.trim());

	if (cmd === "help") return await discordCommandHandler.createHelpCommand(args, message);

	discordCommandHandler.executeCommand(cmd, message, args);
}
