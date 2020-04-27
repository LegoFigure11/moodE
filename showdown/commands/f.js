"use strict";

module.exports = {
	desc: "Pays respects.",
	roomRank: "+",
	async process(args, room, user) {
		return room.say(`${user.name} paid their respects.`);
	},
};
