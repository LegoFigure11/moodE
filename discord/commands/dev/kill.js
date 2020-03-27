"use strict";

module.exports = {
	desc: "Ends the current bot process.",
	adminOnly: true,
	async process(message, args) {
		message.channel.send("Ending process...");
		console.log(`${discordText}${"Ending all bot processes...".brightRed}`);
		console.log(`${discordText}${"This can now be safely closed!".green}`);
		eval("process.exit(0);");
	},
};
