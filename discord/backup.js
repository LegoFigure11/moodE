"use strict";

const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

const databaseDirectory = path.resolve(__dirname, "../databases");

const BACKUP_INTERVAL = discordConfig.backups.interval || 12 * 60 * 60 * 1000; // 12 hours

class Backup {
	async databases() {
		if (discordConfig.backups) {
			setInterval(async function () {
				const filename = `Database backup - ${new Date().toLocaleString("en-GB").replace(/[/:]/g, "-")}.zip`;
		    const file = await fs.createWriteStream(`${__dirname}/${filename}`);
		    const archive = archiver("zip");
		    Storage.exportDatabases();

		    archive.on("error", function (e) {
		      throw e;
		    });

		    file.on("close", async function () {
		      console.log(`${discordText}Database backup complete! ${archive.pointer()} total bytes`);
		      await client.channels.cache.get(discordConfig.backups.channel).send(filename, {files: [`${__dirname}/${filename}`]});
		      fs.unlinkSync(`${__dirname}/${filename}`);
		    });

		    archive.pipe(file);

		    await fs.readdir(databaseDirectory, (err, files) => {
		      for (const file of files) {
		        archive.append(fs.createReadStream(`${databaseDirectory}/${file}`), {name: file});
		      }
		      archive.finalize();
		    });
			}, BACKUP_INTERVAL);
		} else {
			console.log(`${discordText}Automatic database backups disabled.`);
		}
	}
}

module.exports = new Backup();
