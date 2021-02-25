import type {EventEmitter as eventEmitterType} from "events";
import type {Storage as storageType} from "./storage";
import type {Utilities as utilitiesType} from "./utilities";
import type * as discordConfig from "./discord/config-example";
import type {CommandHandler as commandHandlerType} from "./discord/handlers/commandHandler";
import type {MessageDeleteHandler as messageDeleteHandlerType}
  from "./discord/handlers/messageDeleteHandler";
import type {MessageUpdateHandler as messageUpdateHandlerType}
  from "./discord/handlers/messageUpdateHandler";

declare global {
  let __clientReady: boolean;
  let __commandsLoaded: boolean;
  let __messageDeleteHandlerLoaded: boolean;
  let __messageUpdateHandlerLoaded: boolean;
  let __listen: boolean;
  let __reloadInProgress: boolean;
  let __reloadModules: (message: import("discord.js").Message, args: string[]) => Promise<void>;
  const CommandHandler: commandHandlerType;
  const MessageDeleteHandler: messageDeleteHandlerType;
  const MessageUpdateHandler: messageUpdateHandlerType;
  const DiscordConfig: Partial<typeof discordConfig>;
  const Storage: storageType;
  const Utilities: utilitiesType;
  const ReadyChecker: eventEmitterType;
}
