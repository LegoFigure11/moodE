"use strict";

const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const utilities = require("./utilities.js");

const databaseDirectory = path.resolve(__dirname, "../databases");

const BACKUP_INTERVAL = discordConfig.backups.interval || 12 * 60 * 60 * 1000; // 12 hours

class Backup {
	async databases() {
		if (discordConfig.backups) {
			backupDatabases();
			setInterval(function () {
				backupDatabases();
			}, BACKUP_INTERVAL);
		} else {
			console.log(`${Tools.discordText()}Automatic database backups disabled.`);
		}
	}
}

module.exports = new Backup();

async function backupDatabases() {
	utilities.checkForDb("backup", "{}");

	const filename = `Database backup - ${new Date().toLocaleString("en-GB").replace(/[/:]/g, "-")}.zip`;
	const file = await fs.createWriteStream(`${__dirname}/${filename}`);
	const archive = archiver("zip");

	const message = [];

	Storage.exportDatabases();

	const backup = Storage.getDatabase("backup");

	archive.on("error", function (e) {
		throw e;
	});

	file.on("close", async function () {
		console.log(`${Tools.discordText()}Database backup complete! ${archive.pointer()} total bytes`);
		await client.channels.cache.get(discordConfig.backups.channel).send(filename, {files: [`${__dirname}/${filename}`]});
		client.channels.cache.get(discordConfig.backups.channel).send(`Changes: ${message.length > 0 ? "```" + message.join("\n") + "```" : "None!"}`);
		fs.unlinkSync(`${__dirname}/${filename}`);
	});

	archive.pipe(file);

	await fs.readdir(databaseDirectory, (err, files) => {
		for (const file of files) {
			const dir = `${databaseDirectory}/${file}`;
			archive.append(fs.createReadStream(dir), {name: file});

			if (file.endsWith(".json") && file !== "backup.json") {
				const guild = parseGuildId(file);
				const size = fs.statSync(dir).size;

				if (backup[file]) {
					if (size > backup[file]) {
						if (guild) {
							message.push(`${file} (${guild.name}) - ${formatBytes(size)} (+${formatBytes(size - backup[file])})`);
						} else {
							message.push(`${file} - ${formatBytes(size)} (+${formatBytes(size - backup[file])})`);
						}
					}
				} else {
					if (guild) {
						message.push(`${file} (${guild.name}) - ${formatBytes(size)} (+${formatBytes(size)})`);
					} else {
						message.push(`${file} - ${formatBytes(size)} (+${formatBytes(size)})`);
					}
				}
				backup[file] = size;
				Storage.exportDatabase("backup");
			}
		}
		archive.finalize();
	});
}

function parseGuildId(input) {
	input = input.split(".json")[0];
	if (client.guilds.cache.get(input)) {
		return client.guilds.cache.get(input);
	}
	return undefined;
}

// From https://stackoverflow.com/a/18650828/13258354
function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
