"use strict";

module.exports = {
	desc: "Gets the color of a user's name.",
	roomRank: "+",
	aliases: ["namecolour", "color", "colour"],
	noPm: true,
	async process(args, room, user) {
		room.say(`/addhtmlbox <b><font color="${Tools.hashColor(Tools.toId(args[0].trim()), 1)}">${args[0].trim()}</font></b> | ${Tools.hashColor(Tools.toId(args[0]))}`);
	},
};
