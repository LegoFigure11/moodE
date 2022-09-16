"use strict";

class Rule {
	constructor(name, rule) {
		this.name = name.toLowerCase();
		this.rooms = rule.rooms || [];
		this.users = rule.users || [];
		this.process = rule.process;
	}

	execute(args, room, user) {
		return this.process(args, room, user);
	}
}

module.exports.Rule = Rule;
