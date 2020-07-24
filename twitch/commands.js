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
		this.requiredRank = cmd.requiredRank || false;
		this.channels = cmd.channels || false;
		this.process = cmd.process;
		this.noWhisper = cmd.noWhisper || false;
		this.whisperOnly = cmd.whisperOnly || false;
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

	execute(args, channel, user, self) {
		return this.process(args, channel, user, self);
	}

	toString() {
		return `${twitchConfig.commandCharacter}${this.name} ${this.usage}`;
	}
}

class DevCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "DevCommand";
	}

	execute(args, channel, user, self) {
		if (this.disabled) {
			return;
		}
		return this.process(args, channel, user, self);
	}
}

class PrivateCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "PrivateCommand";
	}

	execute(args, channel, user, self) {
		if (this.disabled) {
			return;
		}
		return this.process(args, channel, user, self);
	}
}

class DexCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "DexCommand";
	}

	execute(args, channel, user, self, dex) {
		if (this.disabled) {
			return;
		}
		if (!dex) {
			return;
		}
		return this.process(args, channel, user, self, dex);
	}
}

class TwitchCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "BotCommand";
	}

	execute(args, channel, user, self) {
		if (this.disabled) {
			return;
		}
		return this.process(args, channel, user, self);
	}
}

module.exports.Command = Command;
module.exports.DevCommand = DevCommand;
module.exports.DexCommand = DexCommand;
module.exports.TwitchCommand = TwitchCommand;
module.exports.PrivateCommand = PrivateCommand;
