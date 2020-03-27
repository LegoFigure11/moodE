"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Prints the information of an item.",
	longDesc: "Gives a description of an item's effects and the generation it was introduced in. If applicable, the fling power and fling status effect is given. If applicable, the base power of the move Natural Gift and its type is given.",
	usage: "<item name>",
	options: ["gen"],
	aliases: ["items"],
	hasCustomFormatting: true,
	async process(message, args, dex) {
		if (!(args[0])) {
			return message.channel.send(`Usage: ${discordConfig.commandCharacter}item <name>`);
		}

		const sendMsg = [];

		let item = dex.getItem(args[0]);
		if (!item || !item.exists) {
			item = dex.dataSearch(args[0], ["Items"]);
			if (!item) {
				return message.channel.send(`No item "${args[0]}" found.`);
			}
			sendMsg.push(`No item "${args[0]}" found. Did you mean ${item[0].name}?\n`);
			item = dex.getItem(item[0].name);
		}
		if (item.gen > dex.gen) {
			return message.channel.send(`${item.name} did not exist in Gen ${dex.gen}; it was introduced in Gen ${item.gen}.`);
		}

		const embed = {
			title: item.name,
			description: item.desc || "No description availible.",
			url: `https://www.smogon.com/dex/${utilities.toSmogonString(dex.gen)}/items/${(item.name.split(" ").join("-")).toLowerCase()}/`,
			author: {
				name: item.name,
				icon_url: "https://play.pokemonshowdown.com/sprites/itemicons/" + (item.name.split(" ").join("-")).toLowerCase() + ".png",
			},
			color: message.channel.type === "dm" ? 0 : message.guild.members.cache.get(discordConfig.botID).displayColor,
			fields: [],
			footer: {
				text: `Introduced in Gen ${item.gen}`,
			},
		};
		if (item.naturalGift) {
			embed.fields.push({name: "Natural Gift", value: `Power: ${(item.naturalGift.basePower || "N/A")}\nType: ${(item.naturalGift.type || "N/A")}`});
		}
		if (item.fling) {
			embed.fields.push({name: "Fling", value: `Power: ${(item.fling.basePower || "-")}\nStatus: ${((item.fling.status || item.fling.volatileStatus) || "None")}`});
		}

		if (sendMsg.length > 0) message.channel.send(sendMsg);
		return message.channel.send({embed});
	},
};
