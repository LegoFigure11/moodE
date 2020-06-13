"use strict";

module.exports = {
	desc: "Gets all known alts of a user.",
	usage: "<user>",
	developerOnly: true,
	async process(args, room, user) {
		if (!args[0]) return user.say(`Usage: \`\`${psConfig.commandCharacter}alts ${this.usage}\`\``);
		const db = Storage.getDatabase("alts");
		const target = Tools.toId(args[0]);
		const alts = [];
		if (db[target]) {
			for (const name of db[target]) {
				alts.push(name);
			}
		}
		const keys = Object.keys(db);
		for (let i = 0; i < keys.length; i++) {
			if (db[keys[i]].includes(target)) {
				for (const name of db[keys[i]]) {
					alts.push(name);
				}
			}
		}
		return room.say(alts.length > 1 ? `**${args[0]}**'s known alts: ${[...new Set(alts)].sort().join(", ")}` : `No alts found for user: ${target}`);
	},
};
