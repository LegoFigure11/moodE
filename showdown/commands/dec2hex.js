"use strict";

const converter = require("hex2dec");

module.exports = {
	desc: "Converts a provided decimal value to hexadecimal.",
	usage: "<decimal value>",
	aliases: ["hexify", "d2h", "dh", "dectohex", "decimaltohex", "decimaltohexadecimal"],
	async process(args, room, user) {
		if (!(args[0])) return room.say(`Usage: \`${psConfig.commandCharacter}dec2hex ${this.usage}\``);
		return room.say(converter.decToHex(args[0]));
	},
};
