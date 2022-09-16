"use strict";

const phrases = [
	"As I see it, yes.",
	"Ask again later.",
	"Better not tell you now.",
	"Cannot predict now.",
	"Concentrate and ask again.",
	"Don't count on it.",
	"It is certain.",
	"It is decidedly so.",
	"Most likely.",
	"My reply is no.",
	"My sources say no.",
	"Outlook not so good.",
	"Outlook good.",
	"Reply hazy, try again.",
	"Signs point to yes.",
	"Very doubtful.",
	"Without a doubt.",
	"Yes.",
	"Yes – definitely.",
	"You may rely on it.",
];

module.exports = {
	desc: "Asks the magic 8-Ball a question.",
	usage: "<question>",
	aliases: ["8"],
	async process(message, args) {
		return message.channel.send(`:8ball: ${Tools.sampleOne(phrases)}`);
	},
};
