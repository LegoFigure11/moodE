"use strict";

const path = require("path");

const ReactionEvent = require(path.resolve(__dirname, "./reactionEvents.js"));

const REACTION_ADD_EVENTS_DIRECTORY = path.resolve(__dirname, "./reactionEvents/add");
const REACTION_REMOVE_EVENTS_DIRECTORY = path.resolve(__dirname, "./reactionEvents/remove");

class ReactionEvents {
	constructor() {
		this.add = [];
		this.remove = [];
	}

	async init(isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading reaction events...`);
		await Promise.all([
			this.loadDirectory(REACTION_ADD_EVENTS_DIRECTORY, ReactionEvent.Event, "Add", isReload),
			this.loadDirectory(REACTION_REMOVE_EVENTS_DIRECTORY, ReactionEvent.Event, "Remove", isReload),
		]);
	}

	loadDirectory(directory, Event, type, isReload) {
		console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oading ${`Reaction ${type}`.cyan} events...`);
		return new Promise((resolve, reject) => {
			fs.readdir(directory, (err, files) => {
				if (err) {
					reject(console.log(`Error reading reaction events directory: ${err}`));
				} else if (!files) {
					reject(console.log(`No files in directory ${directory}`));
				} else {
					for (let name of files) {
						if (name.endsWith(".js")) {
							try {
								name = name.slice(0, -3); // remove extention
								const event = new Event(name, require(`${directory}/${name}.js`));
								if (type === "Add") {
									this.add.push(event);
								} else {
									this.remove.push(event);
								}
								if (!(isReload)) console.log(`${Tools.discordText()}${isReload ? "Rel" : "L"}oaded reaction event ${name.green}`);
							} catch (e) {
								console.log(`${Tools.discordText()}${"reactionHandler loadDirectory() error: ".brightRed}${e.stack} while parsing ${name.yellow}${".js".yellow} in ${directory}`);
							}
						}
					}
					console.log(`${Tools.discordText()}${`Reaction ${type}`.cyan} events ${isReload ? "rel" : "l"}oaded!`);
					resolve();
				}
			});
		});
	}

	process(reaction, user, type) {
		if (type === "Add") {
			for (let i = 0; i < this.add.length; i++) {
				const event = this.add[i];
				if (event.servers.length > 0 && !event.servers.includes(reaction.message.guild.id)) continue;
				if (event.channels.length > 0 && !event.channels.includes(reaction.message.channel.id)) continue;
				if (event.users.length > 0 && !event.users.includes(user.id)) continue;
				event.execute(reaction, user);
			}
		} else {
			for (let i = 0; i < this.remove.length; i++) {
				const event = this.remove[i];
				if (event.servers.length > 0 && !event.servers.includes(reaction.message.guild.id)) continue;
				if (event.channels.length > 0 && !event.channels.includes(reaction.message.channel.id)) continue;
				if (event.users.length > 0 && !event.users.includes(user.id)) continue;
				event.execute(reaction, user);
			}
		}
	}
}


module.exports = ReactionEvents;
