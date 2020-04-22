"use strict";

module.exports = {
	desc: "Prints information about how long the bot has been running.",
	async process(message, args) {
		let text = "**Uptime:** ";
		const divisors = [52, 7, 24, 60, 60];
		const units = ["week", "day", "hour", "minute", "second"];
		const buffer = [];
		let uptime = ~~(process.uptime());
		do {
			const divisor = divisors.pop();
			const unit = uptime % divisor;
			buffer.push(unit !== 1 ? unit + " " + units.pop() + "s" : unit + " " + units.pop());
			uptime = ~~(uptime / divisor);
		} while (uptime);

		switch (buffer.length) {
		case 5:
			text += buffer[4] + ", ";
			/* falls through */
		case 4:
			text += buffer[3] + ", ";
			/* falls through */
		case 3:
			text += buffer[2] + ", " + buffer[1] + ", and " + buffer[0];
			break;
		case 2:
			text += buffer[1] + " and " + buffer[0];
			break;
		case 1:
			text += buffer[0];
			break;
		}
		return message.channel.send(text);
	},
};
