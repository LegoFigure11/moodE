"use strict";

// define constants
const child_process = require("child_process");
const Discord = require("discord.js");
const util = require("util");

const exec = util.promisify(child_process.exec);

const runDiscord = false;
const runShowdown = true;

// set up globals
global.colors = require("colors");
global.fs = require("fs");
global.packagejson = require("./package.json");
global.path = require("path");
global.Storage = require("./sources/storage.js");
global.Tools = require("./sources/tools.js");

global.discordText = "Discord-Bot: ".yellow;
global.moodeText = "moodE: ".yellow;
global.pokemonShowdownText = "pokemon-showdown: ".yellow;
global.showdownText = "PS-Bot: ".yellow;

Storage.importDatabases();

// Modified from https://github.com/sirDonovan/Lanette/blob/master/build.js
(async (resolve, reject) => {
	console.log(`${moodeText}Checking pokemon-showdown remote...`);
	const pokemonShowdown = path.join(__dirname, "pokemon-showdown");
	const moodeRemote = "https://github.com/smogon/pokemon-showdown.git";
	const moodeShaDir = path.join(__dirname, "pokemon-showdown.sha");
	let needsClone = false;
	let firstRun = false;
	let needsBuild = true;

	if (!fs.existsSync(pokemonShowdown)) {
		needsClone = true;
		firstRun = true;
		fs.mkdirSync(pokemonShowdown);
	}

	if (!(fs.existsSync(moodeShaDir))) {
		console.log(`${moodeText}Creating pokemon-showdown.sha...`);
		fs.writeFileSync(moodeShaDir);
	}

	process.chdir(pokemonShowdown);

	const remoteOutput = await exec("git remote -v").catch(e => console.log(e));
	if (!remoteOutput || remoteOutput.Error) {
		console.log(`${moodeText}${"Error".red}: No git remote output.`);
		reject();
		return;
	}

	let currentRemote;
	const remotes = remoteOutput.stdout.split("\n");
	for (let i = 0; i < remotes.length; i++) {
		const remote = remotes[i].replace("\t", " ");
		if (remote.startsWith("origin ") && remote.endsWith(" (fetch)")) {
			currentRemote = remote.split("origin ")[1].split(" (fetch)")[0].trim();
			break;
		}
	}

	process.chdir(__dirname);

	if (!currentRemote || currentRemote.trim() !== moodeRemote.trim()) {
		needsClone = true;
		deleteFolderRecursive(pokemonShowdown);
		if (!firstRun) console.log(`${moodeText}Deleted old remote ${currentRemote}`);
	}

	if (needsClone) {
		const hrStart = process.hrtime();
		console.log(`${moodeText}Cloning ${moodeRemote.trim().cyan} (This may take some time!)`);
		const cmd = await exec("git clone " + moodeRemote).catch(e => console.log(e));
		if (!cmd || cmd.Error) {
			reject();
			return;
		}
		const hrEnd = process.hrtime(hrStart);
		const timeString = `${Math.floor(hrEnd[0] / 60)} min ${hrEnd[0] % 60} sec`;
		console.log(`${moodeText}Cloned into ${pokemonShowdown.cyan} ${("(" + timeString + ")").grey}`);
	} else {
		console.log(`${moodeText}No clone required!`);
	}
	process.chdir(pokemonShowdown);

	const revParseOutput = await exec("git rev-parse master").catch(e => console.log(e));
	if (!revParseOutput || revParseOutput.Error) {
		reject();
		return;
	}

	const moodeSha = fs.readFileSync(moodeShaDir).toString().trim();
	const currentSha = revParseOutput.stdout.replace("\n", "");
	if (moodeSha !== currentSha) {
		console.log(`${moodeText}Writing sha... ${("(" + currentSha + ")").grey}`);
		fs.writeFileSync(moodeShaDir, currentSha);
	}

	console.log(`${pokemonShowdownText}Attempting pull...`);
	const pull = await exec("git pull");
	if (!pull || pull.Error) {
		needsBuild = false;
		console.log(`${pokemonShowdownText}Error: could not pull origin.`);
		return;
	}
	if (pull.stdout.replace("\n", "").replace(/-/g, " ") === "Already up to date.") {
		needsBuild = false;
		console.log(`${pokemonShowdownText}Already up to date!`);
	} else {
		console.log(`${pokemonShowdownText}Pull completed!`);
	}

	if (firstRun || needsBuild || needsClone) {
		console.log(`${pokemonShowdownText}Commencing build script...`);
		await exec("node build").catch(e => console.log(e));
		console.log(`${pokemonShowdownText}Built!`);
	}

	process.chdir(__dirname);

	if (runDiscord) {
		console.log(`${moodeText}Launching Discord...`);
		try {
			fs.accessSync(path.resolve(__dirname, "./discord/config.json"));
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
			console.log(`${discordText}: No discord configuration file found...`);
			console.log(`${discordText}: Writing one with default values. Please fill it out with your own information!`);
			fs.writeFileSync(path.resolve(__dirname, "./discord/config.json"), fs.readFileSync(path.resolve(__dirname, "./discord/config-example.json")));
		}
		global.client = new Discord.Client();
		global.discordConfig = require("./discord/config.json");
		global.successEmoji = discordConfig.successEmoji || "\u2705";
		global.failureEmoji = discordConfig.failureEmoji || "\u274C";

		if (!discordConfig.token) throw new Error(`${discordText}Please specify a token in config.json!`);

		global.discord = require("./discord/app.js");
	} else {
		console.log(`${moodeText}Discord Bot disabled.`);
	}

	if (runShowdown) {
		console.log(`${moodeText}Launching PS Bot...`);
		try {
			fs.accessSync(path.resolve(__dirname, "./showdown/config.json"));
		} catch (e) {
			if (e.code !== "ENOENT") throw e;
			console.log(`${showdownText}: No PS Bot configuration file found...`);
			console.log(`${showdownText}: Writing one with default values. Please fill it out with your own information!`);
			fs.writeFileSync(path.resolve(__dirname, "./showdown/config.json"), fs.readFileSync(path.resolve(__dirname, "./showdown/config-example.json")));
		}
		global.psBot = require("./showdown/app.js");
	} else {
		console.log(`${moodeText}PS Bot disabled.`);
	}
})();

// From https://github.com/sirDonovan/Lanette/blob/master/build.js#L12
function deleteFolderRecursive(folder) {
	folder = folder.trim();
	if (!folder || folder === "/" || folder === ".") return;
	let exists = false;
	try {
		fs.accessSync(folder);
		exists = true;
	} catch (e) {}
	if (exists) {
		const contents = fs.readdirSync(folder);
		for (let i = 0; i < contents.length; i++) {
			const curPath = path.join(folder, contents[i]);
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteFolderRecursive(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		}
		fs.rmdirSync(folder);
	}
}
