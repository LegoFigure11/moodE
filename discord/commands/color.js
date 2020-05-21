"use strict";

const nodeHtmlToImage = require("node-html-to-image");

module.exports = {
	desc: "Displays the color of a provided hex code.",
	usage: "<hex code>",
	async process(message, args) {
		const hexRegex = /^(0[xX]){1}[A-Fa-f0-9]{6}$|^#[A-Fa-f0-9]{6}$|^[A-Fa-f0-9]{6}$/;
		let color = args[0];
		if (color.trim().length > 8) {
			color = color.trim().substr(0, 8);
		}
		color = color.replace("0x", "#");
		if (!(hexRegex.test(color.trim()))) return message.channel.send(`${discordConfig.failureEmoji} Unable to coerce "${args[0]}" as a hex code!`);
		const image = await nodeHtmlToImage({
			html: `
			<html>
				<head>
					<style>
						body {
							width: 100px;
							height: 100px;
							background-color: ${hexRegex.exec(color)[0]};
						}
					</style>
				</head>
				<body>
				</body>
			</html>`,
		});

		return message.channel.send(args[0], {files: [image]});
	},
};
