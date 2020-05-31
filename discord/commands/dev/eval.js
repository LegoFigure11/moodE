"use strict";


const LCRNG = require("../../../sources/rng/lcrng.js"); // eslint-disable-line
const utilities = require("../../utilities.js"); // eslint-disable-line

module.exports = {
	desc: "Evaluates arbitrary javascript.",
	usage: "<expression>",
	aliases: ["js"],
	adminOnly: true,
	async process(message, args) {
		args = args.join(",").trim();
		let output;
		try {
			output = eval(args);
			output = JSON.stringify(output, null, 2);
		} catch (e) {
			return message.channel.send(`Error while evaluating expression: ${e}`);
		}
		return message.channel.send(`\`\`\`${output}\`\`\``);
	},
};
