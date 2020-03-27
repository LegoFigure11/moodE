"use strict";

const converter = require("hex2dec");

module.exports = {
	desc: "Converts a provided decimal value to hexadecimal.",
	usage: "<decimal value>",
	aliases: ["hexify", "d2h", "dh", "dectohex", "decimaltohex", "decimaltohexadecimal"],
	async process(message, args) {
		if (!(args[0])) return message.channel.send(`Usage: \`${discordConfig.commandCharacter}dec2hex ${this.usage}\``);
		return message.channel.send(converter.decToHex(args[0]));
	},
};
