"use strict";

const https = require("https");

const utilities = require("../../utilities.js");

const lowKickCalcs = (number) => {
	if (number < 10) {
		return 20;
	}
	if (number < 25) {
		return 40;
	}
	if (number < 50) {
		return 60;
	}
	if (number < 100) {
		return 80;
	}
	if (number < 200) {
		return 100;
	}
	return 120;
};

module.exports = {
	desc: "Prints the information of a Pokémon",
	longDesc: "Gives the number, species name, typing, potential abilities, and stat spread of a Pokémon. If applicable, gives the base species and/or other formes of a Pokémon. If applicable, gives the required items and/or abilities that a Pokémon must have or cannot have. If applicable, mentions the availability of the Pokémon.",
	usage: "<Pokémon name>",
	aliases: ["pokemon", "mon", "stats"],
	options: ["gen"],
	hasCustomFormatting: true,
	async process(message, args, dex) {
		if (!(args[0])) {
			return message.channel.send(`Usage: ${discordConfig.commandCharacter}pokedex <name>`);
		}

		const sendMsg = [];

		let pokemon = dex.getSpecies(args[0]);
		if (!pokemon || !pokemon.exists) {
			pokemon = dex.dataSearch(args[0], ["Pokedex"]);
			if (!pokemon) {
				return message.channel.send(`No Pokémon "${args[0]}" found.`);
			}
			sendMsg.push(`No Pokémon ${args[0]} found. Did you mean ${pokemon[0].name}?`);
			pokemon = dex.getSpecies(pokemon[0].name);
		}
		if (pokemon.gen > dex.gen) {
			return message.channel.send(`${pokemon.name} did not exist in Gen ${dex.gen}; it was introduced in Gen ${pokemon.gen}.`);
		}

		// Must check ability compatibility
		let abilitiesStr = "Ability: <none>";
		if (dex.gen >= 3) {
			abilitiesStr = [pokemon.abilities["0"]];
			if (pokemon.abilities["1"] && dex.getAbility(pokemon.abilities["1"]).gen <= dex.gen) {
				abilitiesStr.push(pokemon.abilities["1"]);
			}
			if (pokemon.abilities["H"]) {
				abilitiesStr.push(pokemon.abilities["H"] + " (Hidden" + (pokemon.unreleasedHidden ? " [Unreleased]" : "") + ")");
			}
			abilitiesStr.length === 1 ? abilitiesStr = 'Ability: ' + abilitiesStr[0] : abilitiesStr = `Abilities: ${abilitiesStr.join(", ")}`; //eslint-disable-line
		}

		const bst = (pokemon.baseStats.hp + pokemon.baseStats.atk + pokemon.baseStats.spa + pokemon.baseStats.spe + pokemon.baseStats.def + pokemon.baseStats.spd);

		const extraInfo = [];

		if (pokemon.otherFormes) {
			const otherFormHelper = [];
			for (let i = 0; i < pokemon.otherFormes.length; i++) {
				const otherForme = dex.getSpecies(pokemon.otherFormes[i]);
				if (otherForme.gen <= dex.gen) {
					otherFormHelper.push(otherForme.name);
				}
			}
			if (otherFormHelper.length > 0) {
				extraInfo.push(`Other formes: ${otherFormHelper.join(", ")}`);
			}
		}

		if (pokemon.prevo) {
			extraInfo.push(`Prevo: ${dex.getSpecies(pokemon.prevo)}`);
		}
		if (pokemon.nfe) {
			const formatEvos = [];
			for (let i = 0; i < pokemon.evos.length; i++) {
				const evo = dex.getSpecies(pokemon.evos[i]);
				if (evo.gen <= dex.gen) {
					formatEvos.push(evo.name);
				}
			}
			extraInfo.push(`Evo: ${formatEvos.join(", ")}`);
		}

		extraInfo.push(`Egg groups: ${pokemon.eggGroups.join(", ")}`);

		const genders = ["M", "F"];
		let genderStr = [];
		for (let i = 0; i < genders.length; i++) {
			if (pokemon.genderRatio[genders[i]]) {
				genderStr.push(`${pokemon.genderRatio[genders[i]] * 100}%${genders[i]}`);
			}
		}
		if (genderStr.length === 0) {
			genderStr = ["Genderless"];
		}
		extraInfo.push(`Gender ratio: ${genderStr.join(", ")}`);

		extraInfo.push("");
		if (pokemon.baseSpecies !== pokemon.name) {
			extraInfo.push(`Base Species: ${pokemon.baseSpecies}`);
		}
		if (pokemon.requiredItems) {
			extraInfo.push(`This Pokémon must hold ${pokemon.requiredItems.join(" or ")} as an item.`);
		}
		if (pokemon.requiredAbility) {
			extraInfo.push(`This Pokémon must have the ability ${pokemon.requiredAbility}.`);
		}
		if (pokemon.unreleasedHidden) {
			extraInfo.push(`This Pokémon's hidden ability is unreleased.`);
		}
		if (pokemon.eventOnly) {
			extraInfo.push(`This Pokémon is only available through events.`);
		}
		if (pokemon.battleOnly) {
			extraInfo.push(`This Pokémon is only available in battle.`);
		}

		const checker = new Promise((resolve, reject) => {
			const req = https.request({"host": "raw.githubusercontent.com",
				"method": "HEAD",
				"path": `kwsch/PKHeX/master/PKHeX.Drawing/Resources/img/Big%20Pokemon%20Sprites/b_${parseInt(pokemon.num)}.png`,
			});

			req.on("response", res => {
				resolve(res);
			});

			req.on("error", err => {
				reject(err);
			});

			req.end();
		});

		let minispriteUrl = `https://raw.githubusercontent.com/kwsch/PKHeX/master/PKHeX.Drawing/Resources/img/Pokemon%20Sprites/${parseInt(pokemon.num)}.png`;

		const result = await checker;
		if (result.statusCode === 200 && dex.gen >= 8) {
			//exists
			minispriteUrl = `https://raw.githubusercontent.com/kwsch/PKHeX/master/PKHeX.Drawing/Resources/img/Big%20Pokemon%20Sprites/b_${parseInt(pokemon.num)}.png`;
		}


		const embed = {
			title: pokemon.name,
			description: `HP: ${pokemon.baseStats.hp} / Atk: ${pokemon.baseStats.atk} / Def: ${pokemon.baseStats.def} / SpA: ${pokemon.baseStats.spa} / SpD: ${pokemon.baseStats.spd} / Spe: ${pokemon.baseStats.spe} (Total: ${bst})\n${abilitiesStr}\n${"Weight: " + pokemon.weightkg + "kg (" + lowKickCalcs(pokemon.weightkg) + " BP); Height: " + pokemon.heightm + "m"}`,
			url: `https://www.smogon.com/dex/${utilities.toSmogonString(dex.gen)}/pokemon/${(pokemon.name.split(" ").join("-")).toLowerCase()}/`,
			author: {
				name: `#${pokemon.num} - ${pokemon.name} [${pokemon.types.join("/")}]`,
				icon_url: minispriteUrl,
			},
			color: utilities.dexColorToDec(Tools.toId(pokemon.color)),
			fields: [{
				name: "Extra Info:",
				value: extraInfo.join("\n") || "None available.",
			}],
			footer: {
				text: `Tier: ${pokemon.tier} | Introduced in Gen ${pokemon.gen}`,
			},
		};

		if (sendMsg.length > 0) message.channel.send(sendMsg);
		return message.channel.send({embed});
	},
};
