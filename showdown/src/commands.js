"use strict";

class Command {
	constructor(name, cmd) {
		this.name = name.toLowerCase();
		this.usage = cmd.usage || "";
		this.desc = cmd.desc || "No description.";
		this.longDesc = cmd.longDesc || this.desc;
		this.aliases = cmd.aliases || [];
		this.disabled = cmd.disabled || false;
		this.developerOnly = cmd.developerOnly || false;
		this.roomRank = cmd.roomRank || null;
		this.globalRank = cmd.globalRank || null;
		this.rooms = cmd.rooms || false;
		this.process = cmd.process;
		this.noPm = cmd.noPm || false;
		this.pmOnly = cmd.pmOnly || false;
		this.commandType = "Command";

		if (Array.isArray(this.longDesc)) {
			this.longDesc = this.longDesc.join("\n");
		}
	}

	trigger(cmd = "") {
		if (this.disabled) {
			return false;
		}
		cmd = cmd.replace(/\s/gi, "").toLowerCase();
		if (cmd === `${this.name}`) {
			return true;
		}
		for (let i = 0; i < this.aliases.length; i++) {
			if (cmd === `${this.aliases[i]}`) {
				return true;
			}
		}
		return false;
	}

	execute(args, room, user) {
		return this.process(args, room, user);
	}

	toString() {
		return `${psConfig.commandCharacter}${this.name} ${this.usage}`;
	}
}

class DevCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "DevCommand";
	}

	execute(args, room, user) {
		if (this.disabled) {
			return;
		}
		return this.process(args, room, user);
	}
}

class PrivateCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "PrivateCommand";
	}

	execute(args, room, user) {
		if (this.disabled) {
			return;
		}
		return this.process(args, room, user);
	}
}

class ChineseCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "ChineseCommand";
	}

	execute(args, room, user) {
		if (this.disabled) {
			return;
		}
		return this.process(args, room, user);
	}
}

class DexCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "DexCommand";
	}

	execute(args, room, user, dex) {
		if (this.disabled) {
			return;
		}
		if (!dex) {
			return;
		}
		return this.process(args, room, user, dex);
	}
}

class ShowdownCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "BotCommand";
	}

	execute(args, room, user) {
		if (this.disabled) {
			return;
		}
		return this.process(args, room, user);
	}
}

module.exports.Command = Command;
module.exports.DevCommand = DevCommand;
module.exports.DexCommand = DexCommand;
module.exports.ShowdownCommand = ShowdownCommand;
module.exports.ChineseCommand = ChineseCommand;
module.exports.PrivateCommand = PrivateCommand;
