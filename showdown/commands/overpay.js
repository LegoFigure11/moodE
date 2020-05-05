"use strict";

module.exports = {
	desc: "OVERPAY!!",
	roomRank: "+",
	async process(args, room, user) {
		return room.say("/wall __OVERPAY!!__");
	},
};
