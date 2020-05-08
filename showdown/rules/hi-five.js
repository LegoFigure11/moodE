"use strict";

const images = ["http://i.imgur.com/gXnhbho.jpg", "http://i.imgur.com/58g3qGo.gif", "http://i.imgur.com/kpPxUQN.jpg", "http://i.imgur.com/B219e.jpg", "http://i.imgur.com/C9SG3bs.gif"];

module.exports = {
	rooms: ["botdevelopment", "battlestadium"],
	async process(message, room, user) {
		const db = Storage.getDatabase(room.id);
		if (!(db.hifive)) db.hifive = false;
		if (message.includes("\\o") && db.hifive && db.hifive !== user.id) {
			const user1 = psUsers.get(db.hifive);
			const user2 = user;
			console.log(`${showdownText}Hi-Five between ${user1.name.cyan} and ${user2.name.cyan} ${"(in ".grey}${room.id.grey}${")".grey}`);
			room.say(`${user1.name} o/\\o ${user2.name}`);
			room.say(`/adduhtml teammates, <img src="${Tools.sampleOne(images)}" width="0" height="0" style="width:auto; height:auto; display: block; margin-left: auto; margin-right: auto;" />`);
			db.hifive = false;
			Storage.exportDatabase(room.id);
		}
		if (message.includes("o/")) {
			db.hifive = user.id;
		} else {
			db.hifive = false;
		}
		Storage.exportDatabase(room.id);
	},
};
