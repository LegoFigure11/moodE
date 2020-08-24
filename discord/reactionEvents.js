"use strict";

class Event {
	constructor(name, event) {
		this.name = name.toLowerCase();
		this.servers = event.servers || [];
		this.channels = event.channels || [];
		this.users = event.users || [];
		this.noPm = event.noPm || false;
		this.process = event.process;
		this.disabled = event.disabled;
	}

	execute(reaction, user, type) {
		return this.process(reaction, user, type);
	}
}

module.exports.Event = Event;
