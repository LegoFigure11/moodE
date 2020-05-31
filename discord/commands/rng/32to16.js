"use strict";

const LCRNG = require("../../../sources/rng/lcrng.js");

module.exports = {
	desc: "Gets the nearest 16-bit seed to a provided 32-bit seed. Uses standard GBA LCRNG.",
	usage: "<32-bit seed (as Hex)>",
	async process(message, args) {
		if (isNaN(parseInt(args[0], 16))) return message.channel.send(`Unable to coerce ${args[0]} as a Hex string!`);
		const RNG = new LCRNG.PokeRNGR(args[0]);
		let result;
		let i = 0;
		do {
			i++;
			result = RNG.getNext32BitNumber();
		} while (result >>> 16 !== 0);
		return message.channel.send(`Closest 16-bit seed: \`${result}\`, ${i} frame${i !== 1 ? "s" : ""} before ${args[0]}`);
	},
};
