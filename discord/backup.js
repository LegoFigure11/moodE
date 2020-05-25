"use strict";

const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

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
			console.log(`${discordText}Automatic database backups disabled.`);
		}
	}
}

module.exports = new Backup();

async function backupDatabases() {
	const filename = `Database backup - ${new Date().toLocaleString("en-GB").replace(/[/:]/g, "-")}.zip`;
	const file = await fs.createWriteStream(`${__dirname}/${filename}`);
	const archive = archiver("zip");

	const message = [];

	Storage.exportDatabases();

	archive.on("error", function (e) {
		throw e;
	});

	file.on("close", async function () {
		console.log(`${discordText}Database backup complete! ${archive.pointer()} total bytes`);
		await client.channels.cache.get(discordConfig.backups.channel).send(filename, {files: [`${__dirname}/${filename}`]});
		client.channels.cache.get(discordConfig.backups.channel).send(`\`\`\`${message.join("\n")}\`\`\``);
		fs.unlinkSync(`${__dirname}/${filename}`);
	});

	archive.pipe(file);

	await fs.readdir(databaseDirectory, (err, files) => {
		for (const file of files) {
			archive.append(fs.createReadStream(`${databaseDirectory}/${file}`), {name: file});
			if (file.endsWith(".json")) message.push(`${file} - ${formatBytes(fs.statSync(`${databaseDirectory}/${file}`).size)}`);
		}
		archive.finalize();
	});
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
