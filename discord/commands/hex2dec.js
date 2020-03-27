"use strict";

const converter = require("hex2dec");

module.exports = {
	desc: "Converts a provided hex value to decimal.",
	usage: "<hex value>",
	aliases: ["decimalify", "h2d", "hd", "hextodec", "hextodecimal", "hexadecimaltodecimal"],
	async process(message, args) {
		if (!(args[0])) return message.channel.send(`Usage: \`${discordConfig.commandCharacter}hex2dec ${this.usage}\``);
		return message.channel.send(converter.hexToDec(args[0]));
	},
};
