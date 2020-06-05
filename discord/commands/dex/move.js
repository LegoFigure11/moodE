"use strict";

const utilities = require("../../utilities.js");

const stats = ["atk", "def", "spa", "spd", "spe", "accuracy", "evasion"];

const exceptions_100_fight = ["Low Kick", "Reversal", "Final Gambit"];
const exceptions_80_fight = ["Double Kick", "Triple Kick"];
const exceptions_75_fight = ["Counter", "Seismic Toss"];
const exceptions_140 = ["Crush Grip", "Wring Out", "Magnitude", "Double Iron Bash"];
const exceptions_130 = ["Pin Missile", "Power Trip", "Punishment", "Dragon Darts", "Dual Chop", "Electro Ball", "Heat Crash",
	"Bullet Seed", "Grass Knot", "Bonemerang", "Bone Rush", "Fissure", "Icicle Spear", "Sheer Cold", "Weather Ball", "Tail Slap", "Guillotine", "Horn Drill",
	"Flail", "Return", "Frustration", "Endeavor", "Natural Gift", "Trump Card", "Stored Power", "Rock Blast", "Gear Grind", "Gyro Ball", "Heavy Slam", "Bolt Beak (Doubled)", "Fishious Rend (Doubled)"];
const exceptions_120 = ["Double Hit", "Spike Cannon"];
const exceptions_100 = ["Twineedle", "Beat Up", "Fling", "Dragon Rage", "Nature's Madness", "Night Shade", "Comet Punch", "Fury Swipes", "Sonic Boom", "Bide",
	"Super Fang", "Present", "Spit Up", "Psywave", "Mirror Coat", "Metal Burst"];

module.exports = {
	desc: "Prints the information of a move",
	longDesc: "Gives the type, category, power, Z-crystal effects, accuracy, PP, description, priority, target, generation, viability, contest type, and ability interactions of a move. An accuracy of 'true' means that the move does not perform an accuracy check.",
	usage: "<move name>",
	options: ["gen"],
	aliases: ["moves", "attack"],
	hasCustomFormatting: true,
	async process(message, args, dex) {
		if (!(args[0])) {
			return message.channel.send(`Useage: ${discordConfig.commandCharacter}move <name>`);
		}

		const sendMsg = [];

		let move = dex.getMove(args[0]);
		if (!move || !move.exists) {
			move = dex.dataSearch(args[0], ["Movedex"]);
			if (!move) {
				return message.channel.send(`No move "${args[0]}" found.`);
			}
			sendMsg.push(`No move "${args[0]}" found. Did you mean ${move[0].name}?`);
			move = dex.getMove(move[0].name);
		}
		if (move.gen > dex.gen) {
			return message.channel.send(`${move.name} did not exist in Gen ${dex.gen}; it was introduced in Gen ${move.gen}.`);
		}

		let zStr = "";
		if (dex.gen === 7 || dex.gen === 0) {
			if (move.isZ) {
				zStr = `(${dex.getItem(move.isZ).name})`;
			} else if (move.zMoveEffect) {
				zStr = `(Z: ${move.zMoveEffect})`;
			} else if (move.zMoveBoost) {
				zStr = [];
				for (let i = 0; i < stats.length; i++) {
					if (move.zMoveBoost[stats[i]]) {
						zStr.push(`${stats[i].slice(0, 3).toUpperCase()}+${move.zMoveBoost[stats[i]]}`);
					}
				}
				zStr = `(Z: ${zStr.join(",")})`;
			} else {
				zStr = `(Z: ${move.zMovePower})`;
			}
			zStr = ` ${zStr}`;
		}

		let maxPower = "";
		if (dex.gen === 8 && move.basePower && move.basePower > 0) {
			if (move.type === "Fighting" || move.type === "Poison") {
				if (move.basePower >= 150 || exceptions_100_fight.includes(move.name)) maxPower = 100;
				else if (move.basePower >= 110) maxPower = 95;
				else if (move.basePower >= 75) maxPower = 90;
				else if (move.basePower >= 65) maxPower = 85;
				else if (move.basePower >= 55 || exceptions_80_fight.includes(move.name)) maxPower = 80;
				else if (move.basePower >= 45 || exceptions_75_fight.includes(move.name)) maxPower = 75;
				else maxPower = 70;
			} else {
				if (move.basePower >= 150) maxPower = 150;
				else if (move.basePower >= 110 || exceptions_140.includes(move.name)) maxPower = 140;
				else if (move.basePower >= 75 || exceptions_130.includes(move.name)) maxPower = 130;
				else if (move.basePower >= 65 || exceptions_120.includes(move.name)) maxPower = 120;
				else if (move.basePower >= 55 || exceptions_100.includes(move.name)) maxPower = 110;
				else if (move.basePower >= 45) maxPower = 100;
				else maxPower = 90;
			}
			maxPower = ` (Max Move Power: ${maxPower})`;
		}

		let behaviorFlags = "";
		if (move.flags.bullet) {
			behaviorFlags += "Has no effect on Pokemon with the Ability Bulletproof. ";
		}
		if (move.flags.protect) {
			behaviorFlags += "Blocked by Detect, Protect, Spiky Shield, and if not a Status move, King's Shield. ";
		}
		if (move.flags.mirror) {
			behaviorFlags += "Can be copied by Mirror Move. ";
		}
		if (move.flags.authentic) {
			behaviorFlags += "Ignores a target's substitute. ";
		}
		if (move.flags.bite) {
			behaviorFlags += "Power is multiplied by 1.5 when used by a Pokemon with the Ability Strong Jaw. ";
		}
		if (move.flags.charge) {
			behaviorFlags += "The user is unable to make a move between turns. ";
		}
		if (move.flags.contact) {
			behaviorFlags += "Makes contact. ";
		}
		if (move.flags.dance) {
			behaviorFlags += "Can be copied by the ability Dancer. ";
		}
		if (move.flags.defrost) {
			behaviorFlags += "Thaws the user if executed successfully while the user is frozen. ";
		}
		if (move.flags.distance) {
			behaviorFlags += "Can target a Pokemon positioned anywhere in a Triple Battle. ";
		}
		if (move.flags.gravity) {
			behaviorFlags += "Prevented from being executed or selected during Gravity's effect. ";
		}
		if (move.flags.heal) {
			behaviorFlags += "Prevented from being executed or selected during Heal Block's effect. ";
		}
		if (move.flags.nonsky) {
			behaviorFlags += "Prevented from being executed or selected in a Sky Battle. ";
		}
		if (move.flags.powder) {
			behaviorFlags += "Has no effect on Grass-type Pokemon, Pokemon with the Ability Overcoat, and Pokemon holding Safety Goggles. ";
		}
		if (move.flags.pulse) {
			behaviorFlags += "Power is multiplied by 1.5 when used by a Pokemon with the Ability Mega Launcher. ";
		}
		if (move.flags.punch) {
			behaviorFlags += "Power is multiplied by 1.2 when used by a Pokemon with the Ability Iron Fist. ";
		}
		if (move.flags.recharge) {
			behaviorFlags += "If this move is successful, the user must recharge on the following turn and cannot make a move. ";
		}
		if (move.flags.reflectable) {
			behaviorFlags += "Bounced back to the original user by Magic Coat or the Ability Magic Bounce. ";
		}
		if (move.flags.snatch) {
			behaviorFlags += "Can be stolen from the original user and instead used by another Pokemon using Snatch. ";
		}
		if (move.flags.sound) {
			behaviorFlags += "Has no effect on Pokemon with the Ability Soundproof. ";
		}

		const extraInfo = [behaviorFlags];
		if (move.target && move.target !== "normal") {
			extraInfo.push(`Target: ${move.target.charAt(0).toUpperCase() + move.target.substring(1)}`);
		}
		if (move.contestType) {
			extraInfo.push(`Contest Type: ${move.contestType}`);
		}

		const embed = {
			title: move.name,
			description: `Base Power: ${move.basePower}${maxPower}${zStr}\nType: ${move.type} | Acc: ${move.accuracy === true ? "--" : move.accuracy} | Category: ${move.category} | PP: ${move.pp} (Max ${Math.floor(move.pp * 1.6)})\n${move.desc || move.shortDesc}${move.priority > 0 ? `\nPriority: +${move.priority}` : move.priority < 0 ? `\nPriority: ${move.priority}` : ""}`,
			url: `https://www.smogon.com/dex/${utilities.toSmogonString(dex.gen)}/moves/${(move.name.split(" ").join("-")).toLowerCase()}/`,
			author: {
				name: `${move.name}`,
				icon_url: move.category === "Physical" ? "https://cdn.discordapp.com/attachments/265293623778607104/665155226570850305/physical.png" : move.category === "Special" ? "https://cdn.discordapp.com/attachments/265293623778607104/665155248242950164/special.png" : "https://cdn.discordapp.com/attachments/265293623778607104/665155248242950164/special.png",
			},
			color: message.channel.type === "dm" ? 0 : message.guild.members.cache.get(client.user.id).displayColor,
			fields: [{
				name: "Extra Info:",
				value: extraInfo.join("\n"),
			}],
			footer: {
				text: `Introduced in Gen ${move.gen}`,
			},
		};

		if (sendMsg.length > 0) message.channel.send(sendMsg);
		return message.channel.send({embed});
	},
};
