/************************************************************************************************************************************/
/*                                                                                                                                  */
/* From https://github.com/smogon/pokemon-showdown/blob/dde822edd3428b4b0880eea6574d86c6864f80f7/server/chat-commands/info.js#L2232 */
/*                                                                                                                                  */
/************************************************************************************************************************************/

"use strict";

module.exports = {
	desc: "Rolls a dice with <number> sides.",
	longDesc: [`${discordConfig.commandCharacter}dice <max number> - Randomly picks a number between 1 and the number you choose.`,
		`${discordConfig.commandCharacter}dice <number of dice>d<number of sides> - Simulates rolling a number of dice, e.g., ${discordConfig.commandCharacter}dice 2d4 simulates rolling two 4-sided dice.`,
		`${discordConfig.commandCharacter}dice <number of dice>d<number of sides><+/-><offset> - Simulates rolling a number of dice and adding an offset to the sum, e.g., ${discordConfig.commandCharacter}dice 2d6+10: two standard dice are rolled; the result lies between 12 and 22.`,
		`${discordConfig.commandCharacter}dice <number of dice>d<number of sides>-<H/L> - Simulates rolling a number of dice with removal of extreme values, e.g., /dice 3d8-L: rolls three 8-sided dice; the result ignores the lowest value.`],
	usage: "<number of sides>",
	aliases: ["roll"],
	async process(message, args) {
		let target = args.join("");

		const maxDice = 40;

		let diceQuantity = 1;
		const diceDataStart = target.indexOf("d");
		if (diceDataStart >= 0) {
			if (diceDataStart) diceQuantity = Number(target.slice(0, diceDataStart));
			target = target.slice(diceDataStart + 1);
			if (!Number.isInteger(diceQuantity) || diceQuantity <= 0 || diceQuantity > maxDice) return message.channel.send(`The amount of dice rolled should be a whole number up to ${maxDice}.`);
		}
		let offset = 0;
		let removeOutlier = 0;
		const modifierData = target.match(/[+-]/);
		if (modifierData) {
			switch (target.slice(modifierData.index).trim().toLowerCase()) {
			case "-l":
				removeOutlier = -1;
				break;
			case "-h":
				removeOutlier = +1;
				break;
			default:
				offset = Number(target.slice(modifierData.index));
				if (isNaN(offset)) return message.channel.send(this.longDesc);
				if (!Number.isSafeInteger(offset)) return message.channel.send(`The specified offset must be an integer up to ${Number.MAX_SAFE_INTEGER}.`);
			}
			if (removeOutlier && diceQuantity <= 1) return message.channel.send(`More than one dice should be rolled before removing outliers.`);
			target = target.slice(0, modifierData.index);
		}

		let diceFaces = 6;
		if (target.length) {
			diceFaces = Number(target);
			if (!Number.isSafeInteger(diceFaces) || diceFaces <= 0) {
				return message.channel.send(`Rolled dice must have a natural amount of faces up to ${Number.MAX_SAFE_INTEGER}.`);
			}
		}

		if (diceQuantity > 1) {
			// Make sure that we can deal with high rolls
			if (!Number.isSafeInteger(offset < 0 ? diceQuantity * diceFaces : diceQuantity * diceFaces + offset)) {
				return message.channel.send(`The maximum sum of rolled dice must be lower or equal than ${Number.MAX_SAFE_INTEGER}.`);
			}
		}
		let maxRoll = 0;
		let minRoll = Number.MAX_SAFE_INTEGER;

		const trackRolls = diceQuantity * (("" + diceFaces).length + 1) <= 60;
		const rolls = [];
		let rollSum = 0;

		for (let i = 0; i < diceQuantity; ++i) {
			const curRoll = Math.floor(Math.random() * diceFaces) + 1;
			rollSum += curRoll;
			if (curRoll > maxRoll) maxRoll = curRoll;
			if (curRoll < minRoll) minRoll = curRoll;
			if (trackRolls) rolls.push(curRoll);
		}

		// Apply modifiers

		if (removeOutlier > 0) {
			rollSum -= maxRoll;
		} else if (removeOutlier < 0) {
			rollSum -= minRoll;
		}
		if (offset) rollSum += offset;

		// Reply with relevant information

		let offsetFragment = "";
		if (offset) offsetFragment += (offset > 0 ? " + " + offset : offset);

		if (diceQuantity === 1) return message.channel.send(`Rolling (1 to ${diceFaces})${offsetFragment}: ${rollSum}`);
		const outlierFragment = removeOutlier ? ` except ${removeOutlier > 0 ? "highest" : "lowest"}` : ``;
		const rollsFragment = trackRolls ? ": " + rolls.join(", ") : "";
		return message.channel.send(
			`\`\`\`${diceQuantity} rolls (1 to ${diceFaces})${rollsFragment}\nSum${offsetFragment}${outlierFragment}: ${rollSum}\`\`\``
		);
	},
};
