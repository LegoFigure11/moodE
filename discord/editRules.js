"use strict";

const path = require("path");

const Rules = require(path.resolve(__dirname, "./rules.js"));

const EDIT_RULES_DIRECTORY = path.resolve(__dirname, "./rules/editRules/");

class EditRules {
	constructor() {
		this.rules = [];
	}

	async init(isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading edit rules...`);
		await Promise.all([
			this.loadDirectory(EDIT_RULES_DIRECTORY, Rules.Rule, isReload),
		]);
	}

	loadDirectory(directory, Rule, isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading ${"Edit".cyan} rules...`);
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
								console.log(`${"Discord: ".yellow + "editRules loadDirectory() error: ".brightRed}${e} while parsing ${name.yellow}${".js".yellow} in ${directory}`);
							}
						}
					}
					console.log(`${Tools.discordText()}${"Edit".cyan} rules ${isReload ? "rel" : "l"}oaded!`);
					resolve();
				}
			});
		});
	}

	get(name) {
		for (const rule of this.rules) {
			if ([rule.name].includes(Tools.toId(name))) return rule;
		}
		throw new Error(`editRules error: Rule "${name}" not found!`);
	}

	process(oldMessage, newMessage) {
		for (let i = 0; i < this.rules.length; i++) {
			const rule = this.rules[i];
			if (rule.servers.length > 0 && !rule.servers.includes(oldMessage.guild.id)) continue;
			if (rule.channels.length > 0 && !rule.channels.includes(oldMessage.channel.id)) continue;
			if (rule.users.length > 0 && !rule.users.includes(oldMessage.author.id)) continue;
			rule.execute(oldMessage, newMessage);
		}
	}
}


module.exports = EditRules;
