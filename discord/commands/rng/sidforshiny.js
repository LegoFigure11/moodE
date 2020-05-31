"use strict";

module.exports = {
	desc: "Calculates the SID required to make a given PID shiny.",
	usage: "<PID (Hex)>, <TID (Dec)>",
	aliases: ["sid4shiny", "square"],
	async process(message, args) {
		if (!args[1]) return message.channel.send(this.usage);
		const decPid = parseInt(args[0], 16);
		const decTid = parseInt(args[1]);

		if (isNaN(decPid)) return message.channel.send(`${discordConfig.failureEmoji} Unable to coerce ${args[0]} as a Hex string!`);
		if (isNaN(decTid)) return message.channel.send(`${discordConfig.failureEmoji} Unable to coerce ${args[1]} as a decimal!`);
		if (decPid < 0 || decPid > 0xFFFFFFFF) return message.channel.send(`${discordConfig.failureEmoji} ${args[0]} is not a valid PID!`);
		if (decTid < 0 || decTid > 65535) return message.channel.send(`${discordConfig.failureEmoji} ${args[1]} is not a valid TID!`);

		const pid16High = decPid >>> 16;
		const pid16Low = decPid & 0xFFFF;

		const square = pid16High ^ pid16Low ^ decTid;
		const rangeLow = 8 * Math.floor(square / 8);

		return message.channel.send(`SID range for shiny: ${rangeLow} - ${rangeLow + 7}\nSID to force square shiny: ${square}`);
	},
};
