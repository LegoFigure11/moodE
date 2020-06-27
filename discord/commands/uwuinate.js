/************************************************************/
/* This file is licensed as GNU General Public License v3.0 */
/************************************************************/

"use strict";

const kaomojiJoy = [" (* ^ ω ^)", " (o^▽^o)", " (≧◡≦)", " ☆⌒ヽ(*\"､^*)chu", " ( ˘⌣˘)♡(˘⌣˘ )", " xD"];
const kaomojiEmbarassed = [" (⁄ ⁄>⁄ ▽ ⁄<⁄ ⁄)..", " (*^.^*)..,", "..,", ",,,", "... ", ".. ", " mmm..", "O.o"];
const kaomojiConfuse = [" (o_O)?", " (°ロ°) !?", " (ーー;)?", " owo?"];
const kaomojiSparkles = [" *:･ﾟ✧*:･ﾟ✧ ", " ☆*:・ﾟ ", "〜☆ ", " uguu.., ", "-.-"];

module.exports = {
	desc: "Converts text to UwU-speak. Powered by https://senguyen1011.github.io/UwUinator/",
	usage: "<text>",
	aliases: ["uwu", "uwuinator"],
	hasCustomFormatting: true,
	async process(message, args) {
		if (!args[0]) return message.channel.send("uwu");
		const input = args.join(", ").toLowerCase().split(" ");
		const output = [];
		// from https://github.com/senguyen1011/UwUinator/blob/master/js/uwuinate.js
		input.forEach((word, index) => {
			let uwu = "";

			const lastChar = word[word.length - 1];
			let end = "";
			let random = 0;
			if (lastChar === "." || lastChar === "?" || lastChar === "!" || lastChar === ",") {
				word = word.slice(0, -1);
				end = lastChar;

				if (end === ".") {
					random = Math.floor(Math.random() * 3);
					if (random === 0) {
						random = Math.floor(Math.random() * kaomojiJoy.length);
						end = kaomojiJoy[random];
					}
				} else if (end === "?") {
					random = Math.floor(Math.random() * 2);
					if (random === 0) {
						random = Math.floor(Math.random() * kaomojiConfuse.length);
						end = kaomojiConfuse[random];
					}
				} else if (end === "!") {
					random = Math.floor(Math.random() * 2);
					if (random === 0) {
						random = Math.floor(Math.random() * kaomojiJoy.length);
						end = kaomojiJoy[random];
					}
				} else if (end === ",") {
					random = Math.floor(Math.random() * 3);
					if (random === 0) {
						random = Math.floor(Math.random() * kaomojiEmbarassed.length);
						end = kaomojiEmbarassed[random];
					}
				}

				random = Math.floor(Math.random() * 4);
				if (random === 0) {
					random = Math.floor(Math.random() * kaomojiSparkles.length);
					end = kaomojiSparkles[random];
				}
			}

			if (word.indexOf("l") > -1) {
				if (word.slice(-2) === "le" || word.slice(-2) === "ll") {
					uwu += `${word.slice(0, -2).replace(/l/g, "w").replace(/r/g, "w") + word.slice(-2) + end} `;
				} else if (word.slice(-3) === "les" || word.slice(-3) === "lls") {
					uwu += `${word.slice(0, -3).replace(/l/g, "w").replace(/r/g, "w") + word.slice(-3) + end} `;
				} else {
					uwu += `${word.replace(/l/g, "w").replace(/r/g, "w") + end} `;
				}
			} else if (word.indexOf("r") > -1) {
				if (word.slice(-2) === "er" || word.slice(-2) === "re") {
					uwu += `${word.slice(0, -2).replace(/r/g, "w") + word.slice(-2) + end} `;
				} else if (word.slice(-3) === "ers" || word.slice(-3) === "res") {
					uwu += `${word.slice(0, -3).replace(/r/g, "w") + word.slice(-3) + end} `;
				} else {
					uwu += `${word.replace(/r/g, "w") + end} `;
				}
			} else {
				uwu += `${word + end} `;
			}

			uwu = uwu.replace(/you're/g, "ur");
			uwu = uwu.replace(/youre/g, "ur");
			uwu = uwu.replace(/fuck/g, "fwickk");
			uwu = uwu.replace(/shit/g, "poopoo");
			uwu = uwu.replace(/bitch/g, "meanie");
			uwu = uwu.replace(/asshole/g, "b-butthole");
			uwu = uwu.replace(/dick/g, "peenie");
			uwu = uwu.replace(/penis/g, "peenie");
			uwu = uwu.replace(/\bcum\b/g, "cummies");
			uwu = uwu.replace(/\bsemen\b/g, " cummies ");
			uwu = uwu.replace(/\bass\b/g, " boi pussy ");
			uwu = uwu.replace(/\bdad\b/g, "daddy");
			uwu = uwu.replace(/\bfather\b/g, "daddy");

			if (uwu.length > 2 && uwu[0].match(/[a-z]/i)) {
				random = Math.floor(Math.random() * 6);
				if (random === 0) {
					uwu = `${uwu[0]}-${uwu}`;
				}
			}
			output.push(uwu);
		});

		return message.channel.send(`\`\`\`${output.join("")}\`\`\``);
	},
};
