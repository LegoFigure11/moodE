import * as path from "path";

import type {GuildBan} from "discord.js";

import type {IGuildBanEvent} from "../../types/events";

const FIRST_PRIORITY = 1;
const LAST_PRIORITY = 99;

export class GuildBanRemoveHandler {
  eventsDirectory: string = path.join(Utilities.discordFolder, "events", "guildBanRemove");
  private events: KeyedDict<number, Dict<IGuildBanEvent>> = {};

  onReload(previous: Partial<GuildBanRemoveHandler>): void {
    for (const i in previous) {
    // @ts-expect-error
      delete previous[i];
    }

    this.loadEvents().catch(e => console.error(e));
  }

  async loadEvents(directory: string = this.eventsDirectory): Promise<void> {
    const events: KeyedDict<number, Dict<IGuildBanEvent>> = {};
    for await (const file of Utilities.getFiles(directory)) {
      if (!file.endsWith(".js")) continue;
      const eventName = path.basename(file).split(".")[0];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const event = require(file) as IGuildBanEvent;
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
    __guildBanRemoveHandlerLoaded = true;
    ReadyChecker.emit("loaded");
  }

  async executeEvents(ban: GuildBan): Promise<void> {
    for (let i = FIRST_PRIORITY; i <= LAST_PRIORITY; i++) {
      if (!this.events[i]) continue;
      for (const event of Object.keys(this.events[i])) {
        if (this.events[i][event].disabled) continue;
        const tempBan = await this.events[i][event].process(ban).catch(console.error);
        if (tempBan) ban = tempBan;
      }
    }
    return;
  }
}

export const instantiate = (): void => {
  const oldHandler = global.GuildBanRemoveHandler as GuildBanRemoveHandler | undefined;

  global.GuildBanRemoveHandler = new GuildBanRemoveHandler();

  if (oldHandler) {
    global.GuildBanRemoveHandler.onReload(oldHandler);
  }
};
