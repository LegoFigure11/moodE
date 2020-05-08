"use strict";

const converter = require("hex2dec");

module.exports = {
	desc: "Converts a provided hex value to decimal.",
	usage: "<hex value>",
	aliases: ["decimalify", "h2d", "hd", "hextodec", "hextodecimal", "hexadecimaltodecimal"],
	async process(args, room, user) {
		if (!(args[0])) return room.say(`Usage: \`${psConfig.commandCharacter}hex2dec ${this.usage}\``);
		return room.say(converter.hexToDec(args[0]));
	},
};
