"use strict";

module.exports = {
	desc: "Live reloads modules.",
	aliases: ["reload", "rl"],
	developerOnly: true,
	async process(args, room, user) {
		console.log(`${showdownText}Hot-patching...`);
		console.log(`${showdownText}--------------`);
		Tools.uncacheDir("showdown/");

		global.psMessageParser = require("../../src/messageParser.js").MessageParser;

		global.PsCommandHandler = require("../../src/commandHandler.js");
		global.psCommandHandler = new PsCommandHandler();
		psCommandHandler.init(true);

		room.say("Hotpatch completed!");
		return true;
	},
};
