"use strict";

const https = require("https");

module.exports = {
	desc: "Gets a definition from urban urban dictionary.",
	hasCustomFormatting: true,
	aliases: ["ud", "urban", "urbandict", "udic"],
	usage: "<word>",
	async process(message, args) {
		const db = Storage.getDatabase(message.guild.id);
		if (!args[0]) return message.channel.send(`Usage: \`${discordConfig.commandCharacter}urbandictionary ${this.usage}\``);
		try {
			const options = {
				hostname: "api.urbandictionary.com",
				path: `/v0/define?term=${encodeURIComponent(args.join(", ").trim())}`,
				method: "GET",
			};
			let send = true;
			const def = new Promise((resolve, reject) => {
				const req = https.request(options, (res) => {
					let body = "";
					res.on("data", (res) => {
						body += res;
					});
					res.on("end", (res) => {
						resolve(body);
					});
					req.on("error", (err) => {
						send = false;
						resolve(err);
					});
				});
				req.end();
			});
			const data = await def;
			const definition = JSON.parse(data.toString()).list[0];
			definition.definition = definition.definition.replace(/\[[a-zA-Z0-9.' ]*\]/gi, replacer);
			definition.example = definition.example.replace(/\[[a-zA-Z0-9.' ]*\]/gi, replacer);
			const embed = {
				title: `"${definition.word}" on Urban Dictionary`,
				url: definition.permalink,
				fields: [
					{
						name: "Example:",
						value: definition.example || "(None)",
					},
				],
				description: definition.definition || "(None)",
			};
			return send ? message.channel.send({embed}) : message.channel.send("Looks like something went wrong...");
		} catch (e) {
			message.channel.send("Looks like something went wrong...");
		}
	},
};

function replacer(match) {
	const words = match.replace(/[[|\]]/g, "").split(" ");
	return `[${words.join(" ")}](http://${words.join("-").replace(/[.|']/g, "")}.urbanup.com)`;
}
