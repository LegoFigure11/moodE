"use strict";

module.exports = {
	servers: [],
	channels: [],
	users: [],
	async process(message) {
		if (message.author.bot) return message;
		const regex = /https:\/\/discord(|app)\.com\/channels\/[0-9]*\/[0-9]*\/[0-9]*/g;
		const matches = [...new Set(message.content.match(regex))]; // Remove duplicate entries
		for (let match of matches) {
			match = match.split("/");
			/*
				[0] "https:",
				[1] "",
				[2] "discordapp.com",
				[3] "channels",
				[4] "guild id",
				[5] "channel id",
				[6] "message id"
			*/
			try {
				const channel = client.channels.cache.get(match[5]);
				channel.messages.fetch(match[6]).then(msg => {
					let attachmentNum = 0;
					const attachments = [];
					for (const attachment of msg.attachments) {
						attachments.push(attachment[1].url);
						attachmentNum += 1;
					}
					const author = `${msg.author.username}#${msg.author.discriminator}`;

					message.channel.send(`Message from ${author}, posted in ${channel} on ${new Date(msg.createdTimestamp).toUTCString()}${attachmentNum > 0 ? ` (with ${attachmentNum} attachment${attachmentNum === 1 ? "" : "s"})` : ""}:\n${msg.content ? `>>> ${msg.content}` : ""}`, {files: attachments});
					return message;
				});
			} catch (e) {
				return message;
			}
		}
		return message;
	},
};
