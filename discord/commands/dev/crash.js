"use strict";

module.exports = {
	desc: "Forces the bot to crash.",
	adminOnly: true,
	hasCustomFormatting: true,
	async process(message, args) {
		throw new Error("Deliberate Error");
	},
};
