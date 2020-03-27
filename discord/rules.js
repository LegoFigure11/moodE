"use strict";

class Rule {
	constructor(name, rule) {
		this.name = name.toLowerCase();
		this.servers = rule.servers || [];
		this.channels = rule.channels || [];
		this.users = rule.users || [];
		this.process = rule.process;
	}

	execute(message) {
		return this.process(message);
	}
}

module.exports.Rule = Rule;
