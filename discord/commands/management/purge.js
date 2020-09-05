"use strict";

const utilities = require("../../utilities.js");

const TIMEOUT = 30 * 1000;

module.exports = {
	desc: "Removes many messages from a channel.",
	longDesc: "Removes the last 1 or more messages in a channel. If an author is provided, only delete messages by that user.",
	usage: "<number (optional, default 1, max 100)>, <@author|author id (optional, default none)>",
	aliases: ["delete", "wipe", "bulkdelete", "deletemany"],
	isManager: true,
	noPm: true,
	async process(message, args) {
		if (!message.guild.members.cache.get(client.user.id).hasPermission("MANAGE_MESSAGES")) return message.channel.send(`${discordFailureEmoji} Insufficient permissions! Bot does not have the required \`MANAGE_MESSAGES\` permission.`);
		const users = [];
		let num = 1;
		for (let arg of args) {
			arg = arg.trim();
			const tempUser = utilities.parseUserId(arg);
			if (tempUser) {
				users.push(tempUser);
			} else {
				const tempNum = parseInt(arg);
				if (!isNaN(tempNum)) num = tempNum;
			}
		}
		// Get confirmation before proceeding
		const filter = response => {
			return response.author.id === message.author.id && response.channel.id === message.channel.id && (Tools.toId(response.content) === "y" || Tools.toId(response.content) === "n");
		};

		message.channel.send(`Are you sure you want to delete the last ${num === 1 ? "" : num} message${num === 1 ? "" : "s"} ${users.length > 0 ? `by ${users[0]}` : ""}? (Y/n):`).then(() => {
			message.channel.awaitMessages(filter, {max: 1, time: TIMEOUT, errors: ["time"]}).then(async (collected) => {
				if (Tools.toId(collected.first().content) === "y") {
					let messages = await message.channel.messages.fetch({limit: num + 50}).catch(e => { return message.channel.send(`${discordFailureEmoji} Error fetching messages!`); });
					if (users[0]) {
						messages = messages.filter(m => m.author.id === users[0].id).array().slice(0, num);
						try {
							message.channel.bulkDelete(messages);
							message.channel.send(`${discordSuccessEmoji} ${messages.length} message${message.length === 1 ? "" : "s"} were deleted!`);
						} catch (e) {
							console.log(e.stack);
						}
					}
				} else {
					message.channel.send("No messages will be deleted!");
				}
			}).catch(collected => {
				return message.channel.send("The command timed out! No messages will be deleted.");
			});
		});
	},
};
