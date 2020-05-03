"use strict";

const https = require("https");
const probe = require("probe-image-size");

module.exports = {
	desc: "Gets a random dog photo.",
	aliases: ["randomdog", "randdog"],
	roomRank: "+",
	async process(args, room, user) {
		const options = {
			hostname: "random.dog",
			path: "/woof?filter=mp4,webm",
			method: "GET",
		};
		const dog = new Promise((resolve, reject) => {
			const req = https.request(options, (res) => {
				res.on("data", (res) => {
					resolve(res);
				});
			});

			req.on("error", (err) => {
				resolve(err);
			});
			req.end();
		});
		const data = await dog;

		const dimensions = await fitImage(`https://random.dog/${data.toString()}`, 300, 400);

		return room.say(`/adduhtml randdog, <img src="https://random.dog/${data.toString()}" width="${dimensions[0]}" height="${dimensions[1]}" style="width:${dimensions[0]}px; height:${dimensions[1]}px; display: block; margin-left: auto; margin-right: auto;" />`);
	},
};

// From Asheviere/Kid-A
// https://git.io/JfOyK

async function fitImage(url, maxHeight, maxWidth) {
	const {height, width} = await probe(url);

	let ratio = 1;

	if (width <= maxWidth && height <= maxHeight) return [width, height];

	if (height * (maxWidth / maxHeight) > width) {
		ratio = maxHeight / height;
	} else {
		ratio = maxWidth / width;
	}

	return [Math.round(width * ratio), Math.round(height * ratio)];
}
