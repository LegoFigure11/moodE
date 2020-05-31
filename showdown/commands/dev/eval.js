"use strict";

const LCRNG = require("../../../sources/rng/lcrng.js"); // eslint-disable-line
const utilities = require("../../src/utilities.js"); // eslint-disable-line

module.exports = {
	desc: "Evaluates arbitrary javascript.",
	usage: "<expression>",
	aliases: ["js", "evaluate"],
	developerOnly: true,
	async process(args, room, user) {
		args = args.join(",").trim();
		let output;
		try {
			output = eval(args);
			output = JSON.stringify(output, null, 2);
			console.log(output);
		} catch (e) {
			return room.say(`Error while evaluating expression: ${e}`);
		}
		return room.say(output);
	},
};
