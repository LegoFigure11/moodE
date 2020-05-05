"use strict";

global.psConfig = require("./config.json");
global.psRooms = require("./src/rooms.js").Rooms;
global.psUsers = require("./src/users.js").Users;
global.psMessageParser = require("./src/messageParser.js").MessageParser;
global.Tournaments = require("./src/tournaments.js");

const ShowdownClient = require("./src/client.js");
global.psClient = new ShowdownClient();

(async () => {
	global.PsCommandHandler = require("./src/commandHandler.js");
	global.psCommandHandler = new PsCommandHandler();
	await psCommandHandler.init();
	psClient.connect();
})();
