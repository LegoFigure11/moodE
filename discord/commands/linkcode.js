"use strict";

const utilities = require("../utilities.js");

module.exports = {
	desc: "Generates a random Link Code.",
	longDesc: "Generates a unique link code of the specified length, otherwise 8.",
	usage: "<length (optional)>",
	aliases: ["code", "generaterandomlinkcode", "chooserandomlinkcode", "getrandomlinkcode"],
	async process(message, args) {
		return message.channel.send(`Your random link code is: **${utilities.generateRandomLinkCode(args[0])}**`);
	},
};
