"use strict";

const WebSocketClient = require("websocket").client;
const https = require("https");
const url = require("url");
const querystring = require("querystring");

const RELOGIN_SECONDS = 60;
const MESSAGE_THROTTLE = 600;
const BASE_RECONNECT_SECONDS = 60;

let server = "play.pokemonshowdown.com";
if (psConfig.server && psConfig.server !== server) {
	server = psConfig.server.includes(".psim.us") ? psConfig.server : `${psConfig.server}.psim.us`;
}
const serverId = "showdown";
let reconnections = 0;

const bannedWords = psConfig.bannedWords && Array.isArray(psConfig.bannedWords) ? psConfig.bannedWords.map(x => x.toLowerCase()) : [];

class Client {
	constructor() {
		this.serverId = serverId;
		this.challstr = "";

		this.messageQueue = [];
		this.messageQueueTimeout = null;

		this.client = new WebSocketClient();
		this.client.on("connect", connection => {
			this.connection = connection;

			this.connection.on("message", message => this.onMessage(message));
			this.connection.on("error", error => this.onConnectionError(error));
			this.connection.on("close", (code, description) => this.onConnectionClose(code, description));

			this.onConnect();
		});
	}

	send(message) {
		if (!message || !this.connection || !this.connection.connected) return;
		if (this.messageQueueTimeout) {
			this.messageQueue.push(message);
			return;
		}
		if (bannedWords.length) {
			const lower = message.toLowerCase();
			for (let i = 0, len = bannedWords.length; i < len; i++) {
				if (lower.includes(bannedWords[i])) return;
			}
		}
		this.connection.send(message);
		this.messageQueueTimeout = setTimeout(() => {
			this.messageQueueTimeout = null;
			const message = this.messageQueue.shift();
			if (message) this.send(message);
		}, MESSAGE_THROTTLE);
	}

	onConnectFail(error) {
		if (this.connectTimeout) clearTimeout(this.connectTimeout);
		if (error) console.log(error.stack);
		reconnections++;
		const retryTime = BASE_RECONNECT_SECONDS * reconnections;
		console.log(`${Tools.showdownText()}Failed to connect to server ${server.brightRed}\n${Tools.showdownText()}(Retrying in ${(retryTime).cyan} seconds${reconnections > 1 ? " (" + reconnections + ")" : ""})`);
		this.connectTimeout = setTimeout(() => this.connect(), retryTime * 1000);
	}

	onConnectionError(error) {
		console.log(`${Tools.showdownText()}Connection error: ${error.stack}`);
	}

	onConnectionClose(code, description) {
		if (this.connectTimeout) clearTimeout(this.connectTimeout);
		let reconnectTime;
		if (this.lockdown) {
			console.log(`${Tools.showdownText()}Connection closed: the server restarted!`);
			reconnections = 0;
			reconnectTime = 15;
		} else {
			console.log(`${Tools.showdownText()}Connection closed: ${description} (${code})`);
			reconnections++;
			reconnectTime = BASE_RECONNECT_SECONDS * reconnections;
		}
		console.log(`Reconnecting in ${reconnectTime.cyan} seconds (${reconnections > 1 ? " (" + reconnections + ")" : ""}`);
		psRooms.destroyRooms();
		psUsers.destroyUsers();
		this.connectTimeout = setTimeout(() => this.connect(), reconnectTime * 1000);
	}

	onConnect() {
		console.log(`${Tools.showdownText()}Successfully connected to ${server.cyan}`);
	}

	connect() {
		const options = {
			hostname: "play.pokemonshowdown.com",
			path: `/crossdomain.php?${querystring.stringify({host: server, path: ""})}`,
			method: "GET",
		};

		https.get(options, response => {
			response.setEncoding("utf8");
			let data = "";
			response.on("data", chunk => {
				data += chunk;
			});
			response.on("end", () => {
				const configData = data.split("var config = ")[1];
				if (configData) {
					let config = JSON.parse(configData.split(";")[0]);
					if (typeof config === "string") config = JSON.parse(config); // encoded twice by the server
					if (config.host) {
						if (config.id) this.serverId = config.id;
						this.client.connect(`ws://${config.host === "showdown" ? "sim.smogon.com" : config.host}:${config.port || 8000}/showdown/websocket`);
						return;
					}
				}
				console.log(`${Tools.showdownText()}${"Error".brightRed}: failed to get data for server ${server}`);
			});
		}).on("error", error => {
			console.log(`${Tools.showdownText()}${"Error".brightRed}: ${error.message}`);
		});

		this.connectTimeout = setTimeout(() => this.onConnectFail(), 30 * 1000);
	}
	login() {
		console.log(`${Tools.showdownText()}Logging in to ${server.cyan}`);
		const action = url.parse(`https://play.pokemonshowdown.com/~~${this.serverId}/action.php`);
		const options = {
			hostname: action.hostname,
			path: action.pathname,
			agent: false,
		};
		if (action.port) options.port = parseInt(action.port);

		let postData;
		if (psConfig.password) {
			options.method = "POST";
			postData = querystring.stringify({
				"act": "login",
				"name": psConfig.username,
				"pass": psConfig.password,
				"challstr": this.challstr,
			});
			options.headers = {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": postData.length,
			};
		} else {
			options.method = "GET";
			options.path += "?" + querystring.stringify({
				"act": "getassertion",
				"userid": Tools.toId(psConfig.username),
				"challstr": this.challstr,
			});
		}

		const request = https.request(options, response => {
			response.setEncoding("utf8");
			let data = "";
			response.on("data", chunk => {
				data += chunk;
			});
			response.on("end", () => {
				if (data === ";") {
					console.log(`${Tools.showdownText()}Failed to log in: invalid password`);
					process.exit();
				} else if (data.charAt(0) !== "]") {
					console.log(`${Tools.showdownText()}Failed to log in: ${data}`);
					process.exit();
				} else if (data.startsWith("<!DOCTYPE html>")) {
					console.log(`${Tools.showdownText()}Failed to log in: connection timed out. Trying again in ${RELOGIN_SECONDS.cyan} seconds`);
					setTimeout(() => this.login(), RELOGIN_SECONDS * 1000);
					return;
				} else if (data.includes("heavy load")) {
					console.log(`${Tools.showdownText()}Failed to log in: the login server is under heavy load. Trying again in ${RELOGIN_SECONDS.cyan} seconds`);
					setTimeout(() => this.login(), RELOGIN_SECONDS * 1000);
					return;
				} else {
					if (psConfig.password) {
						const assertion = JSON.parse(data.substr(1));
						if (assertion.actionsuccess && assertion.assertion) {
							data = assertion.assertion;
						} else {
							console.log(`${Tools.showdownText()}Failed to log in: ${JSON.stringify(assertion)}`);
							process.exit();
						}
					}
					this.send(`|/trn ${psConfig.username},0,${data}`);
				}
			});
		});

		request.on("error", error => console.log(`${Tools.showdownText()}Login error: ${error.stack}`));

		if (postData) request.write(postData);
		request.end();
	}

	onMessage(message) {
		if (message.type !== "utf8" || !message.utf8Data) return;
		let room = psRooms.add("lobby");
		if (!message.utf8Data.includes("\n")) return psMessageParser.parse(message.utf8Data, room);

		let lines = message.utf8Data.split("\n");
		if (lines[0].charAt(0) === ">") {
			room = psRooms.add(lines[0].substr(1));
			for (let i = 0, len = lines.length; i < len; i++) {
				if (lines[i].startsWith("|title|")) {
					room.title = lines[i].split("|")[2];
				}
				if (lines[i].startsWith("|tier|")) {
					room.tier = lines[i].split("|")[2];
				}
			}
			lines.shift();
		}
		for (let i = 0, len = lines.length; i < len; i++) {
			if (lines[i].startsWith("|init|")) {
				psMessageParser.parse(lines[i], room);
				lines = lines.slice(i + 1);
				for (let i = 0, len = lines.length; i < len; i++) {
					if (lines[i].startsWith("|users|")) {
						psMessageParser.parse(lines[i], room);
						break;
					}
				}
				return;
			}
			psMessageParser.parse(lines[i], room);
		}
	}
}

module.exports = Client;
