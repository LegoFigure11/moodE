"use strict";

const sleep = require("system-sleep");

module.exports = {
	async process(message) {
		// Prevent the rule from running if the message looks like a command
		// Remove this next line if you want to rule to run on commands as well
		if (message.content.startsWith(discordConfig.commandCharacter)) return message;
		if (!message.content.includes("://play.pokemonshowdown.com/battle-") || !runShowdown) return message;

		const match = /https?:\/\/play\.pokemonshowdown\.com\/battle-(.+)-(\d+)/g.exec(message.content);
		if (!match) return message;
		match.shift();
		const [tier, match_id] = match;
		const battle_path = `battle-${tier}-${match_id}`;

		for (let i = 0; i < 10; i++) {
			psClient.send(`|/join ${battle_path}`);
			await sleep(500);
			if (psRooms.get(battle_path) !== undefined) break;
		}

		const room = psRooms.get(battle_path);
		if (room) {
			message.channel.send(`${room.title} || ${room.tier}`);
			room.say("/part");
		} else {
			message.channel.send("Unable to find info on this battle.");
		}

		return message;
	},
};
