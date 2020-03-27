"use strict";

const https = require("https");

module.exports = {
	desc: "Gets a random dog photo.",
	hasCustomFormatting: true,
	aliases: ["randomdog", "randdog"],
	async process(message, args) {
		const options = {
			hostname: "random.dog",
			path: "/woof?filter=mp4,webm",
			method: "GET",
		};
		let send = true;
		const dog = new Promise((resolve, reject) => {
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
		const data = await dog;
		const embed = {
			image: {
				url: `https://random.dog/${data.toString()}`,
			},
			footer: {
				text: `https://random.dog/${data.toString()}`,
			},
		};
		return send ? message.channel.send({embed}) : message.channel.send("Something went wrong...");
	},
};
