"use strict";

module.exports = {
	noPm: true,
	async process(reaction, user) {
		const db = Storage.getDatabase(reaction.message.guild.id);
		if (!db.starboard) return;
		if (!db.starboard.emoji) db.starboard.emoji = "\u{2B50}";
		if (!db.starboard.requiredStars) db.starboard.requiredStars = 3;
		if (!db.starboard.roles) db.starboard.roles = [];
		if (!db.starboard.stars) db.starboard.stars = {};
		if (!db.starboard.channel) return Storage.exportDatabase(reaction.message.guild.id);

		const emojiName = reaction._emoji.id ? `<:${reaction._emoji.name}:${reaction._emoji.id}>` : reaction._emoji.name;

		if (db.starboard.emoji === emojiName) {
			if (db.starboard.roles.length > 0) {
				let count = 0;
				const users = await reaction.users.fetch();
				await users.each(async (user) => {
					if (await reaction.message.guild.members.cache.get(user.id).roles.cache.some(role => db.starboard.roles.includes(role.id))) {
						count++;
					}
				});
				reaction.count = count;
			}
			if (reaction.count >= db.starboard.requiredStars) {
				if (db.starboard.stars[reaction.message.id]) {
					// Fetch the message and update the star count
					const channel = client.channels.cache.get(db.starboard.channel);
					channel.messages.fetch(db.starboard.stars[reaction.message.id]).then(msg => {
						msg.edit(`${reaction.count <= 5 ? (db.starboard.level1 ? db.starboard.level1 : ":star:") : reaction.count <= 10 ? (db.starboard.level2 ? db.starboard.level2 : ":star2:") : (db.starboard.level2 ? db.starboard.level3 : ":stars:")} **${reaction.count}** - ${reaction.message.channel} (${reaction.message.author})`);
					});
				} else {
					const embed = {
						color: reaction.message.guild.members.cache.get(reaction.message.author.id).displayColor,
						timestamp: new Date(),
						author: {
							name: `${reaction.message.author.username}`,
							icon_url: reaction.message.author.avatarURL(),
						},
						fields: [
							{
								name: "Link",
								value: `[Click me!](${reaction.message.url})`,
								inline: true,
							},
						],
						footer: {
							icon_url: client.user.avatarURL(),
							text: "moodE",
						},
					};
					const starInfo = `${db.starboard.level1 ? db.starboard.level1 : ":star:"} **${reaction.count}** - ${reaction.message.channel}`;
					if (reaction.message.content) {
						embed.title = "Message:";
						embed.description = reaction.message.content;
					}
					if (reaction.message.attachments.first()) {
						embed.image = {};
						embed.image.url = reaction.message.attachments.first().url;
					}
					const sent = await client.channels.cache.get(db.starboard.channel).send(starInfo, {embed});
					await sent.edit(`${starInfo} (${reaction.message.author})`);
					db.starboard.stars[reaction.message.id] = sent.id;
					Storage.exportDatabase(reaction.message.guild.id);
				}
			}
		}
	},
};
