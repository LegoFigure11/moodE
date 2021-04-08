import * as path from "path";

import {EventEmitter} from "events";

import * as utilities from "./utilities";
import * as storage from "./storage";
import * as discordConfig from "./discord/config-example";
import * as commandHandler from "./discord/handlers/commandHandler";
import * as messageDeleteHandler from "./discord/handlers/messageDeleteHandler";
import * as messageUpdateHandler from "./discord/handlers/messageUpdateHandler";

import type {ReloadableModule} from "./types/index";
import type {Message} from "discord.js";

const moduleOrder: ReloadableModule[] = [
  "utilities", "config", "storage", "commands", "messagedeletehandler", "messageupdatehandler",
];

const moduleFilenames: KeyedDict<ReloadableModule, string> = {
  commands: path.join(__dirname, "discord", "handlers", "commandHandler.js"),
  messagedeletehandler: path.join(__dirname, "discord", "handlers", "messageDeleteHandler.js"),
  messageupdatehandler: path.join(__dirname, "discord", "handlers", "messageUpdateHandler.js"),
  config: path.join(__dirname, "discord", "config-example.js"),
  storage: path.join(__dirname, "storage.js"),
  utilities: path.join(__dirname, "utilities.js"),
  all: "", // Unsused
};

module.exports = (): void => {
  global.__production = process.argv.includes("--production");

  global.ReadyChecker = new EventEmitter();
  global.__clientReady = false;

  utilities.instantiate();
  global.DiscordConfig = discordConfig;
  global.__listen = false;
  void storage.instantiate();
  void commandHandler.instantiate();
  void messageDeleteHandler.instantiate();
  void messageUpdateHandler.instantiate();

  console.log(Utilities.moodeText("Loading Databases..."));
  void Storage.importDatabases();

  global.__commandsLoaded = false;
  console.log(Utilities.moodeText("Loading Commands..."));
  void CommandHandler.loadCommandsDirectory();

  global.__messageDeleteHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Message Delete Events..."));
  void MessageDeleteHandler.loadEvents();

  global.__messageUpdateHandlerLoaded = false;
  console.log(Utilities.moodeText("Loading Message Update Events..."));
  void MessageUpdateHandler.loadEvents();

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

    const modules: ReloadableModule[] = [];
    for (let i = 0; i < hasModules.length; i++) {
      if (hasModules[i]) modules.push(moduleOrder[i]);
    }

    if (modules.includes("storage")) Storage.reloadInProgress = true;

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
        } else if (moduleName === "storage") {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const newStorage = require(moduleFilenames[moduleName]) as typeof import("./storage");
          newStorage.instantiate();
        } else if (moduleName === "utilities") {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const newUtilities = require(moduleFilenames[moduleName]) as typeof import("./utilities");
          newUtilities.instantiate();
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
      if (Storage.reloadInProgress) Storage.reloadInProgress = false;
      m.edit(
        Utilities.failureEmoji(message, `\`ERROR\` \`\`\`XL\n${e.message}\`\`\``)
      ).catch(err => console.error(err));
    });
  };
};
