"use strict";

class Command {
	constructor(name, cmd) {
		this.name = name.toLowerCase();
		this.usage = cmd.usage || "";
		this.desc = cmd.desc || "No description.";
		this.longDesc = cmd.longDesc || this.desc;
		this.adminOnly = cmd.adminOnly || false;
		this.manager = cmd.isManager || false;
		this.elevated = cmd.isElevated || false;
		this.aliases = cmd.aliases || [];
		this.disabled = cmd.disabled || false;
		this.hasCustomFormatting = cmd.hasCustomFormatting || false;
		this.storage = cmd.storage || {};
		this.process = cmd.process;
		this.isNSFW = cmd.isNSFW || false;
		this.options = cmd.options || [];
		this.noPm = cmd.noPm || false;
		this.override = cmd.override || false;
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

	execute(message, args) {
		return this.process(message, args);
	}

	toString() {
		return `${discordConfig.commandCharacter}${this.name} ${this.usage}`;
	}
}

class DevCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "DevCommand";
	}

	execute(msg = [], flags = this.options) {
		if (this.disabled) {
			return;
		}
		return this.process(msg, flags);
	}
}

class DexCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "DexCommand";

		let hasDex = false;
		for (let i = 0; i < this.options.length; i++) {
			if (this.options[i].name === "gen") {
				hasDex = true;
				break;
			}
		}
		if (!hasDex) {
			this.options.push({name: "gen", value: discordConfig.defaultGen, desc: "The generation to run the command with."});
		}
	}

	execute(msg = [], flags = this.options, dex = null) {
		if (this.disabled) {
			return;
		}
		if (!dex) {
			return;
		}
		return this.process(msg, flags, dex);
	}
}

class DiscordCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "BotCommand";
	}

	execute(msg = [], flags = this.options) {
		if (this.disabled) {
			return;
		}
		return this.process(msg, flags);
	}
}

class FcCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "FcCommand";
	}

	execute(msg = [], flags = this.options) {
		if (this.disabled) {
			return;
		}
		return this.process(msg, flags);
	}
}

class JokeCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "JokeCommand";
	}

	execute(msg = [], flags = this.options) {
		if (this.disabled) {
			return;
		}
		return this.process(msg, flags);
	}
}

class ManagementCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "ManagementCommand";
	}

	execute(msg = [], flags = this.options) {
		if (this.disabled) {
			return;
		}
		return this.process(msg, flags);
	}
}

class NsfwCommand extends Command {
	constructor(name, cmd) {
		super(name, cmd);
		this.commandType = "NsfwCommand";
	}

	execute(msg = [], flags = this.options) {
		if (this.disabled) {
			return;
		}
		return this.process(msg, flags);
	}
}

module.exports.Command = Command;
module.exports.DevCommand = DevCommand;
module.exports.DexCommand = DexCommand;
module.exports.DiscordCommand = DiscordCommand;
module.exports.FcCommand = FcCommand;
module.exports.JokeCommand = JokeCommand;
module.exports.ManagementCommand = ManagementCommand;
module.exports.NsfwCommand = NsfwCommand;
