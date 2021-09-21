import * as path from "path";

import {Message, Permissions} from "discord.js";
import {green} from "colors/safe";
import type {ICommand} from "../../types/commands";

import {UserPermissions} from "../enums/userPermissions";

export class CommandHandler {
  commandsDirectory: string = path.join(Utilities.discordFolder, "commands");
  private privateCommands: Dict<ICommand> = {};
  private commands: Dict<ICommand> = {};

  onReload(previous: Partial<CommandHandler>): void {
    for (const i in previous) {
    // @ts-expect-error
      delete previous[i];
    }

    this.loadCommandsDirectory().catch(e => console.error(e));
  }

  async loadCommandsDirectory(directory: string = this.commandsDirectory): Promise<void> {
    const commands: Dict<ICommand> = {};
    for await (const file of Utilities.getFiles(directory)) {
      if (!file.endsWith(".js")) continue;
      const commandName = path.basename(file).split(".")[0];
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(file) as ICommand;
      const isPrivate = file.includes("private");
      if (!isPrivate && this.get(commandName, commands)) {
        console.error(
          Utilities.discordText(
            `"${commandName}" is already defined or has an overlapping alias! Skipping...`
          )
        );
        continue;
      }
      if (commandName !== Utilities.toId(commandName)) {
        console.error(
          Utilities.discordText(`"${commandName}" is not a valid command name! Skipping...`)
        );
        continue;
      }
      if (command?.aliases) {
        let found = false;
        for (const alias of command.aliases) {
          if (this.get(alias, commands)) {
            found = true;
            break;
          }
        }
        if (!isPrivate && found) {
          console.error(
            Utilities.discordText(
              `"${commandName}" has an alias that exists on another command! Skipping...`
            )
          );
          continue;
        }
      }
      if (isPrivate) this.privateCommands[commandName] = command;
      commands[commandName] = command;
    }

    for (const commandName of Object.keys(this.privateCommands)) {
      this.commands[commandName] = this.privateCommands[commandName];
    }

    this.commands = commands;
    __commandsLoaded = true;
    ReadyChecker.emit("loaded");
  }


  executeCommand(commandName: string, message: Message, args: string[]): void {
    const command = this.get(commandName);
    if (!command?.command) return;

    if (command.disabled) {
      message.channel.send(
        Utilities.failureEmoji(message, `${commandName} is currently disabled.`)
      ).catch(e => console.error(e));
      return;
    }
    // Permissions checks
    let userPermissions = DiscordConfig.developers?.includes(message.author.id)
      ? UserPermissions.DEVELOPER : 0;
    userPermissions = Math.max(
      userPermissions,
      DiscordConfig.admins?.includes(message.author.id) ? UserPermissions.ADMIN : 0
    );
    userPermissions = Math.max(
      userPermissions,
      DiscordConfig.managers?.includes(message.author.id) ? UserPermissions.MANAGER : 0
    );
    userPermissions = Math.max(
      userPermissions,
      DiscordConfig.elevated?.includes(message.author.id) ? UserPermissions.ELEVATED : 0
    );
    let commandPermissions = command.userPermissions || 0;
    if (message.channel.type === "DM") {
      // DM channel
      if (command.noPm && userPermissions < UserPermissions.ADMIN) {
        message.author.send(
          Utilities.failureEmoji(message, `The command \`${commandName}\` can't be used in DMs.`)
        ).catch(e => console.error(e));
        return;
      }
    } else {
      // Regular text channel
      if (command.pmOnly && userPermissions < UserPermissions.ADMIN) {
        message.channel.send(
          Utilities.failureEmoji(
            message, `The command \`${commandName}\` can only be used in DMs.`
          )
        ).catch(e => console.error(e));
        return;
      }
      const db = Storage.getDatabase(message.guild!.id);
      // TODO: Fix IDatabase type for commands
      if (db?.commands?.[commandName]?.disabled) {
        message.channel.send(
          Utilities.failureEmoji(
            message, `The command \`${commandName}\` is currently disabled in this server.`
          )
        ).catch(e => console.error(e));
        return;
      }
      userPermissions = Math.max(userPermissions,
        db?.managers?.includes(message.author.id) ? UserPermissions.MANAGER : 0);
      userPermissions = Math.max(userPermissions,
        db?.elevated?.includes(message.author.id) ? UserPermissions.ELEVATED : 0);
      commandPermissions = Math.max(
        db?.commands?.[commandName]?.permissions || 0,
        commandPermissions
      );


      if (commandPermissions > userPermissions) {
        message.channel.send(
          Utilities.failureEmoji(
            message,
            `You lack the required permissions to use the command \`${commandName}\`.`
          )
        ).catch(e => console.error(e));
        return;
      }
    }

    const missingPermissions: Permissions = new Permissions();
    let missingCount = 0;
    if (command.commandPermissions) {
      for (const permission of command.commandPermissions) {
        if (!Utilities.checkBotPermissions(message, permission)) {
          missingPermissions.add(permission);
          missingCount++;
        }
      }
    }

    if (missingCount !== 0) {
      message.channel.send(
        Utilities.failureEmoji(
          message,
          `Missing Permission${
            missingCount === 1 ? "" : "s"
          }: \`${missingPermissions.toArray().join("`, `")}\``
        )
      ).catch(() => {
        // Fallback to DMing author
        message.author.send(
          Utilities.failureEmoji(
            message,
            `Missing Permission${
              missingCount === 1 ? "" : "s"
            }: \`${missingPermissions.toArray().join("`, `")}\``
          )
        ).catch(e => console.error(e));
      });
      return;
    }

    if (
      command.users &&
      (
        !command.users.includes(message.author.id) &&
        userPermissions < UserPermissions.DEVELOPER
      )
    ) {
      message.channel.send(
        Utilities.failureEmoji(
          message, "Oops! Doesn't look like you're allowed to use that command..."
        )
      ).catch(e => console.error(e));
      return;
    }

    // Phew, we finally passed. If we made it to this point, we can run the command!
    console.log(Utilities.discordText(`Executing command ${green(commandName)}`));
    // We don't want a failed command to crash the entire process, so we need a try-catch block here
    try {
      command.command(message, args);
    } catch (e) {
      // TODO: log errors to channel
      message.channel.send(
        Utilities.failureEmoji(
          message,
          `\`The command crashed!\`` +
          `Your error has been logged and a fix will (hopefully) be on its way soon. \`\`\`xl\n${
            Utilities.clean((e as any).stack)
          }\n\`\`\``
        )
      ).catch(err => console.error(err));
    }
    return;
  }

  get(command: string, commands?: Dict<ICommand>): ICommand | null {
    const list = commands || this.commands;
    if (list[command]) return list[command];
    for (const c of Object.keys(list)) {
      const cmd = list[c];
      const aliases = cmd.aliases || [];
      if ([c, ...aliases].includes(command)) return cmd;
    }
    return null;
  }
}

export const instantiate = (): void => {
  const oldCommandHandler = global.CommandHandler as CommandHandler | undefined;

  global.CommandHandler = new CommandHandler();

  if (oldCommandHandler) {
    global.CommandHandler.onReload(oldCommandHandler);
  }
};
