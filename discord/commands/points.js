"use strict";

const utilities = require("../utilities.js");

module.exports = {
	usage: "<@user|user id>, <+/- amount (optional)>",
	noPm: true,
	isElevated: true,
	async process(message, args) {
		const db = Storage.getDatabase(message.guild.id);
		if (!db.points) db.points = {};
		db.points = Object.fromEntries(
			Object.entries(db.points).sort(([, a], [, b]) => b - a)
		);
		Storage.exportDatabase(message.guild.id);
		if (args[0]) args[0] = args[0].trim().split(" ")[0];
		if (!args[0] || !utilities.parseUserId(args[0])) {
			// Server Leaderboard
			const m = [`Current points leaderboard for ${message.guild.name}: \`\`\``];
			const e = Object.entries(db.points);
			let pos = 1;
			let last = 0;
			for (let i = 0; i < 40; i++) {
				if (!e[i] || e[i][1] === 0) break;
				const thisUser = utilities.parseUserId(e[i][0]);
				if (e[i][1] !== last) pos = i + 1;
				m.push(`${pos}) ${e[i][1]} - ${thisUser.username}#${thisUser.discriminator}`);
				last = e[i][1];
			}
			m.push("```");
			return message.channel.send(m.join("").includes("``````") ? `${m[0]}\nNobody has any points!\`\`\`` : m.join("\n"));
		}
		const user = utilities.parseUserId(args[0]);
		let position = 1;
		let last = 0;
		let i = 0;
		for (const entry of Object.entries(db.points)) {
			if (entry[1] !== last) position = i + 1;
			last = entry[1];
			i++;
			if (entry[0] === user.id) break;
		}
		if (args[1]) args[1] = args[1].trim().split(" ").join(""); // Clear whitespace
		if (!args[1] || isNaN(parseInt(args[1]))) {
			// User points
			return message.channel.send(`${user.username}#${user.discriminator}'s points: ${db.points[user.id] ? `${db.points[user.id]} | Position: ${position}` : 0}`);
		} else {
			// Update total
			if (!db.points[user.id]) db.points[user.id] = 0;
			db.points[user.id] = Math.max(0, db.points[user.id] + parseInt(args[1]));
			db.points = Object.fromEntries(
				Object.entries(db.points).sort(([, a], [, b]) => b - a)
			);
			Storage.exportDatabase(message.guild.id);
			let position = 1;
			let last = 0;
			let i = 0;
			for (const entry of Object.entries(db.points)) {
				if (entry[1] !== last) position = i + 1;
				last = entry[1];
				i++;
				if (entry[0] === user.id) break;
			}
			if (db.points[user.id] === 0) {
				return message.channel.send(`${user.username}#${user.discriminator} has no points!`);
			} else {
				return message.channel.send(`${user.username}#${user.discriminator}'s points: ${db.points[user.id]} | New position: ${position}`);
			}
		}
	},
};
