"use strict";

const utilities = require("../../utilities.js");

const TIMEOUT = 60 * 1000;

module.exports = {
	async process(reaction, user) {
		// Only listen to reactions on messages from bot
		if (reaction.message.author.id !== client.user.id) return;
		// Only listen to help commands
		if (!reaction.message.content.startsWith("moodE Help")) return;
		// Only listen to reactions instigated by the original user (stored in the message itself)
		const author = utilities.parseUserId(new RegExp("<.*>").exec(reaction.message.content)[0]);
		if (author.id === user.id) {
			// Pagination wizardry
			const pages = reaction.message.content.split(":")[1].match(new RegExp("[0-9]+", "g"));
			const page = pages[0];
			const maxPage = pages[1] || 1;
			switch (reaction._emoji.name) {
			case "\u{23EA}": // ⏪ Rewind Emoji - Go back to start
				discordCommandHandler.changeHelpPage(reaction.message, user, 1);
				break;
			case "\u{25C0}": // ◀️ Back Emoji - Go back one page
				discordCommandHandler.changeHelpPage(reaction.message, user, Math.max(1, page - 1));
				break;
			case "\u{25B6}": // ▶️ Play Emoji - Go forward one page
				discordCommandHandler.changeHelpPage(reaction.message, user, Math.min(parseInt(page) + 1, maxPage));
				break;
			case "\u{23E9}": // ⏩ Fast Forward Emoji - Go to end
				discordCommandHandler.changeHelpPage(reaction.message, user, maxPage, maxPage);
				break;
			case "\u{1F522}": // 🔢 1234 Emoji - Prompt for user input and go to that page
				const filter = response => {
					const num = parseInt(Tools.toId(response.content));
					return response.author.id === user.id && response.channel.id === reaction.message.channel.id && !isNaN(num) && num > 0 && num <= maxPage;
				};
				const m = await reaction.message.channel.send(`${user} Please enter the page number that you would like to go to:`);
				reaction.message.channel.awaitMessages(filter, {max: 1, time: TIMEOUT, errors: ["time"]}).then(collected => {
					discordCommandHandler.changeHelpPage(reaction.message, user, parseInt(Tools.toId(collected.first().content)), maxPage);
					collected.first().delete().catch(e => {});
					m.delete().catch(e => {});
				}).catch(collected => {
					m.edit(`${discordFailureEmoji} The instruction timed out! Please react again if you still wish to perform this action.`);
				});
				break;
			case "\u{1F4D8}": // 📘 Blue Book Emoji - Go to Contents (Page 2)
				discordCommandHandler.changeHelpPage(reaction.message, user, 2);
				break;
			}
		}
		// Purge all reactions that aren't by the bot
		const users = await reaction.users.fetch();
		await users.each(async (user) => {
			if (user.id !== client.user.id) {
				const reactions = reaction.message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
				try {
					for (const reaction of reactions.values()) {
						await reaction.users.remove(user.id);
						console.log(`${Tools.discordText()}Removed a reaction by ${user.username}#${user.discriminator} ${`(${user.id})`.grey}`);
					}
				} catch (e) {
					console.log(`${Tools.discordText()}Failed to remove a reaction! ${`(${user.id})`.grey}`);
				}
			}
		});
	},
};
