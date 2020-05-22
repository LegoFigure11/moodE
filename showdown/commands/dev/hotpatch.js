"use strict";

module.exports = {
	desc: "Live reloads modules.",
	aliases: ["reload", "rl"],
	developerOnly: true,
	async process(args, room, user) {
		console.log(`${showdownText}Hot-patching...`);
		console.log(`${showdownText}--------------`);
		Tools.uncacheDir("showdown/");
		Tools.uncacheDir("sources/");

		global.Storage = require("../../../sources/storage.js");
		Storage.importDatabases();
		global.Tools = require("../../../sources/tools.js");

		global.psMessageParser = require("../../src/messageParser.js").MessageParser;

		global.PsCommandHandler = require("../../src/commandHandler.js");
		global.psCommandHandler = new PsCommandHandler();
		psMessageParser.init(true);
		psCommandHandler.init(true);

		room.say("Hotpatch completed!");
		return true;
	},
};
