"use strict";

const child_process = require("child_process");
const util = require("util");

const exec = util.promisify(child_process.exec);

module.exports = {
	desc: "Executes `git pull`",
	aliases: ["update", "git"],
	adminOnly: true,
	async process(message, args) {
		message.channel.send("Attempting git pull...");

		process.chdir(path.resolve(__dirname, "../../../"));

		const remoteOutput = await exec("git remote -v").catch(e => console.log(e));
		if (!remoteOutput || remoteOutput.Error) {
			console.log(`${Tools.moodeText()}${"Error".red}: No git remote output.`);
			return message.channel.send(`${discordFailureEmoji} No git remote output.`);
		}

		console.log(`${Tools.moodeText()}Attempting pull...`);
		const pull = await exec("git pull");
		if (!pull || pull.Error) {
			console.log(`${moodeText}Error: could not pull origin.`);
			return message.channel.send(`${discordFailureEmoji} Error: could not pull origin.`);
		}
		if (pull.stdout.replace("\n", "").replace(/-/g, " ") === "Already up to date.") {
			console.log(`${Tools.moodeText()}Already up to date!`);
			return message.channel.send(`${discordFailureEmoji} Already up to date!`);
		} else {
			const moodeHash = await exec("git rev-parse --short HEAD");
			global.hash = moodeHash.stdout.trim();
			console.log(`${Tools.moodeText()}Pull completed!`);
			return message.channel.send(`${discordSuccessEmoji} Pull completed!`);
		}
	},
};
