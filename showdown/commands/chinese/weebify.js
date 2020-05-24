"use strict";

const phrases = [
	"桑", // san
	"君", // kun
	"酱", // chan
	"大人", // sama
	"先生", // sensei
	"前辈", // senpai
	"聚聚", // pro gamer
	"同志", // comrade
	"老师", // teacher
	"将军", // army general
	"小姐", // lass
	"大哥", // big brother
];

module.exports = {
	desc: " (* ^ ω ^)/*:･ﾟ✧*:･ﾟ✧",
	usage: "<thing to weebify>",
	roomRank: "+",
	async process(args, room, user) {
		if (!args[0]) return;
		return room.say(`${args.join(", ")}${Tools.sampleOne(phrases)}`);
	},
};
