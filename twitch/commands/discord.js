"use strict";

module.exports = {
	desc: "Gets/sets a channels discord invite link.",
	async process(args, channel, user, self) {
		const db = Storage.getDatabase(channel);
		if (user.badges && user.badges["broadcaster"] && args[0]) {
			db.discord = args.join(",");
			Storage.exportDatabase(channel);
		}
		return bot.say(channel, db.discord ? db.discord : "No discord link set!");
	},
};
