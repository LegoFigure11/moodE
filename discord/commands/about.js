"use strict";

module.exports = {
	desc: "About moodE.",
	usage: "",
	aliases: ["moode", "version", "invite"],
	hasCustomFormatting: true,
	async process(message, args) {
		return message.channel.send({"embed": {
			title: "About moodE",
			description: "Competitive Pokemon bot based on [SableyeBot](https://github.com/JsKingBoo/SableyeBot3/), [BattleSpotBot](https://github.com/DragonWhale/BattleSpotBot), [Lanette](https://github.com/sirDonovan/Lanette), and [Cassius](https://github.com/sirDonovan/Cassius).",
			url: "https://github.com/LegoFigure11/moodE",
			author: {
				name: `${client.users.cache.get(discordConfig.owner).username}#${client.users.cache.get(discordConfig.owner).discriminator}`,
				icon_url: client.users.cache.get(discordConfig.owner).avatarURL(),
			},
			color: message.channel.type === "dm" ? 0 : message.guild.members.cache.get(client.user.id).displayColor,
			fields: [
				{name: "Invite Link", value: "[Click here](https://discordapp.com/oauth2/authorize?&client_id=537773790445305866&scope=bot&permissions=8)!"},
				{name: "Language", value: "JavaScript (discordjs)"},
			],
			footer: {
				text: `moodE version ${packagejson.version} @ ${hash}`,
			},
		}});
	},
};
