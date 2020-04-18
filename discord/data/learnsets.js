
/*******************************************************************************/
/* From https://github.com/JsKingBoo/SableyeBot3/blob/master/utils/Learnset.js */
/*******************************************************************************/

"use strict";

const learnsetCache = {};

class Learnset {
	constructor(pokemon, dex) {
		if (typeof pokemon === "string") {
			pokemon = dex.getSpecies(pokemon);
		}

		this.pokemon = pokemon.id;
		this.learnset = [];
		this.gen = dex.gen;

		pokemon.learnset = dex.getLearnsetData(this.pokemon);

		if (learnsetCache[this.gen] && learnsetCache[this.gen][this.pokemon]) {
			this.learnset = learnsetCache[this.gen][this.pokemon];
			return;
		}

		const alreadyChecked = {};
		let srcMon = "direct";

		do {
			alreadyChecked[pokemon.speciesid] = true;

			// Does not have its own learnset (e.g. Mega form); take from base
			if (!pokemon.learnset.learnset) {
				if (pokemon.baseSpecies !== pokemon.species) {
					pokemon.learnset = dex.getLearnsetData(pokemon.baseSpecies);
					srcMon = "base species";
					continue;
				}
				break;
			}

			const moves = Object.keys(pokemon.learnset.learnset);
			for (let i = 0; i < moves.length; i++) {
				const move = moves[i];
				for (let j = 0; j < pokemon.learnset.learnset[move].length; j++) {
					const moveEntry = pokemon.learnset.learnset[move][j];
					const gen = moveEntry.charAt(0);
					const method = moveEntry.charAt(1);
					let lvl = -1;
					if (method === "S" || method === "L") {
						lvl = moveEntry.slice(2);
					}

					const moveObj = {
						"name": move,
						"gen": parseInt(gen),
						"method": method,
						"source": srcMon,
						"level": lvl,
					};

					this.learnset.push(moveObj);
				}
			}

			if (pokemon.species === "Lycanroc-Dusk") {
				pokemon = dex.getSpecies("Rockruff-Dusk");
			} else if (pokemon.prevo) {
				pokemon = dex.getSpecies(pokemon.prevo);
				srcMon = "prevo";
				if (pokemon.gen > this.gen) {
					pokemon = null;
				}
			} else if (pokemon.baseSpecies && pokemon.baseSpecies === "Rotom") {
				pokemon = dex.getSpecies(pokemon.baseSpecies);
				srcMon = "base species";
			} else {
				pokemon = null;
			}
		} while (pokemon && pokemon.species && !alreadyChecked[pokemon.speciesid]);

		if (!learnsetCache[this.gen]) {
			learnsetCache[this.gen] = {};
		}
		learnsetCache[this.gen][this.pokemon] = this.learnset;
	}

	findMove(moveid, gen = null) {
		const moves = [];
		for (let i = 0; i < this.learnset.length; i++) {
			if (this.learnset[i].name === moveid) {
				if (!gen || this.learnset[i].gen === gen) {
					moves.push(this.learnset[i]);
				}
			}
		}
		return moves;
	}

	canHaveMove(moveid, gen = null, transfer = true) {
		for (let i = 0; i < this.learnset.length; i++) {
			if (this.learnset[i].name !== moveid) {
				continue;
			}
			if (gen && this.learnset[i].gen > gen) {
				continue;
			}
			if (!transfer) {
				if (gen && this.learnset[i].gen !== gen) {
					continue;
				}
				if (!gen && this.learnset[i].gen !== this.gen) {
					continue;
				}
			}
			return true;
		}
		return false;
	}

	movesArray(transfer = true) {
		const arr = [];
		for (let i = 0; i < this.learnset.length; i++) {
			if (transfer || this.learnset[i].gen === this.gen) {
				arr.push(this.learnset[i].name);
			}
		}
		return arr;
	}
}

module.exports = Learnset;
