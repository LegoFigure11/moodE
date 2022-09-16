"use strict";

const https = require("https");

const SPRITE_URL = "https://play.pokemonshowdown.com/sprites/";

module.exports = {
	desc: "Image link of a Pokémon, or link to sprite directory if no argument is given. Uses PokemonShowdown's sprite library.",
	usage: "<Pokémon name>",
	aliases: ["gif", "model", "sprit"],
	options: ["shiny", "back", "female", "noani", "afd", "gen"],
	hasCustomFormatting: true,
	async process(message, args, dex) {
		if (!(args[0])) {
			return message.channel.send("All sprites can be viewed here: https://play.pokemonshowdown.com/sprites/");
		}

		let pokemon = dex.getSpecies(args[0]);
		if (!pokemon || !pokemon.exists) {
			pokemon = dex.dataSearch(args[0], ["Pokedex"]);
			if (!pokemon) {
				return message.channel.send(`No Pokémon ${args[0]} found.`);
			}
			pokemon = dex.getSpecies(pokemon[0].name);
		}

		if (pokemon.gen > dex.gen) {
			return message.channel.send(`${pokemon.name} did not exist in Gen ${dex.gen}; it was introduced in Gen ${pokemon.gen}.`);
		}

		let spriteId = pokemon.spriteid;
		let genNum = dex.gen;
		if (pokemon.tier === "CAP") {
			genNum = 5;
		}
		if (pokemon.num === 0) {
			genNum = 1;
		}

		let genData = {1: "gen1", 2: "gen2", 3: "gen3", 4: "gen4", 5: "gen5", 6: "", 7: "", 8: ""}[genNum];
		let ending = ".png";
		if (!(Tools.toId(args).includes("noani")) && genNum >= 5 && pokemon.num > 0) {
			genData += "ani";
			ending = ".gif";
		}
		if (Tools.toId(args).includes("noani") && genNum >= 7 && !(Tools.toId(args).includes("back"))) {
			genData = "dex";
		}

		let dir = "";

		if (Tools.toId(args).includes("back")) {
			dir += "-back";
		}
		if (Tools.toId(args).includes("shiny") && genNum > 1) {
			dir += "-shiny";
		}
		if (Tools.toId(args).includes("afd")) {
			dir = `afd${dir}`;
			return `${SPRITE_URL}${dir}/${spriteId}.png`;
		}

		dir = genData + dir;
		if (dir === "") {
			dir = "gen6";
		}

		// Hardcode Unown forme exceptions
		// Gens 2, 3, and 4 only have one unown sprite
		if (spriteId === "unown" && dex.gen >= 5) {
			const regex = /-[!?A-Za-z]/;
			spriteId += args[0].match(regex)[0].toLowerCase().replace("!", "exclamation").replace("?", "question");
		}

		if (Tools.toId(args).includes("female") && genNum >= 4) {
			const checker = new Promise((resolve, reject) => {
				const req = https.request({"host": "play.pokemonshowdown.com",
					"method": "HEAD",
					"path": `${SPRITE_URL}${dir}/${spriteId}-f${ending}`,
				});

				req.on("response", res => {
					resolve(res);
				});

				req.on("error", err => {
					reject(err);
				});

				req.end();
			});

			const result = await checker;
			if (result.statusCode === 200) {
				spriteId += "-f";
			}
		}

		const embed = {
			image: {
				url: `${SPRITE_URL}${dir}/${spriteId}${ending}`,
			},
		};

		return message.channel.send({embed});
	},
};
