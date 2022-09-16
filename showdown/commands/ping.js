"use strict";

module.exports = {
	desc: "Test command.",
	roomRank: "+",
	async process(args, room, user) {
		return room.say("Pong!");
	},
};
