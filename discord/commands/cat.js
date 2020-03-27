"use strict";

const https = require("https");

module.exports = {
	desc: "Gets a random cat photo.",
	hasCustomFormatting: true,
	aliases: ["randomcat", "randcat"],
	async process(message, args) {
		const options = {
			hostname: "aws.random.cat",
			path: "/meow?filter=mp4,webm",
			method: "GET",
		};
		let send = true;
		const cat = new Promise((resolve, reject) => {
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
		const data = await cat;
		const embed = {
			image: {
				url: JSON.parse(data.toString()).file,
			},
			footer: {
				text: JSON.parse(data.toString()).file,
			},
		};
		return send ? message.channel.send({embed}) : message.channel.send("Something went wrong...");
	},
};
