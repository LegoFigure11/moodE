"use strict";

const LCRNG = require("../../../sources/rng/lcrng.js");
const RNG = new LCRNG.PokeRNG();
const RNG2 = new LCRNG.XDRNG();

module.exports = {
	desc: "Provides the Nature Pair for a given PID",
	usage: "<PID (Hex)>",
	aliases: ["pair"],
	async process(message, args) {
		if (!args[0]) return message.channel.send(this.usage);
		const pid1 = args[0].toString(16);
		const decPid1 = parseInt(pid1, 16);

		if (isNaN(decPid1)) return message.channel.send(`${discordFailureEmoji} Unable to coerce ${args[0]} as a Hex string!`);
		if (decPid1 < 0 || decPid1 > 0xFFFFFFFF) return message.channel.send(`${discordFailureEmoji} ${args[0]} is not a valid PID!`);

		const method124Seeds = RNG.calcMethod124SeedIVs(decPid1);
		let m1pids = [];
		for (let i = 0; i < method124Seeds.length; i++) {
			m1pids.push(RNG.concat16([RNG.getNext16BitNumber(RNG.getNext32BitNumber(method124Seeds[i][0])), RNG.getNext16BitNumber(method124Seeds[i][0])]));
			method124Seeds[i][0] = (parseInt(method124Seeds[i][0], 16) + 0x80000000) & 0xFFFFFFFF;
			m1pids.push(RNG.concat16([RNG.getNext16BitNumber(RNG.getNext32BitNumber(method124Seeds[i][0])), RNG.getNext16BitNumber(method124Seeds[i][0])]));
		}

		const methodXDSeeds = RNG2.calcMethodXDSeedIVs(decPid1);
		let xdpids = [];
		for (let i = 0; i < methodXDSeeds.length; i++) {
			xdpids.push(RNG2.concat16([RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodXDSeeds[i][0], 3)), RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodXDSeeds[i][0], 4))]));
			methodXDSeeds[i][0] = (parseInt(methodXDSeeds[i][0], 16) + 0x80000000) & 0xFFFFFFFF;
			xdpids.push(RNG2.concat16([RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodXDSeeds[i][0], 3)), RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodXDSeeds[i][0], 4))]));
		}

		const methodChannelSeeds = RNG2.calcMethodChannelSeedIVs(decPid1);
		let channelpids = [];
		for (let i = 0; i < methodChannelSeeds.length; i++) {
			const part1 = RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodChannelSeeds[i][0], 1));
			const part2 = RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodChannelSeeds[i][0], 2));
			methodChannelSeeds[i][0] = (parseInt(methodChannelSeeds[i][0], 16) + 0x80000000) & 0xFFFFFFFF;
			const part3 = RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodChannelSeeds[i][0], 1));
			const part4 = RNG2.getNext16BitNumber(RNG2.getNext32BitNumber(methodChannelSeeds[i][0], 2));
			channelpids.push(RNG2.concat16([part3, part2]));
			channelpids.push(RNG2.concat16([part1, part4]));
		}

		m1pids = [...new Set(m1pids)];
		xdpids = [...new Set(xdpids)];
		channelpids = [...new Set(channelpids)];

		const m1natures = [];
		for (let i = 0; i < m1pids.length; i += 2) {
			m1natures.push(`\n\t• ${RNG.natures[m1pids[i] % 25]} / ${RNG.natures[m1pids[i + 1] % 25]} (${m1pids[i]} / ${m1pids[i + 1]})`);
		}

		const xdnatures = [];
		for (let i = 0; i < xdpids.length; i += 2) {
			xdnatures.push(`\n\t• ${RNG.natures[xdpids[i] % 25]} / ${RNG.natures[xdpids[i + 1] % 25]} (${xdpids[i]} / ${xdpids[i + 1]})`);
		}

		const channelnatures = [];
		for (let i = 0; i < channelpids.length; i += 2) {
			channelnatures.push(`\n\t• ${RNG.natures[channelpids[i] % 25]} / ${RNG.natures[channelpids[i + 1] % 25]} (${channelpids[i]} / ${channelpids[i + 1]})`);
		}

		return message.channel.send(`\`\`\`Nature Pairs for PID 0x${args[0].replace(/0x|#/, "").padStart(8, "0")}:\n${m1pids.length > 0 ? `Method 1/2/4:${m1natures.join("")}` : ""}\n${xdpids.length > 0 ? `Colo/XD:${xdnatures.join("")}` : ""}\n${channelpids.length > 0 ? `Channel:${channelnatures.join("")}` : ""}\`\`\``);
	},
};
