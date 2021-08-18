import * as path from "path";

import type {Message} from "discord.js";
import type {IEvent} from "../../types/events";

const FIRST_PRIORITY = 1;
const LAST_PRIORITY = 99;

export class MessageCreateHandler {
  eventsDirectory: string = path.join(Utilities.discordFolder, "events", "messageCreate");
  private events: KeyedDict<number, Dict<IEvent>> = {};

  onReload(previous: Partial<MessageCreateHandler>): void {
    for (const i in previous) {
    // @ts-expect-error
      delete previous[i];
    }

    this.loadEvents().catch(e => console.error(e));
  }

  async loadEvents(directory: string = this.eventsDirectory): Promise<void> {
    const events: KeyedDict<number, Dict<IEvent>> = {};
    for await (const file of Utilities.getFiles(directory)) {
      if (!file.endsWith(".js")) continue;
      const eventName = path.basename(file).split(".")[0];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const event = require(file) as IEvent;
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
    __messageCreateHandlerLoaded = true;
    ReadyChecker.emit("loaded");
  }


  async executeEvents(message: Message): Promise<Message> {
    for (let i = FIRST_PRIORITY; i <= LAST_PRIORITY; i++) {
      if (!this.events[i]) continue;
      for (const event of Object.keys(this.events[i])) {
        if (this.events[i][event].disabled) continue;
        const tempMsg = await this.events[i][event].process(message).catch(console.error);
        if (tempMsg) message = tempMsg;
      }
    }
    return message as unknown as Message;
  }
}

export const instantiate = (): void => {
  const oldHandler = global.MessageCreateHandler as MessageCreateHandler | undefined;

  global.MessageCreateHandler = new MessageCreateHandler();

  if (oldHandler) {
    global.MessageCreateHandler.onReload(oldHandler);
  }
};
