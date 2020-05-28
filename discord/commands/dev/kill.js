"use strict";

module.exports = {
	desc: "Ends the current bot process.",
	adminOnly: true,
	async process(message, args) {
		await message.channel.send("Goodbye!");
		console.log(`${Tools.discordText()}${"Ending all bot processes...".brightRed}`);
		console.log(`${Tools.discordText()}${"This can now be safely closed!".green}`);
		eval("process.exit(0);");
	},
};
