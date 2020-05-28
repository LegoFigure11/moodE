"use strict";

module.exports = {
	desc: "Ends the current bot process.",
	developerOnly: true,
	async process(args, room, user) {
		console.log(`${Tools.showdownText()}${"Ending all bot processes...".brightRed}`);
		console.log(`${Tools.showdownText()}${"This can now be safely closed!".green}`);
		eval("process.exit(0);");
	},
};
