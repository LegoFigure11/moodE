"use strict";

module.exports = {
	desc: "Provides info on the most popular commands in the server.",
	usage: "<number>, <(optional) nopm>",
	isManager: true,
	noPm: true,
	hasCustomFormatting: true,
	async process(message, args) {
		let pm = true;
		if (args[1] && Tools.toId(args[1]) === "nopm") pm = false;
		const commands = discordCommandHandler.commands;
		const db = Storage.getDatabase(message.guild.id);

		const usage = [];

		for (let i = 0; i < commands.length; i++) {
			usage.push({name: commands[i].name, times: db.config.commands[commands[i].name].uses.total});
		}
		usage.sort((a, b) => b.times - a.times);

		const number = args[0] ? (parseInt(args[0]) > 0 ? parseInt(args[0]) : 5) : 5;

		const embed = {
			title: `Top ${number} commands for ${message.guild.name}:`,
			color: message.guild.members.cache.get(client.user.id).displayColor,
			fields: [],
		};

		for (let i = 0; i < number; i++) {
			embed.fields.push({name: `#${i + 1}: ${discordConfig.commandCharacter}${usage[i].name}`, value: `${usage[i].times} time${usage[i].times === 1 ? "" : "s"}`});
		}

		return pm ? message.author.send({embed}) : message.channel.send({embed});
	},
};
