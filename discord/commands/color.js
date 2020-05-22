"use strict";

const nodeHtmlToImage = require("node-html-to-image");

module.exports = {
	desc: "Displays the color of a provided hex code.",
	usage: "<hex code>",
	aliases: ["colour"],
	async process(message, args) {
		const hexRegex = /^(0[xX]){1}[A-Fa-f0-9]{6}$|^#[A-Fa-f0-9]{6}$|^[A-Fa-f0-9]{6}$/;
		let color = args[0];
		if (color.trim().length > 8) {
			color = color.trim().substr(0, 8);
		}
		color = color.replace("0x", "#");
		if (!color.startsWith("#")) color = `#${color}`;
		if (!(hexRegex.test(color.trim()))) return message.channel.send(`${discordConfig.failureEmoji} Unable to coerce "${args[0]}" as a hex code!`);
		const image = await nodeHtmlToImage({
			html: `
<html>
	<head>
		<style>
			body {
				font-family: Arial, sans-serif;
				width: 300px;
				height: 100px;
				display: flex;
				flex-direction: row;
				text-align: center;
				font-size: 16px;
				font-weight: 500;
			}
			div {
				display: flex;
				justify-content: center;
				align-items: center;
			}
			.color {
				width: 100px;
				height: 100px;
				background-color: ${hexRegex.exec(color)[0]};
			}
			.dark {
				width: 100px;
				height: 100px;
				background-color: #36393F;
				color: ${hexRegex.exec(color)[0]};
			}
			.light {
				width: 100px;
				height: 100px;
				background-color: #FFFFFF;
				color: ${hexRegex.exec(color)[0]};
			}
		</style>
	</head>
	<body>
		<div class="color"></div>
		<div class="dark"><b>Dark Mode</b></div>
		<div class="light"><b>Light Mode</b></div>
	</body>
</html>`,
			puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		return message.channel.send(args[0], {files: [image]});
	},
};
