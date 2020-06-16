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
		color = color.toUpperCase();
		if (!(hexRegex.test(color.trim()))) return message.channel.send(`${discordConfig.failureEmoji} Unable to coerce "${args[0]}" as a hex code!`);
		color = hexRegex.exec(color)[0];
		const image = await nodeHtmlToImage({
			puppeteerArgs: ["--no-sandbox", "--disable-setuid-sandbox"],
			html: `
<html>
	<head>
	<link href="https://legofigure11.github.io/fonts-reference/Whitney-Medium/stylesheet.css" rel="stylesheet" />
	<style>
			body {
				font-family: whitneymedium, Arial, sans-serif;
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
				background-color: ${color};
			}
			.dark {
				width: 100px;
				height: 100px;
				background-color: #36393F;
				color: ${color};
			}
			.light {
				width: 100px;
				height: 100px;
				background-color: #FFFFFF;
				color: ${color};
			}
		</style>
	</head>
	<body>
		<div class="color" id="color"><b>${color}</b></div>
		<div class="dark"><b>Dark Mode</b></div>
		<div class="light"><b>Light Mode</b></div>
	</body>

	<script>
		// From https://stackoverflow.com/a/41491220/13258354
    function pickTextColorBasedOnBgColor(bgColor, lightColor, darkColor) {
      const color = (bgColor.charAt(0) === "#") ? bgColor.substring(1, 7) : bgColor;
      const r = parseInt(color.substring(0, 2), 16); // hexToR
      const g = parseInt(color.substring(2, 4), 16); // hexToG
      const b = parseInt(color.substring(4, 6), 16); // hexToB
      const uicolors = [r / 255, g / 255, b / 255];
      const c = uicolors.map((col) => {
        if (col <= 0.03928) {
          return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
      });
      const L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
      return (L > 0.179) ? darkColor : lightColor;
    }

    document.getElementById("color").style.color = pickTextColorBasedOnBgColor("${color}", "#FFFFFF", "#36393F");
  </script>
</html>`,
		});

		return message.channel.send({files: [image]});
	},
};
