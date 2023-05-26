import * as path from "path";

import type {GuildMember} from "discord.js";

import type {IGuildMemberUpdateEvent} from "../../types/events";

const FIRST_PRIORITY = 1;
const LAST_PRIORITY = 99;

export class GuildMemberUpdateHandler {
  eventsDirectory: string = path.join(Utilities.discordFolder, "events", "guildMemberUpdate");
  private events: KeyedDict<number, Dict<IGuildMemberUpdateEvent>> = {};

  onReload(previous: Partial<GuildMemberUpdateHandler>): void {
    for (const i in previous) {
    // @ts-expect-error
      delete previous[i];
    }

    this.loadEvents().catch(e => console.error(e));
  }

  async loadEvents(directory: string = this.eventsDirectory): Promise<void> {
    const events: KeyedDict<number, Dict<IGuildMemberUpdateEvent>> = {};
    for await (const file of Utilities.getFiles(directory)) {
      if (!file.endsWith(".js")) continue;
      const eventName = path.basename(file).split(".")[0];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const event = require(file) as IGuildMemberUpdateEvent;
      const priority = event?.priority || LAST_PRIORITY;
      // FIXME
      /* if (this.get(eventName)) {
        console.error(
          Utilities.discordText(
            `"${eventName}" is already defined or has an overlapping alias! Skipping...`
          )
        );
        continue;
      }*/
      if (eventName !== Utilities.toId(eventName)) {
        console.error(
          Utilities.discordText(`"${eventName}" is not a valid event name! Skipping...`)
        );
        continue;
      }
      if (!events[priority]) events[priority] = {};
      events[priority][eventName] = event;
    }
    this.events = events;
    __guildMemberUpdateHandlerLoaded = true;
    ReadyChecker.emit("loaded");
  }

  async executeEvents(oldMember: GuildMember, newMember: GuildMember): Promise<void> {
    for (let i = FIRST_PRIORITY; i <= LAST_PRIORITY; i++) {
      if (!this.events[i]) continue;
      for (const event of Object.keys(this.events[i])) {
        if (this.events[i][event].disabled) continue;
        const tempMember = await this.events[i][event].process(
          oldMember, newMember
        ).catch(console.error);
        if (tempMember) newMember = tempMember;
      }
    }
    return;
  }
}

export const instantiate = (): void => {
  const oldHandler = global.GuildMemberUpdateHandler as GuildMemberUpdateHandler | undefined;

  global.GuildMemberUpdateHandler = new GuildMemberUpdateHandler();

  if (oldHandler) {
    global.GuildMemberUpdateHandler.onReload(oldHandler);
  }
};
