"use strict";

module.exports = {
	desc: "Gets/sets a game ID code.",
	async process(args, channel, user, self) {
		const db = Storage.getDatabase(channel);
		if (user.badges && user.badges["broadcaster"] && args[0]) {
			db.id = args.join(",");
			Storage.exportDatabase(channel);
		}
		return bot.say(channel, db.id ? db.id : "No ID set!");
	},
};
