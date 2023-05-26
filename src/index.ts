import {EventEmitter} from "events";
import * as path from "path";

import type {Message} from "discord.js";

import * as databases from "./databases";
import * as discordConfig from "./discord/config-example";
import * as commandHandler from "./discord/handlers/commandHandler";
import * as guildBanAddHandler from "./discord/handlers/guildBanAddHandler";
import * as guildBanRemoveHandler from "./discord/handlers/guildBanRemoveHandler";
import * as guildMemberAddHandler from "./discord/handlers/guildMemberAddHandler";
import * as guildMemberRemoveHandler from "./discord/handlers/guildMemberRemoveHandler";
import * as guildMemberUpdateHandler from "./discord/handlers/guildMemberUpdateHandler";
import * as messageCreateHandler from "./discord/handlers/messageCreateHandler";
import * as messageDeleteHandler from "./discord/handlers/messageDeleteHandler";
import * as messageReactionAddHandler from "./discord/handlers/messageReactionAddHandler";
import * as messageReactionRemoveHandler from "./discord/handlers/messageReactionRemoveHandler";
import * as messageUpdateHandler from "./discord/handlers/messageUpdateHandler";
import * as pluginsLoader from "./discord/handlers/pluginsLoader";
import * as csrng from "./misc/csrng";
import * as lcrng from "./misc/lcrng";
import type {ReloadableModule} from "./types/index";
import * as utilities from "./utilities";

const moduleOrder: ReloadableModule[] = [
  "utilities", "config", "databases", "commands", "messagedeletehandler", "messageupdatehandler",
  "guildmemberaddhandler", "messagereactionaddhandler", "messagereactionremovehandler",
  "guildbanaddhandler", "guildmemberremovehandler", "guildbanremovehandler",
  "messagecreatehandler", "pluginsloader", "guildmemberupdatehandler",
];

const moduleFilenames: KeyedDict<ReloadableModule, string> = {
  commands: path.join(__dirname, "discord", "handlers", "commandHandler.js"),
  guildbanaddhandler: path.join(__dirname, "discord", "handlers", "guildBanAddHandler.js"),
  guildbanremovehandler: path.join(__dirname, "discord", "handlers", "guildMemberRemoveHandler.js"),
  guildmemberaddhandler: path.join(__dirname, "discord", "handlers", "guildMemberAddHandler.js"),
  guildmemberremovehandler: path.join(
    __dirname, "discord", "handlers", "guildMemberRemoveHandler.js"
  ),
  guildmemberupdatehandler: path.join(
    __dirname, "discord", "handlers", "guildMemberUpdateHandler.js"
  ),
  messagecreatehandler: path.join(__dirname, "discord", "handlers", "messageCreateHandler.js"),
  messagedeletehandler: path.join(__dirname, "discord", "handlers", "messageDeleteHandler.js"),
  messageupdatehandler: path.join(__dirname, "discord", "handlers", "messageUpdateHandler.js"),
  messagereactionaddhandler: path.join(
    __dirname, "discord", "handlers", "messageReactionAddHandler.js"
  ),
  messagereactionremovehandler: path.join(
    __dirname, "discord", "handlers", "messageReactionRemoveHandler.js"
  ),
  pluginsloader: path.join(__dirname, "discord", "handlers", "pluginsLoader.js"),
  config: path.join(__dirname, "discord", "config-example.js"),
  databases: path.join(__dirname, "databases.js"),
  utilities: path.join(__dirname, "utilities.js"),
  all: "", // Unsused
};

module.exports = (): void => {
  global.__production = process.argv.includes("--production");

  global.ReadyChecker = new EventEmitter();
  global.__clientReady = false;

  utilities.instantiate();

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  void csrng.instantiate();

  global.RNG = new lcrng.PokeRNG(); // Already initialized
  RNG.reseed(Utilities.random(0xFFFFFFFF)); // Randomly seed

  global.DiscordConfig = discordConfig;
  global.__listen = false;
  void databases.instantiate();
  void commandHandler.instantiate();
  void guildBanAddHandler.instantiate();
  void guildBanRemoveHandler.instantiate();
  void guildMemberAddHandler.instantiate();
  void guildMemberRemoveHandler.instantiate();
  void guildMemberUpdateHandler.instantiate();
  void messageCreateHandler.instantiate();
  void messageDeleteHandler.instantiate();
  void messageUpdateHandler.instantiate();
  void messageReactionAddHandler.instantiate();
  void messageReactionRemoveHandler.instantiate();
  void pluginsLoader.instantiate();

  console.log(Utilities.moodeText("Loading Databases..."));
  void Databases.importDatabases();

  global.__commandsLoaded = false;
  console.log(Utilities.moodeText("Loading Commands..."));
  void CommandHandler.loadCommandsDirectory();

  global.__guildBanAddHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Guild Ban Add Events..."));
  void GuildBanAddHandler.loadEvents();

  global.__guildBanRemoveHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Guild Ban Remove Events..."));
  void GuildBanRemoveHandler.loadEvents();

  global.__guildMemberAddHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Guild Member Add Events..."));
  void GuildMemberAddHandler.loadEvents();

  global.__guildMemberRemoveHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Guild Member Remove Events..."));
  void GuildMemberRemoveHandler.loadEvents();

  global.__guildMemberUpdateHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Guild Member Update Events..."));
  void GuildMemberUpdateHandler.loadEvents();

  global.__messageCreateHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Message Create Events..."));
  void MessageCreateHandler.loadEvents();

  global.__messageDeleteHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Message Delete Events..."));
  void MessageDeleteHandler.loadEvents();

  global.__messageUpdateHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Message Update Events..."));
  void MessageUpdateHandler.loadEvents();

  global.__messageReactionAddHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Message Reaction Add Events..."));
  void MessageReactionAddHandler.loadEvents();

  global.__messageReactionRemoveHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Message Reaction Remove Events..."));
  void MessageReactionRemoveHandler.loadEvents();

  global.__PluginLoaderLoaded = false;
  console.log(Utilities.moodeText("Loading Plugins..."));
  void PluginsLoader.loadPlugins();

  global.__reloadInProgress = false;

  // eslint-disable-next-line
  global.__reloadModules = async (message, args): Promise<void> => {
    const m = await message.channel.send("Reloading...") as unknown as Message;
    const start = process.hrtime.bigint();
    const hasModules: boolean[] = moduleOrder.slice().map(() => false);
    if (!args?.length || args[0] === "") args = ["all"];

    if (args.includes("all")) args = moduleOrder;

    for (const arg of args) {
      const id = Utilities.toId(arg) as ReloadableModule;
      const moduleIndex = moduleOrder.indexOf(id);
      if (moduleIndex !== -1) {
        hasModules[moduleIndex] = true;
      } else {
        m.edit(
          Utilities.failureEmoji(
            message,
            `\`${arg.trim()}\` is not a module or cannot be reloaded.`
          )
        ).catch(e => console.error(e));
        return;
      }
    }
    global.__reloadInProgress = true;
    __commandsLoaded = false;
    __guildBanAddHandlerLoaded = false;
    __guildBanRemoveHandlerLoaded = false;
    __guildMemberAddHandlerLoaded = false;
    __guildMemberRemoveHandlerLoaded = false;
    __guildMemberUpdateHandlerLoaded = false;
    __messageCreateHandlerLoaded = false;
    __messageDeleteHandlerLoaded = false;
    __messageUpdateHandlerLoaded = false;
    __messageReactionAddHandlerLoaded = false;
    __PluginLoaderLoaded = false;

    const modules: ReloadableModule[] = [];
    for (let i = 0; i < hasModules.length; i++) {
      if (hasModules[i]) modules.push(moduleOrder[i]);
    }

    if (modules.includes("databases")) Databases.reloadInProgress = true;

    for (const moduleName of modules) {
      Utilities.uncacheTree(path.resolve(moduleFilenames[moduleName]));
    }

    const buildScript = path.join(Utilities.rootFolder, "build.js");
    Utilities.uncacheTree(buildScript);

    m.edit("Running `tsc`...").catch(e => console.error(e));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return (require(buildScript)()).then(() => {
      for (const moduleName of modules) {
        if (moduleName === "commands") {
          const newCommandParser = // eslint-disable-next-line @typescript-eslint/no-var-requires
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/commandHandler"
            );
          newCommandParser.instantiate();
        } else if (moduleName === "config") {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          global.DiscordConfig = require(moduleFilenames[moduleName]) as typeof import(
            "./discord/config-example"
          );
        } else if (moduleName === "databases") {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const newDatabases = require(moduleFilenames[moduleName]) as typeof import("./databases");
          newDatabases.instantiate();
        } else if (moduleName === "utilities") {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const newUtilities = require(moduleFilenames[moduleName]) as typeof import("./utilities");
          newUtilities.instantiate();
        } else if (moduleName === "guildbanaddhandler") {
          const newGuildBanAddHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/guildBanAddHandler"
            );
          newGuildBanAddHandler.instantiate();
        } else if (moduleName === "guildbanremovehandler") {
          const newGuildBanRemoveHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/guildBanRemoveHandler"
            );
          newGuildBanRemoveHandler.instantiate();
        } else if (moduleName === "guildmemberaddhandler") {
          const newGuildMemberAddHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/guildMemberAddHandler"
            );
          newGuildMemberAddHandler.instantiate();
        } else if (moduleName === "guildmemberremovehandler") {
          const newGuildMemberRemoveHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/guildMemberRemoveHandler"
            );
          newGuildMemberRemoveHandler.instantiate();
        } else if (moduleName === "guildmemberupdatehandler") {
          const newGuildMemberUpdateHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/guildMemberUpdateHandler"
            );
          newGuildMemberUpdateHandler.instantiate();
        } else if (moduleName === "messagecreatehandler") {
          const newMessageCreateHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/messageCreateHandler"
            );
          newMessageCreateHandler.instantiate();
        } else if (moduleName === "messagedeletehandler") {
          const newMessageDeleteHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/messageDeleteHandler"
            );
          newMessageDeleteHandler.instantiate();
        } else if (moduleName === "messageupdatehandler") {
          const newMessageUpdateHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/messageUpdateHandler"
            );
          newMessageUpdateHandler.instantiate();
        } else if (moduleName === "messagereactionaddhandler") {
          const newMessageReactionAddHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/messageReactionAddHandler"
            );
          newMessageReactionAddHandler.instantiate();
        } else if (moduleName === "messagereactionremovehandler") {
          const newMessageReactionRemoveHandler = // eslint-disable-next-line
            require(moduleFilenames[moduleName]) as typeof import(
              "./discord/handlers/messageReactionRemoveHandler"
            );
          newMessageReactionRemoveHandler.instantiate();
        } else if (moduleName === "pluginsloader") {
          // eslint-disable-next-line
          const newPluginsLoader = require(moduleFilenames[moduleName]) as typeof import (
            "./discord/handlers/pluginsLoader"
          );
          newPluginsLoader.instantiate();
        }
      }

      global.__reloadInProgress = false;
      const end = process.hrtime.bigint();
      m.edit(
        Utilities.successEmoji(
          message,
          `Successfully reloaded ${Utilities.joinList(modules, "`", "`")}! (in ${
            (Number((end - start) / BigInt(1e6)) / 1000).toFixed(3)
          }s)`
        )
      ).catch(e => console.error(e));
    }).catch((e: Error) => {
      console.log(e);

      global.__reloadInProgress = false;
      if (Databases.reloadInProgress) Databases.reloadInProgress = false;
      m.edit(
        Utilities.failureEmoji(message, `\`ERROR\` \`\`\`XL\n${e.message}\`\`\``)
      ).catch(err => console.error(err));
    });
  };
};
