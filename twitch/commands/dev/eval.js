"use strict";

module.exports = {
	desc: "Evaluates arbitrary javascript.",
	usage: "<expression>",
	aliases: ["js"],
	developerOnly: true,
	async process(args, channel, user, self) {
		args = args.join(",").trim();
		let output;
		try {
			output = eval(args);
			output = JSON.stringify(output, null, 2);
		} catch (e) {
			return bot.say(channel, `Error while evaluating expression: ${e}`);
		}
		return bot.say(channel, output);
	},
};
