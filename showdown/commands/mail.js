// Mail delivery is handled in showdown/src/messageParser.js
// This command exists purely to queue mail

"use strict";

const utilities = require("../src/utilities.js");

module.exports = {
	desc: "Sends a user mail.",
	usage: "<user>, <message>",
	pmOnly: true,
	async process(args, room, user) {
		if (!psConfig.allowMail) return room.say("Mail is not configured on this bot!");
		if (!args[1]) return room.say(`${psConfig.commandCharacter}mail ${this.usage}`);

		const to = Tools.toId(args[0]);
		if (!to || to.length > 18 || to === psUsers.self.id || to.startsWith("guest")) return room.say("Please enter a valid username.");

		const message = args.slice(1).join(",").trim();
		const id = Tools.toId(message);
		if (!id) return room.say("Please include a message to send.");
		if (message.length > (258 - user.name.length)) return room.say("Your message is too long.");

		await utilities.checkForDb("mail", "{}");
		const db = Storage.getDatabase("mail");

		if (to in db) {
			let queued = 0;
			for (let i = 0, len = db[to].length; i < len; i++) {
				if (Tools.toId(db[to][i].from) === user.id) queued++;
			}
			if (queued >= 3 && !user.isDeveloper()) return room.say(`You have too many messages queued for ${psUsers.add(args[0]).name}.`);
		} else {
			db[to] = [];
		}
		db[to].push({time: Date.now(), from: user.name, text: message});
		Storage.exportDatabase("mail");

		room.say(`Your message has been sent to ${psUsers.add(args[0]).name}!`);
	},
};
