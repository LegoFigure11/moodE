"use strict";

const child_process = require("child_process");
const util = require("util");

const exec = util.promisify(child_process.exec);

module.exports = {
	desc: "Returns the bot's public IP address.",
	developerOnly: true,
	async process(args, room, user) {
		const ip = await exec("curl ifconfig.me").catch(e => console.log(e));
		return user.say(ip.stdout);
	},
};
