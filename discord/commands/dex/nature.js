"use strict";

const backwardNatures = {
	atk: {
		atk: "Hardy",
		def: "Lonely",
		spa: "Adamant",
		spd: "Naughty",
		spe: "Brave",
	},
	def: {
		atk: "Bold",
		def: "Docile",
		spa: "Impish",
		spd: "Lax",
		spe: "Relaxed",
	},
	spa: {
		atk: "Modest",
		def: "Mild",
		spa: "Bashful",
		spd: "Rash",
		spe: "Quiet",
	},
	spd: {
		atk: "Calm",
		def: "Gentle",
		spa: "Careful",
		spd: "Quirky",
		spe: "Sassy",
	},
	spe: {
		atk: "Timid",
		def: "Hasty",
		spa: "Jolly",
		spd: "Naive",
		spe: "Serious",
	},
};

const stats = ["atk", "def", "spa", "spd", "spe"];

module.exports = {
	desc: "Prints the information of a nature, or returns the nature given the boosted and hindered stat.",
	usage: "<nature name> | (<abbreviated boosted stat>, <abbreviated hindered stat>)",
	aliases: ["natures"],
	options: ["gen"],
	hasCustomFormatting: true,
	async process(message, args, dex) {
		if (!(args[0])) {
			return message.channel.send(`Usage: ${discordConfig.commandCharacter}nature <name> | (<abbreviated boosted stat>, <abbreviated hindered stat>)`);
		}

		if (dex.gen < 3) {
			return message.channel.send("Natures did not exist until Gen 3.");
		}

		const sendMsg = [];

		let nature = dex.getNature(args[0]);
		if (!nature || !nature.exists) {
			nature = dex.dataSearch(args[0], ["Natures"]);
			if (!nature) {
				if (args.length < 2) {
					return message.channel.send(`No nature "${args[0]}" found.`);
				}
				if (!stats.includes(args[0]) || !stats.includes(args[1])) {
					return message.channel.send(`${args[0]}, ${args[1]} not recognized.`);
				}
				nature = dex.getNature(backwardNatures[args[0]][args[1]]);
			} else {
				sendMsg.push(`No nature ${args[0]} found. Did you mean ${nature[0].name}?`);
				nature = dex.getNature(nature[0].name);
			}
		}

		const embed = {
			description: nature.plus ? `The user's ${toStatName(nature.plus)} is boosted by x1.1; however, its ${toStatName(nature.minus)} is lowered by x1.1.` : "All of the user's stat growths are unchanged.",
			author: {
				name: nature.name,
				icon_url: natureToMint(nature.plus),
			},
			color: message.channel.type === "dm" ? 0 : message.guild.members.cache.get(client.user.id).displayColor,
			footer: {
				text: `Introduced in Gen 3`,
			},
		};

		if (sendMsg.length > 0) message.channel.send(sendMsg);
		return message.channel.send({embed});
	},
};

function natureToMint(stat) {
	let url = "https://cdn.bulbagarden.net/upload/0/03/Bag_Serious_Mint_Sprite.png";
	if (stat === "atk") {
		url = "https://cdn.bulbagarden.net/upload/6/6b/Bag_Lonely_Mint_Sprite.png";
	}
	if (stat === "def") {
		url = "https://cdn.bulbagarden.net/upload/1/17/Bag_Bold_Mint_Sprite.png";
	}
	if (stat === "spa") {
		url = "https://cdn.bulbagarden.net/upload/8/8f/Bag_Modest_Mint_Sprite.png";
	}
	if (stat === "spd") {
		url = "https://cdn.bulbagarden.net/upload/c/c6/Bag_Calm_Mint_Sprite.png";
	}
	if (stat === "spe") {
		url = "https://cdn.bulbagarden.net/upload/e/e5/Bag_Timid_Mint_Sprite.png";
	}
	return url;
}

function toStatName(short) {
	if (short === "atk") return "Attack";
	if (short === "def") return "Defense";
	if (short === "spa") return "Sp. Attack";
	if (short === "spd") return "Sp. Defense";
	if (short === "spe") return "Speed";
	return undefined;
}
