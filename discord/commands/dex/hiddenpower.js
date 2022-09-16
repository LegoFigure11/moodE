"use strict";

const TYPES = [
	"Fighting",
	"Flying",
	"Poison",
	"Ground",
	"Rock",
	"Bug",
	"Ghost",
	"Steel",
	"Fire",
	"Water",
	"Grass",
	"Electric",
	"Psychic",
	"Ice",
	"Dragon",
	"Dark",
];

module.exports = {
	desc: "Calculates the Hidden Power Type and Power of the provided IVs.",
	usage: "hp/atk/def/spa/spd/spe",
	aliases: ["hp", "hiddenpow"],
	async process(message, args, dex) {
		let ivs;
		if (args[1]) {
			if (args[5]) {
				ivs = args;
			} else {
				return message.channel.send(`${discordConfig.commandCharacter}hiddenpower ${this.usage}`);
			}
		} else {
			const seperators = ["/", ".", "|"];
			for (const seperator of seperators) {
				if (args[0].includes(seperator)) {
					ivs = args[0].split(seperator);
				}
			}
		}
		if (ivs.length !== 6) return message.channel.send(`${discordConfig.commandCharacter}hiddenpower ${this.usage}`);
		for (let i = 0; i < ivs.length; i++) {
			ivs[i] = Tools.toId(ivs[i]);
			if (isNaN(ivs[i])) return message.channel.send(`${discordFailureEmoji} Unable to coerce "${ivs[i]}" as a number!`);
			ivs[i] = parseInt(ivs[i]);
			if (ivs[i] < 0 || ivs[i] > 31) return message.channel.send(`${discordFailureEmoji} ${ivs[i]} must be a number greater than or equal to 0 and less than or equal to 31!`);
		}
		const hp = ivs[0];
		const atk = ivs[1];
		const def = ivs[2];
		const spa = ivs[3];
		const spd = ivs[4];
		const spe = ivs[5];
		const type = TYPES[Math.floor((((hp % 2) + 2 * (atk % 2) + 4 * (def % 2) + 8 * (spe % 2) + 16 * (spa % 2) + 32 * (spd % 2)) * 15) / 63)];
		const power = Math.floor((((powMod(hp) + 2 * powMod(atk) + 4 * powMod(def) + 8 * powMod(spe) + 16 * powMod(spa) + 32 * powMod(spd)) * 40) / 63) + 30);
		return message.channel.send(`${ivs.join("/")}: Hidden Power ${type} (${power})`);
	},
};

function powMod(num) {
	if ([2, 3].includes(num % 4)) {
		return 1;
	} return 0;
}
