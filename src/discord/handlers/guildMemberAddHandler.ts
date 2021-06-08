import * as path from "path";

import type {GuildMember} from "discord.js";
import type {IGuildMemberAddEvent} from "../../types/events";

const FIRST_PRIORITY = 1;
const LAST_PRIORITY = 99;

export class GuildMemberAddHandler {
  eventsDirectory: string = path.join(Utilities.discordFolder, "events", "guildMemberAdd");
  private events: KeyedDict<number, Dict<IGuildMemberAddEvent>> = {};

  onReload(previous: Partial<GuildMemberAddHandler>): void {
    for (const i in previous) {
    // @ts-expect-error
      delete previous[i];
    }

    this.loadEvents().catch(e => console.error(e));
  }

  async loadEvents(directory: string = this.eventsDirectory): Promise<void> {
    const events: KeyedDict<number, Dict<IGuildMemberAddEvent>> = {};
    for await (const file of Utilities.getFiles(directory)) {
      if (!file.endsWith(".js")) continue;
      const eventName = path.basename(file).split(".")[0];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const event = require(file) as IGuildMemberAddEvent;
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
    __guildMemberAddHandlerLoaded = true;
    ReadyChecker.emit("loaded");
  }


  async executeEvents(member: GuildMember): Promise<void> {
    for (let i = FIRST_PRIORITY; i <= LAST_PRIORITY; i++) {
      if (!this.events[i]) continue;
      for (const event of Object.keys(this.events[i])) {
        if (this.events[i][event].disabled) continue;
        const tempMember = await this.events[i][event].process(member).catch(console.error);
        if (tempMember) member = tempMember;
      }
    }
    return;
  }
}

export const instantiate = (): void => {
  const oldHandler = global.GuildMemberAddHandler as GuildMemberAddHandler | undefined;

  global.GuildMemberAddHandler = new GuildMemberAddHandler();

  if (oldHandler) {
    global.GuildMemberAddHandler.onReload(oldHandler);
  }
};
