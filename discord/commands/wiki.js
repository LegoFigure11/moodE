"use strict";

const wtf = require("wtf_wikipedia");

module.exports = {
	desc: "Attempts to get a wikipedia article on the provided search term.",
	usage: "<subject>",
	aliases: ["wikipedia"],
	hasCustomFormatting: true,
	async process(message, args) {
		if (!(args[0])) return;

		let doc = null;

		if (args[1] !== undefined) {
			doc = await wtf.fetch(Tools.toTitleCase(args[0]), Tools.toTitleCase(args[1]));
		}			else {
			doc = await wtf.fetch(Tools.toTitleCase(args[0]));
		}
		if (doc !== null) {
			if (doc.json().sections[0].paragraphs[0].sentences) {
				const desc = [];
				const index = doc.json().sections[0].paragraphs[0].sentences.length > 0 ? 0 : 1;
				for (let i = 0; i < 2; i++) {
					if (!doc.json().sections[0].paragraphs[index].sentences[i]) break;
					desc.push(doc.json().sections[0].paragraphs[index].sentences[i].text);
				}
				const embed = {
					title: doc.json().title,
					url: `https://en.wikipedia.org/?curid=${doc.json().pageID}`,
					description: desc.join(" "),
					image: {
						url: doc.images(0).json().url ? doc.images(0).thumb() : "",
					},
				};
				return message.channel.send({embed});
			}
			return message.channel.send(`Wiki found, but I was not able to parse it as text... You can view it here: https://en.wikipedia.org/?curid=${doc.json().pageID}`);
		} else {
			return message.channel.send("No wiki found :(");
		}
	},
};
