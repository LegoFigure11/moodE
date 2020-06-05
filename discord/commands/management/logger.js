"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Allows editing of logger configuration.",
	usage: "<on|off>, <output channel id>",
	aliases: ["log"],
	isManager: true,
	noPm: true,
	async process(message, args) {
		const db = Storage.getDatabase(message.guild.id);
		switch (Tools.toId(args[0])) {
		case "on":
			if (!args[1] || !utilities.parseChannelId(message, args[1])) return message.channel.send(`${failureEmoji} Expected a channel!`);
			delete db.config.logger;
			db.config.logger = {"logDeletes": true, "deletesChannel": utilities.parseChannelId(message, args[1]).id, "logEdits": true, "editsChannel": utilities.parseChannelId(message, args[1]).id};
			message.channel.send(`${successEmoji} Enabled event logging in #${utilities.parseChannelId(message, args[1]).name}`);
			break;
		case "off":
			delete db.config.logger;
			message.channel.send(`${successEmoji} Disabled event logging!`);
			break;
		default:
			message.channel.send(`Currently logging events: ${db.config.logger ? `${db.config.logger.logDeletes} in channel: ${utilities.parseChannelId(message, db.config.logger.deletesChannel).name}` : "false"}`);
		}
		Storage.exportDatabase(message.guild.id);
		return true;
	},
};
