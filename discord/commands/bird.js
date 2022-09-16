"use strict";

const https = require("https");

module.exports = {
	desc: "Gets a random bird photo.",
	hasCustomFormatting: true,
	aliases: ["randombird", "randbird", "birb", "randombirb", "randbirb"],
	async process(message, args) {
		const options = {
			hostname: "shibe.online",
			path: "/api/birds?count=1&urls=true&httpsUrls=true",
			method: "GET",
		};
		let send = true;
		const bird = new Promise((resolve, reject) => {
			const req = https.request(options, (res) => {
				res.on("data", (res) => {
					resolve(res);
				});
			});

			req.on("error", (err) => {
				send = false;
				resolve(err);
			});
			req.end();
		});
		const data = await bird;
		const embed = {
			image: {
				url: JSON.parse(data.toString())[0],
			},
			footer: {
				text: JSON.parse(data.toString())[0],
			},
		};
		return send ? message.channel.send({embed}) : message.channel.send("Something went wrong...");
	},
};
