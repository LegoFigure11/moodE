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
			console.log(`${moodeText}${"Error".red}: No git remote output.`);
			return message.channel.send(`${failureEmoji} No git remote output.`);
		}

		console.log(`${moodeText}Attempting pull...`);
		const pull = await exec("git pull");
		if (!pull || pull.Error) {
			console.log(`${moodeText}Error: could not pull origin.`);
			return message.channel.send(`${failureEmoji} Error: could not pull origin.`);
		}
		if (pull.stdout.replace("\n", "").replace(/-/g, " ") === "Already up to date.") {
			console.log(`${moodeText}Already up to date!`);
			return message.channel.send(`${failureEmoji} Already up to date!`);
		} else {
			console.log(`${moodeText}Pull completed!`);
			return message.channel.send(`${successEmoji} Pull completed!`);
		}
	},
};
