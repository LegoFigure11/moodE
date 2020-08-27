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
			if (db.starboard.stars[reaction.message.id]) {
				if (reaction.count >= db.starboard.requiredStars) {
					const channel = client.channels.cache.get(db.starboard.channel);
					channel.messages.fetch(db.starboard.stars[reaction.message.id]).then(msg => {
						msg.edit(`${reaction.count <= 5 ? (db.starboard.level1 ? db.starboard.level1 : ":star:") : reaction.count <= 10 ? (db.starboard.level2 ? db.starboard.level2 : ":star2:") : (db.starboard.level2 ? db.starboard.level3 : ":stars:")} **${reaction.count}** - ${reaction.message.channel} (${reaction.message.author})`);
					});
				} else {
					const channel = client.channels.cache.get(db.starboard.channel);
					channel.messages.fetch(db.starboard.stars[reaction.message.id]).then(msg => {
						try {
							msg.delete();
							delete db.starboard.stars[reaction.message.id];
							Storage.exportDatabase(reaction.message.guild.id);
						} catch (e) {}
					});
				}
			}
		}
	},
};
