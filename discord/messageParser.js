"use strict";

const path = require("path");

const Rules = require(path.resolve(__dirname, "./rules.js"));

const RULES_DIRECTORY = path.resolve(__dirname, "./rules/");

class MessageParser {
	constructor() {
		this.rules = [];
	}

	async init(isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading rules...`);
		await Promise.all([
			this.loadDirectory(RULES_DIRECTORY, Rules.Rule, isReload),
		]);
	}

	loadDirectory(directory, Rule, isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading ${"Message Parser".cyan} rules...`);
		return new Promise((resolve, reject) => {
			fs.readdir(directory, (err, files) => {
				if (err) {
					reject(`Error reading rules directory: ${err}`);
				} else if (!files) {
					reject(`No files in directory ${directory}`);
				} else {
					for (let name of files) {
						if (name.endsWith(".js")) {
							try {
								name = name.slice(0, -3); // remove extention
								const rule = new Rule(name, require(`${directory}/${name}.js`));
								this.rules.push(rule);
								if (!(isReload)) console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oaded rule ${name.green}`);
							} catch (e) {
								console.log(`${"Discord: ".yellow + "MessageParser loadDirectory() error: ".brightRed}${e} while parsing ${name.yellow}${".js".yellow} in ${directory}`);
							}
						}
					}
					console.log(`${Tools.discordText()}${"Message Parser".cyan} rules ${isReload ? "rel" : "l"}oaded!`);
					resolve();
				}
			});
		});
	}

	get(name) {
		for (const rule of this.rules) {
			if ([rule.name].includes(Tools.toId(name))) return rule;
		}
		throw new Error(`messageParser error: Rule "${name}" not found!`);
	}

	async process(message) {
		for (let i = 0; i < this.rules.length; i++) {
			const rule = this.rules[i];
			if (message.deleted) break;
			if (rule.servers.length > 0 && !rule.servers.includes(message.guild.id)) continue;
			if (rule.channels.length > 0 && !rule.channels.includes(message.channel.id)) continue;
			if (rule.users.length > 0 && !rule.users.includes(message.author.id)) continue;
			message = await rule.execute(message);
		}
		return message;
	}
}


module.exports = MessageParser;
