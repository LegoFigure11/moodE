"use strict";

const https = require("https");
const probe = require("probe-image-size");

const SPRITE_URL = "https://play.pokemonshowdown.com/sprites/";

module.exports = {
	desc: "Image link of a Pokémon, or link to sprite directory if no argument is given. Uses PokemonShowdown's sprite library.",
	usage: "<Pokémon name>",
	aliases: ["gif", "model"],
	options: ["shiny", "back", "female", "noani", "afd", "gen"],
	hasCustomFormatting: true,
	async process(args, room, user, dex) {
		if (!(args[0])) {
			return user.say("All sprites can be viewed here: https://play.pokemonshowdown.com/sprites/");
		}

		let pokemon = dex.getSpecies(args[0]);
		if (!pokemon || !pokemon.exists) {
			pokemon = dex.dataSearch(args[0], ["Pokedex"]);
			if (!pokemon) {
				return room.say(`No Pokémon ${args[0]} found.`);
			}
			pokemon = dex.getSpecies(pokemon[0].name);
		}

		if (pokemon.gen > dex.gen) {
			return room.say(`${pokemon.name} did not exist in Gen ${dex.gen}; it was introduced in Gen ${pokemon.gen}.`);
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
			dir = "afd" + dir;
			return `${SPRITE_URL}${dir}/${spriteId}.png`;
		}

		dir = genData + dir;
		if (dir === "") {
			dir = "gen6";
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

		const html = `<img src="${SPRITE_URL}${dir}/${spriteId}${ending}" width="0" height="0" style="width:auto; height:auto; display: block; margin-left: auto; margin-right: auto;" />`;

		return room.say(`/adduhtml ${pokemon.name}-sprite-${genNum}, ${html}`);
	},
};
