/********************************************************************************************/
/* From https://github.com/JsKingBoo/SableyeBot3/blob/master/commands/dex_commands/learn.js */
/********************************************************************************************/

"use strict";

const path = require("path");
const Learnset = require(path.resolve(__dirname, "../../data/learnsets.js"));

const sourceNames = {
	E: "egg",
	D: "dream world",
	S: "event",
	L: "level up",
	M: "TM, HM or TR",
	T: "tutor",
	X: "egg, traded back",
	Y: "event, traded back",
	V: "VC transfer",
};

module.exports = {
	desc: "Learnset of a Pokémon, how a Pokémon learns a move(s), or Pokémon than can learn a move.",
	longDesc: "If a Pokémon and a list of one or more moves are supplied, gives information on how the Pokémon learns the move(s). If only a Pokémon is supplied, gives the learnset of that Pokémon. If only a move is supplied, gives a list of Pokémon than can learn the move.",
	usage: "(<Pokémon name>[, <move name>]...)|<move name>",
	aliases: ["learnset"],
	async process(message, args, dex) {
		if (!args[0]) return message.channel.send(`${discordConfig.commandCharacter}learn ${this.usage}`);
		const sendMsg = [];

		let pokemon = dex.getSpecies(args[0]);
		const moves = [];
		if (!pokemon || !pokemon.exists) {
			pokemon = dex.dataSearch(args[0], ["Pokedex", "Moves"]);
			if (!pokemon.exists || pokemon[0].searchType === "move") {
				pokemon = null;
				if (args.length === 1) {
					args.push(args[0]);
				} else {
					args[1] = args[0];
				}
			} else {
				sendMsg.push(`No Pokémon "${args[0]}" found. Did you mean ${pokemon[0].name}?`);
				pokemon = dex.getSpecies(pokemon[0].name);
			}
		}

		if (pokemon && pokemon.gen > dex.gen) {
			return message.channel.send(`${pokemon.species} did not exist in gen${dex.gen}; it was introduced in gen${pokemon.gen}.`);
		}

		if (args.length > 1) {
			const list = args.slice(1);
			for (const i in list) {
				let move = dex.getMove(list[i]);
				if (!move || !move.exists) {
					move = dex.dataSearch(list[i], ["Movedex"]);
					if (!move) {
						move = null;
					} else {
						sendMsg.push(`No move ${list[i]} found. Did you mean ${move[0].name}?`);
						moves.push(dex.getMove(move[0].name));
					}
				} else {
					moves.push(move);
				}
				if (move && move.gen > dex.gen) {
					return message.channel.send(`${move.name} did not exist in gen${dex.gen}; it was introduced in gen${move.gen}.`);
				}
			}
		}

		if (!pokemon && !moves.length) {
			return message.channel.send(`No Pokémon nor move recognized.`);
		}

		const learnset = (pokemon ? new Learnset(pokemon, dex) : null);

		if (pokemon && !moves.length) {
			const moveNames = {};
			let sketch = false;
			for (let i = 0; i < learnset.learnset.length; i++) {
				const moveEntry = learnset.learnset[i];
				if (moveEntry.gen > dex.gen) {
					continue;
				}
				if (moveEntry.name === "sketch") {
					sketch = true;
				}
				moveNames[dex.getMove(moveEntry.name).name] = 1;
			}

			const listMoves = Object.keys(moveNames).sort();
			if (listMoves.length === 0) {
				return message.channel.send(`${pokemon.name} is not present in Generation ${dex.gen}.`);
			}
			sendMsg.push(`${pokemon.name}'s learnset:`);
			sendMsg.push(listMoves.join(", "));
			if (sketch) {
				sendMsg.push("Note: This Pokémon can learn Sketch and any Sketch-able moves.");
			}
		} else if (!pokemon && moves.length) {
			const move = moves[0];
			const allMons = Object.keys(dex.data.Pokedex);
			const validMons = [];
			for (let i = 0; i < allMons.length; i++) {
				if (dex.data.Pokedex[allMons[i]].num <= 0) continue; // Prevent CAP
				const Species = dex.getSpecies(allMons[i]);
				const monset = new Learnset(Species, dex);
				if (monset.canHaveMove(move.id, dex.gen, true)) {
					validMons.push(dex.data.Pokedex[allMons[i]].name);
				}
			}
			sendMsg.push(`Pokémon that can learn ${move.name}:`);
			sendMsg.push(validMons.join(", "));
		} else if (pokemon && moves.length) {
			for (const i in moves) {
				const move = moves[i];
				let search = learnset.findMove(move.id, dex.gen);
				if (search.length === 0) {
					search = learnset.findMove(move.id, null);
					if (search.length === 0) {
						sendMsg.push(`${pokemon.name} cannot learn ${move.name} in gen${dex.gen}`);
						continue;
					} else {
						sendMsg.push(`${pokemon.name} can learn ${move.name} in another generation.`);
						continue;
					}
				}
				const parseResults = {};
				for (let i = 0; i < search.length; i++) {
					const learnsetMove = search[i];
					if (!parseResults[learnsetMove.gen]) {
						parseResults[learnsetMove.gen] = {};
					}
					if (!parseResults[learnsetMove.gen][learnsetMove.source]) {
						parseResults[learnsetMove.gen][learnsetMove.source] = {};
					}
					if (!parseResults[learnsetMove.gen][learnsetMove.source][learnsetMove.method]) {
						parseResults[learnsetMove.gen][learnsetMove.source][learnsetMove.method] = [];
					}
					parseResults[learnsetMove.gen][learnsetMove.source][learnsetMove.method].push(learnsetMove.level);
				}
				sendMsg.push(`${pokemon.name} can learn ${move.name} in:`);
				const resultGens = Object.keys(parseResults);
				for (let i = 0; i < resultGens.length; i++) {
					sendMsg.push(`Gen${resultGens[i]}:`);
					const resultSources = Object.keys(parseResults[resultGens[i]]);
					for (let j = 0; j < resultSources.length; j++) {
						let sourceLine = `  ${resultSources[j]}: `;
						const resultMethod = Object.keys(parseResults[resultGens[i]][resultSources[j]]);
						for (let k = 0; k < resultMethod.length; k++) {
							sourceLine += sourceNames[resultMethod[k]];
							if (resultMethod[k] === "S" || resultMethod[k] === "L") {
								sourceLine += ` (${parseResults[resultGens[i]][resultSources[j]][resultMethod[k]].join(",")})`;
							}
							sourceLine += "; ";
						}
						sendMsg.push(sourceLine);
					}
				}
				sendMsg.push("");
			}
		}

		return message.channel.send(sendMsg);
	},
};
