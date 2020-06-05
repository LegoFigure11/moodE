/**
 * Tools
 * Cassius - https://github.com/sirDonovan/Cassius
 *
 * This file contains functions that are useful globally.
 *
 * @license MIT license
 */
"use strict";

const https = require("https");
const url = require("url");
const Data = require("./tools-data");
const groups = require("../showdown/src/groups.json");

const whitespaceRegex = new RegExp("\\s+", "g");
const nullCharactersRegex = new RegExp("[\u0000\u200B-\u200F]+", "g");

/**
 * @typedef Learnset
 * @type {Object}
 * @property {{[k: string]: Array<string>}} learnset
 */

/**
 * @typedef TypeChart
 * @type {Object}
 * @property {{[k: string]: number}} damageTaken
 * @property {{[k: string]: number}} [HPivs]
 * @property {{[k: string]: number}} [HPdvs]
 */

/**
 * @typedef FormatData
 * @type {Object}
 * @property {Array<string>} [randomBattleMoves]
 * @property {Array<string>} [randomDoubleBattleMoves]
 * @property {Array<{generation: number, level?: number, moves?: Array<string>, abilities?: Array<string>, pokeball?: string, gender?: string, isHidden?: boolean, shiny?: number | boolean, ivs?: {[k: string]: number}, nature?: string}>} [eventPokemon]
 * @property {string} [tier]
 * @property {string} [doublesTier]
 * @property {string} [requiredItem]
 */

/**
 * @typedef DataTable
 * @type {Object}
 * @property {{[k: string]: Pokemon}} pokedex
 * @property {{[k: string]: Move}} moves
 * @property {{[k: string]: Item}} items
 * @property {{[k: string]: Ability}} abilities
 * @property {{[k: string]: string}} aliases
 * @property {{[k: string]: Learnset}} learnsets
 * @property {{[k: string]: TypeChart}} typeChart
 * @property {{[k: string]: FormatData}} formatsData
 * @property {Array<string>} badges
 * @property {Array<string>} characters
 * @property {Array<Array<string>>} teams
 * @property {Array<string>} trainerClasses
 */

class Tools {
	constructor() {
		/**@type {DataTable} */
		this.data = {
			pokedex: {},
			moves: {},
			items: {},
			abilities: {},
			aliases: {},
			learnsets: {},
			typeChart: {},
			formatsData: {},
			badges: [],
			characters: [],
			teams: [],
			trainerClasses: [],
		};
		this.gen = 7;
		this.dataFilePath = "./data/";
		/**@type {Map<string, Move>} */
		this.MoveCache = new Map();
		/**@type {Map<string, Item>} */
		this.ItemCache = new Map();
		/**@type {Map<string, Ability>} */
		this.AbilityCache = new Map();
		/**@type {Map<string, Pokemon>} */
		this.PokemonCache = new Map();
		/**@type {Map<string, Format>} */
		this.FormatCache = new Map();
		this.loadedData = false;

		this.Data = Data;
	}

	loadData() {
		let typeChart;
		try {
			typeChart = require(`${this.dataFilePath}typechart.js`).BattleTypeChart;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (typeChart) this.data.typeChart = typeChart;

		this.loadPokedex();
		this.loadMoves();
		this.loadItems();
		this.loadAbilities();
		this.loadAliases();
		this.loadLearnsets();
		this.loadFormatsData();
		this.loadBadges();
		this.loadCharacters();
		this.loadTeams();
		this.loadTrainerClasses();

		this.loadedData = true;
	}

	loadPokedex() {
		if (this.loadedData) this.PokemonCache.clear();

		let pokedex;
		try {
			pokedex = require(`${this.dataFilePath}pokedex.js`).BattlePokedex;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (pokedex) this.data.pokedex = pokedex;
	}

	loadMoves() {
		if (this.loadedData) this.MoveCache.clear();

		let moves;
		try {
			moves = require(`${this.dataFilePath}moves.js`).BattleMovedex;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (moves) this.data.moves = moves;
	}

	loadItems() {
		if (this.loadedData) this.ItemCache.clear();

		let items;
		try {
			items = require(`${this.dataFilePath}items.js`).BattleItems;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (items) this.data.items = items;
	}

	loadAbilities() {
		if (this.loadedData) this.AbilityCache.clear();

		let abilities;
		try {
			abilities = require(`${this.dataFilePath}abilities.js`).BattleAbilities;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (abilities) this.data.abilities = abilities;
	}

	loadAliases() {
		let aliases;
		try {
			aliases = require(`${this.dataFilePath}aliases.js`).BattleAliases;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (aliases) this.data.aliases = aliases;
	}

	loadLearnsets() {
		if (this.loadedData) this.PokemonCache.clear();

		let learnsets;
		try {
			learnsets = require(`${this.dataFilePath}learnsets.js`).BattleLearnsets;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (learnsets) this.data.learnsets = learnsets;
	}

	loadFormatsData() {
		if (this.loadedData) this.PokemonCache.clear();

		let formatsData;
		try {
			formatsData = require(`${this.dataFilePath}formats-data.js`).BattleFormatsData;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (formatsData) this.data.formatsData = formatsData;
	}

	loadBadges() {
		let badges;
		try {
			badges = require(`${this.dataFilePath}badges.js`).BattleBadges;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (badges) this.data.badges = badges;
	}

	loadCharacters() {
		let characters;
		try {
			characters = require(`${this.dataFilePath}characters.js`).BattleCharacters;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (characters) this.data.characters = characters;
	}

	loadTeams() {
		let teams;
		try {
			teams = require(`${this.dataFilePath}teams.js`).BattlePokeTeams;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (teams) this.data.teams = teams;
	}

	loadTrainerClasses() {
		let trainerClasses;
		try {
			trainerClasses = require(`${this.dataFilePath}trainer-classes.js`).BattleTrainerClasses;
		} catch (e) {
			if (e.code !== "MODULE_NOT_FOUND") {
				throw e;
			}
		}
		if (trainerClasses) this.data.trainerClasses = trainerClasses;
	}

	/**
  * @param {any} text
  * @return {string}
  */
	toId(text) {
		if (!text) return "";
		const type = typeof text;
		if (type !== "string") {
			if (type === "number") {
				text = `${text}`;
			} else {
				if (text.id) {
					text = text.id;
				} else {
					text = (text.toString ? text.toString() : JSON.stringify(text));
				}
			}
		}
		// Remove the rank character
		const zn = text.replace(/^./, " ");
		// Search for and remove all characters after @ (the status)
		const n = zn.indexOf("@");
		text = text.substring(0, n !== -1 ? n : text.length);
		// Convert to alphanumerical id
		return text.toLowerCase().replace(/[^a-z0-9]/g, "");
	}

	/**
  * @param {any} text
  * @return {string}
  */
	toName(text) {
		if (!text) return "";
		const type = typeof text;
		if (type !== "string") {
			if (type === "number") {
				text = `${text}`;
			} else {
				if (text.name) {
					text = text.name;
				} else {
					text = (text.toString ? text.toString() : JSON.stringify(text));
				}
			}
		}
		if (groups && text.charAt(0) in groups) text = text.substr(1);
		// Crop out the status (which occurs after @)
		const n = text.indexOf("@");
		text = text.substring(0, n !== -1 ? n : text.length);
		return text.trim();
	}

	/**
  * @param {any} text
  * @return {string}
  */
	toString(text) {
		const type = typeof text;
		if (type === "string") return text;
		if (type === "number") return `${text}`;
		if (!text) return "";
		return (text.toString ? text.toString() : JSON.stringify(text));
	}

	discordText() {
		return `[${new Date().toTimeString().split(" ")[0]}] `.grey + `Discord-Bot: `.yellow;
	}

	moodeText() {
		return `[${new Date().toTimeString().split(" ")[0]}] `.grey + `moodE: `.yellow;
	}

	pokemonShowdownText() {
		return `[${new Date().toTimeString().split(" ")[0]}] `.grey + `pokemon-showdown: `.yellow;
	}

	showdownText() {
		return `[${new Date().toTimeString().split(" ")[0]}] `.grey + `PS-Bot: `.yellow;
	}

	/**
  * @param {any} text
  * @return {string}
  */
	toAlphaNumeric(text) {
		text = this.toString(text);
		if (!text) return "";
		return text.replace(/[^a-zA-Z0-9 ]/g, "").trim();
	}

	parseUsernameText(usernameText) {
		let away = false;
		let status = "";
		let username = "";
		const atIndex = usernameText.indexOf("@");
		if (atIndex !== -1) {
			username = usernameText.substr(0, atIndex);
			status = usernameText.substr(atIndex + 1);
			away = status.charAt(0) === "!";
		} else {
			username = usernameText;
		}

		return {away, status, username};
	}

	/**
  * @param {string} text
  * @return {string}
  */
	trim(text) {
		return text.trim().replace(whitespaceRegex, " ").replace(nullCharactersRegex, "");
	}

	/**
  * @param {Array<string>} list
  * @param {string} [formatting]
  * @return {string}
  */
	joinList(list, formatting) {
		if (!list.length) return "";
		if (!formatting) formatting = "";
		if (list.length === 1) {
			return formatting + list[0] + formatting;
		} else if (list.length === 2) {
			return `${formatting + list[0] + formatting} and ${formatting}${list[1]}${formatting}`;
		} else {
			const len = list.length - 1;
			return `${formatting + list.slice(0, len).join(`${formatting}, ${formatting}`) + formatting}, and ${formatting}${list[len]}${formatting}`;
		}
	}

	/**
  * @param {Array<string>} list
  * @param {string} tag
  * @return {string}
  */
	joinListHtml(list, tag) {
		if (!list.length) return "";
		const openingTag = tag;
		const closingTag = `</${tag.substr(1)}`;
		if (list.length === 1) {
			return openingTag + list[0] + closingTag;
		} else if (list.length === 2) {
			return `${openingTag + list[0] + closingTag} and ${openingTag}${list[1]}${closingTag}`;
		} else {
			const len = list.length - 1;
			return `${openingTag + list.slice(0, len).join(`${closingTag}, ${openingTag}`) + closingTag}, and ${openingTag}${list[len]}${closingTag}`;
		}
	}

	/**
  * @param {string} str
  * @return {string}
  */
	escapeHTML(str) {
		if (!str) return "";
		return (`${str}`).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/\//g, "&#x2f;");
	}

	/**
  * @param {string} str
  * @return {string}
  */
	unescapeHTML(str) {
		if (!str) return "";
		return (`${str}`).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&apos;/g, "'").replace(/&#x2f;/g, "/").replace(/&#39;/g, "'").replace(/&#34;/g, "\"");
	}

	/**
  * @param {any} text
  * @param {any} [room]
  * @return {string}
  */
	normalizeMessage(text, room) {
		text = this.toString(text);
		if (!text) return "";
		text = text.trim();
		if (text.startsWith("/wall ")) text = `/announce ${text.substr(6)}`;
		if (text.startsWith("/announce ") && (!room || !Users.self.hasRank(room, "%"))) {
			text = text.substr(10);
			if (!text.includes("**") && text.length <= 296) text = `**${text}**`;
		}
		if (text.length > 300) text = `${text.substr(0, 297)}...`;
		return text;
	}

	/**
  * @param {number} [limit]
  * @return {number}
  */
	random(limit) {
		if (!limit) limit = 2;
		return Math.floor(Math.random() * limit);
	}

	/**
  * @template T
  * @param {Array<T>} array
  * @return {Array<T>}
  */
	shuffle(array) {
		array = array.slice();

		// Fisher-Yates shuffle algorithm
		let currentIndex = array.length;
		let temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex !== 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}
		return array;
	}

	/**
  * @template T
  * @param {Array<T>} array
  * @return {T}
  */
	sampleOne(array) {
		const len = array.length;
		if (!len) throw new Error("Tools.sampleOne() does not accept empty arrays");
		if (len === 1) return array.slice()[0];
		return this.shuffle(array)[0];
	}

	/**
  * @template T
  * @param {Array<T>} array
  * @param {number | string} amount
  * @return {Array<T>}
  */
	sampleMany(array, amount) {
		const len = array.length;
		if (!len) throw new Error("Tools.sampleMany() does not accept empty arrays");
		if (len === 1) return array.slice();
		if (typeof amount === "string") amount = parseInt(amount);
		if (!amount || isNaN(amount)) throw new Error("Invalid amount in Tools.sampleMany()");
		if (amount > len) amount = len;
		return this.shuffle(array).splice(0, amount);
	}

	oxfordJoin(arr) {
		if (arr.length === 0) return [""];
		if (arr.length === 1) return arr[0];
		const firsts = arr.slice(0, arr.length - 1);
		const last = arr[arr.length - 1];
		let lastJoiner = " and ";
		if (arr.length > 2) lastJoiner = ", and ";
		return firsts.join(", ") + lastJoiner + last;
	}

	toTitleCase(str) {
		return str.replace(
			/\w\S*/g,
			function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
			}
		);
	}

	uncacheDir(root) {
		const absoluteRoot = path.resolve(__dirname, `../${root}`);
		for (const key in require.cache) {
			if (key.startsWith(absoluteRoot)) {
				delete require.cache[key];
			}
		}
	}

	/**
  * @param {Pokemon | string} name
  * @return {?Pokemon}
  */
	getPokemon(name) {
		if (name instanceof Data.Pokemon) return name;
		let id = this.toId(name);
		if (id in this.data.aliases) {
			name = this.data.aliases[id];
			id = this.toId(name);
		}
		let pokemon = this.PokemonCache.get(id);
		if (pokemon) return pokemon;
		if (id === "constructor") return null;
		if (!(id in this.data.pokedex)) {
			let aliasTo = "";
			if (id.startsWith("mega") && this.data.pokedex[`${id.slice(4)}mega`]) {
				aliasTo = `${id.slice(4)}mega`;
			} else if (id.startsWith("m") && this.data.pokedex[`${id.slice(1)}mega`]) {
				aliasTo = `${id.slice(1)}mega`;
			} else if (id.startsWith("primal") && this.data.pokedex[`${id.slice(6)}primal`]) {
				aliasTo = `${id.slice(6)}primal`;
			} else if (id.startsWith("p") && this.data.pokedex[`${id.slice(1)}primal`]) {
				aliasTo = `${id.slice(1)}primal`;
			}
			if (aliasTo) {
				const pokemon = this.getPokemon(aliasTo);
				if (pokemon) {
					this.PokemonCache.set(id, pokemon);
					return pokemon;
				}
			}
			return null;
		}
		pokemon = new Data.Pokemon(name, this.data.pokedex[id], this.data.learnsets[id], this.data.formatsData[id]);
		if (!pokemon.tier && !pokemon.doublesTier && pokemon.baseSpecies !== pokemon.species) {
			if (pokemon.baseSpecies === "Mimikyu") {
				pokemon.tier = this.data.formatsData[this.toId(pokemon.baseSpecies)].tier;
				pokemon.doublesTier = this.data.formatsData[this.toId(pokemon.baseSpecies)].doublesTier;
			} else if (pokemon.speciesid.endsWith("totem")) {
				pokemon.tier = this.data.formatsData[pokemon.speciesid.slice(0, -5)].tier;
				pokemon.doublesTier = this.data.formatsData[pokemon.speciesid.slice(0, -5)].doublesTier;
			} else {
				pokemon.tier = this.data.formatsData[this.toId(pokemon.baseSpecies)].tier;
				pokemon.doublesTier = this.data.formatsData[this.toId(pokemon.baseSpecies)].doublesTier;
			}
		}
		if (!pokemon.tier) pokemon.tier = "Illegal";
		if (!pokemon.doublesTier) pokemon.doublesTier = pokemon.tier;
		this.PokemonCache.set(id, pokemon);
		return pokemon;
	}

	/**
  * @param {Pokemon | string} name
  * @return {Pokemon}
  */
	getExistingPokemon(name) {
		const pokemon = this.getPokemon(name);
		if (!pokemon) throw new Error(`Expected Pokemon for '${name}'`);
		return pokemon;
	}

	/**
  * @param {Move | string} name
  * @return {?Move}
  */
	getMove(name) {
		if (name instanceof Data.Move) return name;
		let id = this.toId(name);
		if (id in this.data.aliases) {
			name = this.data.aliases[id];
			id = this.toId(name);
		}
		if (id === "constructor" || !(id in this.data.moves)) return null;
		let move = this.MoveCache.get(id);
		if (move) return move;
		move = new Data.Move(name, this.data.moves[id]);
		this.MoveCache.set(id, move);
		return move;
	}

	/**
  * @param {Move | string} name
  * @return {Move}
  */
	getExistingMove(name) {
		const move = this.getMove(name);
		if (!move) throw new Error(`Expected move for '${name}'`);
		return move;
	}

	/**
  * @param {Item | string} name
  * @return {?Item}
  */
	getItem(name) {
		if (name instanceof Data.Item) return name;
		let id = this.toId(name);
		if (id in this.data.aliases) {
			name = this.data.aliases[id];
			id = this.toId(name);
		}
		if (id === "constructor" || !(id in this.data.items)) return null;
		let item = this.ItemCache.get(id);
		if (item) return item;
		item = new Data.Item(name, this.data.items[id]);
		this.ItemCache.set(id, item);
		return item;
	}

	/**
  * @param {Item | string} name
  * @return {Item}
  */
	getExistingItem(name) {
		const item = this.getItem(name);
		if (!item) throw new Error(`Expected item for '${name}'`);
		return item;
	}

	/**
  * @param {Ability | string} name
  * @return {?Ability}
  */
	getAbility(name) {
		if (name instanceof Data.Ability) return name;
		let id = this.toId(name);
		if (id in this.data.aliases) {
			name = this.data.aliases[id];
			id = this.toId(name);
		}
		if (id === "constructor" || !(id in this.data.abilities)) return null;
		let ability = this.AbilityCache.get(id);
		if (ability) return ability;
		ability = new Data.Ability(name, this.data.abilities[id]);
		this.AbilityCache.set(id, ability);
		return ability;
	}

	/**
  * @param {Ability | string} name
  * @return {Ability}
  */
	getExistingAbility(name) {
		const ability = this.getAbility(name);
		if (!ability) throw new Error(`Expected ability for '${name}'`);
		return ability;
	}

	/**
  * @param {Format | string} name
  * @return {?Format}
  */
	getFormat(name) {
		if (name instanceof Data.Format) return name;
		let id = this.toId(name);
		if (id in this.data.aliases) {
			name = this.data.aliases[id];
			id = this.toId(name);
		}
		if (`gen${this.gen}${id}` in psMessageParser.formatsData) {
			id = `gen${this.gen}${id}`;
		}
		if (id === "constructor" || !(id in psMessageParser.formatsData)) return null;
		let format = this.FormatCache.get(id);
		if (format) return format;
		format = new Data.Format(name, psMessageParser.formatsData[id]);
		this.FormatCache.set(id, format);
		return format;
	}

	/**
  * @param {Format | string} name
  * @return {Format}
  */
	getExistingFormat(name) {
		const format = this.getFormat(name);
		if (!format) throw new Error(`Expected format for '${name}'`);
		return format;
	}

	/**
  * @param {Move | string} source
  * @param {Pokemon | string | Array<string>} target
  * @return {number}
  */
	getEffectiveness(source, target) {
		const sourceType = (typeof source === "string" ? source : source.type);
		let targetType;
		if (typeof target === "string") {
			const pokemon = this.getPokemon(target);
			if (pokemon) {
				targetType = pokemon.types;
			} else {
				targetType = target;
			}
		} else if (target instanceof Array) {
			targetType = target;
		} else {
			targetType = target.types;
		}
		if (targetType instanceof Array) {
			let totalTypeMod = 0;
			for (let i = 0, len = targetType.length; i < len; i++) {
				totalTypeMod += this.getEffectiveness(sourceType, targetType[i]);
			}
			return totalTypeMod;
		}
		const typeData = this.data.typeChart[targetType];
		if (!typeData) return 0;
		switch (typeData.damageTaken[sourceType]) {
		case 1:
			return 1; // super-effective
		case 2:
			return -1; // not very effective
		default:
			return 0;
		}
	}

	/**
  * @param {Move | string} source
  * @param {Pokemon | string | Array<string>} target
  * @return {boolean}
  */
	isImmune(source, target) {
		const sourceType = (typeof source === "string" ? source : source.type);
		let targetType;
		if (typeof target === "string") {
			const pokemon = this.getPokemon(target);
			if (pokemon) {
				targetType = pokemon.types;
			} else {
				targetType = target;
			}
		} else if (target instanceof Array) {
			targetType = target;
		} else {
			targetType = target.types;
		}
		if (targetType instanceof Array) {
			for (let i = 0; i < targetType.length; i++) {
				if (this.isImmune(sourceType, targetType[i])) return true;
			}
			return false;
		}
		const typeData = this.data.typeChart[targetType];
		if (typeData && typeData.damageTaken[sourceType] === 3) return true;
		return false;
	}

	/**
  * @param {number} number
  * @param {{precision?: number, hhmmss?: boolean}} [options]
  * @return {string}
  */
	toDurationString(number, options) {
		const date = new Date(+number);
		const parts = [date.getUTCFullYear() - 1970, date.getUTCMonth(), date.getUTCDate() - 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()];
		const roundingBoundaries = [6, 15, 12, 30, 30];
		const unitNames = ["second", "minute", "hour", "day", "month", "year"];
		const positiveIndex = parts.findIndex(elem => elem > 0);
		const precision = (options && options.precision ? options.precision : parts.length);
		if (options && options.hhmmss) {
			const string = parts.slice(positiveIndex).map(value => value < 10 ? `0${value}` : `${value}`).join(":");
			return string.length === 2 ? `00:${string}` : string;
		}
		// round least significant displayed unit
		if (positiveIndex + precision < parts.length && precision > 0 && positiveIndex >= 0) {
			if (parts[positiveIndex + precision] >= roundingBoundaries[positiveIndex + precision - 1]) {
				parts[positiveIndex + precision - 1]++;
			}
		}
		return parts.slice(positiveIndex).reverse().map((value, index) => value ? `${value} ${unitNames[index]}${value > 1 ? "s" : ""}` : "").reverse().slice(0, precision).join(" ").trim();
	}

	/**
  * @param {string} text
  * @param {Function} callback
  */
	uploadToHastebin(text, callback) {
		if (typeof callback !== "function") return false;
		const action = url.parse("https://hastebin.com/documents");
		const options = {
			hostname: action.hostname,
			path: action.pathname,
			method: "POST",
		};

		const request = https.request(options, response => {
			response.setEncoding("utf8");
			let data = "";
			response.on("data", chunk => {
				data += chunk;
			});
			response.on("end", () => {
				let key;
				try {
					const pageData = JSON.parse(data);
					key = pageData.key;
				} catch (e) {
					if (/^[^<]*<!DOCTYPE html>/.test(data)) {
						return callback(`Cloudflare-related error uploading to Hastebin: ${e.message}`);
					} else {
						return callback(`Unknown error uploading to Hastebin: ${e.message}`);
					}
				}
				callback(`https://hastebin.com/raw/${key}`);
			});
		});

		request.on("error", error => console.log(`Login error: ${error.stack}`));

		if (text) request.write(text);
		request.end();
	}

	/**
  * @template T
  * @param {T} obj
  * @return {T}
  */
	deepFreeze(obj) {
		if (!obj) return obj;
		const type = typeof obj;
		if (type === "function" || type === "string" || type === "number") return obj;
		if (obj instanceof Array) {
			for (let i = 0; i < obj.length; i++) {
				this.deepFreeze(obj[i]);
			}
		} else if (obj instanceof Object) {
			for (const i in obj) {
				this.deepFreeze(obj[i]);
			}
		}
		Object.freeze(obj);
		return obj;
	}

	freezeData() {
		for (const i in this.data.pokedex) {
			this.deepFreeze(this.getPokemon(i));
		}

		for (const i in this.data.moves) {
			this.deepFreeze(this.getMove(i));
		}

		for (const i in this.data.items) {
			this.deepFreeze(this.getItem(i));
		}

		for (const i in this.data.abilities) {
			this.deepFreeze(this.getAbility(i));
		}

		this.deepFreeze(this.data);
	}

	// many thanks to fart (@tmagicturtle) for the following
	hash(text) {
		const MD5 = function (f) {
			function i(b, c) {
				const f = b & 2147483648;
				const g = c & 2147483648;
				const d = b & 1073741824;
				const e = c & 1073741824;
				const h = (b & 1073741823) + (c & 1073741823);
				return d & e ? h ^ 2147483648 ^ f ^ g : d | e ? h & 1073741824 ? h ^ 3221225472 ^ f ^ g : h ^ 1073741824 ^ f ^ g : h ^ f ^ g;
			}
			function j(b, c, d, e, f, g, h) {
				b = i(b, i(i(c & d | ~c & e, f), h));
				return i(b << g | b >>> 32 - g, c);
			}
			function k(b, c, d, e, f, g, h) {
				b = i(b, i(i(c & e | d & ~e, f), h));
				return i(b << g | b >>> 32 - g, c);
			}
			function l(b, c, e, d, f, g, h) {
				b = i(b, i(i(c ^ e ^ d, f), h));
				return i(b << g | b >>> 32 - g, c);
			}
			function m(b, c, e, d, f, g, h) {
				b = i(b, i(i(e ^ (c | ~d), f), h));
				return i(b << g | b >>> 32 - g, c);
			}
			function n(b) {
				let c = "";
				let e = "";
				let d;
				for (d = 0; d <= 3; d++) {
					e = b >>> d * 8 & 255;
					e = `0${e.toString(16)}`;
					c += e.substr(e.length - 2, 2);
				}
				return c;
			}
			let g = [];
			let o, p, q, r, b, c, d, e;
			f = (function (b) {
				for (b = b.replace(/\r\n/g, "\n"), c = "", e = 0; e < b.length; e++) {
					const d = b.charCodeAt(e);
					if (d < 128) {
						c += String.fromCharCode(d);
					} else {
						if (d > 127 && d < 2048) {
							c += String.fromCharCode(d >> 6 | 192);
						} else {
							c += String.fromCharCode(d >> 12 | 224);
							c += String.fromCharCode(d >> 6 & 63 | 128);
							c += String.fromCharCode(d & 63 | 128);
						}
					}
				} return c;
			})(f);
			g = (function (b) {
				let c;
				d = b.length;
				c = d + 8;
				const e = ((c - c % 64) / 64 + 1) * 16;
				const f = Array(e - 1);
				let g = 0;
				let h = 0;
				for (h; h < d; h++) {
					c = (h - h % 4) / 4;
					g = h % 4 * 8;
					f[c] |= b.charCodeAt(h) << g;
				}
				f[(h - h % 4) / 4] |= 128 << h % 4 * 8;
				f[e - 2] = d << 3;
				f[e - 1] = d >>> 29;
				return f;
			})(f);
			b = 1732584193;
			c = 4023233417;
			d = 2562383102;
			e = 271733878;
			for (f = 0; f < g.length; f += 16) {
				o = b;
				p = c;
				q = d;
				r = e;
				b = j(b, c, d, e, g[f + 0], 7, 3614090360);
				e = j(e, b, c, d, g[f + 1], 12, 3905402710);
				d = j(d, e, b, c, g[f + 2], 17, 606105819);
				c = j(c, d, e, b, g[f + 3], 22, 3250441966);
				b = j(b, c, d, e, g[f + 4], 7, 4118548399);
				e = j(e, b, c, d, g[f + 5], 12, 1200080426);
				d = j(d, e, b, c, g[f + 6], 17, 2821735955);
				c = j(c, d, e, b, g[f + 7], 22, 4249261313);
				b = j(b, c, d, e, g[f + 8], 7, 1770035416);
				e = j(e, b, c, d, g[f + 9], 12, 2336552879);
				d = j(d, e, b, c, g[f + 10], 17, 4294925233);
				c = j(c, d, e, b, g[f + 11], 22, 2304563134);
				b = j(b, c, d, e, g[f + 12], 7, 1804603682);
				e = j(e, b, c, d, g[f + 13], 12, 4254626195);
				d = j(d, e, b, c, g[f + 14], 17, 2792965006);
				c = j(c, d, e, b, g[f + 15], 22, 1236535329);
				b = k(b, c, d, e, g[f + 1], 5, 4129170786);
				e = k(e, b, c, d, g[f + 6], 9, 3225465664);
				d = k(d, e, b, c, g[f + 11], 14, 643717713);
				c = k(c, d, e, b, g[f + 0], 20, 3921069994);
				b = k(b, c, d, e, g[f + 5], 5, 3593408605);
				e = k(e, b, c, d, g[f + 10], 9, 38016083);
				d = k(d, e, b, c, g[f + 15], 14, 3634488961);
				c = k(c, d, e, b, g[f + 4], 20, 3889429448);
				b = k(b, c, d, e, g[f + 9], 5, 568446438);
				e = k(e, b, c, d, g[f + 14], 9, 3275163606);
				d = k(d, e, b, c, g[f + 3], 14, 4107603335);
				c = k(c, d, e, b, g[f + 8], 20, 1163531501);
				b = k(b, c, d, e, g[f + 13], 5, 2850285829);
				e = k(e, b, c, d, g[f + 2], 9, 4243563512);
				d = k(d, e, b, c, g[f + 7], 14, 1735328473);
				c = k(c, d, e, b, g[f + 12], 20, 2368359562);
				b = l(b, c, d, e, g[f + 5], 4, 4294588738);
				e = l(e, b, c, d, g[f + 8], 11, 2272392833);
				d = l(d, e, b, c, g[f + 11], 16, 1839030562);
				c = l(c, d, e, b, g[f + 14], 23, 4259657740);
				b = l(b, c, d, e, g[f + 1], 4, 2763975236);
				e = l(e, b, c, d, g[f + 4], 11, 1272893353);
				d = l(d, e, b, c, g[f + 7], 16, 4139469664);
				c = l(c, d, e, b, g[f + 10], 23, 3200236656);
				b = l(b, c, d, e, g[f + 13], 4, 681279174);
				e = l(e, b, c, d, g[f + 0], 11, 3936430074);
				d = l(d, e, b, c, g[f + 3], 16, 3572445317);
				c = l(c, d, e, b, g[f + 6], 23, 76029189);
				b = l(b, c, d, e, g[f + 9], 4, 3654602809);
				e = l(e, b, c, d, g[f + 12], 11, 3873151461);
				d = l(d, e, b, c, g[f + 15], 16, 530742520);
				c = l(c, d, e, b, g[f + 2], 23, 3299628645);
				b = m(b, c, d, e, g[f + 0], 6, 4096336452);
				e = m(e, b, c, d, g[f + 7], 10, 1126891415);
				d = m(d, e, b, c, g[f + 14], 15, 2878612391);
				c = m(c, d, e, b, g[f + 5], 21, 4237533241);
				b = m(b, c, d, e, g[f + 12], 6, 1700485571);
				e = m(e, b, c, d, g[f + 3], 10, 2399980690);
				d = m(d, e, b, c, g[f + 10], 15, 4293915773);
				c = m(c, d, e, b, g[f + 1], 21, 2240044497);
				b = m(b, c, d, e, g[f + 8], 6, 1873313359);
				e = m(e, b, c, d, g[f + 15], 10, 4264355552);
				d = m(d, e, b, c, g[f + 6], 15, 2734768916);
				c = m(c, d, e, b, g[f + 13], 21, 1309151649);
				b = m(b, c, d, e, g[f + 4], 6, 4149444226);
				e = m(e, b, c, d, g[f + 11], 10, 3174756917);
				d = m(d, e, b, c, g[f + 2], 15, 718787259);
				c = m(c, d, e, b, g[f + 9], 21, 3951481745);
				b = i(b, o);
				c = i(c, p);
				d = i(d, q);
				e = i(e, r);
			} return (n(b) + n(c) + n(d) + n(e)).toLowerCase();
		};

		return MD5(this.toId(text));
	}

	HSLToRGB(H, S, L) {
		const C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
		const X = C * (1 - Math.abs((H / 60) % 2 - 1));
		const m = L / 100 - C / 2;

		let R1;
		let G1;
		let B1;
		switch (Math.floor(H / 60)) {
		case 1: R1 = X; G1 = C; B1 = 0; break;
		case 2: R1 = 0; G1 = C; B1 = X; break;
		case 3: R1 = 0; G1 = X; B1 = C; break;
		case 4: R1 = X; G1 = 0; B1 = C; break;
		case 5: R1 = C; G1 = 0; B1 = X; break;
		case 0: default: R1 = C; G1 = X; B1 = 0; break;
		}
		const R = R1 + m;
		const G = G1 + m;
		const B = B1 + m;
		return {R, G, B};
	}

	toHex(x) {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? `0${hex}` : hex;
	}

	hashColor(name, type = 0) {
		const hashed = this.hash(this.toId(name));
		const H = parseInt(hashed.substr(4, 4), 16) % 360; // 0 to 360
		const S = parseInt(hashed.substr(0, 4), 16) % 50 + 40; // 40 to 89
		let L = Math.floor(parseInt(hashed.substr(8, 4), 16) % 20 + 30); // 30 to 49
		const {R, G, B} = this.HSLToRGB(H, S, L);
		const lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722; // 0.013 (dark blue) to 0.737 (yellow)
		let HLmod = (lum - 0.2) * -150; // -80 (yellow) to 28 (dark blue)
		if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
		else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
		else HLmod = 0;
		// let mod = ';border-right: ' + Math.abs(HLmod) + 'px solid ' + (HLmod > 0 ? 'red' : '#0088FF');
		const Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
		if (Hdist < 15) {
			HLmod += (15 - Hdist) / 3;
		}

		L += HLmod;

		const r = this.HSLToRGB(H, S, L);
		if (type === 1) return `#${this.toHex(r["R"])}${this.toHex(r["G"])}${this.toHex(r["B"])}`;
		return `#${this.toHex(r["R"])}${this.toHex(r["G"])}${this.toHex(r["B"])} | hsl(${Math.round(H)}, ${Math.round(S)}, ${L})`;
	}
}

const tools = new Tools();
tools.loadData();

module.exports = tools;
