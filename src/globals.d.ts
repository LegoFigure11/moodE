import type {EventEmitter as eventEmitterType} from "events";
import type {Storage as storageType} from "./storage";
import type {Utilities as utilitiesType} from "./utilities";
import type * as discordConfig from "./discord/config-example";
import type {CommandHandler as commandHandlerType} from "./discord/handlers/commandHandler";
import type {GuildMemberAddHandler as guildMemberAddHandlerType}
  from "./discord/handlers/guildMemberAddHandler";
import type {GuildMemberRemoveHandler as guildMemberRemoveHandlerType}
  from "./discord/handlers/guildMemberRemoveHandler";
import type {MessageDeleteHandler as messageDeleteHandlerType}
  from "./discord/handlers/messageDeleteHandler";
import type {MessageUpdateHandler as messageUpdateHandlerType}
  from "./discord/handlers/messageUpdateHandler";
import type {MessageReactionAddHandler as messageReactionAddHandlerType}
  from "./discord/handlers/messageReactionAddHandler";
import type {MessageReactionRemoveHandler as messageReactionRemoveHandlerType}
  from "./discord/handlers/messageReactionRemoveHandler";

/* eslint-disable no-var */
declare global {
  var __clientReady: boolean;
  var __commandsLoaded: boolean;
  var __guildMemberAddHandlerLoaded: boolean;
  var __guildMemberRemoveHandlerLoaded: boolean;
  var __messageDeleteHandlerLoaded: boolean;
  var __messageUpdateHandlerLoaded: boolean;
  var __messageReactionAddHandlerLoaded: boolean;
  var __messageReactionRemoveHandlerLoaded: boolean;
  var __listen: boolean;
  var __production: boolean;
  var __reloadInProgress: boolean;
  var __reloadModules: (message: import("discord.js").Message, args: string[]) => Promise<void>;
  var CommandHandler: commandHandlerType;
  var GuildMemberAddHandler: guildMemberAddHandlerType;
  var GuildMemberRemoveHandler: guildMemberRemoveHandlerType;
  var MessageDeleteHandler: messageDeleteHandlerType;
  var MessageUpdateHandler: messageUpdateHandlerType;
  var MessageReactionAddHandler: messageReactionAddHandlerType;
  var MessageReactionRemoveHandler: messageReactionRemoveHandlerType;
  var DiscordConfig: Partial<typeof discordConfig>;
  var Storage: storageType;
  var Utilities: utilitiesType;
  var ReadyChecker: eventEmitterType;
}
/* eslint-enable no-var */
