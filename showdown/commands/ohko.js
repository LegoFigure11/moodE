"use strict";

module.exports = {
	desc: "Uses a One-hit KO move.",
	roomRank: "+",
	async process(args, room, user) {
		return room.say(Tools.random(10) <= 3 ? "It's a one-hit KO!" : "The attack missed!");
	},
};
