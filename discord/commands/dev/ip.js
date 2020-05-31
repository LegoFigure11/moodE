"use strict";

const child_process = require("child_process");
const util = require("util");

const exec = util.promisify(child_process.exec);

module.exports = {
	desc: "Returns the bot's public IP address.",
	adminOnly: true,
	async process(message, args) {
		const ip = await exec("curl ifconfig.me").catch(e => console.log(e));
		return message.channel.send(ip.stdout);
	},
};
