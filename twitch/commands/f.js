"use strict";

module.exports = {
	desc: "Pays respects.",
	async process(args, channel, user, self) {
		return user["message-type"] === "whisper" ? bot.whisper(user.username, `${user["display-name"]} paid their respects.`) : bot.say(channel, `${user["display-name"]} paid their respects.`);
	},
};
