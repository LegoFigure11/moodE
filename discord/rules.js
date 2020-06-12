"use strict";

class Rule {
	constructor(name, rule) {
		this.name = name.toLowerCase();
		this.servers = rule.servers || [];
		this.channels = rule.channels || [];
		this.users = rule.users || [];
		this.process = rule.process;
	}

	// oldMessage will be run as `message` in MessageParser rules, but this way we
	// Can use the same framework for editRules too
	execute(oldMessage, newMessage) {
		return this.process(oldMessage, newMessage);
	}
}

module.exports.Rule = Rule;
