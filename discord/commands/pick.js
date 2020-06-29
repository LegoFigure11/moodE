"use strict";

module.exports = {
	desc: "Randomly chooses from once of the provided values.",
	usage: "<comma>, <seperated>, <values>, ...",
	aliases: ["choose"],
	async process(message, args) {
		if (!(args[0])) return;
		return message.channel.send(`:game_die: I randomly selected... "${Tools.sampleOne(args)}"!`);
	},
};
