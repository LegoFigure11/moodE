"use strict";

module.exports = {
	desc: "Uses a One-hit KO move.",
	async process(message, args) {
		return message.channel.send(Tools.random(10) < 3 ? "It's a one-hit KO!" : "The attack missed!");
	},
};
