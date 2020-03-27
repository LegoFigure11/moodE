"use strict";

module.exports = {
	desc: "Provides info on the provided command.",
	usage: "<command name>, <(optional) nopm>",
	isManager: true,
	noPm: true,
	hasCustomFormatting: true,
	async process(message, args) {
		if (!args[0]) return message.channel.send(`Syntax: \`${discordConfig.commandCharacter}info ${this.usage}\``);

		let pm = true;
		if (args[1] && Tools.toId(args[1]) === "nopm") pm = false;
		const commands = discordCommandHandler.commands;
		let command;
		for (let i = 0; i < commands.length; i++) {
			if ([commands[i].name, ...commands[i].aliases].includes(Tools.toId(args[0]))) {
				command = commands[i];
				break;
			}
		}
		if (command) {
			const db = Storage.getDatabase(message.guild.id).config.commands[command.name];
			const users = Array.from(Object.keys(db.uses.users));
			const userArr = [];
			for (let i = 0; i < users.length; i++) {
				userArr.push({name: db.uses.users[users[i]].name, times: db.uses.users[users[i]].times});
			}
			userArr.sort((a, b) => b.times - a.times);
			for (let i = 0; i < userArr.length; i++) {
				userArr[i] = `${userArr[i].name} - ${userArr[i].times} time${userArr[i].times === 1 ? "" : "s"}`;
			}
			const embed = {
				title: `Info for: ${discordConfig.commandCharacter}${command.name} (#${message.guild.name})`,
				description: `**About**: ${command.longDesc || command.desc || "No info available."}`,
				color: message.guild.members.cache.get(client.user.id).displayColor,
				fields: [
					{name: "requiredRoles", value: db.requiredRoles.join(", ") || "None", inline: true},
					{name: "bannedUsers", value: db.bannedUsers.join(", ") || "None", inline: true},
					{name: "bannedChannels", value: db.bannedChannels.join(", ") || "None", inline: true},
					{name: "isElevated", value: db.isElevated, inline: true},
					{name: "isManager", value: db.isManager, inline: true},
					{name: "Uses", value: `Total: ${db.uses.total}\nBreakdown:\n${userArr.join("\n")}`},
				],
			};
			return pm ? message.author.send({embed}) : message.channel.send({embed});
		}
	},
};
