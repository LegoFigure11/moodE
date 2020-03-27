"use strict";

const utilities = require("../../utilities.js");

module.exports = {
	desc: "Prints the information of an ability",
	longDesc: [
		"Gives information on the effects of an ability and rates it. The rating scale goes from -2 to 5 and is based on its usefulness in a singles battle.",
		"-2: Extremely detrimental",
		"The sort of ability that relegates Pokemon with Uber-level BSTs into NU. ex. Slow Start, Truant",
		"-1: Detrimental",
		"An ability that does more harm than good. ex. Defeatist, Normalize",
		"0: Useless",
		"An ability with no net effect during a singles battle. ex. Healer, Illuminate",
		"1: Ineffective",
		"An ability that has a minimal effect. Should not be chosen over any other ability. ex. Damp, Shell Armor",
		"2: Situationally useful",
		"An ability that can be useful in certain situations. ex. Blaze, Insomnia",
		"3: Useful",
		"An ability that is generally useful. ex. Infiltrator, Sturdy",
		"4: Very useful",
		"One of the most popular abilities. The difference between 3 and 4 can be ambiguous. ex. Protean, Regenerator",
		"5: Essential",
		"The sort of ability that defines metagames. ex. Desolate Land, Shadow Tag",
	],
	usage: "<ability name>",
	options: ["gen"],
	aliases: ["abilities", "abil"],
	hasCustomFormatting: true,
	async process(message, args, dex) {
		if (!(args[0])) {
			return message.channel.send(`Usage: ${discordConfig.commandCharacter}pokedex <name>`);
		}

		if (dex.gen < 3) {
			return message.channel.send("Abilities did not exist until gen3.");
		}

		const sendMsg = [];

		let ability = dex.getAbility(args[0]);
		if (!ability || !ability.exists) {
			ability = dex.dataSearch(args[0], ["Abilities"]);
			if (!ability) {
				return message.channel.send(`No ability ${args[0]} found.`);
			}
			sendMsg.push(`No ability ${args[0]} found. Did you mean ${args[0].name}?`);
			ability = dex.getAbility(ability[0].name);
		}
		if (ability.gen > dex.gen) {
			return message.channel.send(`${ability.name} did not exist in Gen ${dex.gen}; it was introduced in Gen ${ability.gen}.`);
		}

		const embed = {
			title: ability.name,
			description: ability.desc || ability.shortDesc,
			url: `https://www.smogon.com/dex/${utilities.toSmogonString(dex.gen)}/abilities/${(ability.name.split(" ").join("-")).toLowerCase()}/`,
			author: {
				name: ability.name,
				icon_url: "https://cdn.bulbagarden.net/upload/9/9a/Bag_Ability_Urge_Sprite.png",
			},
			color: message.channel.type === "dm" ? 0 : message.guild.members.cache.get(client.user.id).displayColor,
			fields: [{
				name: "Extra Info:",
				value: `Rating: ${ability.rating}`,
			}],
			footer: {
				text: `Introduced in Gen ${ability.gen}`,
			},
		};

		if (sendMsg.length > 0) message.channel.send(sendMsg);
		return message.channel.send({
			embed,
		});
	},
};
