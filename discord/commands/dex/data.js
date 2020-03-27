"use strict";

const pokedexjs = require("./pokedex.js");
const movejs = require("./move.js");
const itemjs = require("./item.js");
const abilityjs = require("./ability.js");
const naturejs = require("./nature.js");

const dbLink = {
	"pokemon": pokedexjs,
	"move": movejs,
	"item": itemjs,
	"ability": abilityjs,
	"nature": naturejs,
};

const stats = ["atk", "def", "spa", "spd", "spe"];

module.exports = {
	desc: "Prints the information of a Pokémon, ability, move, item, or nature",
	usage: "<effect name>",
	aliases: ["dt", "dex"],
	options: ["gen"],
	hasCustomFormatting: true,
	async process(message, args, dex) {
		if (!(args[0])) {
			return message.channel.send(`Usage: ${discordConfig.commandCharacter}data <name>`);
		}

		if (args.length >= 2) {
			if (stats.includes(args[0]) && stats.includes(args[1])) {
				return naturejs.process(message, args, dex);
			}
		}

		const search = dex.dataSearch(args[0]);
		if (!search) {
			return message.channel.send(`Cannot recognize ${args.join(", ")}.`);
		}

		return dbLink[search[0].searchType].process(message, args, dex);
	},
};
